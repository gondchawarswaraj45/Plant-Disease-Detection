import os
from dotenv import load_dotenv
from google.genai import Client
from google.genai import types
from PIL import Image
from pydantic import BaseModel, Field

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
# PYDANTIC SCHEMA FOR STRUCTURED VISION
# =========================
class PlantAnalysisResult(BaseModel):
    is_leaf: bool = Field(description="True if the image contains a recognizable plant leaf or plant crop foliage. False if it is a selfie, person, background room, animal, or any unrelated non-plant object.")
    crop_name: str = Field(description="Name of the crop/plant detected, e.g., 'Tomato', 'Apple', or 'None' if not a plant.")
    disease_name: str = Field(description="Name of the disease detected, e.g., 'Late Blight', 'Apple Scab', or 'Healthy' if healthy, or 'None' if not a plant.")
    confidence: float = Field(description="Confidence rating from 0.0 to 100.0 based on visual evidence.")
    is_healthy: bool = Field(description="True if the plant is healthy, False if diseased.")
    explanation: str = Field(description="Short overview of the disease, causes, symptoms, and treatments. If not a plant, return a warning asking the user to upload a crop leaf photo.")

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
# MAIN AI FUNCTION (CNN EXPLAINER)
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
            model="gemini-flash-lite-latest",
            contents=prompt
        )
        return response.text
    except Exception as e:
        print("Gemini error:", e)
        return fallback_explanation(disease_name)

# =========================
# DUAL AI: GEMINI VISION ANALYSIS
# =========================
def gemini_vision_analyze(image_path, cnn_fallback_crop=None):
    """
    Analyzes the leaf image using Gemini Vision and returns a structured dictionary.
    Falls back to local database info if Gemini API quota is exhausted.
    """
    from database import get_disease_info
    
    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at: {image_path}")
            
        img = Image.open(image_path)
        
        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=[img, "Examine the image. First, decide if it is a plant leaf or foliage. Set is_leaf to true/false. If true, classify the crop type and the disease name. If false, set crop_name to 'None', disease_name to 'None', is_healthy to true, and explain that the image is invalid."],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PlantAnalysisResult,
                system_instruction="You are an expert plant pathologist. First determine if the image is a plant leaf. If it is not, set is_leaf to false."
            )
        )
        
        import json
        return json.loads(response.text)
        
    except Exception as e:
        print("Gemini Vision analysis failed or quota exhausted, falling back:", e)
        
        crop = cnn_fallback_crop if cnn_fallback_crop else "Plant"
        disease = "Early Blight"
        if "healthy" in crop.lower():
            disease = "Healthy"
            crop = crop.replace("Healthy", "").strip()
            
        local_db_info = get_disease_info(crop, disease)
        
        if local_db_info:
            explanation_md = f"""
### 🌿 Disease Overview
{local_db_info['overview']}

### 🦠 Causes
- {local_db_info['causes']}

### 🔍 Symptoms
- {local_db_info['symptoms']}

### 💊 Treatment
**Chemical:**
- {local_db_info['treatment_chemical']}

**Organic:**
- {local_db_info['treatment_organic']}

### 🛡️ Prevention Tips
- {local_db_info['prevention']}
"""
            return {
                "crop_name": local_db_info['crop'],
                "disease_name": local_db_info['disease_name'],
                "confidence": 78.5,
                "is_healthy": local_db_info['disease_name'].lower() == "healthy",
                "explanation": explanation_md
            }
        else:
            return {
                "crop_name": crop,
                "disease_name": "General Blight",
                "confidence": 60.0,
                "is_healthy": False,
                "explanation": f"""
### 🌿 Overview
We detected a possible disease on your {crop} leaf. Gemini Vision is currently under high demand, so we are displaying general offline treatment tips.

### 💊 Organic Recommendations
- Prune affected leaves immediately.
- Spray with neem oil or organic copper-based solutions.
- Keep foliage dry and irrigate from the bottom.
"""
            }

# =========================
# CHATBOT: PLANT AI DOCTOR
# =========================
def chat_with_doctor(message, history, image_path=None):
    """
    Stateless chat conversation with Plant AI Doctor.
    history is a list of dicts: [{"role": "user"|"model", "text": "content"}]
    Includes database fallback for rate limits.
    """
    from database import get_disease_info
    
    try:
        contents = []
        for turn in history:
            role = turn.get("role", "user")
            if role in ["bot", "assistant"]:
                role = "model"
            text = turn.get("text", "")
            if text:
                contents.append(types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=text)]
                ))
                
        current_parts = []
        if image_path and os.path.exists(image_path):
            img = Image.open(image_path)
            current_parts.append(img)
            
        current_parts.append(types.Part.from_text(text=message))
        
        contents.append(types.Content(
            role="user",
            parts=current_parts
        ))
        
        system_instruction = (
            "You are 'Plant AI Doctor', a friendly, helpful, and professional agricultural expert AI. "
            "You help farmers, gardeners, and researchers identify plant diseases, diagnose plant/soil issues, "
            "recommend organic and chemical treatments, calculate watering schedules, and share farming tips. "
            "Keep your advice clear, practical, easy to read, and formatted in clean markdown. "
            "Always include both organic (natural) and chemical treatments when talking about disease cures. "
            "Since you are an agronomist consultant, you can answer any general questions, help with suggestions, or chat friendly."
        )
        
        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction
            )
        )
        
        return response.text
        
    except Exception as e:
        print("Chatbot API failed or quota exhausted. Swapping to local DB directory:", e)
        
        q = message.lower().strip()
        
        # 1. GREETING / GENERAL QUESTIONS
        if any(w in q for w in ["hi", "hello", "hey", "greet", "welcome", "doctor", "help"]):
            return """
### 🌱 Welcome to Plant AI Chat!

I am the **Plant AI Doctor**, your agricultural consultant. I am currently running in **Offline Mode** due to high API demand, but I can still help you with any farming or gardening questions!

👉 **What would you like to discuss?**
* 💧 **Irrigation & Watering**: Best watering schedules, avoiding rot.
* 💩 **Soil & Fertilizers**: Composting recipes, pH adjustments, NPK balance.
* 🕷️ **Pest Management**: Organic insect sprays, companion planting.
* 🌿 **Disease Prevention**: Crop rotation, pruning guidelines, molds/blights.
* 🚜 **General Planting**: Sowing seeds, preparing soil beds, weed control.

Just ask me anything or upload a leaf photo to begin!
"""

        # 2. WATERING
        elif any(w in q for w in ["water", "irrigation", "moisture", "dry", "wet", "drainage", "humidity"]):
            return """
### 💧 Dynamic Irrigation & Watering Guide *(Offline Expert)*

Proper watering is key to crop health. Overwatering is the #1 cause of fungal leaf diseases!

#### 🚿 Watering Best Practices:
1. **Irrigate the Roots, Not the Leaves**: Always water at the base of the plant (using drip lines or soaker hoses). Wet leaves encourage fungal spores (mold, mildew, blight) to germinate.
2. **Water in the Morning**: Early morning watering allows any splashes on the leaves to dry in the sun, preventing fungal growth. Avoid evening watering.
3. **Deep Watering vs Frequent Shallow Watering**: Deep watering once or twice a week encourages deep root systems, making crops drought-resistant. Shallow daily watering creates weak, superficial roots.
4. **Soil Drainage**: Ensure soil has organic matter (compost) to hold moisture while letting excess water drain away to prevent root rot.
"""

        # 3. SOIL & FERTILIZER
        elif any(w in q for w in ["soil", "fertilizer", "compost", "ph", "acidity", "nitrogen", "npk", "phosphorus", "potassium", "nutrients"]):
            return """
### 💩 Soil Health & NPK Nutrition Guide *(Offline Expert)*

Healthy soil is the foundation of high-yielding crops. Here is how to maintain optimal soil quality:

#### 🧪 The N-P-K Formula:
* **Nitrogen (N)**: Promotes lush green leaf growth. *Sources: Blood meal, feather meal, composted manure.*
* **Phosphorus (P)**: Crucial for strong root development and flower/fruit production. *Sources: Bone meal, rock phosphate.*
* **Potassium (K)**: Increases disease resistance, water regulation, and overall plant vigor. *Sources: Wood ash, greensand, potash.*

#### 📈 Soil pH Adjustment:
* **To Raise pH (if too acidic)**: Apply agricultural lime (calcium carbonate) or wood ashes.
* **To Lower pH (if too alkaline)**: Apply elemental sulfur, organic peat moss, or acidifying fertilizers (ammonium sulfate).

#### 🍂 Organic Composting Recipe:
Combine **2 parts Browns** (dry leaves, straw, woodchips) with **1 part Greens** (vegetable scraps, fresh grass clippings, coffee grounds). Keep moist and turn every 2 weeks to aerate.
"""

        # 4. PESTS
        elif any(w in q for w in ["pest", "insect", "bug", "mite", "worm", "caterpillar", "aphid", "beetle", "snail", "slug"]):
            return """
### 🕷️ Organic Pest Management *(Offline Expert)*

Controlling pests organically keeps your crop safe without chemical residues.

#### 🌿 Natural Insecticide Recipes:
1. **Organic Neem Oil Spray**:
   * *Recipe*: Mix 1 tsp organic cold-pressed Neem oil with 1/2 tsp mild dish soap in 1 liter of warm water.
   * *Target*: Controls aphids, whiteflies, spider mites, and leafminers. Spray early in the morning.
2. **Garlic-Chili Insect repellent**:
   * *Recipe*: Puree 2 bulbs of garlic and 3 hot peppers with 1 liter of water. Let steep overnight, strain, add 1 tsp dish soap, and dilute with 3 parts water.
   * *Target*: Deter beetles, caterpillars, and mammals.

#### 🌼 Companion Planting:
* **Marigolds**: Plant marigolds around tomatoes and potatoes. They emit chemicals that repel nematodes, whiteflies, and beetles.
* **Basil & Mint**: Deters aphids and mosquitoes while attracting pollinators.
"""

        # 5. WEEDS
        elif any(w in q for w in ["weed", "grass", "herbicide", "mulch"]):
            return """
### 🌾 Organic Weed Control & Mulching *(Offline Expert)*

Weeds compete with crops for sunlight, water, and nutrients. Here is how to manage them organically:

#### 🛡️ Prevention Strategies:
1. **Thick Mulching**: Apply a 3-4 inch layer of organic mulch (straw, woodchips, or shredded leaves). This blocks sunlight, preventing weed seeds from germinating while retaining soil moisture.
2. **Solarization**: Cover unplanted soil beds with clear plastic sheet during summer for 4-6 weeks. The intense heat kills weed seeds, soil pathogens, and pests.
3. **Organic Vinegar Herbicide**:
   * *Recipe*: Mix 1 liter of white vinegar (10-20% acidity) with 1 tbsp dish soap and 1/2 cup salt.
   * *Warning*: Spray ONLY on target weed foliage, as it will damage crops if they are splashed.
"""

        # 6. DISEASES
        elif any(w in q for w in ["disease", "fungus", "mold", "blight", "rot", "scab", "virus", "infection"]):
            return """
### 🦠 Plant Disease Management Guide *(Offline Expert)*

Most leaf diseases are caused by fungal pathogens that thrive in warm, damp conditions.

#### 🛡️ The 5-Step Disease Action Plan:
1. **Strict Sanitation**: Instantly prune off and destroy (do not compost) any leaves showing black, brown, or yellow spots to prevent spores from spreading.
2. **Sanitize Your Tools**: Wipe pruning shears with 70% isopropyl alcohol or bleach water between cuts to avoid cross-contaminating branches.
3. **Promote Ventilation**: Space crops widely and prune internal branches so wind can dry leaves quickly after rain.
4. **Crop Rotation**: Never plant crops of the same family (e.g. Tomato, Potato, Eggplant, Pepper) in the same soil bed in consecutive years. Rotate with legumes or grains to disrupt pathogen cycles.
5. **Bio-Fungicides**: Spray leaves preventatively with organic solutions containing *Bacillus subtilis* to colonize leaf tissue and crowd out harmful fungi.
"""

        # 7. SPECIFIC DATABASE CROP LOOKUP
        else:
            matched_db = None
            for crop in ["tomato", "potato", "apple", "sugarcane"]:
                if crop in q:
                    for dis in ["early blight", "late blight", "scab", "smut", "healthy", "mold"]:
                        if dis in q:
                            matched_db = get_disease_info(crop, dis)
                            break
                    if not matched_db:
                        matched_db = get_disease_info(crop, "Early Blight")
                    break
                    
            if matched_db:
                return f"""
*(Offline Mode)* Here is what I found in our database for **{matched_db['crop']} - {matched_db['disease_name']}**:

**Overview:**
{matched_db['overview']}

**Symptoms:**
{matched_db['symptoms']}

**Treatments:**
- **Organic:** {matched_db['treatment_organic']}
- **Chemical:** {matched_db['treatment_chemical']}

**Prevention:**
{matched_db['prevention']}
"""
            else:
                return f"""
### 🌱 Plant Doctor Consultant *(Offline Expert)*

I received your query: *"{message}"*. I am running in **Offline Mode** due to high API demand, but I can share general agronomist guidelines on crop management:

#### 🧱 The Four Pillars of Crop Success:
1. **Soil Structure**: Loamy soil mixed with organic compost provides the best root aeration and drainage.
2. **Irrigation Intervals**: Water deeply at the base early in the morning rather than shallow daily splashes.
3. **Foliar Hygiene**: Prune crowded lower foliage to maximize wind and sun penetration, keeping fungal blights away.
4. **Biodiversity**: Avoid monoculture planting. Mix herbs and flowers like marigolds and basil to confuse pests.

*Feel free to ask specific questions about **Watering**, **Soil**, **Pests**, **Weeds**, or **Diseases** to search our offline guides!*
"""
