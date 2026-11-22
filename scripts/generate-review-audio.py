import json
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

dist = Path("dist")
output = dist / "review-audio"
output.mkdir(exist_ok=True)
cards = json.loads((dist / "cards.json").read_text(encoding="utf-8"))


def render(card):
    sections = [card["word"], card["meaning"], *card.get("examples", [])]
    text = "\n\n".join(section.strip() for section in sections if section.strip())
    wav = subprocess.run(
        ["espeak-ng", "-v", "en-us", "-s", "138", "-g", "2", "--stdin", "--stdout"],
        input=text.encode("utf-8"), stdout=subprocess.PIPE, check=True,
    ).stdout
    # Uniform frames without per-file tags or seek headers can be joined in the browser.
    subprocess.run(
        ["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", "pipe:0",
         "-ac", "1", "-ar", "22050", "-b:a", "32k", "-threads", "1",
         "-write_xing", "0", "-id3v2_version", "0", str(output / (card["id"] + ".mp3"))],
        input=wav, check=True,
    )


with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(render, cards))
