// Interchange map for nf-core/metatdenovo: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "metatdenovo",
  title: "Metatdenovo Interchange",
  checked: "2026-11-26",
  overview: "Where nf-core/metatdenovo gets its RNA reads, and which pipelines take its assembly and proteins.",
  at: {
    metatdenovo: { x: 500, y: 330 },
    fetchngs: { x: 150, y: 200, side: "below" },
    detaxizer: { x: 150, y: 460, side: "below" },
    proteinfamilies: { x: 850, y: 200, side: "below" },
    seqsubmit: { x: 850, y: 460, side: "below" },
  },
});
