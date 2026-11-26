// Interchange map for nf-core/magmap: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "magmap",
  title: "Magmap Interchange",
  checked: "2026-11-26",
  overview: "Which genomes nf-core/magmap maps reads to, and where its counts go.",
  at: {
    magmap: { x: 500, y: 330 },
    mag: { x: 150, y: 330, side: "below" },
    differentialabundance: { x: 850, y: 330, side: "below" },
  },
});
