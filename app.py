from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

app = Flask(__name__)

# טעינת המודל והטוקניזר
model_name = "avichr/heBERT_sentiment_analysis"

try:
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    model = AutoModelForSequenceClassification.from_pretrained(model_name, trust_remote_code=True)
except Exception as e:
    print("Error loading model:", str(e))
    tokenizer = None
    model = None

def analyze_sentiment(text):
    if not tokenizer or not model:
        return {"error": "Model not loaded"}

    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True).to('cpu')
    with torch.no_grad():
        outputs = model(**inputs)

    probs = torch.nn.functional.softmax(outputs.logits, dim=1)
    pred = torch.argmax(probs).item()

    sentiment = {
        0: "negative",
        1: "neutral",
        2: "positive"
    }

    return {
        "text": text,
        "sentiment": sentiment[pred],
        "confidence": probs[0][pred].item()
    }

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "Missing 'text' field"}), 400

    result = analyze_sentiment(text)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)