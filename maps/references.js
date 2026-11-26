// Interchange map for nf-core/references: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "references",
  overview:
    "Where nf-core/references gets its genomes, and which pipelines can read the indices it builds. No released pipeline reads its datasheet yet, so every pipeline handoff passes files by hand. Each line is a handoff between two pipelines.",
  at: {
    "references-assets": { x: 130, y: 340, side: "below" },
    "AWS iGenomes": { x: 500, y: 70, side: "above" },
    sarek: { x: 870, y: 140, side: "below" },
    rnaseq: { x: 870, y: 340, side: "below" },
    rnavar: { x: 870, y: 540, side: "below" },
    createpanelrefs: { x: 360, y: 630, side: "below" },
    bamtofastq: { x: 640, y: 630, side: "below" },
    methylseq: { x: 140, y: 570, side: "below" },
  },
});
