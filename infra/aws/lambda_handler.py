"""
AWS Lambda handler — adapts FastAPI to run on Lambda.

How AWS Lambda works:
- Lambda is "serverless" — AWS runs your code only when a request comes in
- You pay per request (not per hour), so it's near-free at low traffic
- Each request invokes this handler function with an "event" (the HTTP request)
  and a "context" (Lambda metadata like timeout, memory, etc.)

How Mangum bridges FastAPI and Lambda:
- FastAPI is an ASGI app (designed for long-running servers like uvicorn)
- Lambda expects a simple function(event, context) → response
- Mangum translates between these two worlds:
  1. Takes the Lambda event (API Gateway HTTP request)
  2. Converts it to an ASGI request
  3. Runs it through your FastAPI app
  4. Converts the ASGI response back to a Lambda response

The flow looks like:
  User → API Gateway → Lambda → Mangum → FastAPI → your endpoint → response back

SSE streaming caveat:
- API Gateway HTTP API supports chunked transfer encoding, which enables SSE
- But Lambda has a 30-second timeout by default (configurable up to 15 min)
- For long AI responses, you may need to increase the timeout
- If streaming proves problematic, you can fall back to buffered responses
"""
from mangum import Mangum
from app.main import app

# lifespan="off" because Lambda doesn't support long-running startup/shutdown.
# Each invocation is stateless — there's no persistent server to start/stop.
handler = Mangum(app, lifespan="off")
