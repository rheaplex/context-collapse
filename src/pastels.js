// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GNU-GPL-3.0-or-later
// pastels.js - Context Collapse: the pastels variant.
// Copyright (C) 2026 Myers Studio, Ltd.
// Free software under the GNU GPL, version 3 or later; see COPYING.

/* Chroma pulled right down and value up, but not to the very top: the
   ground is a lighter pastel again, and it needs somewhere to be. */
ContextCollapse.run({
  title: "Context Collapse — Pastels",
  slug: "context-collapse-pastels",
  palette: {
    sat: [30, 48],
    lit: [64, 76],
    jitter: {
      h: 8,
      s: 8,
      l: 7
    }
  }
});

// @license-end
