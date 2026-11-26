// Interchange map for nf-core/ampliseq: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "ampliseq",
  overview: "Where nf-core/ampliseq gets its amplicon reads, and where its abundance tables go.",
  at: {
    fetchngs: { x: 150, y: 210, side: "below" },
    detaxizer: { x: 150, y: 470, side: "below" },
    differentialabundance: { x: 850, y: 340, side: "below" },
  },
});
