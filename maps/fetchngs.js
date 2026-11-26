// Interchange map for nf-core/fetchngs: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "fetchngs",
  overview:
    "Where nf-core/fetchngs downloads public sequencing data from, and which pipelines start from the samplesheet it writes. With --nf_core_pipeline it adds the columns a pipeline needs. Each line is a handoff between two pipelines.",
  at: {
    "ENA / SRA": { x: 170, y: 340, side: "below" },
    sarek: { x: 310, y: 90, side: "above" },
    seqinspector: { x: 540, y: 90, side: "above" },
    rnaseq: { x: 880, y: 160, side: "below" },
    rnavar: { x: 880, y: 340, side: "below" },
    atacseq: { x: 880, y: 440, side: "below" },
    ampliseq: { x: 880, y: 580, side: "below" },
    metatdenovo: { x: 740, y: 630, side: "below" },
    taxprofiler: { x: 560, y: 630, side: "below" },
    viralrecon: { x: 380, y: 630, side: "below" },
    mag: { x: 200, y: 630, side: "below" },
    detaxizer: { x: 740, y: 90, side: "above" },
    viralmetagenome: { x: 880, y: 250, side: "below" },
  },
});
