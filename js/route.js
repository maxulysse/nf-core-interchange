// Routes a map's handoffs as metro lines: sets each edge's SVG path, e.d. Geometry only, without the DOM;
// mapModel calls it, so bin/check.js checks the paths too.
const HEX_R = 72;
const groupBy = (xs, key) => Object.values(xs.reduce((g, x) => ((g[key(x)] ??= []).push(x), g), {}));
const across = (face) => (face === "l" || face === "r" ? "y" : "x");

function routeMap(HUB, S, E) {
  const byId = Object.fromEntries(S.map((s) => [s.id, s]));
  const far = (e) => byId[e.f === HUB.id ? e.t : e.f];
  const hubEdges = E.filter((e) => e.f === HUB.id || e.t === HUB.id);
  hubEdges.forEach((e) => {
    const s = far(e),
      dx = s.x - HUB.x,
      dy = s.y - HUB.y;
    e.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "r" : "l") : dy > 0 ? "b" : "t";
  });
  // Centre-to-centre spacing of lines in a bundle, on straight runs and diagonals alike (see offset).
  const PAR = 14;
  groupBy(hubEdges, (e) => e.face).forEach((es) => {
    const k = across(es[0].face),
      len = k === "y" ? HEX_R : HEX_R * Math.sqrt(3),
      half = len / 2,
      gap = Math.min(PAR, len / Math.max(es.length - 1, 1));
    // Each far station gets one slot on the face; lines to the same station sit PAR apart in that slot, as at the
    // station, so the bundle runs parallel all the way.
    es.sort((a, b) => far(a)[k] - far(b)[k]);
    const slots = groupBy(es, (e) => far(e).id);
    slots.forEach((g, j) =>
      g.forEach((e, i) => {
        e.lane = (i - (g.length - 1) / 2) * PAR;
        e.off = ((j + 0.5) / slots.length - 0.5) * len + e.lane;
      }),
    );
    // A line to a station level with the face runs straight: its port moves to the station's height (or x) when
    // the lines beside it still fit, and the others step aside to stay PAR apart. A face with more lines than fit
    // PAR apart squeezes them evenly instead.
    es.sort((a, b) => a.off - b.off);
    es.forEach((e, i) => {
      const want = far(e)[k] + e.lane - HUB[k];
      e.level = want >= -half + i * gap && want <= half - (es.length - 1 - i) * gap;
      if (e.level) e.off = want;
    });
    for (let i = 1; i < es.length; i++)
      if (!es[i].level) es[i].off = Math.min(half, Math.max(es[i].off, es[i - 1].off + gap));
    for (let i = es.length - 2; i >= 0; i--)
      if (!es[i].level) es[i].off = Math.max(-half, Math.min(es[i].off, es[i + 1].off - gap));
  });
  function hubPort(face, off) {
    if (face === "t" || face === "b")
      return [HUB.x + off, HUB.y + (face === "b" ? 1 : -1) * (HEX_R - Math.abs(off) / Math.sqrt(3))];
    return [HUB.x + ((face === "r" ? 1 : -1) * HEX_R * Math.sqrt(3)) / 2, HUB.y + off];
  }
  // Octilinear routing, like a subway map: straight runs joined by one 45-degree diagonal,
  // with rounded corners at each bend. Leaves the station along its main axis.
  const BEND_R = 18,
    LEAD = 32;
  function route([x1, y1], [x2, y2]) {
    const dx = x2 - x1,
      dy = y2 - y1,
      ax = Math.abs(dx),
      ay = Math.abs(dy);
    const sx = Math.sign(dx),
      sy = Math.sign(dy);
    if (ax < 1 || ay < 1)
      return [
        [x1, y1],
        [x2, y2],
      ];
    // The diagonal sits in the middle, with equal straight runs either side. Near 45 degrees those runs vanish,
    // so the line leaves straight, then turns, and enters the station straight from the side: never only a diagonal.
    const r = Math.abs(ax - ay) / 2;
    const d = Math.min(ax, ay) - LEAD;
    if (r < LEAD && d > 0)
      return ax >= ay
        ? [
            [x1, y1],
            [x1 + sx * (ax - d), y1],
            [x2, y2 - sy * LEAD],
            [x2, y2],
          ]
        : [
            [x1, y1],
            [x1, y1 + sy * (ay - d)],
            [x2 - sx * LEAD, y2],
            [x2, y2],
          ];
    const pts =
      ax >= ay
        ? [
            [x1, y1],
            [x1 + sx * r, y1],
            [x2 - sx * r, y2],
            [x2, y2],
          ]
        : [
            [x1, y1],
            [x1, y1 + sy * r],
            [x2, y2 - sy * r],
            [x2, y2],
          ];
    return pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 0.5);
  }
  // Moves a polyline sideways by d, keeping d at every bend (a mitre join), so parallel lines stay d apart
  // on diagonals too. d is along the face at the first point: +y on a left or right face, +x on a top or bottom one.
  function offset(pts, d, face) {
    const dir = pts.slice(1).map(([x, y], i) => {
      const [px, py] = pts[i],
        l = Math.hypot(x - px, y - py);
      return [(x - px) / l, (y - py) / l];
    });
    const along = across(face) === "y" ? [0, 1] : [1, 0];
    const side = Math.sign(-dir[0][1] * along[0] + dir[0][0] * along[1]) || 1;
    const n = dir.map(([ux, uy]) => [-uy * side, ux * side]);
    return pts.map(([x, y], i) => {
      const a = n[Math.max(0, i - 1)],
        b = n[Math.min(n.length - 1, i)],
        k = d / (1 + a[0] * b[0] + a[1] * b[1]);
      return [x + (a[0] + b[0]) * k, y + (a[1] + b[1]) * k];
    });
  }
  // A hub line is drawn from the middle of its bundle, offset to its own place, so a bundle keeps one spacing.
  function pathFor(e) {
    const [a, b] = [byId[e.f], byId[e.t]];
    if (!a.hub && !b.hub) return rounded(route([a.x, a.y], [b.x, b.y]));
    const s = far(e),
      bundle = hubEdges.filter((h) => far(h) === s),
      mid = bundle.reduce((t, h) => t + h.off, 0) / bundle.length;
    const pts = offset(route(hubPort(e.face, mid), [s.x, s.y]), e.off - mid, e.face);
    pts[0] = hubPort(e.face, e.off);
    return rounded(e.f === HUB.id ? pts : pts.reverse());
  }
  function rounded(pts) {
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [px, py] = pts[i - 1],
        [cx, cy] = pts[i],
        [nx, ny] = pts[i + 1];
      const l1 = Math.hypot(cx - px, cy - py),
        l2 = Math.hypot(nx - cx, ny - cy);
      const r = Math.min(BEND_R, l1 / 2, l2 / 2);
      if (r < 0.5) {
        d += ` L${cx.toFixed(1)},${cy.toFixed(1)}`;
        continue;
      }
      const ax = cx - ((cx - px) / l1) * r,
        ay = cy - ((cy - py) / l1) * r;
      const bx = cx + ((nx - cx) / l2) * r,
        by = cy + ((ny - cy) / l2) * r;
      d += ` L${ax.toFixed(1)},${ay.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
    }
    const [lx, ly] = pts[pts.length - 1];
    return d + ` L${lx.toFixed(1)},${ly.toFixed(1)}`;
  }
  E.forEach((e) => (e.d = pathFor(e)));
}
