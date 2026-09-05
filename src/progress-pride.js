// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GNU-GPL-3.0-or-later
// progress-pride.js - Context Collapse: the Progress Pride variant.
// Copyright (C) 2026 Myers Studio, Ltd.
// Free software under the GNU GPL, version 3 or later; see COPYING.

/* The Progress Pride flag, Daniel Quasar, 2018: the six rainbow stripes plus the
   chevron of white, pink and light blue for trans people and brown and black for
   people of colour. Eleven colours, checked against two published sources.

   blend is false, so the eleven are used exactly and repeated rather than
   interpolated. A colour halfway between the flag's pink and its brown is not a
   colour of the flag and should not be invented to fill a column.

   The ground is the eleven colours averaged: #8F7668, a warm greige. Not a neutral
   chosen to sit under the flag but the flag itself, mixed — which makes it a peer of
   the colours rather than an absence behind them, and gives it a reading: it is what
   the plane would become if the spread ran to completion and nothing held its edges.
   It also happens to land at 48% lightness, and mid is exactly what is needed, since
   the flag contains both #000000 and #FFFFFF and only a middle value lets both read.
   It clears every flag colour by 113 or more, nearest being the brown.
   Being outside the palette means none of the eleven is spent on the ground — all
   eleven stay available to the timelines.

   spreadLit is left off, so only hue spreads. Black and white have no saturation
   to spread, which means those two columns hold their colour exactly.

   Colour does spread here, and past MAXRINGS a quote overwrites the colour it
   quoted. That is not erasure in this palette: people update their identities, and
   this flag more than most. Baker's 1978 design had eight stripes and lost two of
   them; Philadelphia added black and brown in 2017; Quasar added this chevron in
   2018; Vecchietti added the intersex circle in 2021. Five revisions, two of them
   deletions. A symbol that has been rewritten that often is not insulted by a work
   about rewriting. */
ContextCollapse.run({
  title: "Context Collapse — Progress Pride",
  slug: "context-collapse-progress-pride",
  palette: {
    colours: ["#E40303", "#FF8C00", "#FFED00", "#008026", "#004DFF", "#750787",
              "#FFFFFF", "#FFAFC8", "#74D7EE", "#613915", "#000000"],
    blend: false,
    drift: [0.02, 0.3],
    jitter: { h: 4, s: 5, l: 5 },
    ground: { mean: true }
  }
});

// @license-end
