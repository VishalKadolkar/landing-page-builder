from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import re
import torch
from diffusers import AutoPipelineForText2Image
import base64
from io import BytesIO

app = Flask(__name__)
CORS(app)

OLLAMA_URL = "http://localhost:11434/api/generate"

print("Loading SDXL Turbo image model...")
pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sdxl-turbo",
    torch_dtype=torch.float32,
    variant="fp16"
)
print("Image model loaded!")

def generate_image_prompt(business_description):
    prompt = """[INST] Convert this business description into a SHORT image prompt (max 60 words) for a landing page mockup.

Business: """ + business_description + """

Start with: "professional landing page mockup,"
Include only: color scheme, layout style, mood, font style.
Output ONLY the prompt, nothing else, keep it under 60 words.

[/INST]"""

    response = requests.post(OLLAMA_URL, json={
        "model": "qwen2.5",
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": 80,
            "temperature": 0.7
        }
    }, timeout=60)

    result = response.json()
    image_prompt = result["response"].strip()
    image_prompt = re.sub(r'\[INST\].*?\[/INST\]', '', image_prompt).strip()
    
    # Truncate to 60 words max
    words = image_prompt.split()
    if len(words) > 60:
        image_prompt = ' '.join(words[:60])
    
    print("Image prompt: " + image_prompt)
    return image_prompt

def generate_image(prompt):
    image = pipe(
        prompt=prompt,
        num_inference_steps=4,
        guidance_scale=0.0,
        width=1024,
        height=768
    ).images[0]

    buffered = BytesIO()
    image.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_base64

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    description = data.get("description", "")

    if not description:
        return jsonify({"error": "No description provided"}), 400

    print("Generating image for: " + description[:80])

    try:
        image_prompt = generate_image_prompt(description)
        print("Generating image with SDXL Turbo...")
        img_base64 = generate_image(image_prompt)
        print("Image generated successfully!")

        return jsonify({
            "success": True,
            "image": img_base64,
            "prompt": image_prompt
        })

    except Exception as e:
        print("Error: " + str(e))
        return jsonify({"error": str(e), "success": False}), 500

if __name__ == "__main__":
    print("Starting Flask server on port 5001...")
    app.run(port=5001, debug=False)