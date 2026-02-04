import os
from collections import defaultdict

BASE_DIR = "dataset/train"

class_counts = defaultdict(int)

for crop in os.listdir(BASE_DIR):
    crop_path = os.path.join(BASE_DIR, crop)
    if not os.path.isdir(crop_path):
        continue

    for disease in os.listdir(crop_path):
        disease_path = os.path.join(crop_path, disease)
        if not os.path.isdir(disease_path):
            continue

        label = f"{crop}__{disease}"
        class_counts[label] += len(os.listdir(disease_path))

print("Total classes:", len(class_counts))
print("-" * 40)

for label, count in sorted(class_counts.items(), key=lambda x: x[1]):
    print(f"{label:40s} : {count}")
