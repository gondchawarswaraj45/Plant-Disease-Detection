import os
from dotenv import load_dotenv
from google.genai import Client

# =========================
# LOAD ENVIRONMENT
# =========================
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise EnvironmentError("❌ GEMINI_API_KEY not found in .env file")

# =========================
# INIT GEMINI CLIENT
# =========================
client = Client(api_key=GEMINI_API_KEY)

# =========================
# FALLBACK EXPLANATION
# =========================
def fallback_explanation(disease_name):
    return f"""
### 🌱 {disease_name}

⚠️ AI explanation service is currently unavailable.

**What you should do now:**
- Monitor your crop carefully
- Remove infected leaves if visible
- Avoid over-watering
- Consult a local agricultural officer

This prediction is AI-generated and should not replace expert advice.
"""

# =========================
# MAIN AI FUNCTION
# =========================
def explain_disease(disease_name, confidence=None, crop_name="Plant"):

    if confidence is not None and confidence < 60:
        return f"""
### ⚠️ Low Prediction Confidence

The system detected **{disease_name}**, but confidence is **{confidence}%**.

👉 Please:
- Upload a clearer leaf image
- Take the photo in good lighting
- Consult an agricultural expert before treatment
"""

    prompt = f"""
You are an agricultural expert helping a small-scale farmer.

Crop: {crop_name}
Disease: {disease_name}

Explain the disease in VERY SIMPLE language.

### 🌿 Disease Overview
(short explanation)

### 🦠 Causes
- bullet points

### 🔍 Symptoms
- bullet points

### 💊 Treatment
Chemical:
- bullet points

Organic:
- bullet points

### 🛡️ Prevention Tips
- bullet points
"""

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        return response.text

    except Exception as e:
        print("Gemini error:", e)
        return fallback_explanation(disease_name)
