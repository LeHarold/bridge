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
    wav = io.BytesIO()
    offsets = []
    sample_rate = voice.config.sample_rate
    frames = 0
    with wave.open(wav, "wb") as stream:
        stream.setparams((1, 2, sample_rate, 0, "NONE", "not compressed"))
        for phrase in phrases:
            offsets.append(frames / sample_rate)
            for chunk in voice.synthesize(phrase, syn_config=config):
                pcm = chunk.audio_int16_bytes
                stream.writeframesraw(pcm)
                frames += len(pcm) // 2
            gap = sample_rate // 4
            stream.writeframesraw(bytes(gap * 2))
            frames += gap
    # Uniform frames without per-file tags or seek headers can be joined in the browser.
    subprocess.run(
        ["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", "pipe:0",
         "-ac", "1", "-ar", "22050", "-b:a", "64k", "-threads", "1",
         "-write_xing", "0", "-id3v2_version", "0", str(output / (card["id"] + ".mp3"))],
        input=wav.getvalue(), check=True,
    )
    return card['id'], offsets


with ThreadPoolExecutor(max_workers=2) as pool:
    timings = dict(pool.map(render, cards))
(output / 'timings.json').write_text(json.dumps(timings, separators=(',', ':')), encoding='utf-8')
