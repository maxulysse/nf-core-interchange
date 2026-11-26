// Interchange map for nf-core/mag: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "mag",
  title: "Mag Interchange",
  checked: "2026-11-26",
  overview: "Where nf-core/mag gets its shotgun reads, and which pipelines take its contigs, bins and proteins.",
  at: {
    mag: { x: 500, y: 330 },
    fetchngs: { x: 150, y: 200, side: "below" },
    detaxizer: { x: 150, y: 460, side: "below" },
    seqsubmit: { x: 500, y: 70, side: "above" },
    magmap: { x: 850, y: 120, side: "below" },
    funcscan: { x: 850, y: 225, side: "below" },
    phageannotator: { x: 850, y: 330, side: "below" },
    phyloplace: { x: 850, y: 435, side: "below" },
    metapep: { x: 850, y: 540, side: "below" },
    proteinfamilies: { x: 500, y: 610, side: "below" },
  },
});
