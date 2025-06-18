from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

# Load the sentiment analysis model
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="avichr/heBERT_sentiment_analysis",
    tokenizer="avichr/heBERT_sentiment_analysis",
    return_all_scores=True
)

@app.route("/sentiment", methods=["POST"])
def analyze_sentiment():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        result = sentiment_pipeline(text)
        return jsonify(result[0])  # Return list of label-score dicts
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run()