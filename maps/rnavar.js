// Interchange map for nf-core/rnavar: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "rnavar",
  overview:
    "Where nf-core/rnavar gets its RNA-seq reads or alignments, its reference and annotation caches, and where its variant calls can go next. Each line is a handoff between two pipelines.",
  at: {
    rnavar: { x: 500, y: 330 },
    fetchngs: { x: 130, y: 200, side: "below" },
    rnaseq: { x: 130, y: 470, side: "below" },
    igenomes: { x: 300, y: 80, side: "above" },
    "annotation-cache": { x: 500, y: 60, side: "above" },
    references: { x: 700, y: 80, side: "above" },
    variantprioritization: { x: 870, y: 330, side: "below" },
  },
});
