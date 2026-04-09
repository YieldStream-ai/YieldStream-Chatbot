import html
import re


def sanitize_message(text: str) -> str:
    """
    Sanitize user input before storing or passing to Gemini.

    - Escapes HTML entities so <script> becomes &lt;script&gt;
    - Strips null bytes which can confuse parsers
    - Trims whitespace

    This protects against stored XSS if messages are displayed
    in the dashboard or any other HTML context.
    """
    text = text.replace("\x00", "")
    text = html.escape(text, quote=True)
    text = text.strip()
    return text


def sanitize_session_id(session_id: str) -> str:
    """Ensure session_id is a valid UUID-like string (alphanumeric + hyphens only)."""
    cleaned = re.sub(r"[^a-zA-Z0-9\-]", "", session_id)
    return cleaned[:36]
