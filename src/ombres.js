// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GNU-GPL-3.0-or-later
// ombres.js - Context Collapse: the ombres variant.
// Copyright (C) 2026 Myers Studio, Ltd.
// Free software under the GNU GPL, version 3 or later; see COPYING.

/* 10K Drop's gradient, stops at 0.3 and 0.7 so each end holds flat before it
   turns, run top left to bottom right on the axis the tape runs on.
   The direction is "ne" and not the "se" that gives a pattern that same
   diagonal: the eight names come from 10K Drop, where they name a gradient's
   axis, so for gradients they mean what they say and for patterns they are
   inverted. Checked by eye both times.
   Every ring ramps across itself, so a nested quote is a stack of ramps at the
   same angle rather than one ramp cut into bands. */
ContextCollapse.run({
  title: "Context Collapse — Ombres",
  slug: "context-collapse-ombres",
  fill: {
    kind: "gradient",
    shift: -34,
    dir: "ne"
  }
});

// @license-end
