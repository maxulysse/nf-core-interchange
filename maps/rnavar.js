// Interchange map for nf-core/rnavar: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "rnavar",
  overview:
    "Where nf-core/rnavar gets its RNA-seq reads or alignments, its reference and annotation caches, and where its variant calls can go next. Each line is a handoff between two pipelines.",
  at: {
    fetchngs: { x: 130, y: 210, side: "below" },
    rnaseq: { x: 130, y: 480, side: "below" },
    "AWS iGenomes": { x: 300, y: 90, side: "above" },
    references: { x: 500, y: 70, side: "above" },
    "annotation-cache": { x: 760, y: 90, side: "above" },
    variantprioritization: { x: 870, y: 340, side: "below" },
  },
});
