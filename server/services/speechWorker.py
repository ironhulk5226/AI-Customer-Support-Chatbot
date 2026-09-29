import json
import os
import sys

import av
import numpy as np
from faster_whisper import WhisperModel


def load_audio_as_pcm(audio_path):
    chunks = []
    resampler = av.audio.resampler.AudioResampler(format="s16", layout="mono", rate=16000)

    with av.open(audio_path) as container:
        audio_stream = next((stream for stream in container.streams if stream.type == "audio"), None)
        if audio_stream is None:
            raise ValueError("The uploaded file does not contain an audio stream.")

        for frame in container.decode(audio_stream):
            for resampled_frame in resampler.resample(frame):
                chunks.append(resampled_frame.to_ndarray().reshape(-1))

        for resampled_frame in resampler.resample(None):
            chunks.append(resampled_frame.to_ndarray().reshape(-1))

    if not chunks:
        raise ValueError("The uploaded audio contains no samples.")

    return np.concatenate(chunks).astype(np.float32) / 32768.0


def main():
    if len(sys.argv) != 2 or sys.argv[1] != "--persistent":
        raise ValueError("Persistent speech worker mode is required.")

    sys.stdout.reconfigure(encoding="utf-8")

    model_size = os.environ.get("WHISPER_MODEL_SIZE", "small")
    device = os.environ.get("WHISPER_DEVICE", "cpu")
    compute_type = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")
    model = WhisperModel(model_size, device=device, compute_type=compute_type)

    for request_line in sys.stdin:
        if not request_line.strip():
            continue

        try:
            request = json.loads(request_line)
            audio = load_audio_as_pcm(request["audio_path"])
            segments, info = model.transcribe(
                audio,
                language=request["language"],
                task="transcribe",
                beam_size=3,
                temperature=0.0,
                condition_on_previous_text=False,
                vad_filter=True,
            )
            text = "".join(segment.text for segment in segments).strip()
            response = {
                "text": text,
                "language": info.language,
                "language_probability": info.language_probability,
            }
        except Exception as error:
            response = {"error": str(error)}

        print(json.dumps(response, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()