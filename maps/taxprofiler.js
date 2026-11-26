// Interchange map for nf-core/taxprofiler: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "taxprofiler",
  title: "Taxprofiler Interchange",
  checked: "2026-11-26",
  overview: "Where nf-core/taxprofiler gets its shotgun reads and databases, and where its profiles go.",
  at: {
    taxprofiler: { x: 500, y: 330 },
    fetchngs: { x: 150, y: 200, side: "below" },
    detaxizer: { x: 150, y: 460, side: "below" },
    createtaxdb: { x: 500, y: 80, side: "above" },
    bamtofastq: { x: 500, y: 590, side: "below" },
    differentialabundance: { x: 850, y: 330, side: "below" },
  },
});
