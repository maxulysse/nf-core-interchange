// Handoff statuses. What a pipeline still lacks goes in the handoff's note.
const ST = {
  native: { label: "Native", note: "the output goes straight in: no conversion needed" },
  conversion: {
    label: "Conversion",
    note: "the output must be reshaped first, into the next pipeline's samplesheet or params",
  },
};

// A pipeline's field is the first top-level honeycomb group that lists it; resources come after every field.
const FIELD = {};
TREE.children.forEach((g, i) =>
  (function walk(n) {
    typeof n === "string" ? (FIELD[n] ??= i) : n.children.forEach(walk);
  })(g),
);
const byField = (a, b) => (FIELD[a] ?? Infinity) - (FIELD[b] ?? Infinity) || a.localeCompare(b);

// Places stations on the star around the hub: inputs on the left, resources along the top, outputs in field
// order clockwise over the slots left (top, right, bottom, then under the inputs). Sides fill evenly, at most
// six each, the most a hub face takes before its lines crowd. A map's own `at` places a station by hand.
const MAX_SIDE = 6;
function layout(M, E) {
  const ids = [...new Set(E.flatMap((e) => [e.f, e.t]))].filter((id) => id !== M.id && !M.at?.[id]);
  const into = (id, res) => E.some((e) => e.f === id && e.t === M.id && !!e.res === res);
  const ins = ids.filter((id) => into(id, false)).sort(byField),
    res = ids.filter((id) => !ins.includes(id) && into(id, true)).sort(byField),
    outs = ids.filter((id) => !ins.includes(id) && !res.includes(id)).sort(byField);
  const n = { t: res.length, r: 0, b: 0, l: ins.length };
  // A side that holds a hand-placed station takes no outputs, so nothing lands on top of it.
  for (const { x, y } of Object.values(M.at ?? {})) {
    const side = x <= 200 ? "l" : x >= 800 ? "r" : y <= 150 ? "t" : y >= 550 ? "b" : null;
    if (side) n[side] = MAX_SIDE;
  }
  // Outputs share the right, bottom and top evenly, and go under the inputs only once those are full.
  const extra = { t: 0, r: 0, b: 0, l: 0 };
  for (let i = 0; i < outs.length; i++) {
    const open = ["r", "b", "t"].filter((k) => n[k] < MAX_SIDE);
    const side = open.length ? open.sort((a, b) => n[a] - n[b])[0] : "l";
    n[side]++;
    extra[side]++;
  }
  let k = 0;
  const take = (m) => outs.slice(k, (k += m));
  const top = [...res, ...take(extra.t)],
    right = take(extra.r),
    bottom = take(extra.b).reverse(),
    left = [...ins, ...take(extra.l).reverse()];
  // Spread m stations evenly around the middle of a side; two sit wide apart, as a mirrored pair.
  const spread = (m, step, pair) => [...Array(m)].map((_, i) => (i - (m - 1) / 2) * (m === 2 ? pair : step));
  const along = (m, span, pair) => spread(m, m > 1 ? Math.min(span[0], span[1] / (m - 1)) : 0, pair);
  const at = {};
  along(top.length, [127, 500], 254).forEach((d, i) => (at[top[i]] = { x: 500 + d, y: 80, side: "above" }));
  along(bottom.length, [127, 500], 254).forEach((d, i) => (at[bottom[i]] = { x: 500 + d, y: 600, side: "below" }));
  along(left.length, [135, 520], 270).forEach((d, i) => (at[left[i]] = { x: 120, y: 340 + d, side: "below" }));
  along(right.length, [135, 520], 270).forEach((d, i) => (at[right[i]] = { x: 880, y: 340 + d, side: "below" }));
  return { ...at, ...M.at };
}

// What a map draws, without the DOM: its stations with their text from stations.js, and the handoffs from
// handoffs.js that it draws, each coloured. renderMap draws it and bin/check.js checks it.
function mapModel(M) {
  const also = new Set(M.also),
    skip = new Set(M.skip);
  const pair = (h) => `${h.f}>${h.t}`;
  const drawn = (h) => !skip.has(pair(h)) && (h.f === M.id || h.t === M.id || also.has(pair(h)));
  // Copies, so rendering twice never stacks state on the shared data.
  const E = HANDOFFS.filter(drawn).map((h) => ({ ...h, handoff: h }));
  // The hub always sits in the middle of the 1000 x 680 map.
  const HUB = { id: M.id, ...STATIONS[M.id], x: 500, y: 340, hub: true, side: "inside" };
  const S = [HUB, ...Object.entries(layout(M, E)).map(([id, at]) => ({ id, ...STATIONS[id], ...at }))];
  // Colour by direction: into the hub is input (or a resource), out of it is results. A handoff between two
  // other stations takes the colour of the hub line at its target, or at its source.
  E.forEach((e) => (e.line = e.t === M.id ? (e.res ? "res" : "reads") : e.f === M.id ? "out" : null));
  const hubLine = (id) => E.find((h) => h.line && (h.f === id || h.t === id))?.line;
  E.forEach((e) => (e.line ??= e.res ? "res" : (hubLine(e.t) ?? hubLine(e.f))));
  const days = E.map((e) => e.checked).sort();
  return { HUB, S, E, checked: [days[0], days.at(-1)] };
}
