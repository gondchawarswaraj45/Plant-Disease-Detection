from flask import Flask, render_template, request
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from gemini_helper import explain_disease
from dotenv import load_dotenv

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
# LOAD MODEL (ONCE)
# =========================
# Compatibility shim: handle older/newer model configs that include a 'groups' kwarg
# in DepthwiseConv2D which may not be accepted by this Keras version.
from tensorflow.keras.layers import DepthwiseConv2D as _DepthwiseConv2D
class DepthwiseConv2DCompat(_DepthwiseConv2D):
    def __init__(self, *args, groups=None, **kwargs):
        # ignore 'groups' for compatibility
        super().__init__(*args, **kwargs)

custom_objects = {"DepthwiseConv2D": DepthwiseConv2DCompat}
model = tf.keras.models.load_model(MODEL_PATH, custom_objects=custom_objects)

# Load class names produced during training (must match model output order)
CLASS_FILE = os.path.join(BASE_DIR, "..", "models", "class_names.txt")
with open(CLASS_FILE, "r", encoding="utf-8") as f:
    raw_names = [l.strip() for l in f if l.strip()]

# Make names human-friendly for the UI
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
def home():
    return render_template("home.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/diseases")
def diseases():
    return render_template("diseases.html")


@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return render_template("result.html", error="No image uploaded ❗")

    file = request.files["image"]

    if file.filename == "":
        return render_template("result.html", error="No image selected ❗")

    # =========================
    # SAVE IMAGE
    # =========================
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(file_path)

    # =========================
    # MODEL PREDICTION
    # =========================
    processed_img = preprocess_image(file_path)
    predictions = model.predict(processed_img)

    predicted_index = np.argmax(predictions)
    predicted_class = CLASS_NAMES[predicted_index]
    confidence = round(float(np.max(predictions)) * 100, 2)

    # =========================
    # GEMINI AI EXPLANATION
    # =========================
    explanation = explain_disease(
    disease_name=predicted_class,
    confidence=confidence,
    crop_name="Tomato"
)


    # =========================
    # SEND TO UI
    # =========================
    return render_template(
        "result.html",
        image=file.filename,
        disease=predicted_class,
        confidence=confidence,
        explanation=explanation
    )


# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    app.run(debug=True)