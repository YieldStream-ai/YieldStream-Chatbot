"""
Rate limiter — prevents API abuse and protects your Gemini quota.

How it works (sliding window algorithm):
- For each API key, we track timestamps of recent requests
- RPM check: count requests in the last 60 seconds
- RPD check: count requests in the last 86400 seconds (24 hours)
- If either limit is exceeded, return a 429 (Too Many Requests) with a Retry-After header

Why rate limit?
- Gemini API calls cost money. Without rate limiting, one bad actor (or a bug)
  could burn through your entire quota in minutes.
- Even with no users yet, bots/scrapers that find your endpoint could abuse it.

This is the in-memory implementation (good for single-instance dev).
For production with multiple server instances, swap to Redis so all instances
share the same counters. The interface is the same either way.
"""
import time
from dataclasses import dataclass, field


@dataclass
class RateLimitResult:
    allowed: bool
    rpm_remaining: int = 0
    rpd_remaining: int = 0
    retry_after: int = 0  # seconds until they can retry


@dataclass
class _KeyState:
    """Tracks request timestamps for a single API key."""
    timestamps: list[float] = field(default_factory=list)

    def clean_and_count(self, window_seconds: int) -> int:
        """Remove expired timestamps and return count of remaining ones."""
        cutoff = time.time() - window_seconds
        self.timestamps = [t for t in self.timestamps if t > cutoff]
        return len(self.timestamps)


class InMemoryRateLimiter:
    """
    Sliding window rate limiter using in-memory storage.

    Good for: local dev, single-instance deployments.
    Not good for: multiple server instances (each would have its own counters).
    """

    def __init__(self):
        # key_hash -> _KeyState
        self._states: dict[str, _KeyState] = {}

    async def check_and_increment(
        self, key_hash: str, rpm_limit: int, rpd_limit: int
    ) -> RateLimitResult:
        state = self._states.setdefault(key_hash, _KeyState())

        # Check minute window
        rpm_count = state.clean_and_count(60)
        if rpm_count >= rpm_limit:
            # Find when the oldest request in the window expires
            oldest_in_window = min(
                t for t in state.timestamps if t > time.time() - 60
            )
            retry_after = int(60 - (time.time() - oldest_in_window)) + 1
            return RateLimitResult(
                allowed=False,
                rpm_remaining=0,
                rpd_remaining=max(0, rpd_limit - state.clean_and_count(86400)),
                retry_after=retry_after,
            )

        # Check daily window
        rpd_count = state.clean_and_count(86400)
        if rpd_count >= rpd_limit:
            return RateLimitResult(
                allowed=False,
                rpm_remaining=max(0, rpm_limit - rpm_count),
                rpd_remaining=0,
                retry_after=60,  # Suggest checking back in a minute
            )

        # Allowed — record this request
        state.timestamps.append(time.time())
        return RateLimitResult(
            allowed=True,
            rpm_remaining=rpm_limit - rpm_count - 1,
            rpd_remaining=rpd_limit - rpd_count - 1,
        )


# Singleton
rate_limiter = InMemoryRateLimiter()
