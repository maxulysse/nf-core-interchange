// Interchange map for nf-core/detaxizer: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "detaxizer",
  overview: "Where nf-core/detaxizer gets its reads, and which pipelines read the filtered reads back.",
  at: {
    fetchngs: { x: 150, y: 210, side: "below" },
    seqinspector: { x: 150, y: 470, side: "below" },
    ampliseq: { x: 850, y: 120, side: "below" },
    taxprofiler: { x: 850, y: 270, side: "below" },
    mag: { x: 850, y: 420, side: "below" },
    metatdenovo: { x: 850, y: 570, side: "below" },
  },
});
