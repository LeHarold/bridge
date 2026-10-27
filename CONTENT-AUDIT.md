# THE BRIDGE content audit · 2026-10-27

Target repository: https://github.com/LeHarold/bridge

Target website: https://leharold.github.io/bridge/

Status: corrections verified locally and prepared for publication through GitHub Pages.

Compared all 2,495 existing entries to the text extracted from the supplied PDF. Identified 2,508 source bullets and recovered 13 omitted entries. Split four additional shoe idioms and five opposite-expression pairs into individual cards. The revised dataset contains 2,517 cards, ordered by source location. All original IDs and page references remain stable. Newly recovered entries and split cards receive new IDs. Existing progress remains keyed to the original IDs.

Corrections include the heading `abide by`, secondary definitions incorrectly treated as examples, missed examples after definitions without separators, corrupted spacing, part-of-speech labels inside spelling targets, and ambiguous noun/verb pronunciations for résumé/resume and wind. Supported synonymous spelling targets are accepted. Opposite phrases such as count in/count out, likely/unlikely, quarter past/quarter to, switch on/switch off and turn on/turn off are separate questions. Their examples were minimally adapted from the combined source examples and explicitly marked in the data.

The `source` field records PDF page, printed page and source bullet. Changed original entries retain `sourceOriginal`. See `content-audit.json` for affected IDs. Existing device-local IndexedDB records are not modified. The offline cache version is bumped so an eventual deployment refreshes the data and question module.

Validation: `node verify-v4.mjs` and `node verify-content.mjs`. The latter verifies source coverage, ID stability, page order and known content regressions. The first verifies filtering, printing, example layout, pronunciation availability and offline assets.

Limits: this is a complete entry inventory and extraction review, not a certification that every source-book definition, example or assembled phrase pronunciation is linguistically correct. Source-book issues still needing dictionary review include Diameter (b638), Dip (b650), Frizzle (b908), and the synonym-only Gleam entry (b993). Definitions must not be silently treated as authoritative merely because they appear in the supplied book. Phrase KK remains assembled word by word. No missing source examples have been invented.

Dictionary cross-checks used for corrections:

- Indulgence: https://dictionary.cambridge.org/dictionary/english/indulgence
- Implement: https://www.dictionary.com/browse/implement
- Blacksmith: https://api.pageplace.de/preview/DT0400.9780511451270_A25081870/preview-9780511451270_A25081870.pdf (Cambridge School Dictionary search excerpt)
- Circulation: https://dictionary.cambridge.org/dictionary/english/circulation
- Density: https://goldbook.iupac.org/terms/view/D01590
- Patent: https://dictionary.cambridge.org/us/dictionary/english/patent

The original PDF and extracted full text are excluded from the publishable website. Only `dist/` is hosted by the existing Pages workflow. Audit scripts rely on the local source extraction and are not required to run the website.


