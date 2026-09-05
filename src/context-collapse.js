// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GNU-GPL-3.0-or-later
// context-collapse.js - Sixteen timelines quoting each other into collapse.
// Copyright (C) 2026 Myers Studio, Ltd.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

/* ------------------------------------------------------------------ *
 * CONTEXT COLLAPSE — engine
 *
 * 16 vertical timelines. Posts are speech bubbles of emotive colour.
 * A timeline reacts by quoting a bubble from beside it, drawing it again
 * inside a frame of its own reaction colour. Quotes of quotes nest; past
 * three rings the innermost surviving reaction becomes the fill and the
 * original colour is gone.
 * A post is fixed at the moment it is made. Nothing about it changes
 * afterwards; a few are deleted, and the column closes over the hole, but
 * the quotes of it elsewhere are untouched. What decays is not the post
 * but the attention paid to it.
 * The newest post arrives at the bottom and the column rides up, as a
 * chat does. You can only quote what is in front of you: the row above
 * you in your own column, or the bottom of the column to either side.
 * A tail marks that a post is an answer. Originating nothing, it has
 * none. Answering another timeline it hangs bottom left, pointing out of
 * the column. Answering itself it hangs top right, pointing up at the row
 * above — which is exactly where a self-answer's source is, so that one
 * tail in the piece points true.
 * The ground is a single colour, and it is the seventeenth member of the
 * same palette the sixteen timelines come from: one palette, divided
 * seventeen ways, one share kept back for the surface.
 * No timeline holds one pace. Each drifts between busy and near dormant
 * on its own slow cycle, so which columns are the fast ones changes over
 * the course of a run.
 * Colour spreads: quoting pulls a timeline's palette toward what it quoted.
 * Reaction flows mostly left to right, one column at a time.
 *
 * The engine is shared; a piece is a config. See the per-variant .js files.
 * ------------------------------------------------------------------ */

(function (global) {
"use strict";

const W = 1920, H = 1080;
const N = 16;                 // timelines
const GUT = 16;               // gutter: room for a tail to reach into
const PAD = GUT;              // the outer margin is a gutter too, so the
                              // edge columns' tails have the same room as
                              // everyone else's and nothing runs off the plane
const COLW = (W - PAD * 2 - GUT * (N - 1)) / N;   // 103, every x integral
const ROW = 18;               // a "row": one line of a post
const MAXROWS = 6;            // a post is 2-6 rows
const RING = ROW / 2;         // quote frame, half a row each side, so that
                              // a quote is exactly one row taller than its
                              // source and the source keeps its true size
const MAXRINGS = 3;           // rings kept before the fill is overwritten
const NEARROWS = 3;           // how far into a neighbouring column you look
const GAP = 12;               // gap between posts, and room for a tail
const TAILB = ROW * 1.5;      // tail base, buried in the corner
const TAILL = ROW * (2 / 3);  // the part that shows: 12, clear of the 16 it
                              // reaches into, whether gutter or margin
const TAILC = 0.45;           // sides bowed slightly in, so it tapers to a
                              // point rather than swelling into a lobe
const RAD = 16;               // corner radius: a bubble, not a rounded box
const MINRAD = 3;             // ...that a nested bubble never fully loses
const ATTN = 20000;           // ms over which a post stops being quotable
const DELP = 0.035;           // proportion of posts their author later deletes
const PREROLL = 900000;       // ms of feed run before the first frame

////////////////////////////////////////////////////////////////////////
// Config: a piece is the rules plus one of these.
////////////////////////////////////////////////////////////////////////

const DEFAULTS = {
  title: "Context Collapse",
  slug: "context-collapse",
  seed: null,            // a seed baked in: a number, or the hex string you
                         // would otherwise have put after the # in the URL.
                         // For a page with no address bar to read one from.
  palette: {
    hues: "spread",      // "spread" round the wheel, or [h, h, h] to cycle
    colours: null,       // or an explicit list of hex strings
    blend: true,         // true treats that list as a ramp and interpolates it
                         // to fill the slots. false uses the colours exactly and
                         // repeats them instead — for a set that means something
                         // as a set, where a colour between two of them is not a
                         // member and should not be invented
    sat: [52, 92],
    lit: [42, 62],
    litLadder: false,    // step lightness across the slots, for palettes whose
                         // hues repeat and so cannot tell columns apart
    litRange: null,      // remap an explicit ramp's lightness into this band.
                         // A ramp spanning the whole range leaves no lightness
                         // for the ground: whatever the ground is, some column
                         // matches it and disappears. Compressing the ramp
                         // keeps every one of its colours visible.
    drift: [0.1, 2.2],   // idle hue walk, deg/s. The restoring pull has a ~20 s
                         // time constant, so a column settles about 20x this
                         // far from its founding hue: at the default up to 44
                         // degrees, which is life on a full wheel and ruin for
                         // a palette that is only allowed three hues.
    jitter: { h: 7, s: 10, l: 12 },
    spreadLit: 0,        // how much lightness spreads as well as hue: 0 for
                         // wheel palettes, 1 where lightness is what actually
                         // distinguishes one timeline from another
    // The ground is the seventeenth slot of the palette, and by default it
    // works out its own value from where the other sixteen actually sit: a
    // light palette gets a lighter ground, a dark one a darker, and a palette
    // stuck in the middle gets contrast instead. Give s/l to set it by hand,
    // or a hex to make it a support rather than a member — the palette then
    // divides sixteen ways, because the paper is not one of your pigments.
    // `mean: true` instead makes it the average of `colours`: not a neutral
    // chosen to sit under the palette but the palette itself, mixed. Only sound
    // where that average lands clear of the colours it came from — for a set
    // spanning black to white it lands mid, which is exactly where it is needed;
    // for a set that is all mid-lightness it would land on top of them.
    ground: { s: null, l: null, hex: null, mean: false }
  },
  fill: {
    kind: "flat",        // flat | gradient | twostripes | spot | box | check | stripe
    shift: -20,          // lightness offset of the fill's second colour
    groundShift: null,   // ...and on the ground, where it wants to be quieter.
                         // Defaults to a little over half the posts' shift.
    cell: ROW,           // pattern cell
    element: ROW * 0.62, // the mark inside the cell
    dir: "n"             // n ne e se s sw w nw
  }
};

let CFG = DEFAULTS;

const merge = (base, over) => {
  const out = {};
  for (const k in base) {
    const b = base[k], o = over ? over[k] : undefined;
    if (o === undefined) out[k] = b;
    else if (b && typeof b === "object" && !Array.isArray(b)) out[k] = merge(b, o);
    else out[k] = o;
  }
  for (const k in (over || {})) if (!(k in out)) out[k] = over[k];
  return out;
};

////////////////////////////////////////////////////////////////////////
// Seeded randomness. Every frame is reproducible from the hash.
////////////////////////////////////////////////////////////////////////
const mulberry32 = (a) => {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
let rnd, seed;
const rr = (a, b) => a + rnd() * (b - a);
const ri = (a, b) => Math.floor(rr(a, b + 1));
// posting rates are log-distributed, not uniform: most accounts are quiet
// and a few are relentless.
const lrr = (a, b) => Math.exp(rr(Math.log(a), Math.log(b)));
const clamp = (v, lo, hi) => v < lo ? lo : (v > hi ? hi : v);

////////////////////////////////////////////////////////////////////////
// Colour values and conversions.
////////////////////////////////////////////////////////////////////////
const hsl2rgb = (h, s, l) => {
  h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
};
const rgb2hsl = (rgb) => {
  const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  const l = (mx + mn) / 2;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  return { h: (h + 360) % 360, s: s * 100, l: l * 100 };
};
const hex2rgb = (hex) => {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
const rgbStr = (rgb) => {
  return "rgb(" + (rgb[0] | 0) + "," + (rgb[1] | 0) + "," + (rgb[2] | 0) + ")";
};
// shortest-arc drift of hue a toward hue b
const hueToward = (a, b, t) => {
  let d = ((b - a + 540) % 360) - 180;
  return ((a + d * t) % 360 + 360) % 360;
};
// a colour carries the hsl it was made from, not just the rgb, so that a
// patterned fill can derive a second colour from it without guessing
const makeColour = (h, s, l) => ({ h: h, s: s, l: l, c: hsl2rgb(h, s, l) });

////////////////////////////////////////////////////////////////////////
// Palettes: seventeen slots round a wheel, or an explicit set.
////////////////////////////////////////////////////////////////////////

// Seventeen slots, not sixteen: the ground takes one, so the surface is a
// member of the palette rather than a colour from outside it. Shuffled, so
// that neighbouring columns are not already adjacent — the spread has to do
// real work to make a bloc — and so which share falls to the ground is not
// fixed either.
// true when the ground is not one of the palette's own slots
const groundIsOutside = () => {
  const g = CFG.palette.ground;
  return !!(g.hex || (g.mean && CFG.palette.colours));
};

const makeSlots = () => {
  const P = CFG.palette, n = N + (groundIsOutside() ? 0 : 1), slots = [];
  if (P.colours && P.blend === false) {
    // Exact colours. Shuffle the list before cycling it, so that which of them
    // have to repeat in order to fill sixteen columns is not always the same
    // few — with eleven colours and sixteen columns, five must appear twice.
    const base = P.colours.map(function (x) { return rgb2hsl(hex2rgb(x)); });
    for (let i = base.length - 1; i > 0; i--) {
      const j = ri(0, i); const t = base[i]; base[i] = base[j]; base[j] = t;
    }
    for (let i = 0; i < n; i++) {
      const b = base[i % base.length];
      slots.push({ h: b.h, s: b.s, l: b.l });
    }
  } else if (P.colours) {
    // an explicit ramp, resampled by interpolating in rgb
    const ramp = P.colours.map(hex2rgb);
    for (let i = 0; i < n; i++) {
      const t = i * (ramp.length - 1) / (n - 1);
      const k = Math.min(ramp.length - 2, Math.floor(t)), f = t - k;
      const c = [0, 1, 2].map(j => ramp[k][j] + (ramp[k + 1][j] - ramp[k][j]) * f);
      slots.push(rgb2hsl(c));
    }
  } else if (Array.isArray(P.hues)) {
    for (let i = 0; i < n; i++)
      slots.push({ h: P.hues[i % P.hues.length] + rr(-4, 4), s: null, l: null });
  } else {
    for (let i = 0; i < n; i++) slots.push({ h: i * (360 / n) + rr(-8, 8), s: null, l: null });
  }
  if (P.colours && P.litRange) {
    let lo = 100, hi = 0;
    for (const s of slots) { if (s.l < lo) lo = s.l; if (s.l > hi) hi = s.l; }
    const span = hi - lo || 1;
    for (const s of slots)
      s.l = P.litRange[0] + (s.l - lo) / span * (P.litRange[1] - P.litRange[0]);
  }
  if (P.litLadder)
    for (let i = 0; i < n; i++)
      slots[i].l = P.lit[0] + (P.lit[1] - P.lit[0]) * (i / (n - 1));
  for (let i = slots.length - 1; i > 0; i--) {
    const j = ri(0, i); const t = slots[i]; slots[i] = slots[j]; slots[j] = t;
  }
  return slots;
};

// quoteBias ramps with the column index, from a timeline that only originates
// to one that only answers. If lightness ramped with it too, the plane would
// say value decides who speaks and who may only reply — a claim no palette
// should make by accident, and least of all a palette of skin tones. Left to
// chance it is usually harmless, mean r about 0 over 400 seeds, but one seed
// in seventeen came out past |r| = 0.5 and one in a hundred past 0.7. So the
// deal is reshuffled until value and rank are unrelated. Every arrangement
// that passes is still equally likely; only the tail is removed.
const MAXCORR = 0.25;

const lightnessAgainstIndex = (slots) => {
  const n = slots.length;
  let mx = 0, my = 0;
  for (let i = 0; i < n; i++) { mx += i; my += slots[i].l; }
  mx /= n; my /= n;
  let sx = 0, sy = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = i - mx, dy = slots[i].l - my;
    sx += dx * dx; sy += dy * dy; sxy += dx * dy;
  }
  return sy === 0 ? 0 : sxy / Math.sqrt(sx * sy);
};

const decorrelate = (slots) => {
  for (let tries = 0; tries < 200; tries++) {
    if (Math.abs(lightnessAgainstIndex(slots)) <= MAXCORR) return;
    for (let i = slots.length - 1; i > 0; i--) {
      const j = ri(0, i); const t = slots[i]; slots[i] = slots[j]; slots[j] = t;
    }
  }
};

////////////////////////////////////////////////////////////////////////
// The world: sixteen timelines and what they post.
////////////////////////////////////////////////////////////////////////
let agents = [], uid = 0, paused = false;
let ground = "#000";          // the css string, for the canvas element
let groundCol = null;         // ...and the colour itself, so it can be filled
                              // with the same pattern the posts are
let cv, ctx, last = 0, clock = 0;

const build = (s) => {
  seed = s >>> 0;
  rnd = mulberry32(seed);
  uid = 0;
  agents = [];
  patterns.clear();

  const P = CFG.palette;
  const slots = makeSlots();
  // the seventeenth. It never posts and never quotes, so unlike the other
  // sixteen it never drifts: the ground is the one colour that stays put.
  const gslot = groundIsOutside() ? null : slots.pop();
  // fill in whatever the palette left to chance, then deal the sixteen so
  // that value does not track rank
  for (const sl of slots) {
    if (sl.s === null || sl.s === undefined) sl.s = rr(P.sat[0], P.sat[1]);
    if (sl.l === null || sl.l === undefined) sl.l = rr(P.lit[0], P.lit[1]);
  }
  decorrelate(slots);

  for (let i = 0; i < N; i++) {
    const t = i / (N - 1), sl = slots[i];
    agents.push({
      i: i,
      x: PAD + i * (COLW + GUT),
      hue: sl.h,
      hue0: sl.h,
      sat: sl.s,
      lit: sl.l,
      lit0: sl.l,
      // left edge originates, right edge only reacts
      quoteBias: Math.max(0, Math.min(0.97, 0.03 + t * 0.93 + rr(-0.14, 0.14))),
      interval: lrr(3200, 42000),                           // activity level
      // ...but activity is a mood, not a constant. Two slow sines of
      // different period give each column a rhythm no other column shares.
      per1: rr(48000, 165000),
      per2: rr(15000, 52000),
      ph1: rr(0, 6.283),
      ph2: rr(0, 6.283),
      swing: rr(0.45, 1.5),                                 // depth of the mood
      latency: lrr(250, 5000),                              // speed of response
      spread: rr(0.015, 0.24),                              // how fast colour spreads in
      drift: rr(P.drift[0], P.drift[1]),                    // idle hue walk
      burstiness: rr(0.02, 0.3),
      burst: 0,
      next: rr(0, 2500),
      blocks: []
    });
  }

  if (P.ground.hex) {
    const c = rgb2hsl(hex2rgb(P.ground.hex));
    groundCol = makeColour(c.h, c.s, c.l);
  } else if (P.ground.mean && P.colours) {
    // every colour in the palette, averaged: the ground is what the plane
    // would be if the spread ran to completion and nothing held its edges
    const cs = P.colours.map(hex2rgb);
    const m = [0, 1, 2].map(function (j) {
      return cs.reduce(function (a, c) { return a + c[j]; }, 0) / cs.length;
    });
    const c = rgb2hsl(m);
    groundCol = makeColour(c.h, c.s, c.l);
  } else if (P.ground.s !== null && P.ground.l !== null) {
    groundCol = makeColour(gslot.h, P.ground.s, P.ground.l);
  } else {
    groundCol = autoGround(gslot.h);
  }
  ground = rgbStr(groundCol.c);
};

// Where the ground should sit, read off where the sixteen actually are.
// A palette that lives in the light gets a lighter ground and stays in its
// own register; one that lives in the dark gets a darker one; one sitting in
// the middle has nowhere to hide, so it gets contrast — the roomier side.
// Chroma is a fraction of the palette's, so the ground is of the family and
// still recedes.
const autoGround = (hue) => {
  const P = CFG.palette, J = P.jitter;
  let lo = 100, hi = 0, sat = 0, chroma = 0;
  for (const a of agents) {
    if (a.lit - J.l * 0.75 < lo) lo = a.lit - J.l * 0.75;
    if (a.lit + J.l > hi) hi = a.lit + J.l;
    sat += a.sat;
    // actual colour, not the saturation number: at 95% lightness a 90%
    // saturated colour is still nearly white
    chroma += (1 - Math.abs(2 * a.lit / 100 - 1)) * a.sat / 100;
  }
  lo = clamp(lo, 0, 100); hi = clamp(hi, 0, 100);
  const mean = sat / agents.length, meanC = chroma / agents.length;
  const mid = (lo + hi) / 2;
  const roomUp = 100 - hi, roomDown = lo, MINGAP = 12;
  let up;
  if (mid >= 62 && roomUp >= MINGAP) up = true;         // lives in the light
  else if (mid <= 38 && roomDown >= MINGAP) up = false; // lives in the dark
  else {
    // Stuck in the middle, so value cannot decide and chroma does. Saturated
    // colour glows on a dark ground and washes out on a light one; colour
    // with little chroma reads as material, and wants paper. Without this,
    // phosphors — mid-band and fully saturated — landed on near-white.
    const wantUp = mean < 55;
    if (wantUp && roomUp >= MINGAP) up = true;
    else if (!wantUp && roomDown >= MINGAP) up = false;
    else up = roomUp > roomDown;
  }
  // Sit just clear of the band rather than as far from it as possible. Pushed
  // to the end of the range a ground is black or white; this one is meant to
  // be a colour that the foreground has to sit against.
  const GAP = 14;
  const l = up ? Math.min(92, hi + GAP) : Math.max(13, lo - GAP);
  // HSL has little chroma to give near either end of the lightness range, so
  // saturation has to rise there to keep the same amount of actual colour.
  // Setting saturation directly gave washed-out pales and sooty darks.
  const cap = 1 - Math.abs(2 * l / 100 - 1);
  return makeColour(hue, clamp(meanC * 0.5 / Math.max(cap, 0.1) * 100, 30, 100), l);
};

// how much slower or faster than its baseline a timeline is posting now.
// exp() so that busy and quiet are symmetrical multiples, not offsets.
const tempo = (a, now) => {
  return Math.exp(a.swing * (Math.sin(now / a.per1 + a.ph1) * 0.65 +
                             Math.sin(now / a.per2 + a.ph2) * 0.35));
};

const post = (a, now) => {
  const wantQuote = rnd() < a.quoteBias;
  let b = null;
  if (wantQuote) b = quote(a, now);
  if (!b) b = original(a);
  b.born = now;
  // the one thing that can still happen to a post, decided when it is made
  b.dies = rnd() < DELP ? now - Math.log(1 - rnd()) * 20000 : Infinity;
  b.y = H + GAP;                 // arrives from below and rides up
  a.blocks.unshift(b);
  if (a.blocks.length > 220) a.blocks.length = 220;
};

const original = (a) => {
  const P = CFG.palette, J = P.jitter;
  return {
    id: uid++,
    col: a.i,
    // 2-6 rows, skewed short: most posts are one thought
    h: ROW * (2 + Math.floor(Math.pow(rnd(), 1.6) * (MAXROWS - 1))),
    fill: makeColour(a.hue + rr(-J.h, J.h),
             a.sat + rr(-J.s, J.s),
             a.lit + rr(-J.l * 0.75, J.l)),
    rings: [],
    depth: 0,
    tail: null,                       // originating: answering nothing
    quotes: 0
  };
};

const quote = (a, now) => {
  const cands = [], wts = [];
  let total = 0;
  // A new post arrives at the bottom of its column, so the only things it
  // can plausibly be seen to refer to are the ones next to it there: the
  // row immediately above it, or the bottom few rows of either neighbour.
  for (let i = a.i - 1; i <= a.i + 1; i++) {
    if (i < 0 || i >= N) continue;
    // reaction still flows left to right, one column at a time
    const dir = i < a.i ? 1 : (i > a.i ? 0.15 : 0.45);
    const rows = i === a.i ? 1 : NEARROWS;   // own column: only the row above
    const src = agents[i].blocks;
    for (let k = 0; k < Math.min(rows, src.length); k++) {
      const b = src[k];
      if (now - b.born < a.latency) continue; // hasn't seen it yet
      // attention decays, the post does not: an old block is still bright,
      // it has just stopped being something anyone reacts to.
      // preferential attachment: already-quoted blocks attract quotes
      const bw = dir * Math.pow(0.55, k) *
                 (0.04 + Math.exp(-(now - b.born) / ATTN)) *
                 (1 + b.quotes * 0.85) * (b.depth === 0 ? 1.3 : 1);
      cands.push(b); wts.push(bw); total += bw;
    }
  }
  if (!total) return null;
  let pick = rnd() * total, src = cands[cands.length - 1];
  for (let k = 0; k < cands.length; k++) {
    pick -= wts[k];
    if (pick <= 0) { src = cands[k]; break; }
  }

  // quoting leaves no mark on the thing quoted, only on who quotes next
  src.quotes++;

  // colour spreads from what is quoted into whoever quotes it. Hue always;
  // lightness too where lightness is what tells the palette apart.
  const P = CFG.palette, J = P.jitter;
  a.hue = hueToward(a.hue, src.fill.h, a.spread);
  if (P.spreadLit) a.lit += (src.fill.l - a.lit) * a.spread * P.spreadLit;

  const rings = src.rings.slice();
  rings.push(makeColour(a.hue + rr(-J.h * 0.7, J.h * 0.7),
                a.sat + rr(-J.s * 0.6, J.s * 0.6),
                a.lit + rr(-J.l * 0.35, J.l * 0.8)));
  let fill = src.fill;
  // past MAXRINGS the innermost surviving reaction becomes the fill:
  // the original is overwritten by the reaction to the reaction.
  while (rings.length > MAXRINGS) fill = rings.shift();

  return {
    id: uid++,
    col: a.i,
    h: Math.min(ROW * (MAXROWS + MAXRINGS), src.h + RING * 2),
    fill: fill,
    rings: rings,
    depth: src.depth + 1,
    // answering someone else hangs left, answering yourself hangs up
    tail: src.col === a.i ? 1 : -1,
    quotes: 0
  };
};

////////////////////////////////////////////////////////////////////////
// Fills, after 10K Drop: flat, a soft gradient, two hard stripes, and a
// repeating cell holding a spot, a box, a check or a stripe, any of them
// turned to one of eight directions. The second colour is always the post's
// own, shifted in lightness, so a pattern is a texture within one voice
// rather than a second voice smuggled in.
////////////////////////////////////////////////////////////////////////

const patterns = new Map();

const directionToAngle = (d) => {
  return { n: 0, ne: 45, e: 90, se: 135, s: 180, sw: 225, w: 270, nw: 315 }[d] || 0;
};
const gradientCoordsForDirection = (x1, y1, x2, y2, d) => {
  switch (d) {
    case "n":  return { x1: x1, y1: y1, x2: x1, y2: y2 };
    case "ne": return { x1: x1, y1: y1, x2: x2, y2: y2 };
    case "e":  return { x1: x1, y1: y1, x2: x2, y2: y1 };
    case "se": return { x1: x1, y1: y2, x2: x2, y2: y1 };
    case "s":  return { x1: x1, y1: y2, x2: x1, y2: y1 };
    case "sw": return { x1: x2, y1: y2, x2: x1, y2: y1 };
    case "w":  return { x1: x2, y1: y1, x2: x1, y2: y1 };
    default:   return { x1: x2, y1: y2, x2: x1, y2: y2 };
  }
};

const createCanvasPattern = (kind, a, b) => {
  const key = kind + "|" + a + "|" + b;
  let p = patterns.get(key);
  if (p) return p;
  const F = CFG.fill;
  const cell = Math.max(4, Math.round(F.cell));
  const el = Math.max(1, Math.round(F.element));
  const edge = (cell - el) / 2;
  const off = document.createElement("canvas");
  off.width = off.height = cell;
  const c2 = off.getContext("2d");
  c2.fillStyle = a; c2.fillRect(0, 0, cell, cell);
  c2.fillStyle = b;
  if (kind === "spot") {
    c2.beginPath(); c2.arc(cell / 2, cell / 2, el / 2, 0, Math.PI * 2); c2.fill();
  } else if (kind === "box") {
    c2.fillRect(edge, edge, el, el);
  } else if (kind === "check") {
    c2.fillRect(0, cell / 2, cell / 2, cell / 2);
    c2.fillRect(cell / 2, 0, cell / 2, cell / 2);
  } else if (kind === "stripe") {
    c2.fillRect(0, edge, cell, el);
  }
  p = ctx.createPattern(off, "repeat");
  if (patterns.size > 900) patterns.clear();   // posts churn; do not hoard
  patterns.set(key, p);
  return p;
};

// x/y/w/h are the rect being filled, and set a gradient's extent, so each
// ring ramps across itself. ax/ay are where a repeating pattern is anchored,
// which is not the same thing: pass the whole post's origin for every one of
// its rings and the texture runs through the lot unbroken, one piece of tape
// rather than one per ring.
const paint = (col, x, y, w, h, shift, ax, ay) => {
  const F = CFG.fill;
  if (F.kind === "flat") return rgbStr(col.c);
  if (shift === undefined || shift === null) shift = F.shift;
  const two = rgbStr(hsl2rgb(col.h, col.s, clamp(col.l + shift, 4, 96)));
  if (F.kind === "gradient" || F.kind === "twostripes") {
    const c = gradientCoordsForDirection(x, y, x + w, y + h, F.dir);
    const g = ctx.createLinearGradient(c.x1, c.y1, c.x2, c.y2);
    if (F.kind === "twostripes") {
      g.addColorStop(0, rgbStr(col.c));
      g.addColorStop(0.5, rgbStr(col.c));
      g.addColorStop(0.5000001, two);
      g.addColorStop(1, two);
    } else {
      g.addColorStop(0.3, rgbStr(col.c));
      g.addColorStop(0.7, two);
    }
    return g;
  }
  const p = createCanvasPattern(F.kind, rgbStr(col.c), two);
  // the texture travels with the post rather than showing through it
  p.setTransform(new DOMMatrix()
    .translateSelf(ax === undefined ? x : ax, ay === undefined ? y : ay)
    .rotateSelf(directionToAngle(F.dir)));
  return p;
};

////////////////////////////////////////////////////////////////////////
// Simulation.
////////////////////////////////////////////////////////////////////////

const step = (dt, now) => {
  for (const a of agents) {
    // idle drift keeps a quiet timeline from being frozen, and a weak pull
    // back to where it started keeps the spread from collapsing all sixteen
    // into one colour: blocs form, and hold their edges
    a.hue = (a.hue + a.drift * dt * 0.001 + 360) % 360;
    a.hue = hueToward(a.hue, a.hue0, dt * 0.00005);
    if (CFG.palette.spreadLit) a.lit += (a.lit0 - a.lit) * dt * 0.00005;

    if (a.next < now - 2000) a.next = now;   // never catch up on a lost tab
    while (now >= a.next) {
      post(a, now);
      const pace = a.interval * tempo(a, now);
      if (a.burst > 0) {
        a.burst--;
        a.next += Math.max(900, pace * rr(0.22, 0.5));
      } else {
        if (rnd() < a.burstiness) a.burst = ri(2, 5);
        a.next += pace * rr(0.6, 1.6);
      }
    }

    // Deletion: the column closes over the hole, and the quotes of it in
    // other columns are untouched. But a post only goes when the column can
    // lose it and still reach the top of the plane — otherwise deleting one
    // post tears an empty band into the feed. So a post marked for deletion
    // waits, sometimes a long time, and in a quiet column may never go at
    // all. You cannot delete a thing while its absence would show.
    let stack = 0;
    for (const b of a.blocks) stack += b.h;
    stack += GAP * Math.max(0, a.blocks.length - 1);
    for (let n = a.blocks.length - 1; n >= 0; n--) {
      const b = a.blocks[n];
      if (now < b.dies) continue;
      if (stack - b.h - GAP < H - PAD) continue;   // its absence would show
      a.blocks.splice(n, 1);
      stack -= b.h + GAP;
    }

    // the newest sits at the bottom and everything older rides up above it
    let y = H - PAD;
    // a post shoves the column over about a third of a second, so the
    // movement reads as displacement rather than as a cut
    const k = 1 - Math.exp(-dt * 0.0042);
    for (let n = 0; n < a.blocks.length; n++) {
      const b = a.blocks[n];
      y -= b.h; b.ty = y; y -= GAP;
      b.y += (b.ty - b.y) * k;
    }
    // the oldest leaves at the top
    while (a.blocks.length) {
      const o = a.blocks[a.blocks.length - 1];
      if (o.y + o.h < 0) a.blocks.pop(); else break;
    }
  }
};

////////////////////////////////////////////////////////////////////////
// Drawing.
////////////////////////////////////////////////////////////////////////

// A post is a roundrect. Rings are concentric, so each inset shrinks the
// radius by the same amount or the corners stop being parallel.
const roundRectPath = (x, y, w, h, r) => {
  h = Math.max(0, h);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
};

// One shape, turned. Answering another timeline: bottom left, pointing out
// of the column. Answering itself: top right, pointing up at the row above,
// which is where a self-answer's source is now that the feed runs upward.
// It grows from the centre of the corner's arc rather than sitting on the
// edge, burying the base inside the body so the join is seamless.
const tailPath = (x, b) => {
  const r = Math.min(RAD, b.h / 2);
  const out = b.tail < 0;
  const cx = out ? x + r : x + COLW - r;
  const cy = out ? b.y + b.h - r : b.y + r;
  const ux = out ? -1 : 0, uy = out ? 0 : -1;  // the way it points
  const px = -uy, py = ux;                     // across it, for the base
  const L = r + TAILL, hb = TAILB / 2, cb = TAILB * TAILC, cl = L * TAILC;
  ctx.beginPath();
  ctx.moveTo(cx + px * hb, cy + py * hb);
  ctx.quadraticCurveTo(cx + ux * cl + px * cb, cy + uy * cl + py * cb,
                       cx + ux * L, cy + uy * L);
  ctx.quadraticCurveTo(cx + ux * cl - px * cb, cy + uy * cl - py * cb,
                       cx - px * hb, cy - py * hb);
  ctx.closePath();
};

const draw = () => {
  // the ground takes the same fill as the posts, one step quieter: a
  // patterned piece is patterned all the way down, not shapes on a flat card
  const F = CFG.fill;
  const gs = F.groundShift === null ? F.shift * 0.55 : F.groundShift;
  ctx.fillStyle = paint(groundCol, 0, 0, W, H, gs);
  ctx.fillRect(0, 0, W, H);

  for (const a of agents) {
    for (const b of a.blocks) {
      if (b.y + b.h < 0 || b.y > H) continue;
      const n = b.rings.length;

      if (b.tail !== null) {
        const oc = n ? b.rings[n - 1] : b.fill;
        ctx.fillStyle = paint(oc, a.x, b.y, COLW, b.h);
        tailPath(a.x, b);
        ctx.fill();
      }

      // outermost ring is the most recent reaction. None of this is a
      // function of time: the post looks the same the day it scrolls away
      // as it did the second it was made.
      for (let k = 0; k < n; k++) {
        const inset = k * RING;
        const w = COLW - inset * 2, hh = b.h - inset * 2;
        ctx.fillStyle = paint(b.rings[n - 1 - k], a.x + inset, b.y + inset, w, hh,
                              null, a.x, b.y);
        roundRectPath(a.x + inset, b.y + inset, w, hh, Math.max(MINRAD, RAD - inset));
        ctx.fill();
      }
      const ins = n * RING, w = COLW - ins * 2, hh = b.h - ins * 2;
      ctx.fillStyle = paint(b.fill, a.x + ins, b.y + ins, w, hh, null, a.x, b.y);
      roundRectPath(a.x + ins, b.y + ins, w, hh, Math.max(MINRAD, RAD - ins));
      ctx.fill();
    }
  }
};

const frame = (t) => {
  requestAnimationFrame(frame);
  if (!last) last = t;
  let dt = t - last; last = t;
  if (paused) return;
  if (dt > 120) dt = 120;          // don't detonate after a background tab
  clock += dt;
  step(dt, clock);
  draw();
};

// the feed did not start when you opened it: run it forward before the
// first frame so the plane is already full of history. Fifteen minutes: a
// column that spends its first few minutes dormant needs that long to fill.
const preroll = (ms) => {
  const h = 34;
  for (let t = 0; t < ms; t += h) { clock += h; step(h, clock); }
  for (const a of agents) for (const b of a.blocks) b.y = b.ty;
};

////////////////////////////////////////////////////////////////////////
// The page around the plane.
////////////////////////////////////////////////////////////////////////

// Framed: a marketplace token, or a preview on the contact sheet. The address
// bar is not ours to write to and the click is not ours to take — a viewer has
// to click the plane to give it focus, and that click would land on the pause.
// Framed, the piece takes its seed from the config and is left to run.
const framed = (() => {
  try { return window.self !== window.top; } catch (e) { return true; }
})();

// A baked seed, as a number or as the hex you would have typed after the #.
const bakedSeed = () => {
  const s = CFG.seed;
  if (s === null || s === undefined) return undefined;
  const n = typeof s === "string" ? parseInt(s, 16) : s;
  return Number.isFinite(n) ? n : undefined;
};

const CSS =
  '*{box-sizing:border-box}' +
  'body{margin:0;background:#101018;' +          // until the seed is known
  '-webkit-font-smoothing:antialiased;overflow:hidden}' +
  '#stage{position:fixed;inset:0;display:grid;place-items:center}' +
  '#plane{display:block;box-shadow:0 0 0 1px rgba(255,255,255,.045);' +
  'width:min(100vw,177.778vh);height:min(56.25vw,100vh)}' +
  '';

const reseed = (s) => {
  clock = 0;
  build(s === undefined ? (Math.random() * 4294967296) >>> 0 : s);
  preroll(PREROLL);
  cv.style.background = ground;
  document.body.style.background = ground;   // no black bar around the plane
  // no readout on the plane: the seed lives in the address bar, and nothing
  // is laid over the work. Framed there is no address bar to live in, and
  // writing one would only push an entry onto the host page's history.
  if (!framed) location.hash = seed.toString(16);
  draw();          // so a still is painted even while paused
};

const run = (config) => {
  CFG = merge(DEFAULTS, config || {});
  // ?still paints one frame and holds it, for contact sheets and the index.
  // Space still starts it moving.
  if (/(^|[?&])still($|[&=])/.test(location.search)) paused = true;

  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);
  if (!document.title) document.title = CFG.title;

  const stage = document.createElement("div");
  stage.id = "stage";
  cv = document.createElement("canvas");
  cv.id = "plane"; cv.width = W; cv.height = H;
  stage.appendChild(cv);
  document.body.appendChild(stage);

  ctx = cv.getContext("2d", { alpha: false });

  if (!framed) addEventListener("keydown", function (e) {
    if (e.key === " ") { e.preventDefault(); paused = !paused; }
    else if (e.key === "r" || e.key === "R") reseed();
    else if (e.key === "s" || e.key === "S") {
      const a = document.createElement("a");
      a.download = CFG.slug + "-" + seed.toString(16) + ".png";
      a.href = cv.toDataURL("image/png");
      a.click();
    }
  });
  if (!framed) addEventListener("pointerdown", function () { paused = !paused; });

  // The fragment first, so a seed can still be dealt by hand; then one baked
  // into the config; then chance.
  const fromHash = parseInt(location.hash.slice(1), 16);
  const hashed = location.hash.length > 1 && Number.isFinite(fromHash);
  reseed(hashed ? fromHash : bakedSeed());
  requestAnimationFrame(frame);
};

global.ContextCollapse = { run: run };

})(typeof window !== "undefined" ? window : this);

// @license-end
