// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GNU-GPL-3.0-or-later
// index.js - Context Collapse: the contact sheet.
// Copyright (C) 2026 Myers Studio, Ltd.
// Free software under the GNU GPL, version 3 or later; see COPYING.

/* One list, so adding a variant means adding a line here and a page beside it. */
const SEED = "c0ffee";
const VARIANTS = {
  "g-pal": [
    ["flat", "Flat colour", "Seventeen hues evenly round the wheel, and nothing laid over them. The plain reading."],
    ["primaries",  "Primaries",  "Six hues to start with. Every other colour on the plane has spread there."],
    ["pastels",    "Pastels",    "Chroma right down, value right up. The spread barely shows."],
    ["neons",      "Neons",      "Full chroma on near-black. The loudest the rules can be."],
    ["progress-pride", "Progress Pride", "Daniel Quasar\u2019s 2018 flag, all eleven colours used exactly rather than blended, on a neutral mid grey so black and white both read."],
    ["phosphors",  "Phosphors",  "Red, blue-screen-of-death blue, and green. Three hues for sixteen timelines, so value has to tell them apart."],
    ["metallic",   "Metallic",   "Gold through silver. Metal is a colour plus a highlight, so this one needs a ramp."]
  ],
  "g-fill": [
    ["stripes", "Stripes", "Equal bands at 135 degrees, top left to bottom right. Warning tape, in each bubble\u2019s own colour."],
    ["checks",  "Checks",  "The cell half filled in two quarters, so the two tones weigh the same."],
    ["dots",    "Dots",    "A disc centred in a larger cell, so the post shows between the dots."],
    ["ombres",  "Ombres",  "A ramp top left to bottom right, on the axis the tape runs on. Stops at 0.3 and 0.7, so each end holds flat before it turns."]
  ]
};

for (const id in VARIANTS) {
  const host = document.getElementById(id);
  for (const [file, name, note] of VARIANTS[id]) {
    const a = document.createElement("a");
    a.className = "card";
    a.href = file + ".html#" + SEED;
    const shot = document.createElement("div");
    shot.className = "shot";
    const f = document.createElement("iframe");
    f.setAttribute("loading", "lazy");
    f.setAttribute("tabindex", "-1");
    f.setAttribute("aria-hidden", "true");
    f.setAttribute("scrolling", "no");
    f.src = file + ".html?still#" + SEED;
    shot.appendChild(f);
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = '<div class="name"></div><div class="note"></div>';
    meta.querySelector(".name").textContent = name;
    meta.querySelector(".note").textContent = note;
    a.appendChild(shot);
    a.appendChild(meta);
    host.appendChild(a);
  }
}

// @license-end
