// Interchange map for nf-core/viralmetagenome: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "viralmetagenome",
  overview: "Where nf-core/viralmetagenome gets its reads, and which pipelines take its viral contigs.",
  at: {
    viralmetagenome: { x: 500, y: 330 },
    fetchngs: { x: 150, y: 330, side: "below" },
    phageannotator: { x: 850, y: 200, side: "below" },
    phyloplace: { x: 850, y: 460, side: "below" },
  },
});
