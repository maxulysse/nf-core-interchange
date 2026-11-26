// Interchange map for nf-core/rnavar: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "rnavar",
  overview:
    "Where nf-core/rnavar gets its RNA-seq reads or alignments, its reference and annotation caches, and where its variant calls can go next. Each line is a handoff between two pipelines.",
  at: {
    fetchngs: { x: 120, y: 205, side: "below" },
    rnaseq: { x: 120, y: 475, side: "below" },
    "AWS iGenomes": { x: 300, y: 80, side: "above" },
    references: { x: 500, y: 80, side: "above" },
    "annotation-cache": { x: 700, y: 80, side: "above" },
    variantprioritization: { x: 880, y: 340, side: "below" },
  },
});
