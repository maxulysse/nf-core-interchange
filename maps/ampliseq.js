// Interchange map for nf-core/ampliseq: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "ampliseq",
  title: "Ampliseq Interchange",
  checked: "2026-11-26",
  overview: "Where nf-core/ampliseq gets its amplicon reads, and where its abundance tables go.",
  at: {
    ampliseq: { x: 500, y: 330 },
    fetchngs: { x: 150, y: 200, side: "below" },
    detaxizer: { x: 150, y: 460, side: "below" },
    differentialabundance: { x: 850, y: 330, side: "below" },
  },
});
