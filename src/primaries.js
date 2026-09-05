// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GNU-GPL-3.0-or-later
// primaries.js - Context Collapse: the primaries variant.
// Copyright (C) 2026 Myers Studio, Ltd.
// Free software under the GNU GPL, version 3 or later; see COPYING.

/* Six hues to start with. Every other colour on the plane has spread there:
   the mixing is the mechanic, not the palette. */
ContextCollapse.run({
  title: "Context Collapse — Primaries",
  slug: "context-collapse-primaries",
  palette: {
    hues: [0, 60, 120, 180, 240, 300],
    drift: [0.05, 0.5],
    sat: [96, 100],
    lit: [44, 56],
    jitter: {
      h: 3,
      s: 3,
      l: 7
    }
  }
});

// @license-end
