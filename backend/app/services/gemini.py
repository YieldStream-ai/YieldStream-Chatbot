"""
Gemini service — wraps Google's AI SDK to stream chat responses.

How it works:
1. The chat endpoint calls stream_response() with the conversation history + system prompt
2. We build a Gemini request with the system prompt as a "system_instruction"
   (this tells Gemini how to behave — it's like a hidden preamble before the conversation)
3. We stream the response back token by token using an async generator
4. The chat endpoint wraps these tokens into SSE (Server-Sent Events) format

The system prompt NEVER comes from the frontend — it's always loaded from the
Client record in the database. This prevents prompt injection attacks where
someone could try to override the bot's personality via the widget.
"""
from google import genai
from google.genai import types

from app.config import settings


class GeminiService:
    def __init__(self):
        self._client = None

    @property
    def client(self):
        """Lazy-init the Gemini client so the app starts even without an API key."""
        if self._client is None:
            if not settings.gemini_api_key:
                raise RuntimeError("GEMINI_API_KEY is not set")
            self._client = genai.Client(api_key=settings.gemini_api_key)
        return self._client

    async def stream_response(
        self,
        messages: list[dict],
        system_prompt: str,
        model_name: str = "gemini-2.0-flash",
        max_tokens: int = 1024,
    ):
        """
        Stream a response from Gemini given conversation history.

        Args:
            messages: List of {"role": "user"|"model", "content": "..."} dicts.
                      Note: Gemini uses "model" not "assistant" for the AI role.
            system_prompt: The client's system prompt (injected server-side).
            model_name: Which Gemini model to use.
            max_tokens: Max tokens in the response.

        Yields:
            Text chunks as they arrive from Gemini.
        """
        # Convert our message format to Gemini's Content format
        contents = []
        for msg in messages:
            # Gemini expects "model" for assistant messages, not "assistant"
            role = "model" if msg["role"] == "assistant" else msg["role"]
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part(text=msg["content"])],
                )
            )

        # Stream the response — each chunk contains a small piece of text
        response = self.client.models.generate_content_stream(
            model=model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=max_tokens,
            ),
        )

        # Yield text chunks as they arrive.
        # The google-genai SDK's streaming is synchronous, so we iterate normally.
        # FastAPI's StreamingResponse handles the async wrapping.
        full_text = ""
        for chunk in response:
            if chunk.text:
                full_text += chunk.text
                yield chunk.text

    async def generate_response(
        self,
        messages: list[dict],
        system_prompt: str,
        model_name: str = "gemini-2.0-flash",
        max_tokens: int = 1024,
    ) -> str:
        """Non-streaming version — returns the full response at once."""
        chunks = []
        async for chunk in self.stream_response(messages, system_prompt, model_name, max_tokens):
            chunks.append(chunk)
        return "".join(chunks)


# Singleton instance
gemini_service = GeminiService()
