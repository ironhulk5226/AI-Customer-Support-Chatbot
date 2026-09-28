import json
import os
import sys

from faster_whisper import WhisperModel


def main():
    if len(sys.argv) != 2:
        raise ValueError("An audio file path is required.")

    model_size = os.environ.get("WHISPER_MODEL_SIZE", "small")
    device = os.environ.get("WHISPER_DEVICE", "cpu")
    compute_type = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")
    model = WhisperModel(model_size, device=device, compute_type=compute_type)
    segments, info = model.transcribe(sys.argv[1], beam_size=5, vad_filter=True)
    text = "".join(segment.text for segment in segments).strip()

    print(json.dumps({
        "text": text,
        "language": info.language,
        "language_probability": info.language_probability,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()