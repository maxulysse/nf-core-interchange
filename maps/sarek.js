// Interchange map for nf-core/sarek: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "sarek",
  overview:
    "Where nf-core/sarek gets its input data and resources, and where its results go next. Each line is a handoff between two pipelines.",
  at: {
    fetchngs: { x: 120, y: 244, side: "left" },
    demultiplex: { x: 120, y: 418, side: "left" },
    bamtofastq: { x: 120, y: 620, side: "left" },
    seqinspector: { x: 300, y: 331, side: "below", tag: "optional" },
    "AWS iGenomes": { x: 120, y: 100, side: "above" },
    references: { x: 380, y: 100, side: "above" },
    createpanelrefs: { x: 620, y: 100, side: "above" },
    "annotation-cache": { x: 900, y: 100, side: "above" },
    variantprioritization: { x: 900, y: 475, side: "below" },
    variantbenchmarking: { x: 900, y: 331, side: "below" },
    tumourevo: { x: 900, y: 620, side: "below" },
    epitopeprediction: { x: 620, y: 620, side: "below" },
    hlatyping: { x: 380, y: 620, side: "below" },
  },
  // fetchngs reaches sarek through seqinspector here; the fetchngs map draws the direct handoff.
  skip: ["fetchngs>sarek"],
  also: ["fetchngs>seqinspector", "demultiplex>seqinspector", "hlatyping>epitopeprediction"],
});
