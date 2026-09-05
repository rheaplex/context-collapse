// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GNU-GPL-3.0-or-later
// metallic.js - Context Collapse: the metallic variant.
// Copyright (C) 2026 Myers Studio, Ltd.
// Free software under the GNU GPL, version 3 or later; see COPYING.

/* Gold, brass, bronze, copper, rose, pewter, steel, silver. Metal is a colour plus a highlight, so this is the one palette that needs a ramp. */
ContextCollapse.run({
  title: "Context Collapse — Metallic",
  slug: "context-collapse-metallic",
  palette: {
    colours: ["#d4af37", "#b5a642", "#cd7f32", "#b87333", "#b76e79", "#96a8a1", "#71797e", "#c0c0c0"],
    drift: [0.02, 0.25],
    spreadLit: 1,
    jitter: {
      h: 5,
      s: 7,
      l: 8
    }
  },
  fill: {
    kind: "gradient",
    shift: 24,
    dir: "n"
  }
});

// @license-end
