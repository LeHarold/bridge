import io
import json
import wave
from piper import PiperVoice, SynthesisConfig
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

dist = Path("dist")
output = dist / "review-audio"
output.mkdir(exist_ok=True)
cards = json.loads((dist / "cards.json").read_text(encoding="utf-8"))
voice = PiperVoice.load('en_US-lessac-medium.onnx')
config = SynthesisConfig(length_scale=1.12)


def render(card):
    sections = [card["word"], card["meaning"], *card.get("examples", [])]
    phrases = [section.strip() for section in sections if section.strip()]
    text = " ".join(phrase if phrase.endswith((".", "!", "?")) else phrase + "." for phrase in phrases)
    wav = io.BytesIO()
    with wave.open(wav, "wb") as stream:
        voice.synthesize_wav(text, stream, syn_config=config)
    # Uniform frames without per-file tags or seek headers can be joined in the browser.
    subprocess.run(
        ["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", "pipe:0",
         "-ac", "1", "-ar", "22050", "-b:a", "64k", "-threads", "1",
         "-write_xing", "0", "-id3v2_version", "0", str(output / (card["id"] + ".mp3"))],
        input=wav.getvalue(), check=True,
    )


with ThreadPoolExecutor(max_workers=2) as pool:
    list(pool.map(render, cards))
