// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GNU-GPL-3.0-or-later
// checks.js - Context Collapse: the checks variant.
// Copyright (C) 2026 Myers Studio, Ltd.
// Free software under the GNU GPL, version 3 or later; see COPYING.

/* 10K Drop's check: the cell is half filled in two quarters, so there is no gap colour and the two tones weigh the same. */
ContextCollapse.run({
  title: "Context Collapse — Checks",
  slug: "context-collapse-checks",
  fill: {
    kind: "check",
    shift: -22,
    cell: 12,
    dir: "n"
  }
});

// @license-end
