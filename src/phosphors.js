// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GNU-GPL-3.0-or-later
// phosphors.js - Context Collapse: the phosphors variant.
// Copyright (C) 2026 Myers Studio, Ltd.
// Free software under the GNU GPL, version 3 or later; see COPYING.

/* Three phosphors and no others. The blue is the classic blue screen of death,
   #0000AA — hue 240, a pure deep blue, not the cyan-leaning #0078D7 of the later
   Windows screens. The red is a red phosphor rather than an amber one, so it reads
   red and not yellow. Only three hues for sixteen timelines, so value has to tell
   them apart: litLadder steps lightness across the slots.
   Secondaries do appear — a yellow column, a magenta one — because colour spreads
   from what a timeline quotes, and red toward green passes through yellow.
   That is left alone: a colour CRT makes yellow out of red and green phosphor and
   magenta out of red and blue, so mixing is what the three are for. */
ContextCollapse.run({
  title: "Context Collapse — Phosphors",
  slug: "context-collapse-phosphors",
  palette: {
    hues: [4, 240, 122],
    drift: [0.03, 0.3],
    sat: [90, 100],
    lit: [26, 66],
    litLadder: true,
    jitter: {
      h: 4,
      s: 4,
      l: 6
    }
  }
});

// @license-end
