import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

MODEL_PATH = "models/plant_disease_model.h5"
VAL_DIR = "dataset/val"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32

model = tf.keras.models.load_model(MODEL_PATH)

datagen = ImageDataGenerator(rescale=1./255)

val_data = datagen.flow_from_directory(
    VAL_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=False
)

y_true = val_data.classes
y_pred = np.argmax(model.predict(val_data), axis=1)

# Classification report
print(classification_report(y_true, y_pred, target_names=val_data.class_indices.keys()))

# Confusion matrix
cm = confusion_matrix(y_true, y_pred)

plt.figure(figsize=(12, 10))
sns.heatmap(cm, cmap="Blues", xticklabels=val_data.class_indices.keys(),
            yticklabels=val_data.class_indices.keys())
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix")
plt.tight_layout()
plt.show()
