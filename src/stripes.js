// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GNU-GPL-3.0-or-later
// stripes.js - Context Collapse: the stripes variant.
// Copyright (C) 2026 Myers Studio, Ltd.
// Free software under the GNU GPL, version 3 or later; see COPYING.

/* 10K Drop's repeating stripe cell, turned to 135 degrees so it runs top left
   to bottom right: warning tape. The two bands are equal widths, as tape's are.
   The second colour is the post's own shifted in value, so the texture stays
   inside one voice — every bubble is taped in its own colour. */
ContextCollapse.run({
  title: "Context Collapse — Stripes",
  slug: "context-collapse-stripes",
  fill: {
    kind: "stripe",
    shift: -24,
    cell: 14,
    element: 7,
    dir: "se"
  }
});

// @license-end
