// Interchange map for nf-core/metatdenovo: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "metatdenovo",
  overview: "Where nf-core/metatdenovo gets its RNA reads, and which pipelines take its assembly and proteins.",
  at: {
    fetchngs: { x: 150, y: 210, side: "below" },
    seqinspector: { x: 150, y: 340, side: "below" },
    detaxizer: { x: 150, y: 470, side: "below" },
    proteinfamilies: { x: 850, y: 210, side: "below" },
    seqsubmit: { x: 850, y: 470, side: "below" },
  },
});
