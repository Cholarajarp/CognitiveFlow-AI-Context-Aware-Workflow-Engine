import os
from dotenv import load_dotenv

load_dotenv()

# In a real production environment, never hardcode API keys.
# This fallback is provided for the hackathon MVP context as requested.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyD4ZpsrAih07YNgsdAsu8HTehD3R0ulwbg")
