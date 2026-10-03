from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from IndicTransToolkit import IndicProcessor
import torch

app = Flask(__name__)

# --------------------------------------------------
# Model Configuration
# --------------------------------------------------

INDIC_TO_EN_MODEL = "ai4bharat/indictrans2-indic-en-dist-200M"
EN_TO_INDIC_MODEL = "ai4bharat/indictrans2-en-indic-dist-200M"

DEVICE = "cpu"

# --------------------------------------------------
# Load Indic -> English
# --------------------------------------------------

print("Loading Indic → English model...")

indic_en_tokenizer = AutoTokenizer.from_pretrained(
    INDIC_TO_EN_MODEL,
    trust_remote_code=True
)

indic_en_model = AutoModelForSeq2SeqLM.from_pretrained(
    INDIC_TO_EN_MODEL,
    trust_remote_code=True
).to(DEVICE)

indic_en_processor = IndicProcessor(inference=True)

print("Indic → English model loaded.")

# --------------------------------------------------
# Load English -> Indic
# --------------------------------------------------

print("Loading English → Indic model...")

en_indic_tokenizer = AutoTokenizer.from_pretrained(
    EN_TO_INDIC_MODEL,
    trust_remote_code=True
)

en_indic_model = AutoModelForSeq2SeqLM.from_pretrained(
    EN_TO_INDIC_MODEL,
    trust_remote_code=True
).to(DEVICE)

en_indic_processor = IndicProcessor(inference=True)

print("English → Indic model loaded.")

print("Translation service ready.")


# --------------------------------------------------
# Indic -> English
# --------------------------------------------------

def translate_indic_to_english(text, source_language):

    batch = indic_en_processor.preprocess_batch(
        [text],
        src_lang=source_language,
        tgt_lang="eng_Latn"
    )

    inputs = indic_en_tokenizer(
        batch,
        return_tensors="pt",
        padding=True
    )

    inputs = {
        key: value.to(DEVICE)
        for key, value in inputs.items()
    }

    with torch.no_grad():

        outputs = indic_en_model.generate(
            **inputs,
            max_length=256
        )

    decoded = indic_en_tokenizer.batch_decode(
        outputs,
        skip_special_tokens=True
    )

    result = indic_en_processor.postprocess_batch(
        decoded,
        lang="eng_Latn"
    )

    return result[0]


# --------------------------------------------------
# English -> Indic
# --------------------------------------------------

def translate_english_to_indic(text, target_language):

    batch = en_indic_processor.preprocess_batch(
        [text],
        src_lang="eng_Latn",
        tgt_lang=target_language
    )

    inputs = en_indic_tokenizer(
        batch,
        return_tensors="pt",
        padding=True
    )

    inputs = {
        key: value.to(DEVICE)
        for key, value in inputs.items()
    }

    with torch.no_grad():

        outputs = en_indic_model.generate(
            **inputs,
            max_length=256
        )

    decoded = en_indic_tokenizer.batch_decode(
        outputs,
        skip_special_tokens=True
    )

    result = en_indic_processor.postprocess_batch(
        decoded,
        lang=target_language
    )

    return result[0]


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/health")
def health():

    return jsonify({
        "status": "ok",
        "service": "translation",
        "device": DEVICE
    })


# --------------------------------------------------
# Translation API
# --------------------------------------------------

@app.post("/translate")
def translate():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Request body is required."
            }), 400

        text = data.get("text")
        source_language = data.get("sourceLanguage")
        target_language = data.get("targetLanguage")

        if not text or not text.strip():

            return jsonify({
                "error": "Text is required."
            }), 400

        if not source_language or not target_language:

            return jsonify({
                "error": "sourceLanguage and targetLanguage are required."
            }), 400

        # Indic -> English
        if source_language in ["mar_Deva", "hin_Deva"] and target_language == "eng_Latn":

            translated_text = translate_indic_to_english(
                text,
                source_language
            )

        # English -> Indic
        elif source_language == "eng_Latn" and target_language in [
            "mar_Deva",
            "hin_Deva"
        ]:

            translated_text = translate_english_to_indic(
                text,
                target_language
            )

        else:

            return jsonify({
                "error": "Unsupported translation direction."
            }), 400

        return jsonify({
            "sourceLanguage": source_language,
            "targetLanguage": target_language,
            "translatedText": translated_text
        })

    except Exception as error:

        print("Translation error:", str(error))

        return jsonify({
            "error": "Translation failed."
        }), 500


# --------------------------------------------------
# Start Server
# --------------------------------------------------

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=7000,
        debug=False
    )