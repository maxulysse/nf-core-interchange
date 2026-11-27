// One interchange map per hub pipeline: its overview, and the handoffs it draws besides its hub's (also).
// js/model.js places the stations around the hub; their text is in stations.js, the handoffs in handoffs.js.
const MAPS = {
  sarek: {
    overview:
      "Where nf-core/sarek gets its input data and resources, and where its results go next. Each line is a handoff between two pipelines.",
    also: ["hlatyping>epitopeprediction"],
  },
  createpanelrefs: {
    overview:
      "Where nf-core/createpanelrefs gets its cohort of normal alignments and its reference genome, and which pipelines read the panels and models it builds. Each line is a handoff between two pipelines.",
  },
  oncoanalyser: {
    overview:
      "Where nf-core/oncoanalyser gets its alignments, reads and Hartwig reference data, and where its calls go next. Each line is a handoff between two pipelines.",
  },
  bamtofastq: {
    overview:
      "Which pipelines' alignments nf-core/bamtofastq turns back into reads, and which pipelines can start again from those reads, to realign against another genome build or with another aligner. Each line is a handoff between two pipelines.",
  },
  fetchngs: {
    overview:
      "Where nf-core/fetchngs downloads public sequencing data from, and which pipelines start from the samplesheet it writes. With --nf_core_pipeline it adds the columns a pipeline needs. Each line is a handoff between two pipelines.",
  },
  references: {
    overview:
      "Where nf-core/references gets its genomes, and which pipelines can read the indices it builds. No released pipeline reads its datasheet yet, so every pipeline handoff passes files by hand. Each line is a handoff between two pipelines.",
  },
  rnavar: {
    overview:
      "Where nf-core/rnavar gets its RNA-seq reads or alignments, its reference and annotation caches, and where its variant calls can go next. Each line is a handoff between two pipelines.",
  },
  detaxizer: {
    overview: "Where nf-core/detaxizer gets its reads, and which pipelines read the filtered reads back.",
  },
  createtaxdb: {
    overview: "Where nf-core/createtaxdb gets its reference sequences, and which pipeline reads its databases.",
  },
  ampliseq: {
    overview: "Where nf-core/ampliseq gets its amplicon reads, and where its abundance tables go.",
  },
  taxprofiler: {
    overview: "Where nf-core/taxprofiler gets its shotgun reads and databases, and where its profiles go.",
  },
  mag: {
    overview: "Where nf-core/mag gets its shotgun reads, and which pipelines take its contigs, bins and proteins.",
  },
  magmap: {
    overview: "Which genomes nf-core/magmap maps reads to, and where its counts go.",
  },
  metatdenovo: {
    overview: "Where nf-core/metatdenovo gets its RNA reads, and which pipelines take its assembly and proteins.",
  },
  viralmetagenome: {
    overview: "Where nf-core/viralmetagenome gets its reads, and which pipelines take its viral contigs.",
  },
  seqinspector: {
    overview:
      "Which pipelines hand nf-core/seqinspector reads to check, which references and databases its QC reads, and where the checked reads go next. Each line is a handoff between two pipelines.",
  },
  demultiplex: {
    overview:
      "Where nf-core/demultiplex gets its sequencing runs, and which pipelines start from the samplesheets it writes for them. Each line is a handoff between two pipelines.",
  },
  proteinfamilies: {
    overview: "Which pipelines give nf-core/proteinfamilies its proteins, and which read the samplesheets it writes.",
  },
};
for (const [id, m] of Object.entries(MAPS)) m.id = id;
const mapTitle = (id) => `${id[0].toUpperCase()}${id.slice(1)} Interchange`;
