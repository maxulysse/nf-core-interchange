// Draws one interchange map: the hub pipeline in the middle as a hexagon, the pipelines and resources
// around it as stations, and each handoff as a metro line. Call renderMap(M) with a registered map.
const narrow = matchMedia("(max-width: 640px)");
narrow.addEventListener("change", () => location.reload());
const F = narrow.matches ? 1.8 : 1;
const ST = {
  native: { label: "Native", note: "both pipelines support it in code; the chain has not been run end to end" },
  planned: { label: "Planned", note: "needs a hand-built samplesheet, a change in a pipeline, or a release" },
};
const LN = { reads: "Input data", res: "Resources", out: "Results out" };
const NS = "http://www.w3.org/2000/svg";
const el = (n, a = {}, txt) => { const e = document.createElementNS(NS, n);
  for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; return e; };
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const HEX_R = 72;
const groupBy = (xs, key) => Object.values(xs.reduce((g, x) => ((g[key(x)] ??= []).push(x), g), {}));
const across = face => face === "l" || face === "r" ? "y" : "x";
const hexPoints = (x, y, R) => [-90, -30, 30, 90, 150, 210].map(a => { const r = a * Math.PI / 180;
  return `${(x + R * Math.cos(r)).toFixed(1)},${(y + R * Math.sin(r)).toFixed(1)}`; }).join(" ");
function activate(node, fn) {
  node.setAttribute("tabindex", 0);
  node.addEventListener("click", fn);
  node.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); fn(); } });
}
let resetMap = () => {};

function renderMap(M) {
// Copies, so rendering twice never stacks state on the shared data.
const S = M.S.map(s => ({ ...s })), E = M.E.map(e => ({ ...e }));
const byId = Object.fromEntries(S.map(s => [s.id, s]));
const HUB = S.find(s => s.hub);
const release = s => s.ext ? "resource" : s.rel;
const far = e => byId[e.f === HUB.id ? e.t : e.f];
document.getElementById("map-title").textContent = M.title;
document.getElementById("map-checked").textContent = M.checked;
document.getElementById("map-credits").innerHTML = M.credits ?? "";
const hubEdges = E.filter(e => e.f === HUB.id || e.t === HUB.id);
hubEdges.forEach(e => { const s = far(e), dx = s.x - HUB.x, dy = s.y - HUB.y;
  e.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "r" : "l") : (dy > 0 ? "b" : "t"); });
E.forEach(e => e.shift = [0, 0]);
groupBy(hubEdges, e => e.face).forEach(es => {
  es.sort((a, b) => far(a)[across(a.face)] - far(b)[across(b.face)]);
  const len = across(es[0].face) === "y" ? HEX_R : HEX_R * Math.sqrt(3);
  es.forEach((e, i) => e.off = ((i + 0.5) / es.length - 0.5) * len);
});
groupBy(hubEdges, e => [e.f, e.t].sort().join()).forEach(es => {
  const mid = es.reduce((sum, e) => sum + e.off, 0) / es.length;
  es.forEach(e => { const d = e.off - mid; e.shift = across(e.face) === "y" ? [0, d] : [d, 0]; });
});
function port(s, e) {
  if (!s.hub) return [s.x + e.shift[0], s.y + e.shift[1]];
  if (e.face === "t" || e.face === "b") return [s.x + e.off, s.y + (e.face === "b" ? 1 : -1) * (HEX_R - Math.abs(e.off) / Math.sqrt(3))];
  return [s.x + (e.face === "r" ? 1 : -1) * HEX_R * Math.sqrt(3) / 2, s.y + e.off];
}
// Octilinear routing, like a subway map: straight runs joined by one 45-degree diagonal,
// with rounded corners at each bend. Leaves the station along its main axis.
const BEND_R = 18;
function pathFor(e) {
  const [x1, y1] = port(byId[e.f], e), [x2, y2] = port(byId[e.t], e);
  const dx = x2 - x1, dy = y2 - y1, ax = Math.abs(dx), ay = Math.abs(dy);
  const sx = Math.sign(dx), sy = Math.sign(dy);
  let pts;
  if (ax < 1 || ay < 1) pts = [[x1, y1], [x2, y2]];
  else {
    // The diagonal sits in the middle, with equal straight runs either side.
    if (ax >= ay) { const r = (ax - ay) / 2;
      pts = [[x1, y1], [x1 + sx * r, y1], [x2 - sx * r, y2], [x2, y2]]; }
    else { const r = (ay - ax) / 2;
      pts = [[x1, y1], [x1, y1 + sy * r], [x2, y2 - sy * r], [x2, y2]]; }
    pts = pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 0.5);
  }
  return rounded(pts);
}
function rounded(pts) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [cx, cy] = pts[i], [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(cx - px, cy - py), l2 = Math.hypot(nx - cx, ny - cy);
    const r = Math.min(BEND_R, l1 / 2, l2 / 2);
    if (r < 0.5) { d += ` L${cx.toFixed(1)},${cy.toFixed(1)}`; continue; }
    const ax = cx - (cx - px) / l1 * r, ay = cy - (cy - py) / l1 * r;
    const bx = cx + (nx - cx) / l2 * r, by = cy + (ny - cy) / l2 * r;
    d += ` L${ax.toFixed(1)},${ay.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return d + ` L${lx.toFixed(1)},${ly.toFixed(1)}`;
}

const svg = document.getElementById("map");
svg.replaceChildren(); svg.setAttribute("aria-label", `Map of pipelines connected to nf-core/${HUB.id}`);
svg.setAttribute("viewBox", "0 0 1000 680");
if (narrow.matches) { const pad = 100 * (F - 1);
  svg.classList.add("narrow"); svg.setAttribute("viewBox", `${-pad} ${-pad / 2} ${1000 + 2 * pad} ${680 + pad}`); }
const gL = el("g"), gD = el("g"), gS = el("g");
svg.append(gL, gD, gS);

// Each station and edge keeps its own SVG node, so selection needs no DOM lookups.
E.forEach((e, i) => {
  e.id = "e" + i;
  const d = pathFor(e);
  e.node = el("path", { id: e.id, d, class: `line ${e.line} ${e.st}` });
  const hit = el("path", { d, class: "hit" });
  hit.append(el("title", {}, `${e.f} to ${e.t}: ${ST[e.st].label}`));
  hit.addEventListener("click", () => selectEdge(e));
  gL.append(e.node, hit);
  if (!reduced) {
    const c = el("circle", { r: 4, class: `dot ${e.st}` });
    // Balls flowing into the same station share one timing, so they leave and arrive together.
    const k = S.indexOf(byId[e.t]);
    const am = el("animateMotion", { dur: `${5 + (k % 4)}s`, repeatCount: "indefinite", begin: `${-k * 0.7}s` });
    const mp = el("mpath"); mp.setAttribute("href", "#" + e.id);
    am.append(mp); c.append(am); gD.append(c);
  }
});

const LBL = { left: [-18, 5, "end"], above: [0, -32, "middle"], below: [0, 32, "middle"], inside: [0, 0, "middle"] };
const hexPts = s => hexPoints(s.x, s.y, HEX_R);
const mark = s => s.hub ? el("polygon", { points: hexPts(s) })
  : s.ext ? el("rect", { x: s.x - 9, y: s.y - 9, width: 18, height: 18, class: "mark" })
  : el("circle", { cx: s.x, cy: s.y, r: 10, class: "mark" });
S.forEach(s => {
  s.node = el("g", { class: ["stn", s.hub && "hub", s.tag].filter(Boolean).join(" "), role: "button", "aria-label": s.id });
  const [dx, dy, anc] = LBL[s.side];
  // The hub label sits inside the fixed-size hexagon, so it keeps its size.
  const label = el("g", { transform: `translate(${s.x},${s.y}) scale(${s.hub ? 1 : F})` });
  label.append(el("text", { x: dx, y: dy, "text-anchor": anc, class: "name" }, s.id),
    el("text", { x: dx, y: dy + 15, "text-anchor": anc, class: "ver" }, release(s)));
  s.node.append(mark(s), label);
  activate(s.node, () => selectStation(s)); gS.append(s.node);
});

const card = document.getElementById("card");
const pill = st => `<span class="pill ${st}">${ST[st].label}</span>`;
function link(s) { const u = s.url ?? `https://nf-co.re/${s.id}`;
  return `<a href="${u}" target="_blank" rel="noopener">${u.replace("https://", "")}</a>`; }

function highlight(nodes) {
  svg.querySelectorAll(".on, .sel").forEach(n => n.classList.remove("on", "sel"));
  svg.classList.toggle("focus", nodes.length > 0);
  nodes.forEach(n => n.classList.add("on"));
}
function selectStation(s) {
  const ins = E.filter(e => e.t === s.id), outs = E.filter(e => e.f === s.id);
  highlight([s.node, ...[...ins, ...outs].flatMap(e => [e.node, byId[e.f].node, byId[e.t].node])]);
  s.node.classList.add("sel");
  card.innerHTML = `<div class="kicker">${s.ext ? "Resource" : `Pipeline · ${s.rel}${s.tag ? ` (${s.tag})` : ""}`}</div>
    <h2>${s.id}</h2><p>${s.blurb}</p>
    <dl>${s.takes ? `<dt>Takes</dt><dd>${s.takes}</dd>` : ""}<dt>Gives</dt><dd>${s.gives}</dd>
    ${ins.length ? `<dt>From</dt><dd>${ins.map(e => e.f).join(", ")}</dd>` : ""}
    ${outs.length ? `<dt>To</dt><dd>${outs.map(e => e.t).join(", ")}</dd>` : ""}
    <dt>Link</dt><dd>${link(s)}</dd></dl>
    ${!s.hub && MAPS[s.id] ? `<button class="open" type="button">Open the ${s.id} interchange →</button>` : ""}`;
  card.querySelector(".open")?.addEventListener("click", () => { location.hash = "#/" + s.id; });
}
function selectEdge(e) {
  highlight([e.node, byId[e.f].node, byId[e.t].node]);
  card.innerHTML = `<div class="kicker">Handoff · ${LN[e.line]}</div>
    <h2>${e.f} → ${e.t}</h2><div>${pill(e.st)}</div>
    <dl><dt>Through</dt><dd class="mono">${e.via}</dd><dt>Note</dt><dd>${e.note}</dd></dl>`;
}
function reset() {
  highlight([]);
  card.innerHTML = `<div class="kicker">Overview</div><h2>${S.length - 1} stations around ${HUB.id}, ${E.length} handoffs</h2>
    <p>${M.overview}</p>
    ${Object.entries(ST).map(([k, v]) => `<p><strong>${v.label}: ${E.filter(e => e.st === k).length}</strong>, ${v.note}.</p>`).join("")}
    <p style="color:var(--muted)">Select a station or a line for details. Click the empty map to come back here.</p>`;
}
svg.onclick = ev => { if (ev.target === svg) reset(); };

// Legend: colour is the line, opacity is the status.
const sw = (cls, color) => `<svg width="38" height="10" aria-hidden="true"><line x1="5" y1="5" x2="33" y2="5" class="line ${cls}" style="stroke:${color};stroke-width:5"/></svg>`;
document.getElementById("legend").innerHTML =
  Object.entries(LN).map(([k, v]) => `<span>${sw("", `var(--${k})`)}${v}</span>`).join("") +
  Object.entries(ST).map(([k, v]) => `<span>${sw(k, "var(--fg)")}${v.label}</span>`).join("");

function row(cells, open) {
  const tr = document.createElement("tr");
  tr.className = "clickable"; tr.innerHTML = cells;
  activate(tr, () => { open(); document.querySelector(".main").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "end" }); });
  return tr;
}
document.getElementById("t-st").replaceChildren(...S.map(s =>
  row(`<td><strong>${s.id}</strong></td><td class="mono">${release(s)}</td><td>${s.takes}</td><td>${s.gives}</td>`, () => selectStation(s))));
document.getElementById("t-e").replaceChildren(...E.map(e =>
  row(`<td>${e.f}</td><td>${e.t}</td><td>${pill(e.st)}</td><td class="mono">${e.via}</td><td>${e.note}</td>`, () => selectEdge(e))));

resetMap = reset;
reset();
}
