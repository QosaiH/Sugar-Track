from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# HuggingFace API URL
API_URL = "https://api-inference.huggingface.co/models/avichr/heBERT_sentiment_analysis" 
API_TOKEN = "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"  # תחליף בהמשך

headers = {"Authorization": "Bearer {API_TOKEN}"}

def analyze_sentiment(text):
    response = requests.post(API_URL, headers=headers, json={"inputs": text})
    if response.status_code != 200:
        return {"error": "Model server error", "code": response.status_code}
    
    result = response.json()
    return {
        "text": text,
        "sentiment": result[0][0]['label'] if len(result) > 0 else None,
        "confidence": result[0][0]['score'] if len(result) > 0 else None
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