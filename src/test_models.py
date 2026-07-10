import os
from dotenv import load_dotenv
from google.genai import Client
from google.genai import types
from pydantic import BaseModel, Field

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = Client(api_key=api_key)

class TestSchema(BaseModel):
    greeting: str = Field(description="A greeting response.")
    sentiment: str = Field(description="Positive, Neutral, or Negative.")

print("\nTesting structured output with gemini-flash-lite-latest...")
try:
    response = client.models.generate_content(
        model="gemini-flash-lite-latest",
        contents="Say hello and tell me how you feel today.",
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=TestSchema
        )
    )
    print(f"SUCCESS! Output: {response.text.strip()}")
except Exception as e:
    print(f"FAILED: {e}")
