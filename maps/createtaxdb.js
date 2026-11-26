// Interchange map for nf-core/createtaxdb: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "createtaxdb",
  overview: "Where nf-core/createtaxdb gets its reference sequences, and which pipeline reads its databases.",
  at: {
    "reference sequences": { x: 150, y: 340, side: "below" },
    taxprofiler: { x: 850, y: 340, side: "below" },
  },
});
