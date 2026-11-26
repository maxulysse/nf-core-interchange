// Interchange map for nf-core/createpanelrefs: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "createpanelrefs",
  overview:
    "Where nf-core/createpanelrefs gets its cohort of normal alignments and its reference genome, and which pipelines read the panels and models it builds. Each line is a handoff between two pipelines.",
  at: {
    "AWS iGenomes": { x: 300, y: 90, side: "above" },
    references: { x: 700, y: 90, side: "above" },
    longraredisease: { x: 130, y: 340, side: "below" },
    sarek: { x: 870, y: 210, side: "below" },
    rnadnavar: { x: 870, y: 480, side: "below" },
    raredisease: { x: 500, y: 620, side: "below" },
  },
});
