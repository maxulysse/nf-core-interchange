// Interchange map for nf-core/sarek: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "sarek",
  overview:
    "Where nf-core/sarek gets its input data and resources, and where its results go next. Each line is a handoff between two pipelines.",
  at: {
    sarek: { x: 520, y: 320 },
    fetchngs: { x: 140, y: 224, side: "left" },
    demultiplex: { x: 140, y: 398, side: "left" },
    bamtofastq: { x: 140, y: 600, side: "left" },
    seqinspector: { x: 320, y: 311, side: "below", tag: "optional" },
    igenomes: { x: 140, y: 80, side: "above" },
    references: { x: 400, y: 80, side: "above" },
    createpanelrefs: { x: 640, y: 80, side: "above" },
    "annotation-cache": { x: 770, y: 138, side: "below" },
    downloadvepcache: { x: 920, y: 80, side: "above" },
    downloadsnpeffcache: { x: 920, y: 196, side: "below" },
    variantprioritization: { x: 920, y: 455, side: "below" },
    variantbenchmarking: { x: 920, y: 311, side: "below" },
    tumourevo: { x: 920, y: 600, side: "below" },
    epitopeprediction: { x: 640, y: 600, side: "below" },
    hlatyping: { x: 400, y: 600, side: "below" },
  },
  also: [
    "fetchngs>seqinspector",
    "demultiplex>seqinspector",
    "downloadvepcache>annotation-cache",
    "downloadsnpeffcache>annotation-cache",
    "hlatyping>epitopeprediction",
  ],
});
