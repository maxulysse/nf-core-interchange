// Interchange map for nf-core/createtaxdb: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "createtaxdb",
  title: "Createtaxdb Interchange",
  checked: "2026-11-26",
  overview: "Where nf-core/createtaxdb gets its reference sequences, and which pipeline reads its databases.",
  at: {
    createtaxdb: { x: 500, y: 330 },
    "reference sequences": { x: 150, y: 330, side: "below" },
    taxprofiler: { x: 850, y: 330, side: "below" },
  },
});
