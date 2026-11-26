// Interchange map for nf-core/mag: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "mag",
  overview: "Where nf-core/mag gets its shotgun reads, and which pipelines take its contigs, bins and proteins.",
  at: {
    fetchngs: { x: 150, y: 210, side: "below" },
    detaxizer: { x: 150, y: 470, side: "below" },
    seqsubmit: { x: 500, y: 80, side: "above" },
    magmap: { x: 850, y: 130, side: "below" },
    funcscan: { x: 850, y: 235, side: "below" },
    phageannotator: { x: 850, y: 340, side: "below" },
    phyloplace: { x: 850, y: 445, side: "below" },
    metapep: { x: 850, y: 550, side: "below" },
    proteinfamilies: { x: 500, y: 620, side: "below" },
  },
});
