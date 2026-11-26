// Interchange map for nf-core/bamtofastq: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "bamtofastq",
  overview:
    "Which pipelines' alignments nf-core/bamtofastq turns back into reads, and which pipelines can start again from those reads, to realign against another genome build or with another aligner. Each line is a handoff between two pipelines.",
  at: {
    bamtofastq: { x: 500, y: 330 },
    igenomes: { x: 300, y: 80, side: "above" },
    references: { x: 700, y: 80, side: "above" },
    sarek: { x: 130, y: 190, side: "below" },
    raredisease: { x: 130, y: 480, side: "below" },
    rnaseq: { x: 870, y: 190, side: "below" },
    taxprofiler: { x: 870, y: 480, side: "below" },
  },
});
