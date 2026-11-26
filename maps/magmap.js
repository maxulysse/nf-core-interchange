// Interchange map for nf-core/magmap. Stations (S) are pipelines and resources; edges (E) are handoffs between them.
registerMap({
  id: "magmap",
  title: "Magmap Interchange",
  checked: "2026-11-26",
  overview:
    'Which genomes nf-core/magmap maps reads to, and where its counts go. Handoffs come from the <a href="https://vagkaratzas.github.io/meta-omics-sig/" target="_blank" rel="noopener">meta-omics SIG benchmark</a>, rechecked against the latest releases.',
  S: [
    {
      id: "magmap",
      x: 500,
      y: 330,
      hub: true,
      side: "inside",
      blurb: "Maps reads to a set of genomes or MAGs and counts them per gene and per genome.",
      takes: "Samplesheet: sample, fastq_1, fastq_2; --genomeinfo: accno, genome_fna, genome_gff",
      gives: "Counts per gene and per genome",
    },
    {
      id: "mag",
      x: 150,
      y: 330,
      side: "below",
      blurb: "Assembles metagenomes and bins the contigs into metagenome-assembled genomes (MAGs).",
      takes:
        "Samplesheet: sample, group, short_reads_1, short_reads_2, short_reads_platform (or long_reads, long_reads_platform)",
      gives: "Assemblies, bins, Prodigal and Prokka proteins, taxonomy",
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
      f: "mag",
      t: "magmap",
      line: "reads",
      st: "planned",
      via: "bins into --genomeinfo: accno, genome_fna",
      note: "magmap also needs its own reads samplesheet. Not yet run.",
    },
    {
      f: "magmap",
      t: "differentialabundance",
      line: "out",
      st: "planned",
      via: "counts per gene or genome into --matrix, with --input and --contrasts",
      note: "Not yet run.",
    },
  ],
});
