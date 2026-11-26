// Interchange map for nf-core/createtaxdb. Stations (S) are pipelines and resources; edges (E) are handoffs between them.
registerMap({
  id: "createtaxdb",
  title: "Createtaxdb Interchange",
  checked: "2026-11-26",
  overview:
    'Where nf-core/createtaxdb gets its reference sequences, and which pipeline reads its databases. Handoffs come from the <a href="https://vagkaratzas.github.io/meta-omics-sig/" target="_blank" rel="noopener">meta-omics SIG benchmark</a>, rechecked against the latest releases.',
  S: [
    {
      id: "createtaxdb",
      x: 500,
      y: 330,
      hub: true,
      side: "inside",
      blurb: "Builds databases for several taxonomic classifiers at once from one set of reference sequences.",
      takes: "Samplesheet: id, taxid, fasta_dna and/or fasta_aa; --dbname; one --build_TOOL flag per database",
      gives: "One database per classifier",
    },
    {
      id: "reference sequences",
      x: 150,
      y: 330,
      ext: true,
      url: "https://www.ncbi.nlm.nih.gov/datasets/",
      side: "below",
      blurb: "Reference genomes or proteins with their NCBI taxonomy ids, for example from NCBI Datasets.",
      takes: "",
      gives: "FASTA, taxid",
    },
    {
      id: "taxprofiler",
      x: 850,
      y: 330,
      side: "below",
      blurb:
        "Taxonomic classification and profiling of shotgun short- and long-read metagenomic data, with several classifiers in one run.",
      takes:
        "Samplesheet: sample, run_accession, instrument_platform, fastq_1, fastq_2, fasta; --databases: tool, db_name, db_params, db_path",
      gives: "Taxonomic profiles, merged tables",
    },
  ],
  E: [
    {
      f: "reference sequences",
      t: "createtaxdb",
      line: "reads",
      st: "native",
      via: "FASTA and taxid into id, taxid, fasta_dna or fasta_aa",
      note: "createtaxdb is fed from references, not from the reads.",
    },
    {
      f: "createtaxdb",
      t: "taxprofiler",
      line: "res",
      st: "planned",
      via: "each database into a --databases row: tool, db_name, db_params, db_path",
      note: "createtaxdb writes no --databases sheet, so list the databases by hand. Not yet run.",
    },
  ],
});
