// Interchange map for nf-core/mag: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "mag",
  overview: "Where nf-core/mag gets its shotgun reads, and which pipelines take its contigs, bins and proteins.",
  at: {
    fetchngs: { x: 120, y: 205, side: "below" },
    seqinspector: { x: 120, y: 340, side: "below" },
    detaxizer: { x: 120, y: 475, side: "below" },
    seqsubmit: { x: 373, y: 80, side: "above" },
    magmap: { x: 627, y: 80, side: "above" },
    funcscan: { x: 880, y: 205, side: "below" },
    phageannotator: { x: 880, y: 340, side: "below" },
    phyloplace: { x: 880, y: 475, side: "below" },
    metapep: { x: 627, y: 600, side: "below" },
    proteinfamilies: { x: 373, y: 600, side: "below" },
  },
});
