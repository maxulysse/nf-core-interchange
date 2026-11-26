// Interchange map for nf-core/seqinspector. Stations are placed around the hub by js/model.js; text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "seqinspector",
  overview:
    "Which pipelines hand nf-core/seqinspector reads to check, which references and databases its QC reads, and where the checked reads go next. Each line is a handoff between two pipelines.",
});
