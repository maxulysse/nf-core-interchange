#!/usr/bin/env node
// Checks the data behind the site: the tree, the stations, the handoffs and the maps. Run from the repo root.
const fs = require("fs");
const vm = require("vm");

// Load the scripts in index.html order, up to the drawing code: data, plus mapModel, which needs no DOM.
const scripts = [...fs.readFileSync("index.html", "utf8").matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
for (const f of scripts.slice(0, scripts.indexOf("js/map.js")))
  vm.runInThisContext(fs.readFileSync(f, "utf8"), { filename: f });
const { TREE, CATALOGUE, MAPS, STATIONS, HANDOFFS, SOURCES, ST, mapModel, labelBox, corners, HEX_R, MARK_R } =
  vm.runInThisContext(
    "({ TREE, CATALOGUE, MAPS, STATIONS, HANDOFFS, SOURCES, ST, mapModel, labelBox, corners, HEX_R, MARK_R })",
  );

let bad = 0;
const fail = (msg) => {
  console.log(msg);
  bad = 1;
};
const pair = (h) => `${h.f}>${h.t}`;
const markBox = (s, r = s.hub ? HEX_R : MARK_R) => corners(s.x - r, s.y - r, 2 * r, 2 * r);
// Whether two outlines, both rectangles, overlap: no side of either keeps them apart.
const overlap = (p, q) =>
  [p, q].every((o) =>
    o.every(([x0, y0], i) => {
      const [x1, y1] = o[(i + 1) % o.length],
        along = (r) => r.map(([x, y]) => x * (y0 - y1) + y * (x1 - x0)),
        [a, b] = [along(p), along(q)];
      return Math.min(...a) < Math.max(...b) && Math.min(...b) < Math.max(...a);
    }),
  );
// The outlines a line covers, drawn 8 wide (.line in style.css): one per step between the points of its path, whose
// curves stay inside the steps through their control points.
const lineBoxes = (d) => {
  const p = [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);
  return p.slice(1).flatMap(([x1, y1], i) => {
    const [x0, y0] = p[i],
      l = Math.hypot(x1 - x0, y1 - y0),
      [nx, ny] = [((y0 - y1) / l) * 4, ((x1 - x0) / l) * 4];
    return l
      ? [
          [
            [x0 + nx, y0 + ny],
            [x1 + nx, y1 + ny],
            [x1 - nx, y1 - ny],
            [x0 - nx, y0 - ny],
          ],
        ]
      : [];
  });
};

// Every catalogue pipeline sits in the tree, and the tree names only catalogue pipelines.
const leaves = new Set();
(function walk(n) {
  typeof n === "string" ? leaves.add(n) : n.children.forEach(walk);
})(TREE);
Object.keys(CATALOGUE)
  .filter((id) => !leaves.has(id))
  .forEach((id) => fail(`pipelines.js: ${id} is not in TREE`));
[...leaves].filter((id) => !CATALOGUE[id]).forEach((id) => fail(`pipelines.js: ${id} is not in catalogue.js`));

// A station that is not a resource is an nf-core pipeline.
Object.entries(STATIONS)
  .filter(([id, s]) => !s.ext && !CATALOGUE[id])
  .forEach(([id]) => fail(`stations.js: ${id} is not a resource and not in catalogue.js`));

for (const h of HANDOFFS) {
  [h.f, h.t].filter((id) => !STATIONS[id]).forEach((id) => fail(`handoffs.js: ${pair(h)} names unknown station ${id}`));
  if (!ST[h.st]) fail(`handoffs.js: ${pair(h)} has unknown status ${h.st}`);
  if (h.src && !SOURCES[h.src]) fail(`handoffs.js: ${pair(h)} has unknown src ${h.src}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(h.checked)) fail(`handoffs.js: ${pair(h)} has no checked date`);
}

// Every map names known handoffs, keeps its stations apart, and draws each handoff with a route and a colour.
const placed = new Set(),
  drawn = new Set();
for (const M of Object.values(MAPS)) {
  (M.also ?? [])
    .filter((p) => !HANDOFFS.some((h) => pair(h) === p))
    .forEach((p) => fail(`${M.id}: also names unknown handoff ${p}`));
  const { S, E } = mapModel(M);
  E.filter((e) => e.d.includes("NaN")).forEach((e) => fail(`${M.id}: ${pair(e)} has no route`));
  E.filter((e) => !e.line).forEach((e) =>
    fail(`${M.id}: ${pair(e)} touches no station on a hub line, so it has no colour`),
  );
  const at = S.map((s) => `${s.x},${s.y}`);
  at.filter((xy, i) => at.indexOf(xy) !== i).forEach((xy) => fail(`${M.id}: two stations sit at ${xy}`));
  // At every label scale renderMap uses, 1 to 1.8 in tenths, no label covers another label, a station, the hub or a line.
  const lines = E.map((e) => [e, lineBoxes(e.d)]);
  for (const F of [10, 11, 12, 13, 14, 15, 16, 17, 18].map((k) => k / 10)) {
    const labelled = S.filter((s) => !s.hub),
      box = new Map(labelled.map((s) => [s, labelBox(s, F)]));
    labelled.forEach((a, i) => {
      labelled.slice(i + 1).forEach((b) => {
        if (overlap(box.get(a), box.get(b))) fail(`${M.id}: at scale ${F}, the labels of ${a.id} and ${b.id} touch`);
      });
      S.filter((b) => b !== a && overlap(box.get(a), markBox(b))).forEach((b) =>
        fail(`${M.id}: at scale ${F}, the label of ${a.id} covers ${b.id}`),
      );
      lines
        .filter(([, l]) => l.some((o) => overlap(box.get(a), o)))
        .forEach(([e]) => fail(`${M.id}: at scale ${F}, the label of ${a.id} covers the line ${pair(e)}`));
    });
  }
  S.forEach((s) => placed.add(s.id));
  E.forEach((e) => drawn.add(e.handoff));
}
Object.keys(STATIONS)
  .filter((id) => !placed.has(id))
  .forEach((id) => fail(`stations.js: ${id} is on no map`));
HANDOFFS.filter((h) => !drawn.has(h)).forEach((h) => fail(`handoffs.js: ${pair(h)} is on no map`));

process.exit(bad);
