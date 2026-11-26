// Interchange map for nf-core/createpanelrefs: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "createpanelrefs",
  overview:
    "Where nf-core/createpanelrefs gets its cohort of normal alignments and its reference genome, and which pipelines read the panels and models it builds. Each line is a handoff between two pipelines.",
  at: {
    createpanelrefs: { x: 500, y: 330 },
    "AWS iGenomes": { x: 300, y: 80, side: "above" },
    references: { x: 700, y: 80, side: "above" },
    longraredisease: { x: 130, y: 330, side: "below" },
    sarek: { x: 870, y: 200, side: "below" },
    rnadnavar: { x: 870, y: 470, side: "below" },
    raredisease: { x: 500, y: 610, side: "below" },
  },
});
