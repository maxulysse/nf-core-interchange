// Draws one interchange map: the hub pipeline in the middle as a hexagon, the pipelines and resources
// around it as stations, and each handoff as a metro line. Call renderMap(M, from), where from is the id of the previous view.
const narrow = matchMedia("(max-width: 640px)");
narrow.addEventListener("change", () => location.reload());
const F = narrow.matches ? 1.8 : 1;
const LN = { reads: "Input data", res: "Resources", out: "Results out" };
// Map and catalogue text that is not markup: escape it before it goes into HTML. Notes and overviews are markup.
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const NS = "http://www.w3.org/2000/svg";
const el = (n, a = {}, txt) => {
  const e = document.createElementNS(NS, n);
  for (const k in a) e.setAttribute(k, a[k]);
  if (txt != null) e.textContent = txt;
  return e;
};
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hexPoints = (x, y, R) =>
  [-90, -30, 30, 90, 150, 210]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      return `${(x + R * Math.cos(r)).toFixed(1)},${(y + R * Math.sin(r)).toFixed(1)}`;
    })
    .join(" ");
function activate(node, fn) {
  node.setAttribute("tabindex", 0);
  node.addEventListener("click", fn);
  node.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      fn();
    }
  });
}
let resetMap = () => {};
// Set by a zoom into a tile or station; any other route change counts as going back.
let forward = false;
// Eases an SVG viewBox between two [x, y, w, h] boxes, then calls done if the page has not moved on.
// A newer call on the same SVG stops this one.
function animateBox(svg, from, to, done) {
  const id = (svg.anim = (svg.anim ?? 0) + 1),
    at = location.hash,
    t0 = performance.now(),
    DUR = 450,
    ease = (t) => 1 - (1 - t) ** 3;
  (function step(now) {
    if (svg.anim !== id) return;
    const k = ease(Math.min(1, (now - t0) / DUR));
    svg.setAttribute("viewBox", from.map((v, i) => (v + (to[i] - v) * k).toFixed(1)).join(" "));
    if (k < 1) requestAnimationFrame(step);
    else if (location.hash === at) done?.();
  })(t0);
}
// A box of width w centred on a point, with the aspect ratio of the full box.
const around = (s, w, full) => {
  const h = (w * full[3]) / full[2];
  return [s.x - w / 2, s.y - h / 2, w, h];
};

// Narrow screens scale labels by F, so neighbours can collide. A column too tight for labels below its stations
// gets them beside, on the side away from the hub; a row whose labels touch staggers them over two or three tiers.
// Returns the box `full` grown to hold every label.
function fitNarrow(svg, S, full) {
  const move = (s, x, y, anchor) =>
    [...s.label_.children].forEach((t, i) => {
      t.setAttribute("x", x);
      t.setAttribute("y", y + i * 15);
      t.setAttribute("text-anchor", anchor);
    });
  const near = (a, b) => Math.abs(a - b) < 1;
  const stations = S.filter((s) => !s.hub);
  // Height of a label below its station, in map units: offset, name, version, margin.
  const below = (32 + 15 + 8) * F;
  for (const [x, side] of [
    [CENTRE.x - COL, -1],
    [CENTRE.x + COL, 1],
  ]) {
    const col = stations.filter((s) => near(s.x, x) && s.label === "below").sort((a, b) => a.y - b.y);
    if (col.slice(1).some((s, i) => s.y - col[i].y < below + 12))
      col.forEach((s) => move(s, side * 16, -2, side < 0 ? "end" : "start"));
  }
  const width = (s) => s.label_.getBBox().width * F;
  for (const lab of ["above", "below"]) {
    const rows = {};
    stations.filter((s) => s.label === lab).forEach((s) => (rows[Math.round(s.y)] ??= []).push(s));
    for (const row of Object.values(rows)) {
      row.sort((a, b) => a.x - b.x);
      // Labels `k` apart share a tier; use the fewest tiers, up to three, that keep each tier clear.
      const clash = (k) => row.slice(k).some((s, i) => s.x - row[i].x < (width(s) + width(row[i])) / 2 + 8);
      const tiers = [1, 2, 3].find((k) => !clash(k)) ?? 3;
      const out = lab === "above" ? -1 : 1;
      row.forEach((s, i) => i % tiers && move(s, 0, out * (32 + 36 * (i % tiers)), "middle"));
    }
  }
  const b = svg.getBBox(),
    m = 12,
    x0 = Math.min(full[0], b.x - m),
    y0 = Math.min(full[1], b.y - m),
    x1 = Math.max(full[0] + full[2], b.x + b.width + m),
    y1 = Math.max(full[1] + full[3], b.y + b.height + m);
  return [x0, y0, x1 - x0, y1 - y0];
}

function renderMap(M, from) {
  const { HUB, S, E, checked } = mapModel(M);
  const byId = Object.fromEntries(S.map((s) => [s.id, s]));
  // Releases come from catalogue.js.
  const release = (s) => (s.ext ? "resource" : (CATALOGUE[s.id]?.rel ?? "dev"));
  document.getElementById("map-title").textContent = mapTitle(M.id);
  document.getElementById("map-checked").textContent =
    checked[0] === checked[1] ? `on ${checked[0]}` : `between ${checked[0]} and ${checked[1]}`;
  document.getElementById("map-credits").innerHTML =
    `Thanks to the <a href="https://github.com/nf-core/${HUB.id}/graphs/contributors">contributors of nf-core/${HUB.id}</a>.`;
  const svg = document.getElementById("map");
  svg.replaceChildren();
  svg.setAttribute("aria-label", `Map of pipelines connected to nf-core/${HUB.id}`);
  const pad = 100 * (F - 1);
  let full = [-pad, -pad / 2, MAP_W + 2 * pad, MAP_H + pad];
  svg.classList.toggle("narrow", narrow.matches);
  svg.classList.remove("zooming");
  const gL = el("g"),
    gD = el("g"),
    gS = el("g");
  svg.append(gL, gD, gS);

  // Leg 1 runs in the first half of the loop, leg 2 in the second.
  const LEG = {
    1: { keyPoints: "0;1;1", keyTimes: "0;0.5;1", calcMode: "linear" },
    2: { keyPoints: "0;0;1", keyTimes: "0;0.5;1", calcMode: "linear" },
  };
  // Each station and edge keeps its own SVG node, so selection needs no DOM lookups.
  E.forEach((e, i) => {
    e.id = "e" + i;
    e.node = el("path", { id: e.id, d: e.d, class: `line ${e.line} ${e.st}` });
    const hit = el("path", { d: e.d, class: "hit" });
    hit.append(el("title", {}, `${e.f} to ${e.t}: ${ST[e.st].label}`));
    hit.addEventListener("click", () => selectEdge(e));
    gL.append(e.node, hit);
    if (!reduced) {
      const c = el("circle", { r: 4, class: `dot ${e.st}` });
      // Every ball shares one 5 s loop, so at each station the balls arrive and leave together. On a route
      // through a station (fetchngs, seqinspector, sarek) one ball runs the first leg, then the next one the second.
      const am = el("animateMotion", { dur: "5s", repeatCount: "indefinite", ...LEG[e.leg] });
      const mp = el("mpath");
      mp.setAttribute("href", "#" + e.id);
      am.append(mp);
      c.append(am);
      if (e.leg)
        c.append(
          el("animate", {
            attributeName: "visibility",
            values: e.leg === 1 ? "visible;hidden" : "hidden;visible",
            keyTimes: "0;0.5",
            calcMode: "discrete",
            dur: "5s",
            repeatCount: "indefinite",
          }),
        );
      gD.append(c);
    }
  });

  const LBL = { above: [0, -32, "middle"], below: [0, 32, "middle"], inside: [0, 0, "middle"] };
  const mark = (s) =>
    s.hub
      ? el("polygon", { points: hexPoints(s.x, s.y, HEX_R) })
      : s.ext
        ? el("rect", { x: s.x - 9, y: s.y - 9, width: 18, height: 18, class: "mark" })
        : el("circle", { cx: s.x, cy: s.y, r: 10, class: "mark" });
  S.forEach((s) => {
    s.node = el("g", {
      class: ["stn", s.hub && "hub", s.tag].filter(Boolean).join(" "),
      role: "button",
      "aria-label": s.id,
    });
    const [dx, dy, anc] = LBL[s.label];
    // The hub label sits inside the fixed-size hexagon, so it keeps its size.
    const label = el("g", { transform: `translate(${s.x},${s.y}) scale(${s.hub ? 1 : F})` });
    // A long hub name shrinks to fit the hexagon; 0.56em is about one Overpass character.
    const hubSize = s.hub ? `font-size:${Math.min(26, (HEX_R * 1.5) / (s.id.length * 0.56)).toFixed(1)}px` : "";
    label.append(
      el("text", { x: dx, y: dy, "text-anchor": anc, class: "name", style: hubSize }, s.id),
      el("text", { x: dx, y: dy + 15, "text-anchor": anc, class: "ver" }, release(s)),
    );
    s.node.append(mark(s), label);
    s.label_ = label;
    // A second click on a selected station that has its own map opens that map.
    activate(s.node, () => (s.node.classList.contains("sel") && !s.hub && MAPS[s.id] ? openMap(s) : selectStation(s)));
    gS.append(s.node);
  });

  if (narrow.matches) full = fitNarrow(svg, S, full);
  // Open zoomed on where we came from, then pull back: the hub after a zoom in, the previous map's station after going back.
  const start = byId[from] ? around(byId[from], 160, full) : around(HUB, HEX_R * 2.4, full);
  if (reduced) svg.setAttribute("viewBox", full.join(" "));
  else animateBox(svg, start, full);

  const card = document.getElementById("card");
  const pill = (st) => `<span class="pill ${st}">${ST[st].label}</span>`;
  function link(s) {
    const u = s.url ?? `https://nf-co.re/${s.id}`;
    return `<a href="${u}" target="_blank" rel="noopener">${u.replace("https://", "")}</a>`;
  }

  function highlight(nodes) {
    svg.querySelectorAll(".on, .sel").forEach((n) => n.classList.remove("on", "sel"));
    svg.classList.toggle("focus", nodes.length > 0);
    nodes.forEach((n) => n.classList.add("on"));
  }
  function selectStation(s) {
    const ins = E.filter((e) => e.t === s.id),
      outs = E.filter((e) => e.f === s.id);
    highlight([s.node, ...[...ins, ...outs].flatMap((e) => [e.node, byId[e.f].node, byId[e.t].node])]);
    s.node.classList.add("sel");
    card.innerHTML = `<div class="kicker">${s.ext ? "Resource" : `Pipeline · ${esc(release(s))}${s.tag ? ` (${s.tag})` : ""}`}</div>
    <h2>${s.id}</h2><p>${s.blurb}</p>
    <dl>${s.takes ? `<dt>Takes</dt><dd>${s.takes}</dd>` : ""}<dt>Gives</dt><dd>${s.gives}</dd>
    ${ins.length ? `<dt>From</dt><dd>${[...new Set(ins.map((e) => e.f))].join(", ")}</dd>` : ""}
    ${outs.length ? `<dt>To</dt><dd>${[...new Set(outs.map((e) => e.t))].join(", ")}</dd>` : ""}
    <dt>Link</dt><dd>${link(s)}</dd></dl>
    ${!s.hub && MAPS[s.id] ? `<button class="open" type="button">Open the ${s.id} interchange →</button>` : ""}`;
    card.querySelector(".open")?.addEventListener("click", () => openMap(s));
  }
  // Zooms into a station while the rest fades, then opens its map, which starts zoomed on that same pipeline.
  function openMap(s) {
    if (reduced) {
      location.hash = s.id;
      return;
    }
    const v = svg.viewBox.baseVal;
    s.node.classList.add("zoom");
    svg.classList.add("zooming");
    animateBox(svg, [v.x, v.y, v.width, v.height], around(s, 160, full), () => {
      forward = true;
      location.hash = s.id;
    });
  }
  function selectEdge(e) {
    highlight([e.node, byId[e.f].node, byId[e.t].node]);
    card.innerHTML = `<div class="kicker">Handoff · ${LN[e.line]}</div>
    <h2>${e.f} → ${e.t}</h2><div>${pill(e.st)}</div>
    <dl><dt>Through</dt><dd class="mono">${esc(e.via)}</dd><dt>Note</dt><dd>${e.note}</dd>
    ${e.src ? `<dt>Source</dt><dd>${SOURCES[e.src]}</dd>` : ""}</dl>`;
  }
  function reset() {
    highlight([]);
    card.innerHTML = `<div class="kicker">Overview</div><h2>${S.length - 1} stations around ${HUB.id}, ${E.length} handoffs</h2>
    <p>${M.overview}</p>
    ${Object.entries(ST)
      .map(([k, v]) => `<p><strong>${v.label}: ${E.filter((e) => e.st === k).length}</strong>, ${v.note}.</p>`)
      .join("")}
    <p style="color:var(--muted)">Select a station or a line for details, and click a selected station again to open its own map. Click the empty map to come back here.</p>`;
  }
  svg.onclick = (ev) => {
    if (ev.target === svg) reset();
  };

  // Legend: colour is the line, opacity is the status.
  const sw = (cls, color) =>
    `<svg width="38" height="10" aria-hidden="true"><line x1="5" y1="5" x2="33" y2="5" class="line ${cls}" style="stroke:${color};stroke-width:5"/></svg>`;
  document.getElementById("legend").innerHTML =
    Object.entries(LN)
      .map(([k, v]) => `<span>${sw("", `var(--${k})`)}${v}</span>`)
      .join("") +
    Object.entries(ST)
      .map(([k, v]) => `<span>${sw(k, "var(--fg)")}${v.label}</span>`)
      .join("");

  function row(cells, open) {
    const tr = document.createElement("tr");
    tr.className = "clickable";
    tr.innerHTML = cells;
    activate(tr, () => {
      open();
      document.querySelector(".main").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "end" });
    });
    return tr;
  }
  document.querySelectorAll("#v-map th[aria-sort]").forEach((h) => h.removeAttribute("aria-sort"));
  document
    .getElementById("t-st")
    .replaceChildren(
      ...S.map((s) =>
        row(
          `<td><strong>${s.id}</strong></td><td class="mono">${esc(release(s))}</td><td>${s.takes}</td><td>${s.gives}</td>`,
          () => selectStation(s),
        ),
      ),
    );
  document
    .getElementById("t-e")
    .replaceChildren(
      ...E.map((e) =>
        row(
          `<td>${e.f}</td><td>${e.t}</td><td>${pill(e.st)}</td><td class="mono">${esc(e.via)}</td><td>${e.note}</td>`,
          () => selectEdge(e),
        ),
      ),
    );

  resetMap = reset;
  reset();
}
