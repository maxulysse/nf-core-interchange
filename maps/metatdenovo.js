// Interchange map for nf-core/metatdenovo. Stations (S) are pipelines and resources; edges (E) are handoffs between them.
registerMap({
  id: "metatdenovo",
  title: "Metatdenovo Interchange",
  checked: "2026-11-26",
  overview:
    'Where nf-core/metatdenovo gets its RNA reads, and which pipelines take its assembly and proteins. Handoffs come from the <a href="https://vagkaratzas.github.io/meta-omics-sig/" target="_blank" rel="noopener">meta-omics SIG benchmark</a>, rechecked against the latest releases.',
  S: [
    {
      id: "metatdenovo",
      x: 500,
      y: 330,
      hub: true,
      side: "inside",
      blurb: "De novo assembly and annotation of metatranscriptomes. All samples go into one co-assembly.",
      takes: "Samplesheet: sample, fastq_1, fastq_2; --assembler; --orf_caller",
      gives: "One assembly, ORFs and proteins, counts per sample",
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
      id: "proteinfamilies",
      x: 850,
      y: 200,
      side: "below",
      blurb:
        "Clusters proteins into families and builds a model for each. It can write samplesheets for proteinfold and proteinannotator.",
      takes: "Samplesheet: sample, fasta (amino acids: .fa, .fasta, .faa or .fas, optionally gzipped)",
      gives: "Families, HMMs, alignments, family representatives (_reps.faa)",
    },
    {
      id: "seqsubmit",
      x: 850,
      y: 460,
      side: "below",
      blurb: "Submits reads, assemblies, MAGs and bins to ENA through Webin-CLI.",
      takes:
        "--mode mags, bins, metagenomic_assemblies or reads, each with its own samplesheet; ENA_WEBIN and ENA_WEBIN_PASSWORD secrets",
      gives: "ENA accessions",
    },
  ],
  E: [
    {
      f: "fetchngs",
      t: "metatdenovo",
      line: "reads",
      st: "native",
      via: "--nf_core_pipeline metatdenovo: samplesheet/samplesheet.csv into --input",
      note: "Needs no extra columns.",
    },
    {
      f: "detaxizer",
      t: "metatdenovo",
      line: "reads",
      st: "conversion",
      via: "filtered FASTQ into sample, fastq_1, fastq_2",
      note: '--generate_pipeline_samplesheets has no metatdenovo option. <a href="https://github.com/vagkaratzas/meta-omics-sig/blob/main/scripts/converters/detaxizer_to_reads_samplesheet.py" target="_blank" rel="noopener">detaxizer_to_reads_samplesheet.py</a> builds the sheet. Both mates are filtered with the same read list, so pairs stay in sync.',
    },
    {
      f: "metatdenovo",
      t: "proteinfamilies",
      line: "out",
      st: "conversion",
      via: "--orf_caller prodigal: prodigal/<assembly>.prodigal.faa.gz into sample, fasta",
      note: 'One row, as metatdenovo makes one co-assembly. <a href="https://github.com/vagkaratzas/meta-omics-sig/blob/main/scripts/converters/metatdenovo_to_proteinfamilies.py" target="_blank" rel="noopener">metatdenovo_to_proteinfamilies.py</a> writes it; ran in the SIG benchmark.',
    },
    {
      f: "metatdenovo",
      t: "seqsubmit",
      line: "out",
      st: "conversion",
      via: "--mode metagenomic_assemblies: megahit/megahit_assembly.contigs.fa.gz into id, fasta, run_accession, assembler, assembler_version",
      note: "seqsubmit 1.0.0 registers every assembly as a primary metagenome, so a metatranscriptome gets the wrong ENA type. It takes one run_accession per row, not a co-assembly of several runs.",
    },
  ],
});
