from flask import Flask, render_template, request, jsonify, redirect, url_for
import os
import uuid
import base64
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from gemini_helper import explain_disease, gemini_vision_analyze, chat_with_doctor
from dotenv import load_dotenv
import database

# =========================
# ENV & APP CONFIG
# =========================
load_dotenv()

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "plant_disease_model.h5")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# =========================
# INITIALIZE DATABASE
# =========================
database.init_db()

# =========================
# LOAD MODEL (ONCE)
# =========================
from tensorflow.keras.layers import DepthwiseConv2D as _DepthwiseConv2D
class DepthwiseConv2DCompat(_DepthwiseConv2D):
    def __init__(self, *args, groups=None, **kwargs):
        super().__init__(*args, **kwargs)

custom_objects = {"DepthwiseConv2D": DepthwiseConv2DCompat}
model = tf.keras.models.load_model(MODEL_PATH, custom_objects=custom_objects)

CLASS_FILE = os.path.join(BASE_DIR, "..", "models", "class_names.txt")
with open(CLASS_FILE, "r", encoding="utf-8") as f:
    raw_names = [l.strip() for l in f if l.strip()]

CLASS_NAMES = [n.replace("_", " ").replace("  ", " ").title() for n in raw_names]
IMG_SIZE = 224

# =========================
# IMAGE PREPROCESSING
# =========================
def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(IMG_SIZE, IMG_SIZE))
    img_array = image.img_to_array(img)
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# =========================
# ROUTES
# =========================

@app.route("/")
@app.route("/login")
@app.route("/dashboard")
@app.route("/about")
@app.route("/diseases")
@app.route("/chat")
@app.route("/history")
@app.route("/soil")
@app.route("/watering")
@app.route("/predict/result/<report_id>")
def spa_entry(report_id=None):
    return render_template("index.html")


# =========================
# JSON REST API ENDPOINTS
# =========================

@app.route("/api/diseases")
def api_diseases():
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM diseases")
    seeded_diseases = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in seeded_diseases])


@app.route("/api/history")
def api_history():
    scans = database.get_scans()
    return jsonify([dict(row) for row in scans])


@app.route("/api/history/delete/<int:scan_id>", methods=["POST"])
def api_history_delete(scan_id):
    database.delete_scan(scan_id)
    return jsonify({"success": True})


@app.route("/api/chat", methods=["POST"])
def api_chat():
    message = request.form.get("message", "")
    import json
    history_raw = request.form.get("history", "[]")
    try:
        history = json.loads(history_raw)
    except Exception:
        history = []

    image_path = None
    if "image" in request.files:
        file = request.files["image"]
        if file and file.filename != "":
            filename = f"chat_{uuid.uuid4().hex}_{file.filename}"
            image_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(image_path)

    bot_response = chat_with_doctor(message=message, history=history, image_path=image_path)
    return jsonify({"response": bot_response})


@app.route("/api/soil", methods=["GET", "POST"])
def api_soil():
    if request.method == "POST":
        try:
            data = request.get_json() or {}
            crop_type = data.get("crop_type", "General")
            soil_type = data.get("soil_type", "Loam")
            ph = float(data.get("ph_level", 7.0))
            moisture = data.get("moisture_level", "Medium")
            
            # Diagnostics logic (Rules engine)
            verdict = ""
            recs = []
            
            # pH evaluations
            if ph < 5.5:
                verdict = "Highly Acidic 🔴"
                recs.append("Apply agricultural lime (calcium carbonate) to raise pH.")
                recs.append("Avoid acidic fertilizers like ammonium sulfate.")
            elif ph > 7.5:
                verdict = "Alkaline 🔴"
                recs.append("Apply elemental sulfur or organic compost to lower soil pH.")
                recs.append("Use ammonium fertilizers to slowly lower soil pH over time.")
            else:
                verdict = "Optimal pH range (5.5 - 7.5) 🟢"
                recs.append("Soil acidity is excellent for most crops. Maintain compost nutrition.")
                
            # Moisture & Soil match evaluations
            if soil_type == "Sandy" and moisture == "Low":
                recs.append("Sandy soil has poor water retention. Implement mulching and increase compost to build humus.")
            elif soil_type == "Clay" and moisture == "High":
                recs.append("Clay soil holds water easily but lacks drainage. Aerate the soil and mix in gypsum/sand to avoid root rot.")
                
            # Crop specific checklist
            if crop_type == "Potato" and ph > 6.0:
                recs.append("Potatoes prefer slightly acidic soil (5.0 - 5.5). High pH increases the risk of Potato Scab disease.")
            elif crop_type == "Tomato" and ph < 6.0:
                recs.append("Tomatoes prefer a pH of 6.2 - 6.8. Low pH limits calcium intake, risking Blossom End Rot.")
                
            recs_str = "\n".join([f"- {r}" for r in recs])
            database.add_soil_report(crop_type, soil_type, ph, moisture, verdict, recs_str)
            
            return jsonify({
                "crop_type": crop_type,
                "soil_type": soil_type,
                "ph": ph,
                "moisture": moisture,
                "verdict": verdict,
                "recommendations": recs
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    reports = database.get_soil_reports()
    return jsonify([dict(row) for row in reports])


# =========================
# DUAL MODEL VERIFICATION & SCAN LOGGING
# =========================
def run_dual_analysis(file_path, filename):
    # 1. Edge CNN Classify
    processed_img = preprocess_image(file_path)
    predictions = model.predict(processed_img)
    predicted_index = np.argmax(predictions)
    predicted_class = CLASS_NAMES[predicted_index]
    confidence = round(float(np.max(predictions)) * 100, 2)

    # 2. Gemini Multimodal Analysis
    gemini_result = gemini_vision_analyze(file_path, cnn_fallback_crop=predicted_class)

    # Check leaf validity (reject selfies, rooms, face cam shots)
    if not gemini_result.get("is_leaf", True):
        return {
            "image": filename,
            "error": "The uploaded photograph does not appear to contain a recognizable plant leaf. To run crop disease diagnostics, please upload a clear, close-up photo of a leaf.",
            "disease": "Invalid Leaf Image",
            "confidence": confidence,
            "gemini_result": gemini_result,
            "verification_status": "INVALID IMAGE",
            "verification_class": "verify-danger",
            "verification_message": "Foliage Verification Failed: Image does not contain a plant leaf."
        }

    # 3. Cross Verification Check
    cnn_crop = predicted_class.lower().strip()
    gemini_crop = gemini_result.get("crop_name", "").lower().strip()
    
    words_cnn = [w for w in cnn_crop.replace(",", "").replace("_", " ").split() if len(w) > 2]
    words_gemini = [w for w in gemini_crop.replace(",", "").replace("_", " ").split() if len(w) > 2]
    
    crop_match = False
    for w1 in words_cnn:
        for w2 in words_gemini:
            if w1 in w2 or w2 in w1:
                crop_match = True
                break
    
    if crop_match:
        verification_status = "AGREEMENT"
        verification_class = "verify-success"
        verification_message = f"Both AI models agree that this is a {predicted_class} leaf."
    else:
        if "unable" in gemini_crop or "failed" in gemini_crop or not gemini_crop:
            verification_status = "CNN ONLY"
            verification_class = "verify-warning"
            verification_message = "Gemini Vision was unable to verify the crop type. Relying on local CNN predictions."
        else:
            verification_status = "DISCREPANCY"
            verification_class = "verify-danger"
            verification_message = f"AI Mismatch! CNN predicts '{predicted_class}' but Gemini Vision detects '{gemini_result.get('crop_name')}'."

    # 4. Save to scan history database
    database.add_scan(
        filename=filename,
        cnn_crop=predicted_class,
        gemini_disease=gemini_result.get("disease_name", "Unknown"),
        confidence=confidence,
        verification_status=verification_status,
        verification_message=verification_message
    )

    return {
        "image": filename,
        "disease": predicted_class,
        "confidence": confidence,
        "gemini_result": gemini_result,
        "verification_status": verification_status,
        "verification_class": verification_class,
        "verification_message": verification_message
    }


@app.route("/api/predict", methods=["POST"])
def api_predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No image selected"}), 400

    # Save leaf photo
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"scan_{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
    file.save(file_path)

    try:
        report = run_dual_analysis(file_path, unique_filename)
        return jsonify(report)
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500


@app.route("/api/camera-upload", methods=["POST"])
def camera_upload():
    try:
        data = request.get_json()
        if not data or "image" not in data:
            return jsonify({"error": "No image data found"}), 400
            
        base64_data = data["image"].split(",")[1]
        image_bytes = base64.b64decode(base64_data)
        
        # Save frame snapshot
        unique_filename = f"camera_{uuid.uuid4().hex}.jpg"
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
        with open(file_path, "wb") as f:
            f.write(image_bytes)
            
        report = run_dual_analysis(file_path, unique_filename)
        return jsonify({
            "report": report,
            "redirect": url_for("spa_entry", report_id=unique_filename)
        })
    except Exception as e:
        print("Camera processing failure:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/predict/result/<report_id>")
def api_predict_result(report_id):
    # Fetch scan from database log
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scans WHERE filename = ?", (report_id,))
    scan = cursor.fetchone()
    conn.close()
    
    if not scan:
        return jsonify({"error": "Scan result not found."}), 404
        
    report = {
        "image": scan["filename"],
        "disease": scan["cnn_predicted_crop"],
        "confidence": scan["confidence"],
        "gemini_result": {
            "crop_name": scan["cnn_predicted_crop"],
            "disease_name": scan["gemini_predicted_disease"],
            "confidence": 85.0,
            "is_healthy": scan["gemini_predicted_disease"].lower() == "healthy",
            "explanation": f"""
### 🌿 Offline Diagnosis Summary
We successfully reloaded this scan from your **Scan Log**. 

**Detected Disease:** {scan['gemini_predicted_disease']}
**CNN Prediction:** {scan['cnn_predicted_crop']}
**Verification**: {scan['verification_message']}
"""
        },
        "verification_status": scan["verification_status"],
        "verification_class": "verify-success" if scan["verification_status"] == "AGREEMENT" else ("verify-warning" if scan["verification_status"] == "CNN ONLY" else "verify-danger"),
        "verification_message": scan["verification_message"]
    }
    return jsonify(report)


if __name__ == "__main__":
    app.run(debug=True)