#!/usr/bin/env node
// Checks the data behind the site: the tree, the stations, the handoffs and the maps. Run from the repo root.
const fs = require("fs");
const vm = require("vm");

// Load the scripts in index.html order, up to the drawing code: data, plus mapModel, which needs no DOM.
const scripts = [...fs.readFileSync("index.html", "utf8").matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
for (const f of scripts.slice(0, scripts.indexOf("js/map.js")))
  vm.runInThisContext(fs.readFileSync(f, "utf8"), { filename: f });
const { TREE, CATALOGUE, MAPS, STATIONS, HANDOFFS, SOURCES, ST, mapModel } = vm.runInThisContext(
  "({ TREE, CATALOGUE, MAPS, STATIONS, HANDOFFS, SOURCES, ST, mapModel })",
);

let bad = 0;
const fail = (msg) => {
  console.log(msg);
  bad = 1;
};
const pair = (h) => `${h.f}>${h.t}`;

// Every catalogue pipeline sits in the tree, and the tree names only catalogue pipelines.
const leaves = new Set();
(function walk(n) {
  typeof n === "string" ? leaves.add(n) : n.children.forEach(walk);
})(TREE);
Object.keys(CATALOGUE)
  .filter((id) => !leaves.has(id))
  .forEach((id) => fail(`pipelines.js: ${id} is not in TREE`));
[...leaves].filter((id) => !CATALOGUE[id]).forEach((id) => fail(`pipelines.js: ${id} is not in catalogue.js`));

// A station that is not a resource is an nf-core pipeline, unless it says where it lives.
Object.entries(STATIONS)
  .filter(([id, s]) => !s.ext && !CATALOGUE[id] && !s.url)
  .forEach(([id]) => fail(`stations.js: ${id} is not in catalogue.js and has no url`));

for (const h of HANDOFFS) {
  [h.f, h.t].filter((id) => !STATIONS[id]).forEach((id) => fail(`handoffs.js: ${pair(h)} names unknown station ${id}`));
  if (!ST[h.st]) fail(`handoffs.js: ${pair(h)} has unknown status ${h.st}`);
  if (h.src && !SOURCES[h.src]) fail(`handoffs.js: ${pair(h)} has unknown src ${h.src}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(h.checked)) fail(`handoffs.js: ${pair(h)} has no checked date`);
}

// Every map is loaded, places its hub and known stations, and draws each placed station with a coloured line.
fs.readdirSync("maps")
  .filter((f) => !scripts.includes(`maps/${f}`))
  .forEach((f) => fail(`index.html: maps/${f} is not loaded`));
const placed = new Set(),
  drawn = new Set();
for (const M of Object.values(MAPS)) {
  const ids = Object.keys(M.at);
  ids.filter((id) => !STATIONS[id]).forEach((id) => fail(`${M.id}: places unknown station ${id}`));
  (M.also ?? [])
    .filter((p) => !HANDOFFS.some((h) => pair(h) === p))
    .forEach((p) => fail(`${M.id}: also names unknown handoff ${p}`));
  if (!M.at[M.id]) {
    fail(`${M.id}: the hub is not placed`);
    continue;
  }
  const { E } = mapModel(M);
  E.flatMap((e) => [e.f, e.t])
    .filter((id) => !M.at[id])
    .forEach((id) => fail(`${M.id}: draws a handoff to ${id}, which it does not place`));
  E.filter((e) => !e.line).forEach((e) =>
    fail(`${M.id}: ${pair(e)} touches no station on a hub line, so it has no colour`),
  );
  ids.filter((id) => !E.some((e) => e.f === id || e.t === id)).forEach((id) => fail(`${M.id}: ${id} has no line`));
  ids.forEach((id) => placed.add(id));
  E.forEach((e) => drawn.add(e.handoff));
}
Object.keys(STATIONS)
  .filter((id) => !placed.has(id))
  .forEach((id) => fail(`stations.js: ${id} is on no map`));
HANDOFFS.filter((h) => !drawn.has(h)).forEach((h) => fail(`handoffs.js: ${pair(h)} is on no map`));

process.exit(bad);
