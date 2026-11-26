// Interchange map for nf-core/references: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "references",
  overview:
    "Where nf-core/references gets its genomes, and which pipelines can read the indices it builds. No released pipeline reads its datasheet yet, so every pipeline handoff passes files by hand. Each line is a handoff between two pipelines.",
  at: {
    references: { x: 500, y: 330 },
    "references-assets": { x: 130, y: 330, side: "below" },
    igenomes: { x: 500, y: 60, side: "above" },
    sarek: { x: 870, y: 130, side: "below" },
    rnaseq: { x: 870, y: 330, side: "below" },
    rnavar: { x: 870, y: 530, side: "below" },
    createpanelrefs: { x: 360, y: 620, side: "below" },
    bamtofastq: { x: 640, y: 620, side: "below" },
    methylseq: { x: 140, y: 560, side: "below" },
  },
});
