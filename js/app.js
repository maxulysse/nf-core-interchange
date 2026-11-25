// Honeycomb overview and routing. #/ shows the honeycomb, #/<id> shows that pipeline's interchange map.
// A tile with a map zooms in before the map opens.
const TILE_R = 64, GAP = 5;
const pave = document.getElementById("pave"), pcard = document.getElementById("pcard");
const tileXY = p => [TILE_R * Math.sqrt(3) * (p.q + p.r / 2), TILE_R * 1.5 * p.r];

// viewBox fits every tile with a margin, so adding a tile anywhere grows the map to hold it.
const xs = PIPELINES.map(p => tileXY(p)[0]), ys = PIPELINES.map(p => tileXY(p)[1]);
const M_ = TILE_R * 1.2;
const home = [Math.min(...xs) - M_, Math.min(...ys) - M_,
  Math.max(...xs) - Math.min(...xs) + 2 * M_, Math.max(...ys) - Math.min(...ys) + 2 * M_];
const setBox = b => pave.setAttribute("viewBox", b.map(v => v.toFixed(1)).join(" "));
setBox(home);

PIPELINES.forEach(p => {
  const [x, y] = tileXY(p), has = !!MAPS[p.id], inner = TILE_R - GAP;
  // Long names shrink to fit the tile width; 0.56em is about one Overpass character.
  const width = inner * Math.sqrt(3) * 0.86;
  const size = Math.min(has ? 17 : 13, width / (p.id.length * 0.56));
  p.node = el("g", { class: `tile${has ? " has" : ""}`, role: "button",
    "aria-label": has ? `${p.id}: open its interchange map` : `${p.id}: no map yet` });
  p.node.append(el("polygon", { points: hexPoints(x, y, inner) }),
    el("text", { x, y: y + 2, class: "name", style: `font-size:${size.toFixed(1)}px` }, p.id),
    el("text", { x, y: y + 20, class: "sub" }, has ? `${MAPS[p.id].S.length - 1} stations` : "no map yet"),
    el("title", {}, p.id));
  activate(p.node, () => has ? zoomInto(p) : selectTile(p));
  pave.append(p.node);
});

function selectTile(p) {
  PIPELINES.forEach(t => t.node.classList.toggle("sel", t === p));
  pcard.innerHTML = `<div class="kicker">Pipeline</div><h2>${p.id}</h2>
    <p>No interchange map yet. Add one in <code>maps/${p.id}.js</code> and it opens from this tile.</p>
    <dl><dt>Link</dt><dd><a href="https://nf-co.re/${p.id}" target="_blank" rel="noopener">nf-co.re/${p.id}</a></dd></dl>`;
}
function resetPave() {
  PIPELINES.forEach(t => t.node.classList.remove("sel"));
  const n = Object.keys(MAPS).length;
  pcard.innerHTML = `<div class="kicker">Overview</div><h2>${PIPELINES.length} pipelines, ${n} map${n === 1 ? "" : "s"}</h2>
    <p>Each tile is a pipeline. Filled tiles open an interchange map, with that pipeline as the hub and every pipeline it hands data to or from around it.</p>
    <p style="color:var(--muted)">Select a tile. Dashed tiles have no map yet.</p>`;
}
pave.onclick = ev => { if (ev.target === pave) resetPave(); };

// Zoom: the viewBox closes in on the tile while the others fade, then the map opens.
function zoomInto(p) {
  if (reduced) { location.hash = "#/" + p.id; return; }
  const [x, y] = tileXY(p), w = TILE_R * 2.4, h = w * home[3] / home[2];
  const to = [x - w / 2, y - h / 2, w, h], t0 = performance.now(), DUR = 450;
  p.node.classList.add("zoom"); pave.classList.add("zooming");
  const ease = t => 1 - (1 - t) ** 3;
  (function step(now) {
    const k = ease(Math.min(1, (now - t0) / DUR));
    setBox(home.map((v, i) => v + (to[i] - v) * k));
    if (k < 1) requestAnimationFrame(step); else location.hash = "#/" + p.id;
  })(t0);
}

const vPave = document.getElementById("v-pave"), vMap = document.getElementById("v-map");
function route() {
  const id = location.hash.match(/^#\/(.+)$/)?.[1];
  const m = id && MAPS[id];
  vPave.hidden = !!m; vMap.hidden = !m;
  if (m) { renderMap(m); document.title = `${m.title} · nf-core Interchange`; window.scrollTo(0, 0); }
  else {
    document.title = "nf-core Interchange";
    pave.classList.remove("zooming"); PIPELINES.forEach(t => t.node.classList.remove("zoom"));
    setBox(home); resetPave();
  }
}
addEventListener("hashchange", route);
document.getElementById("back").addEventListener("click", () => { location.hash = "#/"; });
document.addEventListener("keydown", ev => {
  if (ev.key !== "Escape") return;
  vMap.hidden ? resetPave() : resetMap();
});

// Sortable tables: a header click sorts by that column, a second click reverses it.
document.querySelectorAll("table").forEach(table => table.querySelectorAll("th").forEach((th, col) => {
  const btn = document.createElement("button");
  btn.className = "sort"; btn.type = "button"; btn.textContent = th.textContent;
  th.replaceChildren(btn);
  btn.addEventListener("click", () => {
    const dir = th.getAttribute("aria-sort") === "ascending" ? -1 : 1;
    table.querySelectorAll("th").forEach(h => h.removeAttribute("aria-sort"));
    th.setAttribute("aria-sort", dir > 0 ? "ascending" : "descending");
    const body = table.tBodies[0], text = r => r.cells[col].textContent;
    body.append(...[...body.rows].sort((a, b) => dir * text(a).localeCompare(text(b), undefined, { numeric: true })));
  });
}));

// Theme toggle: the choice is stored in this browser and overrides the system setting.
const root = document.documentElement, themeBtn = document.getElementById("theme");
const isDark = () => root.dataset.theme === "dark";
function labelTheme() {
  themeBtn.textContent = isDark() ? "☀ Light" : "☾ Dark";
  themeBtn.setAttribute("aria-label", `Switch to ${isDark() ? "light" : "dark"} mode`);
}
themeBtn.addEventListener("click", () => {
  root.dataset.theme = isDark() ? "light" : "dark";
  stored = root.dataset.theme;
  try { localStorage.setItem("theme", stored); } catch {}
  labelTheme();
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ev => {
  if (!stored) { root.dataset.theme = ev.matches ? "dark" : "light"; labelTheme(); }
});
labelTheme();
route();
