# Cleared design system

Customs paperwork: cool neutrals, one teal accent, red and green only for mismatch and match.

- **Tokens** live at the top of `public/css/cleared.css`. Change a value there, not in a page.
- **Colour:** ink, muted ink, surface, background, line. Accent teal is used for the one primary action per view, links, focus and progress. Red and green mean mismatch and match and nothing else. Body text meets 7:1.
- **Spacing:** 4, 8, 12, 16, 24, 32, 48, 64, 96. Things that belong together sit 8 to 16 apart. Sections sit 96 apart. Space separates groups, rules do not.
- **Radius:** 6 for inputs and small chips, 8 for buttons, 12 for cards and the document set, 14 for the floating bar. A button in the bar is 14 minus 6 padding, so 8.
- **Type:** Bricolage Grotesque for everything. Plex Mono only for values copied from documents (weights, codes, names as printed). Fraunces only in the footer. No italics. Headlines wrap with `text-wrap: balance`. Numbers use tabular figures.
- **Icons:** one set, 24px grid, 2.5px round stroke. Today that is the check mark.
- **Motion:** 120ms for press and hover, 220ms for state changes, one easing curve. Motion confirms something happened (a mismatch clears, a button is busy, a message appears). It is off when the reader prefers reduced motion.
- **Loading:** skeleton rows for tables and cards, a spinner inside the button that was pressed. Never a blank page or the word "Loading".
- **Pages are generated** by `build_pages.py`. Edit it, then run `npm run build:pages`.
