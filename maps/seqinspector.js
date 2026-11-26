// Interchange map for nf-core/seqinspector: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "seqinspector",
  overview:
    "Which pipelines hand nf-core/seqinspector reads to check, which references and databases its QC reads, and where the checked reads go next. Each line is a handoff between two pipelines.",
  at: {
    fetchngs: { x: 120, y: 205, side: "below" },
    demultiplex: { x: 120, y: 340, side: "below" },
    bamtofastq: { x: 120, y: 475, side: "below" },
    "AWS iGenomes": { x: 373, y: 80, side: "above" },
    references: { x: 627, y: 80, side: "above" },
    sarek: { x: 880, y: 340, side: "below" },
    createtaxdb: { x: 500, y: 600, side: "below" },
  },
});
