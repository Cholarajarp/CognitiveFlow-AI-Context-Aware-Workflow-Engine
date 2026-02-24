import google.generativeai as genai
import os
from config import GEMINI_API_KEY

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def get_gemini_response(prompt: str, context: str = ""):
    if not GEMINI_API_KEY:
        return "Error: GEMINI_API_KEY not found in environment variables."
    
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        full_prompt = f"Context: {context}\n\nUser Request: {prompt}"
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        return f"AI Error: {str(e)}"
