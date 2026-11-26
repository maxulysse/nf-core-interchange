// Handoff statuses. What a pipeline still lacks goes in the handoff's note.
const ST = {
  native: { label: "Native", note: "the output goes straight in: no conversion needed" },
  conversion: {
    label: "Conversion",
    note: "the output must be reshaped first, into the next pipeline's samplesheet or params",
  },
};

// A pipeline's field is the first top-level honeycomb group that lists it; resources come after every field.
// A pipeline also in a later field sorts after the rest of its first one, next to that field.
const FIELD = {},
  LAST = {};
TREE.children.forEach((g, i) =>
  (function walk(n) {
    if (typeof n !== "string") return n.children.forEach(walk);
    FIELD[n] ??= i;
    LAST[n] = i;
  })(g),
);
const byField = (a, b) =>
  (FIELD[a] ?? Infinity) - (FIELD[b] ?? Infinity) || (LAST[a] ?? 0) - (LAST[b] ?? 0) || a.localeCompare(b);

// Places stations on the star around the hub: inputs fan in from the left, resources from the top, outputs fan
// out to the right, each in field order. A side takes `n` stations and `lines` hub lines; once outputs would fill
// the right they share it evenly with the bottom, the top (when no resource uses it, or when both are full) and
// the left (when no input uses it). A very busy map (twelve outputs or more) moves its resources to the left with
// the inputs and lets each side fill to `max`. A stop between sources and the hub (seqinspector) sits left of the
// hub, level with it.
const SIDE = {
  l: { n: 6, max: 8, lines: 5 },
  r: { n: 6, max: 8, lines: 5 },
  t: { n: 5, max: 5, lines: 8 },
  b: { n: 5, max: 5, lines: 8 },
};
// The order each role tries sides in, and the order outputs run clockwise from the top.
const PREFER = { in: ["l", "b", "t", "r"], res: ["t", "r", "l", "b"], out: ["r", "b", "t", "l"] };
const RING = { in: PREFER.in, res: PREFER.res, out: ["t", "r", "b", "l"] };
function layout(M, E) {
  const stop = E.find((e) => e.f !== M.id && e.t !== M.id && E.some((h) => h.f === e.t && h.t === M.id))?.t;
  const feeders = stop ? E.filter((e) => e.t === stop && e.f !== M.id).map((e) => e.f) : [];
  const ids = [...new Set(E.flatMap((e) => [e.f, e.t]))].filter(
    (id) => id !== M.id && id !== stop && !feeders.includes(id),
  );
  const into = (id, res) => E.some((e) => e.f === id && e.t === M.id && !!e.res === res);
  const lines = (id) => E.filter((e) => [e.f, e.t].includes(id) && [e.f, e.t].includes(M.id)).length;
  const ins = ids.filter((id) => into(id, false)).sort(byField),
    res = ids.filter((id) => !ins.includes(id) && into(id, true)).sort(byField),
    outs = ids.filter((id) => !ins.includes(id) && !res.includes(id)).sort(byField);
  const outLines = outs.reduce((n, id) => n + lines(id), 0);
  const roles = { in: ins, res, out: outs };

  // 1. How many stations of each role go on each side.
  const busy = outs.length >= 12 && !stop;
  // A busy map packs every hub face to the eight lines the longest face holds.
  const limit = (k) => (busy ? { n: SIDE[k].max, lines: 8 } : SIDE[k]);
  const share =
    outLines >= SIDE.r.lines || outs.length >= SIDE.r.n
      ? ["r", "b"].concat(!res.length || busy ? ["t"] : []).concat(!ins.length && !stop ? ["l"] : [])
      : [];
  const count = { t: 0, r: 0, b: 0, l: 0 },
    used = { t: 0, r: 0, b: 0, l: 0 },
    per = { in: { ...count }, res: { ...count }, out: { ...count } };
  // A stop's fan takes the middle of the left, leaving room for two more inputs above and below it.
  if (stop) [count.l, used.l] = [SIDE.l.n - 2, SIDE.l.lines - 2];
  const pick = (role, w) => {
    const order = (busy && role === "res" ? ["l", "t", "r", "b"] : PREFER[role]).filter(
      (k) => !(role === "out" && k === "l" && count.l),
    );
    const open = order.filter((k) => count[k] < limit(k).n && used[k] + w <= limit(k).lines);
    const shared = role === "out" && open.filter((k) => share.includes(k)).sort((a, b) => used[a] - used[b])[0];
    const roomiest = order
      .filter((k) => count[k] < SIDE[k].max)
      .sort((a, b) => used[a] / SIDE[a].lines - used[b] / SIDE[b].lines)[0];
    return shared || open[0] || roomiest;
  };
  for (const [role, list] of Object.entries(roles))
    for (const id of list) {
      const k = pick(role, lines(id));
      count[k]++;
      used[k] += lines(id);
      per[role][k]++;
    }

  // 2. Which stations: each role's sorted list, cut along its ring of sides.
  const side = { t: {}, r: {}, b: {}, l: {} };
  for (const [role, list] of Object.entries(roles))
    for (const k of RING[role]) side[k][role] = list.splice(0, per[role][k]);
  // Each side read left to right or top to bottom; outputs on the bottom and left run back, clockwise.
  const top = [...side.t.in, ...side.t.res, ...side.t.out],
    right = [...side.r.in, ...side.r.res, ...side.r.out],
    bottom = [...side.b.in, ...side.b.res, ...side.b.out.reverse()],
    left = [...side.l.res, ...side.l.in, ...side.l.out.reverse()];

  // 3. Where: offsets from the middle of a side, `step` apart; two stations sit `pair` apart. On a side column
  // the one station with more hub lines than any other sits level with the hub, so its bundle runs straight.
  const place = (list, step, pair, centre = false) => {
    const m = list.length,
      w = list.map(lines),
      k = w.indexOf(Math.max(...w));
    if (centre && m > 1 && w[k] > 1 && w.filter((n) => n === w[k]).length === 1)
      return list.map((_, i) => (i - k) * step);
    return list.map((_, i) => (i - (m - 1) / 2) * (m === 2 ? pair : step));
  };
  // A row of up to three stays within reach of the hub's top or bottom face, so its lines arrive vertically; a row
  // of four or five sits further out, at most 120 apart and within 200 of the middle, for the same reason.
  const row = (m) =>
    m <= 3
      ? { step: m > 1 ? Math.min(124, 248 / (m - 1)) : 0, out: 0 }
      : { step: Math.min(120, 400 / (m - 1)), out: 30 };
  // Both side columns use one step, set by the fuller one, so the two sides read alike.
  const tall = Math.max(left.length, right.length),
    column = Math.min(135, (tall > 6 ? 480 : 400) / Math.max(tall - 1, 1));
  const at = {};
  const set = (list, offs, xy) => list.forEach((id, i) => (at[id] = xy(offs[i])));
  set(top, place(top, row(top.length).step, 248), (d) => ({ x: 500 + d, y: 80 - row(top.length).out, side: "above" }));
  set(bottom, place(bottom, row(bottom.length).step, 248), (d) => ({
    x: 500 + d,
    y: 600 + row(bottom.length).out,
    side: "below",
  }));
  if (stop) {
    // The stop sits level with the hub, so source, stop and hub run as one straight line; the other inputs sit
    // above and below it, further out when the stop fans in two sources.
    const wide = feeders.length > 1 ? 200 : 135;
    set(left, [-wide, wide], (d) => ({ x: 120, y: 340 + d, side: "below" }));
    at[stop] = { x: 300, y: 340, side: "below", tag: "optional" };
    const fan = feeders.length > 1 ? Math.min(100, 520 / (feeders.length - 1)) : 0;
    set(feeders, place(feeders, fan, 200), (d) => ({ x: 120, y: 340 + d, side: "below" }));
  } else set(left, place(left, column, 270, true), (d) => ({ x: 120, y: 340 + d, side: "below" }));
  set(right, place(right, column, 270, true), (d) => ({ x: 880, y: 340 + d, side: "below" }));
  return at;
}

// What a map draws, without the DOM: its stations with their text from stations.js, and the handoffs from
// handoffs.js that it draws, each coloured. renderMap draws it and bin/check.js checks it.
function mapModel(M) {
  const also = new Set(M.also),
    skip = new Set();
  const pair = (h) => `${h.f}>${h.t}`;
  // A source that a station intercepts reaches the hub through it: source -> station -> hub.
  const has = (f, t) => HANDOFFS.some((h) => h.f === f && h.t === t);
  for (const [id, s] of Object.entries(STATIONS))
    for (const src of s.intercepts ?? [])
      if (has(id, M.id) && has(src, M.id) && has(src, id)) {
        skip.add(`${src}>${M.id}`);
        also.add(`${src}>${id}`);
      }
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
