// Interchange map for nf-core/viralmetagenome: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "viralmetagenome",
  overview: "Where nf-core/viralmetagenome gets its reads, and which pipelines take its viral contigs.",
  at: {
    fetchngs: { x: 150, y: 210, side: "below" },
    seqinspector: { x: 150, y: 470, side: "below" },
    phageannotator: { x: 850, y: 210, side: "below" },
    phyloplace: { x: 850, y: 470, side: "below" },
  },
});
