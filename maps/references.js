// Interchange map for nf-core/references: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "references",
  overview:
    "Where nf-core/references gets its genomes, and which pipelines can read the indices it builds. No released pipeline reads its datasheet yet, so every pipeline handoff passes files by hand. Each line is a handoff between two pipelines.",
  at: {
    "references-assets": { x: 120, y: 340, side: "below" },
    "AWS iGenomes": { x: 300, y: 80, side: "above" },
    sarek: { x: 700, y: 80, side: "above" },
    rnaseq: { x: 880, y: 205, side: "below" },
    rnavar: { x: 880, y: 340, side: "below" },
    methylseq: { x: 880, y: 475, side: "below" },
    bamtofastq: { x: 700, y: 600, side: "below" },
    createpanelrefs: { x: 300, y: 600, side: "below" },
  },
});
