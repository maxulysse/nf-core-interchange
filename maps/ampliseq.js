// Interchange map for nf-core/ampliseq. Stations (S) are pipelines and resources; edges (E) are handoffs between them.
registerMap({
  id: "ampliseq",
  title: "Ampliseq Interchange",
  checked: "2026-11-26",
  overview:
    'Where nf-core/ampliseq gets its amplicon reads, and where its abundance tables go. Handoffs come from the <a href="https://vagkaratzas.github.io/meta-omics-sig/" target="_blank" rel="noopener">meta-omics SIG benchmark</a>, rechecked against the latest releases.',
  S: [
    {
      id: "ampliseq",
      x: 500,
      y: 330,
      hub: true,
      side: "inside",
      blurb: "Amplicon sequencing analysis (16S, ITS, COI and more) with DADA2 and QIIME2.",
      takes: "Samplesheet: sample, fastq_1, fastq_2, run; --primer_fwd, --primer_rev; --metadata",
      gives: "ASVs, taxonomy, abundance tables, diversity",
    },
    {
      id: "fetchngs",
      x: 150,
      y: 200,
      side: "below",
      blurb: "Downloads FASTQ for SRA, ENA, DDBJ or GEO ids and writes a samplesheet for the next pipeline.",
      takes: "ids.csv: one accession per line",
      gives: "FASTQ, samplesheet/samplesheet.csv (--nf_core_pipeline picks the columns)",
    },
    {
      id: "detaxizer",
      x: 150,
      y: 460,
      side: "below",
      blurb:
        "Finds host or contaminant reads (human by default) with kraken2 or bbduk and filters them out. With --generate_downstream_samplesheets it writes sheets for taxprofiler and mag.",
      takes: "Samplesheet: sample, short_reads_fastq_1, short_reads_fastq_2, long_reads_fastq_1 (gzipped FASTQ)",
      gives: "Filtered FASTQ, downstream_samplesheets/taxprofiler.csv and mag-pe.csv",
    },
    {
      id: "differentialabundance",
      x: 850,
      y: 330,
      side: "below",
      blurb: "Differential abundance analysis between conditions, with a report.",
      takes: "--input: sample and condition columns; --matrix; --contrasts",
      gives: "Differential tables, report",
    },
  ],
  E: [
    {
      f: "fetchngs",
      t: "ampliseq",
      line: "reads",
      st: "native",
      via: "--nf_core_pipeline ampliseq: samplesheet/samplesheet.csv into --input",
      note: "Adds an empty run column; fill it when the samples come from several sequencing runs.",
    },
    {
      f: "detaxizer",
      t: "ampliseq",
      line: "reads",
      st: "conversion",
      via: "filtered FASTQ into sample, fastq_1, fastq_2",
      note: "--generate_pipeline_samplesheets only takes taxprofiler and mag, so build this sheet by hand.",
    },
    {
      f: "ampliseq",
      t: "differentialabundance",
      line: "out",
      st: "planned",
      via: "abundance table into --matrix, with --input and --contrasts",
      note: "ampliseq writes QIIME2 and BIOM tables; differentialabundance wants a plain feature-by-sample matrix. Not yet run.",
    },
  ],
});
