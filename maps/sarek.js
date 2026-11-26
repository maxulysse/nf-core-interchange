// Interchange map for nf-core/sarek. Stations are placed around the hub by js/model.js; text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "sarek",
  overview:
    "Where nf-core/sarek gets its input data and resources, and where its results go next. Each line is a handoff between two pipelines.",
  also: ["hlatyping>epitopeprediction"],
});
