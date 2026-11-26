// Honeycomb tree and routing. A group tile zooms into a honeycomb of its children; a pipeline tile
// zooms into its interchange map. The hash names one node: none is the top, #<id> a group or pipeline.
const TILE_R = 64,
  GAP = 5,
  PX = 1.6;
const pave = document.getElementById("pave"),
  pcard = document.getElementById("pcard");
const crumbs = document.getElementById("crumbs"),
  lede = document.getElementById("lede");
// A group appears once. A pipeline may appear in several groups: PARENTS lists them all.
const isGroup = (n) => !!n.children;
const NODES = {},
  PARENTS = {};
(function index(n, parent) {
  if (isGroup(n)) n.children = n.children.map((c) => (typeof c === "string" ? { id: c } : c));
  const seen = NODES[n.id];
  if (seen && (isGroup(n) || isGroup(seen))) throw new Error(`Duplicate group id in TREE: ${n.id}`);
  if (parent && PARENTS[n.id]?.includes(parent)) throw new Error(`${n.id} is listed twice in ${parent.id}`);
  NODES[n.id] ??= n;
  (PARENTS[n.id] ??= []).push(parent);
  n.children?.forEach((c) => index(c, n));
})(TREE, null);
const label = (n) => n.label ?? n.id;
const contains = (g, id) => g.children.some((c) => c.id === id || (isGroup(c) && contains(c, id)));
// Distinct pipelines under a node, counted once even when they sit in several of its groups.
const leaves = (n) => (isGroup(n) ? [...new Map(n.children.flatMap(leaves).map((l) => [l.id, l])).values()] : [n]);
// The breadcrumb follows the group you came from (the current level) when the pipeline is in it, else its first group.
const parentOf = (n) => {
  const ps = PARENTS[n.id];
  return ps.includes(level) ? level : ps[0];
};
const pathTo = (n) => (n ? [...pathTo(parentOf(n)), n] : []);
const groupLinks = (id) =>
  PARENTS[id].map((g) => `<a href="#${g.id}">${pathTo(g).slice(1).map(label).join(" › ")}</a>`).join(", ");
const plural = (k, w) => `${k} ${w}${k === 1 ? "" : "s"}`;
const info = (id) => CATALOGUE[id] ?? { desc: "", rel: null };
// The repository URL lives once, in the GitHub link in the page header.
const REPO = document.querySelector("a.gh").href;

// Spiral placement in axial hex coordinates: the centre, then each ring outward.
const DIRS = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];
function spiral(count) {
  const out = [[0, 0]];
  for (let k = 1; out.length < count; k++) {
    let q = DIRS[4][0] * k,
      r = DIRS[4][1] * k;
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < k; j++) {
        out.push([q, r]);
        q += DIRS[i][0];
        r += DIRS[i][1];
      }
  }
  return out.slice(0, count);
}
const tileXY = ([q, r]) => [TILE_R * Math.sqrt(3) * (q + r / 2), TILE_R * 1.5 * r];
const setBox = (b) => pave.setAttribute("viewBox", b.map((v) => v.toFixed(1)).join(" "));

let level = TREE,
  home = [0, 0, 1, 1];
function showGroup(g, from) {
  level = g;
  const pos = spiral(g.children.length);
  g.children.forEach((c, i) => {
    c.qr = pos[i];
  });
  // viewBox fits the tiles with a margin, and never shrinks below about three tiles across, so a small group stays tile-sized.
  const xs = g.children.map((c) => tileXY(c.qr)[0]),
    ys = g.children.map((c) => tileXY(c.qr)[1]);
  const m = TILE_R * 1.2,
    x0 = Math.min(...xs) - m,
    y0 = Math.min(...ys) - m;
  let w = Math.max(...xs) - Math.min(...xs) + 2 * m,
    h = Math.max(...ys) - Math.min(...ys) + 2 * m;
  const W = Math.max(w, TILE_R * Math.sqrt(3) * 3.4),
    H = Math.max(h, TILE_R * 3.6);
  home = [x0 - (W - w) / 2, y0 - (H - h) / 2, W, H];
  setBox(home);
  // Same tile size on every level: the honeycomb is drawn at a fixed scale, and only narrow screens shrink it.
  pave.style.width = `${(W * PX).toFixed(0)}px`;
  pave.replaceChildren();
  g.children.forEach((c) => {
    const [x, y] = tileXY(c.qr),
      grp = isGroup(c),
      has = !grp && !!MAPS[c.id],
      inner = TILE_R - GAP;
    // Long names shrink to fit the tile width; 0.56em is about one Overpass character.
    const width = inner * Math.sqrt(3) * 0.86;
    const size = Math.min(grp || has ? 17 : 13, width / (label(c).length * 0.56));
    const n = leaves(c).length;
    const dev = !grp && !info(c.id).rel;
    const sub = grp
      ? plural(n, "pipeline")
      : has
        ? `${Object.keys(MAPS[c.id].at).length} stations`
        : dev
          ? "dev"
          : info(c.id).rel;
    c.node = el("g", {
      class: `tile${grp ? " grp" : has ? " has" : dev ? " dev" : ""}`,
      role: "button",
      "aria-label": grp
        ? `${label(c)}: ${sub}`
        : has
          ? `${c.id}: open its interchange map`
          : `${c.id}, ${sub}: no map yet`,
    });
    c.node.append(
      el("polygon", { points: hexPoints(x, y, inner) }),
      el("text", { x, y: y + 2, class: "name", style: `font-size:${size.toFixed(1)}px` }, label(c)),
      el("text", { x, y: y + 20, class: "sub" }, sub),
      el("title", {}, grp ? label(c) : `${c.id}${info(c.id).desc ? `: ${info(c.id).desc}` : ""}`),
    );
    activate(c.node, () => (grp || has ? zoomInto(c) : selectTile(c)));
    pave.append(c.node);
  });
  pave.classList.remove("zooming", "enter");
  void pave.getBoundingClientRect();
  pave.classList.add("enter");
  lede.hidden = g !== TREE;
  // Going back opens the group zoomed on the tile we came from (or the one holding it), then pulls back.
  const back = from && g.children.find((c) => c.id === from || (isGroup(c) && contains(c, from)));
  if (back && !reduced) animateBox(pave, tileBox(back), home);
  resetPave();
}

function selectTile(p) {
  level.children.forEach((t) => t.node.classList.toggle("sel", t === p));
  const { desc, rel } = info(p.id);
  pcard.innerHTML = `<div class="kicker">Pipeline · ${rel ? esc(rel) : "dev"}</div><h2>${p.id}</h2>
    ${desc ? `<p>${esc(desc)}</p>` : ""}
    <p style="color:var(--muted)">No interchange map yet. To add one, see <a href="${REPO}/blob/main/docs/CONTRIBUTING.md" target="_blank" rel="noopener">CONTRIBUTING</a>.</p>
    <dl><dt>${PARENTS[p.id].length > 1 ? "Groups" : "Group"}</dt><dd>${groupLinks(p.id)}</dd>
    <dt>Link</dt><dd><a href="https://nf-co.re/${p.id}" target="_blank" rel="noopener">nf-co.re/${p.id}</a></dd></dl>`;
}
function resetPave() {
  level.children.forEach((t) => t.node.classList.remove("sel"));
  const all = leaves(level),
    maps = all.filter((n) => MAPS[n.id]).length;
  const groups = level.children.filter(isGroup).length;
  pcard.innerHTML = `<div class="kicker">${level === TREE ? "Overview" : "Group"}</div>
    <h2>${level === TREE ? `${plural(all.length, "pipeline")}, ${plural(maps, "map")}` : label(level)}</h2>
    ${
      level === TREE
        ? `<p>Groups follow the field or the data you start from, then split by what you want to do with it. Open a group to go one level down, until you reach a pipeline and its interchange map.</p>`
        : `<p>${plural(all.length, "pipeline")}${groups ? ` in ${plural(groups, "sub-group")}` : ""}, ${maps} with a map.</p>`
    }
    <p style="color:var(--muted)">Filled tiles open a pipeline map. Outlined tiles open another honeycomb. Dashed tiles have no map yet, faint ones are still in development.</p>
    ${level === TREE ? `<p style="color:var(--muted)">Pipeline list from the nf-core catalogue, ${CATALOGUE_DATE}.</p>` : ""}`;
}
pave.onclick = (ev) => {
  if (ev.target === pave) resetPave();
};

const tileBox = (c) => {
  const [x, y] = tileXY(c.qr);
  return around({ x, y }, TILE_R * 2.4, home);
};
// Zoom: the viewBox closes in on the tile while the others fade, then the next level opens.
function zoomInto(c) {
  if (reduced) {
    location.hash = c.id;
    return;
  }
  c.node.classList.add("zoom");
  pave.classList.add("zooming");
  animateBox(pave, home, tileBox(c), () => {
    forward = true;
    location.hash = c.id;
  });
}

function renderCrumbs(n) {
  const path = pathTo(n);
  crumbs.replaceChildren(
    ...path.flatMap((p, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label(p);
      if (i === path.length - 1) b.setAttribute("aria-current", "page");
      else
        b.addEventListener("click", () => {
          location.hash = p === TREE ? "" : p.id;
        });
      if (i === 0) return [b];
      const sep = document.createElement("span");
      sep.className = "sep";
      sep.textContent = "›";
      sep.setAttribute("aria-hidden", "true");
      return [sep, b];
    }),
  );
}

const mapGroups = document.getElementById("map-groups");
const vPave = document.getElementById("v-pave"),
  vMap = document.getElementById("v-map");
let last = null;
function route() {
  const n = NODES[location.hash.slice(1)] ?? TREE,
    from = forward ? null : last;
  forward = false;
  last = n.id;
  const m = !isGroup(n) && MAPS[n.id];
  vPave.hidden = !!m;
  vMap.hidden = !m;
  if (m) {
    renderMap(m, from);
    window.scrollTo(0, 0);
  } else {
    showGroup(isGroup(n) ? n : parentOf(n), from);
    if (!isGroup(n)) selectTile(n);
  }
  mapGroups.innerHTML = m ? `In ${groupLinks(n.id)}` : "";
  renderCrumbs(n);
  document.title = n === TREE ? "nf-core/interchange" : `${m ? m.title : label(n)} · nf-core/interchange`;
}
addEventListener("hashchange", route);
document.addEventListener("keydown", (ev) => {
  if (ev.key !== "Escape") return;
  vMap.hidden ? resetPave() : resetMap();
});

// Sortable tables: a header click sorts by that column, a second click reverses it.
document.querySelectorAll("table").forEach((table) =>
  table.querySelectorAll("th").forEach((th, col) => {
    const btn = document.createElement("button");
    btn.className = "sort";
    btn.type = "button";
    btn.textContent = th.textContent;
    th.replaceChildren(btn);
    btn.addEventListener("click", () => {
      const dir = th.getAttribute("aria-sort") === "ascending" ? -1 : 1;
      table.querySelectorAll("th").forEach((h) => h.removeAttribute("aria-sort"));
      th.setAttribute("aria-sort", dir > 0 ? "ascending" : "descending");
      const body = table.tBodies[0],
        text = (r) => r.cells[col].textContent;
      body.append(...[...body.rows].sort((a, b) => dir * text(a).localeCompare(text(b), undefined, { numeric: true })));
    });
  }),
);

// Theme toggle: the choice is stored in this browser and overrides the system setting.
const root = document.documentElement,
  themeBtn = document.getElementById("theme");
const isDark = () => root.dataset.theme === "dark";
function labelTheme() {
  themeBtn.textContent = isDark() ? "☀ Light" : "☾ Dark";
  themeBtn.setAttribute("aria-label", `Switch to ${isDark() ? "light" : "dark"} mode`);
}
themeBtn.addEventListener("click", () => {
  root.dataset.theme = isDark() ? "light" : "dark";
  stored = root.dataset.theme;
  try {
    localStorage.setItem("theme", stored);
  } catch {}
  labelTheme();
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (ev) => {
  if (!stored) {
    root.dataset.theme = ev.matches ? "dark" : "light";
    labelTheme();
  }
});
labelTheme();
route();
