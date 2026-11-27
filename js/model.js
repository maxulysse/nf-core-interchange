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

// The map is 1000 x 680 with the hub in the middle; side columns sit COL left and right of it, rows ROW above and
// below it. Two stations on a row sit ROW_PAIR apart, two on a column COL_PAIR apart.
const MAP_W = 1000,
  MAP_H = 680,
  CENTRE = { x: MAP_W / 2, y: MAP_H / 2 },
  COL = 380,
  ROW = 260,
  ROW_PAIR = 248,
  COL_PAIR = 270;
// A side takes `n` stations and `lines` hub lines, or `max` stations on a busy map: one with BUSY_OUTS outputs or more.
const BUSY_OUTS = 12;
const SIDE = {
  l: { n: 6, max: 8, lines: 5 },
  r: { n: 6, max: 8, lines: 5 },
  t: { n: 5, max: 5, lines: 8 },
  b: { n: 5, max: 5, lines: 8 },
};
// The order each role tries sides in, and the order outputs run clockwise from the top.
const PREFER = { in: ["l", "b", "t", "r"], res: ["t", "r", "l", "b"], out: ["r", "b", "t", "l"] };
const RING = { in: PREFER.in, res: PREFER.res, out: ["t", "r", "b", "l"] };

// How many stations of each role go on each side. Inputs fan in from the left, resources from the top, outputs fan
// out to the right; once outputs would fill the right they share it evenly with the bottom, the top (when no
// resource uses it, or when both are full) and the left (when no input uses it). A busy map moves its resources to
// the left with the inputs and lets each side fill to `max` and eight lines, the most the longest hub face holds. A
// stop's fan takes the middle of the left, leaving room for two more inputs above and below it.
function assign(roles, lines, stop) {
  const busy = roles.out.length >= BUSY_OUTS && !stop;
  const prefer = busy ? { ...PREFER, res: ["l", "t", "r", "b"] } : PREFER;
  const limit = (k) => (busy ? { n: SIDE[k].max, lines: 8 } : SIDE[k]);
  const outLines = roles.out.reduce((n, id) => n + lines(id), 0);
  const share =
    outLines >= SIDE.r.lines || roles.out.length >= SIDE.r.n
      ? ["r", "b", ...(!roles.res.length || busy ? ["t"] : []), ...(!roles.in.length && !stop ? ["l"] : [])]
      : [];
  const count = { t: 0, r: 0, b: 0, l: 0 },
    used = { t: 0, r: 0, b: 0, l: 0 },
    per = { in: { ...count }, res: { ...count }, out: { ...count } };
  if (stop) [count.l, used.l] = [SIDE.l.n - 2, SIDE.l.lines - 2];
  // When every side is full, each takes up to `max`; a stop's left still holds only the two beside the stop.
  const most = (k) => (stop && k === "l" ? SIDE.l.n : SIDE[k].max);
  // Outputs keep off a left side that already holds stations.
  const pick = (role, w) => {
    const order = prefer[role].filter((k) => !(role === "out" && k === "l" && count.l));
    const open = order.filter((k) => count[k] < limit(k).n && used[k] + w <= limit(k).lines);
    const shared = role === "out" && open.filter((k) => share.includes(k)).sort((a, b) => used[a] - used[b])[0];
    const roomiest = order
      .filter((k) => count[k] < most(k))
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
  return per;
}

// Places the stations around the hub, each role in field order. A stop between sources and the hub (seqinspector)
// sits left of the hub, level with it, with its sources fanned out beyond it.
function layout(M, E, stop) {
  const feeders = stop ? E.filter((e) => e.t === stop && e.f !== M.id).map((e) => e.f) : [];
  const ids = [...new Set(E.flatMap((e) => [e.f, e.t]))].filter(
    (id) => id !== M.id && id !== stop && !feeders.includes(id),
  );
  const into = (id, res) => E.some((e) => e.f === id && e.t === M.id && !!e.res === res);
  const lines = (id) => E.filter((e) => [e.f, e.t].includes(id) && [e.f, e.t].includes(M.id)).length;
  const ins = ids.filter((id) => into(id, false)).sort(byField),
    res = ids.filter((id) => !ins.includes(id) && into(id, true)).sort(byField),
    outs = ids.filter((id) => !ins.includes(id) && !res.includes(id)).sort(byField);
  const roles = { in: ins, res, out: outs };
  const per = assign(roles, lines, stop);

  // Each role's sorted list, cut along its ring of sides, then each side read left to right or top to bottom;
  // outputs on the bottom and left run back, clockwise.
  const side = { t: {}, r: {}, b: {}, l: {} };
  for (const [role, list] of Object.entries(roles))
    for (const k of RING[role]) side[k][role] = list.splice(0, per[role][k]);
  const top = [...side.t.in, ...side.t.res, ...side.t.out],
    right = [...side.r.in, ...side.r.res, ...side.r.out],
    bottom = [...side.b.in, ...side.b.res, ...side.b.out.reverse()],
    left = [...side.l.res, ...side.l.in, ...side.l.out.reverse()];

  // Offsets from the middle of a side, `step` apart; two stations sit `pair` apart. On a side column the one
  // station with more hub lines than any other sits level with the hub, so its bundle runs straight.
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
  const row = (m) => (m <= 3 ? { step: 124, out: 0 } : { step: Math.min(120, 400 / (m - 1)), out: 30 });
  // Both side columns use one step, set by the fuller one, so the two sides read alike.
  const tall = Math.max(left.length, right.length),
    column = Math.min(135, (tall > 6 ? 480 : 400) / Math.max(tall - 1, 1));
  const at = {};
  const set = (list, offs, xy) => list.forEach((id, i) => (at[id] = xy(offs[i])));
  const [tr, br] = [row(top.length), row(bottom.length)];
  // Labels run away from stations above and right of the hub ("start"), and up to the others ("end").
  set(top, place(top, tr.step, ROW_PAIR), (d) => ({ x: CENTRE.x + d, y: CENTRE.y - ROW - tr.out, anchor: "start" }));
  set(bottom, place(bottom, br.step, ROW_PAIR), (d) => ({
    x: CENTRE.x + d,
    y: CENTRE.y + ROW + br.out,
    anchor: "end",
  }));
  const onLeft = (d) => ({ x: CENTRE.x - COL, y: CENTRE.y + d, anchor: "end" });
  if (stop) {
    // The stop sits level with the hub, so source, stop and hub run as one straight line; the other inputs sit
    // above and below it, further out when the stop fans in two sources.
    const wide = feeders.length > 1 ? 200 : 135;
    set(left, [-wide, wide], onLeft);
    at[stop] = { x: CENTRE.x - 200, y: CENTRE.y, anchor: "end", tag: "optional" };
    const fan = feeders.length > 1 ? Math.min(100, 520 / (feeders.length - 1)) : 0;
    set(feeders, place(feeders, fan, 200), onLeft);
  } else set(left, place(left, column, COL_PAIR, true), onLeft);
  set(right, place(right, column, COL_PAIR, true), (d) => ({ x: CENTRE.x + COL, y: CENTRE.y + d, anchor: "start" }));
  return at;
}

// A station's release, or what it is instead: "resource", or "dev" before a first release.
const release = (s) => (s.ext ? "resource" : (CATALOGUE[s.id]?.rel ?? "dev"));
// A station's label: its name over its release, `lead` below, drawn F times larger on a small map. The sizes match
// .stn .name and .stn .ver in style.css. A label sits `side` beside its station, its name `lift` above the station's
// centre line, turned `slant` degrees. The map's box keeps `edge` around the labels.
const LABEL = { name: 15, ver: 11, lead: 15, side: 16, lift: -2, slant: 45, edge: 12 };
// The radius of a station's mark.
const MARK_R = 10;
// Label widths are estimated from character counts, generously (0.62em a character, 0.78em a capital), so a label
// keeps clear of its neighbours in any font.
const textWidth = (t, px) => [...t].reduce((w, c) => w + (c >= "A" && c <= "Z" ? 0.78 : 0.62), 0) * px;
// Outlines are lists of corners.
const corners = (x, y, w, h) => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];
// Where a station's label sits before scaling: its name's baseline (x, y) and its turn in degrees. A station's label
// runs away from it ("start") or up to it ("end"), rising to the right; the hub's ("middle") sits level inside it.
const labelAt = (s) =>
  s.anchor === "middle"
    ? { x: 0, y: 0, angle: 0 }
    : { x: (s.anchor === "start" ? 1 : -1) * LABEL.side, y: LABEL.lift, angle: -LABEL.slant };
// The middle of a station's name of width w, before scaling: its release sits centred there.
const nameMid = (s, w) => labelAt(s).x + ((s.anchor === "end" ? -1 : 1) * w) / 2;
// The outline a station's label covers at scale F, in map units. It runs from the name's cap height, 0.8em above the
// baseline, to below the release, which sits centred under the name.
function labelBox(s, F) {
  const { y, angle } = labelAt(s),
    name = textWidth(s.id, LABEL.name),
    w = Math.max(name, textWidth(release(s), LABEL.ver)),
    mid = nameMid(s, name),
    a = (angle * Math.PI) / 180,
    [cos, sin] = [Math.cos(a), Math.sin(a)];
  return corners(mid - w / 2, y - 0.8 * LABEL.name, w, LABEL.name + LABEL.lead).map(([u, v]) => [
    s.x + (u * cos - v * sin) * F,
    s.y + (u * sin + v * cos) * F,
  ]);
}

// The map's box: the map with a margin that grows with F, the framing phones had before labels were measured, grown
// further to hold every label.
function viewBox(S, F) {
  const pad = 100 * (F - 1),
    pts = S.filter((s) => !s.hub).flatMap((s) => labelBox(s, F)),
    xs = pts.map(([x]) => x),
    ys = pts.map(([, y]) => y),
    x0 = Math.min(-pad, ...xs.map((x) => x - LABEL.edge)),
    y0 = Math.min(-pad / 2, ...ys.map((y) => y - LABEL.edge)),
    x1 = Math.max(MAP_W + pad, ...xs.map((x) => x + LABEL.edge)),
    y1 = Math.max(MAP_H + pad / 2, ...ys.map((y) => y + LABEL.edge));
  return [x0, y0, x1 - x0, y1 - y0];
}

// What a map draws, without the DOM: its stations with their text from stations.js, and the handoffs from
// handoffs.js that it draws, each coloured and routed. renderMap draws it and bin/check.js checks it.
function mapModel(M) {
  const also = new Set(M.also),
    skip = new Set();
  let stop;
  const pair = (h) => `${h.f}>${h.t}`;
  // A source that a station intercepts reaches the hub through it: source -> station -> hub.
  const has = (f, t) => HANDOFFS.some((h) => h.f === f && h.t === t);
  for (const [id, s] of Object.entries(STATIONS))
    for (const src of s.intercepts ?? [])
      if (has(id, M.id) && has(src, M.id) && has(src, id)) {
        skip.add(`${src}>${M.id}`);
        also.add(`${src}>${id}`);
        stop = id;
      }
  const drawn = (h) => !skip.has(pair(h)) && (h.f === M.id || h.t === M.id || also.has(pair(h)));
  // Copies, so rendering twice never stacks state on the shared data.
  const E = HANDOFFS.filter(drawn).map((h) => ({ ...h, handoff: h }));
  const HUB = { id: M.id, ...STATIONS[M.id], ...CENTRE, hub: true, anchor: "middle" };
  const S = [HUB, ...Object.entries(layout(M, E, stop)).map(([id, at]) => ({ id, ...STATIONS[id], ...at }))];
  // Colour by direction: into the hub is input (or a resource), out of it is results. A handoff between two
  // other stations takes the colour of the hub line at its target, or at its source.
  E.forEach((e) => (e.line = e.t === M.id ? (e.res ? "res" : "reads") : e.f === M.id ? "out" : null));
  const hubLine = (id) => E.find((h) => h.line && (h.f === id || h.t === id))?.line;
  E.forEach((e) => (e.line ??= e.res ? "res" : (hubLine(e.t) ?? hubLine(e.f))));
  // Which half of the animation loop a ball runs: 1 or 2 on a two-leg route through a station (source, stop, hub or
  // hub, station, target), 0 (the whole loop) otherwise.
  const via = E.filter((e) => e.f !== M.id && e.t !== M.id);
  const legOf = (e) => {
    if (e.t === M.id) return via.some((v) => v.t === e.f) ? 2 : 0;
    if (e.f === M.id) return via.some((v) => v.f === e.t) ? 1 : 0;
    return E.some((h) => h.f === e.t && h.t === M.id) ? 1 : 2;
  };
  E.forEach((e) => (e.leg = legOf(e)));
  routeMap(HUB, S, E);
  const days = E.map((e) => e.checked).sort();
  return { HUB, S, E, checked: [days[0], days.at(-1)] };
}
