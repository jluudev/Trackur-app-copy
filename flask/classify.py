from flask import Flask, request, jsonify
import tensorflow as tf
from PIL import Image
import numpy as np
from flask_cors import CORS
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes

model = tf.keras.models.load_model('./animal_class.h5')

def preprocess_image(image, target_size=(224, 224)):
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(target_size)
    image = np.expand_dims(image, axis=0)
    return image


@app.route("/predict", methods=["POST"])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    image = Image.open(file.stream)
    processed_image = preprocess_image(image, target_size=(224, 224))

    prediction = model.predict(processed_image)
    top_prediction = np.max(prediction)
    is_animal = top_prediction > 0.7  # May need to adjust further?

    is_animal_python_bool = bool(is_animal)

    # Print the predictions and the top prediction probability for backend checking
    print("Top prediction probability:", top_prediction)
    print("Is it an animal?", is_animal_python_bool)

    response = {
        'is_animal': is_animal_python_bool
    }

    return jsonify(response)


@app.route("/ping", methods=["GET"])
def ping():
    return "pong"

if __name__ == "__main__":
    app.run(debug=True)
