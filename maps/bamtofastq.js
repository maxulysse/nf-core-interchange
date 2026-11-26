// Interchange map for nf-core/bamtofastq: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "bamtofastq",
  overview:
    "Which pipelines' alignments nf-core/bamtofastq turns back into reads, and which pipelines can start again from those reads, to realign against another genome build or with another aligner. Each line is a handoff between two pipelines.",
  at: {
    "AWS iGenomes": { x: 300, y: 90, side: "above" },
    references: { x: 700, y: 90, side: "above" },
    sarek: { x: 130, y: 200, side: "below" },
    raredisease: { x: 130, y: 490, side: "below" },
    rnaseq: { x: 870, y: 200, side: "below" },
    taxprofiler: { x: 870, y: 490, side: "below" },
  },
});
