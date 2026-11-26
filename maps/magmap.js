// Interchange map for nf-core/magmap: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "magmap",
  overview: "Which genomes nf-core/magmap maps reads to, and where its counts go.",
  at: {
    mag: { x: 150, y: 340, side: "below" },
    differentialabundance: { x: 850, y: 340, side: "below" },
  },
});
