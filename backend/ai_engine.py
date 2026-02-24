import google.generativeai as genai
import os
import logging
from config import GEMINI_API_KEY

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found in environment variables.")

async def get_gemini_response(prompt: str, context: str = ""):
    """
    Generates a response from Gemini AI based on the prompt and context.
    Falls back to a mock response if the API call fails (e.g., invalid key).
    """
    if not GEMINI_API_KEY:
        return "Error: GEMINI_API_KEY not configured."
    
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        full_prompt = f"Context: {context}\n\nUser Request: {prompt}"

        # Use async generation
        response = await model.generate_content_async(full_prompt)
        return response.text
    except Exception as e:
        logger.error(f"AI Error: {str(e)}")
        # Fallback for demo purposes if API key is invalid/quota exceeded
        if "403" in str(e) or "404" in str(e):
             return (f"AI Simulation (API Error: {str(e)})\n\n"
                     f"Based on your request '{prompt}' and context '{context}', "
                     "I would normally generate a helpful response here. "
                     "Since the API key is invalid or the model is unavailable, "
                     "this is a placeholder response to demonstrate the UI flow.")
        return f"AI Error: {str(e)}"
