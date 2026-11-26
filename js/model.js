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

// Places stations on the star around the hub, at most six a side (the most a hub face takes before its lines
// crowd). Inputs fan in from the left, resources from the top, outputs fan out to the right; each spills to the
// next side only when full; outputs too many for the right share it evenly with the bottom (and the top). Inputs run in
// field order down the left; outputs in field order clockwise from the top. A stop between sources and the
// hub (seqinspector) takes the left. A map's own `at` places a station by hand; a side holding one takes nothing else.
// A hub face holds about five lines on a side (the left and right faces are short) and eight along the top or
// bottom, and a side about six labels; past that a station goes to the side with most room.
const MAX_SIDE = 6;
const LINES = { l: 5, r: 5, t: 8, b: 8 };
const PREFER = { in: ["l", "b", "t", "r"], res: ["t", "r", "l", "b"], out: ["r", "b", "t", "l"] };
function layout(M, E) {
  // A stop between sources and the hub (seqinspector) sits left of the hub, its sources on the left side beyond it.
  const stop = E.find((e) => e.f !== M.id && e.t !== M.id && E.some((h) => h.f === e.t && h.t === M.id))?.t;
  const feeders = stop ? E.filter((e) => e.t === stop && e.f !== M.id).map((e) => e.f) : [];
  const ids = [...new Set(E.flatMap((e) => [e.f, e.t]))].filter(
    (id) => id !== M.id && !M.at?.[id] && id !== stop && !feeders.includes(id),
  );
  const into = (id, res) => E.some((e) => e.f === id && e.t === M.id && !!e.res === res);
  const ins = ids.filter((id) => into(id, false)).sort(byField),
    res = ids.filter((id) => !ins.includes(id) && into(id, true)).sort(byField),
    outs = ids.filter((id) => !ins.includes(id) && !res.includes(id)).sort(byField);
  const closed = new Set(
    Object.values(M.at ?? {}).map(({ x, y }) =>
      x <= 200 ? "l" : x >= 800 ? "r" : y <= 150 ? "t" : y >= 550 ? "b" : null,
    ),
  );
  const lines = (id) => E.filter((e) => [e.f, e.t].includes(id) && [e.f, e.t].includes(M.id)).length;
  const count = { t: 0, r: 0, b: 0, l: 0 },
    used = { t: 0, r: 0, b: 0, l: 0 },
    per = { in: { t: 0, r: 0, b: 0, l: 0 }, res: { t: 0, r: 0, b: 0, l: 0 }, out: { t: 0, r: 0, b: 0, l: 0 } };
  // Next to a stop, the left keeps room for two more inputs, above and below its fan.
  if (stop) {
    count.l = MAX_SIDE - 2;
    used.l = LINES.l - 2;
  }
  // Outputs too many for the right share it evenly with the bottom, with the top when no resource uses it or
  // both are full, and with the left when no input uses it.
  const outLines = outs.reduce((n, id) => n + lines(id), 0);
  const share =
    outLines > LINES.r || outs.length > MAX_SIDE
      ? [
          "r",
          "b",
          ...(!res.length || outLines > LINES.r + LINES.b - 3 || outs.length > 2 * MAX_SIDE - 1 ? ["t"] : []),
          ...(!ins.length && !stop ? ["l"] : []),
        ]
      : null;
  for (const [role, list] of [
    ["in", ins],
    ["res", res],
    ["out", outs],
  ])
    for (const id of list) {
      const w = lines(id);
      const open = PREFER[role].filter((k) => !closed.has(k) && count[k] < MAX_SIDE && used[k] + w <= LINES[k]);
      const roomiest = PREFER[role]
        .filter((k) => !closed.has(k))
        .sort((a, b) => used[a] / LINES[a] - used[b] / LINES[b])[0];
      const split =
        role === "out" && share && open.filter((k) => share.includes(k)).sort((a, b) => used[a] - used[b])[0];
      const side = split || open[0] || roomiest;
      count[side]++;
      used[side] += w;
      per[role][side]++;
    }
  const cut = (list) => {
    let k = 0;
    return (m) => list.slice(k, (k += m));
  };
  const inAt = cut(ins),
    resAt = cut(res),
    outAt = cut(outs);
  const inL = inAt(per.in.l),
    inB = inAt(per.in.b),
    inT = inAt(per.in.t),
    inR = inAt(per.in.r);
  const resT = resAt(per.res.t),
    resR = resAt(per.res.r),
    resL = resAt(per.res.l),
    resB = resAt(per.res.b);
  const outT = outAt(per.out.t),
    outR = outAt(per.out.r),
    outB = outAt(per.out.b),
    outL = outAt(per.out.l);
  // Each side read left to right or top to bottom.
  const top = [...inT, ...resT, ...outT],
    right = [...inR, ...resR, ...outR],
    bottom = [...inB, ...resB, ...outB.reverse()],
    left = [...resL, ...inL, ...outL.reverse()];
  // Spread m stations evenly around the middle of a side; two sit wide apart, as a mirrored pair.
  const spread = (m, step, pair) => [...Array(m)].map((_, i) => (i - (m - 1) / 2) * (m === 2 ? pair : step));
  const along = (m, span, pair) => spread(m, m > 1 ? Math.min(span[0], span[1] / (m - 1)) : 0, pair);
  // On a side column, the one station with more lines to the hub than any other sits level with it, so its
  // bundle runs straight; the others keep their order either side of it. A tie spreads evenly, mirrored.
  const offsets = (list, span, pair, centre = false) => {
    const w = list.map(lines),
      k = w.indexOf(Math.max(...w));
    const busiest = w[k] > 1 && w.filter((n) => n === w[k]).length === 1;
    if (!centre || list.length < 2 || !busiest) return along(list.length, span, pair);
    const step = Math.min(span[0], span[1] / 2 / Math.max(k, list.length - 1 - k));
    return list.map((_, i) => (i - k) * step);
  };
  const at = {};
  // A row of up to three stays within reach of the hub's top or bottom face, so its lines arrive vertically.
  // A row of four sits further out, 120 apart, so its outer lines still arrive vertically; five or more spread
  // to the full width.
  const row = (m) => (m <= 3 ? [124, 248, 248, 0] : m === 4 ? [120, 360, 248, 30] : [250, 500, 254, 0]);
  const [ts, tw, tp, tf] = row(top.length),
    [bs, bw, bp, bf] = row(bottom.length);
  offsets(top, [ts, tw], tp).forEach((d, i) => (at[top[i]] = { x: 500 + d, y: 80 - tf, side: "above" }));
  offsets(bottom, [bs, bw], bp).forEach((d, i) => (at[bottom[i]] = { x: 500 + d, y: 600 + bf, side: "below" }));
  if (stop) {
    // The stop sits level with the hub, so source, stop and hub run as one straight line; the other inputs sit
    // above and below it, further out when the stop fans in two sources.
    const wide = feeders.length > 1 ? 200 : 135;
    left.forEach((id, i) => (at[id] = { x: 120, y: 340 + (i ? wide : -wide), side: "below" }));
    at[stop] = { x: 300, y: 340, side: "below", tag: "optional" };
    along(feeders.length, [100, 520], 200).forEach((d, i) => (at[feeders[i]] = { x: 120, y: 340 + d, side: "below" }));
  } else offsets(left, [135, 400], 270, true).forEach((d, i) => (at[left[i]] = { x: 120, y: 340 + d, side: "below" }));
  offsets(right, [135, 400], 270, true).forEach((d, i) => (at[right[i]] = { x: 880, y: 340 + d, side: "below" }));
  return { ...at, ...M.at };
}

// What a map draws, without the DOM: its stations with their text from stations.js, and the handoffs from
// handoffs.js that it draws, each coloured. renderMap draws it and bin/check.js checks it.
function mapModel(M) {
  const also = new Set(M.also),
    skip = new Set(M.skip);
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
