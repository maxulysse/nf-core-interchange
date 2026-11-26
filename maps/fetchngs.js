// Interchange map for nf-core/fetchngs: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "fetchngs",
  overview:
    "Where nf-core/fetchngs downloads public sequencing data from, and which pipelines start from the samplesheet it writes. With --nf_core_pipeline it adds the columns a pipeline needs. Each line is a handoff between two pipelines.",
  at: {
    "ENA / SRA": { x: 120, y: 340, side: "below" },
    sarek: { x: 120, y: 205, side: "below" },
    seqinspector: { x: 300, y: 80, side: "above" },
    detaxizer: { x: 500, y: 80, side: "above" },
    rnaseq: { x: 700, y: 80, side: "above" },
    viralmetagenome: { x: 880, y: 205, side: "below" },
    rnavar: { x: 880, y: 340, side: "below" },
    atacseq: { x: 880, y: 475, side: "below" },
    ampliseq: { x: 740, y: 600, side: "below" },
    metatdenovo: { x: 580, y: 600, side: "below" },
    taxprofiler: { x: 420, y: 600, side: "below" },
    viralrecon: { x: 260, y: 600, side: "below" },
    mag: { x: 120, y: 475, side: "below" },
  },
});
