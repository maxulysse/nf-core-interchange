// Interchange map for nf-core/fetchngs: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "fetchngs",
  overview:
    "Where nf-core/fetchngs downloads public sequencing data from, and which pipelines start from the samplesheet it writes. With --nf_core_pipeline it adds the columns a pipeline needs. Each line is a handoff between two pipelines.",
  at: {
    "ENA / SRA": { x: 100, y: 340, side: "below" },
    sarek: { x: 154, y: 205, side: "above" },
    seqinspector: { x: 300, y: 106, side: "above" },
    detaxizer: { x: 500, y: 70, side: "above" },
    rnaseq: { x: 700, y: 106, side: "above" },
    viralmetagenome: { x: 846, y: 205, side: "above" },
    rnavar: { x: 900, y: 340, side: "below" },
    atacseq: { x: 860, y: 457, side: "below" },
    ampliseq: { x: 749, y: 551, side: "below" },
    metatdenovo: { x: 589, y: 603, side: "below" },
    taxprofiler: { x: 411, y: 603, side: "below" },
    viralrecon: { x: 251, y: 551, side: "below" },
    mag: { x: 140, y: 457, side: "below" },
  },
});
