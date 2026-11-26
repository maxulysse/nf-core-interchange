// Interchange map for nf-core/taxprofiler: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "taxprofiler",
  overview: "Where nf-core/taxprofiler gets its shotgun reads and databases, and where its profiles go.",
  at: {
    fetchngs: { x: 150, y: 210, side: "below" },
    seqinspector: { x: 150, y: 340, side: "below" },
    detaxizer: { x: 150, y: 470, side: "below" },
    createtaxdb: { x: 500, y: 90, side: "above" },
    bamtofastq: { x: 500, y: 600, side: "below" },
    demultiplex: { x: 310, y: 600, side: "below" },
    differentialabundance: { x: 850, y: 340, side: "below" },
  },
});
