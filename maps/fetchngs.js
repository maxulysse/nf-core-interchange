// Interchange map for nf-core/fetchngs. Stations are placed around the hub by js/model.js; text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "fetchngs",
  overview:
    "Where nf-core/fetchngs downloads public sequencing data from, and which pipelines start from the samplesheet it writes. With --nf_core_pipeline it adds the columns a pipeline needs. Each line is a handoff between two pipelines.",
});
