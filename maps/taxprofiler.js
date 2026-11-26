// Interchange map for nf-core/taxprofiler. Stations (S) are pipelines and resources; edges (E) are handoffs between them.
registerMap({
  id: "taxprofiler",
  title: "Taxprofiler Interchange",
  checked: "2026-11-26",
  overview:
    'Where nf-core/taxprofiler gets its shotgun reads and databases, and where its profiles go. Handoffs come from the <a href="https://vagkaratzas.github.io/meta-omics-sig/" target="_blank" rel="noopener">meta-omics SIG benchmark</a>, rechecked against the latest releases.',
  S: [
    {
      id: "taxprofiler",
      x: 500,
      y: 330,
      hub: true,
      side: "inside",
      blurb:
        "Taxonomic classification and profiling of shotgun short- and long-read metagenomic data, with several classifiers in one run.",
      takes:
        "Samplesheet: sample, run_accession, instrument_platform, fastq_1, fastq_2, fasta; --databases: tool, db_name, db_params, db_path",
      gives: "Taxonomic profiles, merged tables",
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
      id: "createtaxdb",
      x: 500,
      y: 80,
      side: "above",
      blurb: "Builds databases for several taxonomic classifiers at once from one set of reference sequences.",
      takes: "Samplesheet: id, taxid, fasta_dna and/or fasta_aa; --dbname; one --build_TOOL flag per database",
      gives: "One database per classifier",
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
      t: "taxprofiler",
      line: "reads",
      st: "native",
      via: "--nf_core_pipeline taxprofiler: samplesheet/samplesheet.csv into --input",
      note: "Carries run_accession and instrument_platform from ENA, and adds an empty fasta column.",
    },
    {
      f: "detaxizer",
      t: "taxprofiler",
      line: "reads",
      st: "native",
      via: "--generate_downstream_samplesheets: downstream_samplesheets/taxprofiler.csv into --input",
      note: "taxprofiler 2.0.1 read it unchanged in the SIG benchmark. taxprofiler still needs a --databases sheet, which detaxizer does not write.",
    },
    {
      f: "createtaxdb",
      t: "taxprofiler",
      line: "res",
      st: "planned",
      via: "each database into a --databases row: tool, db_name, db_params, db_path",
      note: "createtaxdb writes no --databases sheet, so list the databases by hand. Not yet run.",
    },
    {
      f: "taxprofiler",
      t: "differentialabundance",
      line: "out",
      st: "planned",
      via: "taxpasta merged profiles into --matrix, with --input and --contrasts",
      note: "The observations sheet and contrasts file come from you. Not yet run.",
    },
  ],
});
