// Interchange map for nf-core/bamtofastq. Stations are placed around the hub by js/model.js; text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "bamtofastq",
  overview:
    "Which pipelines' alignments nf-core/bamtofastq turns back into reads, and which pipelines can start again from those reads, to realign against another genome build or with another aligner. Each line is a handoff between two pipelines.",
});
