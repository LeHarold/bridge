# THE BRIDGE · Word Studio

An installable, offline English vocabulary platform based on THE BRIDGE.

## Features

- 2,517 word and phrase cards in printed book-page order (pages 2–241).
- Flashcards and alternating definition / sentence-blank spelling practice.
- A device-local Continue reading bookmark: study cards save your place automatically; library entries offer a Bookmark button.
- Red, yellow and green mastery indicators. One correct answer per word counts in each morning, afternoon or evening session; three correct sessions in a row turn green. Wrong answers reset the streak and return the next day.
- Device-local IndexedDB progress, editable tags, filtered search and JSON backup / restore.
- Multiple examples on separate lines; American pronunciation in KK notation.
- Print every word in the selected range with definitions, examples and pronunciation.
- Installable PWA; all learning assets are cached locally after the first online visit.

## Run locally

No dependencies or build step are required for the website.

```sh
python -m http.server 8000 --directory dist
```

Open http://localhost:8000. Service workers require HTTPS or localhost.

## Tests

Requires Node.js 20 or newer:

```sh
node verify-v4.mjs
```

The tests cover tag-filter cleanup, search, page ranges, example formatting, pronunciation coverage, full-range printing and offline service-worker responses.

## GitHub Pages

In repository Settings → Pages, select **GitHub Actions** as the publishing source. The included workflow verifies the app and deploys `dist/` after each push to `main`.

The app manifest and service-worker paths are relative so they work at a project URL such as `https://leharold.github.io/bridge/`.

## Install and transfer progress

Wait for **Ready for offline use**, then select **Install / Offline**. In Chrome or Edge, use Install app; in Safari on iPhone/iPad use Share → Add to Home Screen.

Progress is scoped to a browser and website origin. Before switching from the previous hosting address, export progress there, then import it on the GitHub Pages site. Installing on a different browser does not transfer progress automatically. Clearing site data removes stored progress.

Audio depends on voices installed on the device. All text content and practice work offline.

## Content and pronunciation credits

Vocabulary, definitions and examples originate in the user-supplied THE BRIDGE book; the original PDF and personal learning records are excluded from this repository. No rights in the book content are granted by this repository.

American pronunciation data is based on [ipa-dict](https://github.com/open-dict-data/ipa-dict) / CMUdict, converted to KK notation, with supplemental entries. Phrase pronunciations are assembled word by word and do not model connected speech. See [the pronunciation data license](dist/pronunciation-LICENSE.txt). KK uses [e] and [o] for the vowels commonly represented as /eɪ/ and /oʊ/ in IPA.


