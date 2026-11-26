// Interchange map for nf-core/detaxizer: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "detaxizer",
  title: "Detaxizer Interchange",
  checked: "2026-11-26",
  overview: "Where nf-core/detaxizer gets its reads, and which pipelines read the filtered reads back.",
  at: {
    detaxizer: { x: 500, y: 330 },
    fetchngs: { x: 150, y: 330, side: "below" },
    ampliseq: { x: 850, y: 110, side: "below" },
    taxprofiler: { x: 850, y: 260, side: "below" },
    mag: { x: 850, y: 410, side: "below" },
    metatdenovo: { x: 850, y: 560, side: "below" },
  },
});
