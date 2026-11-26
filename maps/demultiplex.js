// Interchange map for nf-core/demultiplex: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "demultiplex",
  overview:
    "Where nf-core/demultiplex gets its sequencing runs, and which pipelines start from the samplesheets it writes for them. Each line is a handoff between two pipelines.",
  at: {
    "sequencing run": { x: 120, y: 340, side: "below" },
    createtaxdb: { x: 373, y: 80, side: "above" },
    seqinspector: { x: 627, y: 80, side: "above" },
    rnaseq: { x: 880, y: 205, side: "below" },
    sarek: { x: 880, y: 340, side: "below" },
    atacseq: { x: 880, y: 475, side: "below" },
    taxprofiler: { x: 627, y: 600, side: "below" },
    methylseq: { x: 373, y: 600, side: "below" },
  },
});
