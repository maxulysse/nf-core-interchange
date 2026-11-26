// Interchange map for nf-core/fetchngs: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "fetchngs",
  overview:
    "Where nf-core/fetchngs downloads public sequencing data from, and which pipelines start from the samplesheet it writes. With --nf_core_pipeline it adds the columns a pipeline needs. Each line is a handoff between two pipelines.",
  at: {
    fetchngs: { x: 440, y: 330 },
    "ENA / SRA": { x: 110, y: 330, side: "below" },
    sarek: { x: 250, y: 80, side: "above" },
    seqinspector: { x: 620, y: 80, side: "above" },
    rnaseq: { x: 880, y: 150, side: "below" },
    rnavar: { x: 880, y: 330, side: "below" },
    atacseq: { x: 880, y: 430, side: "below" },
    ampliseq: { x: 880, y: 570, side: "below" },
    metatdenovo: { x: 680, y: 620, side: "below" },
    taxprofiler: { x: 500, y: 620, side: "below" },
    viralrecon: { x: 320, y: 620, side: "below" },
    mag: { x: 140, y: 620, side: "below" },
    detaxizer: { x: 760, y: 80, side: "above" },
    viralmetagenome: { x: 880, y: 240, side: "below" },
  },
});
