// Interchange map for nf-core/sarek. Stations are placed around the hub by js/model.js; text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "sarek",
  overview:
    "Where nf-core/sarek gets its input data and resources, and where its results go next. Each line is a handoff between two pipelines.",
  // seqinspector is an optional stop between the read sources and sarek, so this side is placed by hand.
  at: {
    fetchngs: { x: 120, y: 244, side: "left" },
    demultiplex: { x: 120, y: 418, side: "left" },
    seqinspector: { x: 300, y: 331, side: "below", tag: "optional" },
    bamtofastq: { x: 120, y: 620, side: "left" },
  },
  // fetchngs and demultiplex reach sarek through seqinspector here; their own maps draw the direct handoffs.
  skip: ["fetchngs>sarek", "demultiplex>sarek"],
  also: ["fetchngs>seqinspector", "demultiplex>seqinspector", "hlatyping>epitopeprediction"],
});
