// Every station drawn on a map: what it is, what it takes and what it gives. Releases come from catalogue.js;
// url is only for resources; a pipeline station links to nf-co.re/<id>. intercepts lists read sources whose
// handoffs to a hub run through this station instead, when it hands that hub the same reads.
const STATIONS = {
  "ENA / SRA": {
    ext: true,
    url: "https://www.ebi.ac.uk/ena/browser/",
    blurb: "Public sequence archives: ENA, NCBI SRA and DDBJ, with GEO series resolved to their runs.",
    takes: "",
    gives: "FASTQ and run metadata",
  },
  ampliseq: {
    blurb: "Amplicon sequencing analysis (16S, ITS, COI and more) with DADA2 and QIIME2.",
    takes: "Samplesheet: sample, fastq_1, fastq_2, run; --primer_fwd, --primer_rev; --metadata",
    gives: "ASVs, taxonomy, abundance tables, diversity",
  },
  "annotation-cache": {
    ext: true,
    url: "https://annotation-cache.github.io/",
    blurb: "Public S3 bucket of Ensembl VEP and snpEff caches, read by sarek and rnavar.",
    takes: "",
    gives: "VEP cache, snpEff cache",
  },
  atacseq: {
    blurb: "ATAC-seq peak calling and QC.",
    takes: "Samplesheet: sample, fastq_1, fastq_2, replicate",
    gives: "Peaks, consensus peaks, counts",
  },
  bamtofastq: {
    blurb:
      "Converts aligned BAM or CRAM back to FASTQ, with QC before and after. Mapped and unmapped reads are both kept, and --chr limits it to some chromosomes or regions.",
    takes: "Samplesheet: sample_id, mapped, index, file_type (bam or cram); FASTA and fai for CRAM",
    gives: "reads/<sample>_{1,2}.merged.fastq.gz, FastQC and samtools stats",
  },
  createpanelrefs: {
    blurb:
      "Builds panels of normals and cohort models from many normal samples, one tool per --tools entry: mutect2 (somatic PON), cnvkit (copy-number reference), germlinecnvcaller (GATK gCNV ploidy and CNV models) and gens (read-count PON, short or long reads).",
    takes:
      "Samplesheet: sample, bam, bai or cram, crai (indexes optional, built when missing); FASTA, fai, dict; per-tool intervals and targets",
    gives: "Mutect2 PON VCF, CNVkit reference .cnn, gCNV ploidy and CNV models, Gens PON .hdf5",
  },
  createtaxdb: {
    blurb: "Builds databases for several taxonomic classifiers at once from one set of reference sequences.",
    takes: "Samplesheet: id, taxid, fasta_dna and/or fasta_aa; --dbname; one --build_TOOL flag per database",
    gives: "One database per classifier",
  },
  demultiplex: {
    blurb: "Demultiplexes raw sequencer output into per-sample FASTQ.",
    takes: "Samplesheet: id, samplesheet (the run's SampleSheet.csv), lane, flowcell (the BCL run folder)",
    gives: "FASTQ, samplesheets for atacseq, methylseq, rnaseq, sarek, seqinspector, taxprofiler",
  },
  detaxizer: {
    blurb:
      "Finds host or contaminant reads (human by default) with kraken2 or bbduk and filters them out. With --generate_downstream_samplesheets it writes sheets for taxprofiler and mag.",
    takes: "Samplesheet: sample, short_reads_fastq_1, short_reads_fastq_2, long_reads_fastq_1 (gzipped FASTQ)",
    gives: "Filtered FASTQ, downstream_samplesheets/taxprofiler.csv and mag-pe.csv",
  },
  differentialabundance: {
    blurb: "Differential abundance analysis between conditions, with a report.",
    takes: "--input: sample and condition columns; --matrix; --contrasts",
    gives: "Differential tables, report",
  },
  epitopeprediction: {
    blurb: "Predicts which mutated peptides bind the patient's HLA alleles, for MHC class I or II.",
    takes: "Samplesheet: sample, alleles, mhc_class, filename (raw somatic VCF), germline_vcf, tumor_sample",
    gives: "Ranked neoepitope predictions",
  },
  fetchngs: {
    blurb:
      "Downloads FASTQ files and metadata for public SRA, ENA, DDBJ and GEO ids, and writes a samplesheet. --nf_core_pipeline shapes it for one of 8 pipelines.",
    takes: "A file of SRA, ENA, DDBJ or GEO ids, one per line",
    gives:
      "FASTQ, samplesheet/samplesheet.csv (sample, fastq_1, fastq_2, pipeline columns, ENA metadata), id_mappings.csv",
  },
  funcscan: {
    blurb: "Screens contigs for antimicrobial peptides, resistance genes and biosynthetic gene clusters.",
    takes: "Samplesheet: sample, fasta (protein, gbk, gff optional)",
    gives: "AMP, ARG and BGC calls, summary tables",
  },
  hlatyping: {
    blurb:
      "Types HLA alleles from DNA or RNA reads with OptiType (class I), and with HLA-HD (class II) when installed.",
    takes: "Samplesheet: sample, fastq_1, fastq_2 or bam, seq_type",
    gives: "HLA genotype: OptiType TSV, HLA-HD result",
  },
  "AWS iGenomes": {
    ext: true,
    url: "https://ewels.github.io/AWS-iGenomes/",
    blurb:
      "AWS iGenomes bucket with prebuilt GATK reference bundles such as GATK.GRCh38. sarek, bamtofastq, seqinspector, createpanelrefs, variantprioritization, variantbenchmarking, tumourevo and hlatyping read it through --genome and --igenomes_base.",
    takes: "",
    gives: "FASTA, indices, dbSNP, known indels, germline resource",
  },
  longraredisease: {
    blurb:
      "Long-read pipeline that identifies variants in patients with neurodevelopmental disorders, from ONT or PacBio data.",
    takes:
      "Samplesheet: sample, file_path (a file or folder of reads), sex, phenotype, family_id, maternal_id, paternal_id, hpo_terms",
    gives: "Aligned BAM, small variants, SVs, CNVs, methylation",
  },
  mag: {
    blurb: "Assembles metagenomes and bins the contigs into metagenome-assembled genomes (MAGs).",
    takes:
      "Samplesheet: sample, group, short_reads_1, short_reads_2, short_reads_platform (or long_reads, long_reads_platform)",
    gives: "Assemblies, bins, Prodigal and Prokka proteins, taxonomy",
  },
  magmap: {
    blurb: "Maps reads to a set of genomes or MAGs and counts them per gene and per genome.",
    takes: "Samplesheet: sample, fastq_1, fastq_2; --genomeinfo: accno, genome_fna, genome_gff",
    gives: "Counts per gene and per genome",
  },
  metapep: {
    blurb: "Predicts proteins and peptides from microbiome assemblies, bins or taxa, and their binding to HLA alleles.",
    takes: "Samplesheet: condition, type, microbiome_path, alleles (weights_path optional)",
    gives: "Peptides, binding predictions",
  },
  metatdenovo: {
    blurb: "De novo assembly and annotation of metatranscriptomes. All samples go into one co-assembly.",
    takes: "Samplesheet: sample, fastq_1, fastq_2; --assembler; --orf_caller",
    gives: "One assembly, ORFs and proteins, counts per sample",
  },
  methylseq: {
    blurb: "Bisulfite and TAPS methylation analysis with Bismark, bwa-meth and MethylDackel, or BWA-MEM and rastair.",
    takes:
      "Samplesheet: sample, fastq_1, fastq_2, genome; --fasta, --fasta_index, --bismark_index, --bwameth_index, --bwamem_index",
    gives: "Aligned BAMs, methylation calls, QC",
  },
  phageannotator: {
    blurb: "Identifies and annotates phage sequences in assembled contigs. No release yet.",
    takes: "Samplesheet: sample, group, fastq_1, fasta (gzipped)",
    gives: "Phage annotations",
  },
  phyloplace: {
    blurb: "Places query sequences on a reference phylogeny.",
    takes: "--phyloplace_input: sample, queryseqfile, refseqfile, refphylogeny, model",
    gives: "Placements, classifications",
  },
  proteinannotator: {
    blurb: "Protein statistics and functional annotation, with InterProScan and other tools.",
    takes: "Samplesheet: id, fasta",
    gives: "Annotations per protein",
  },
  proteinfamilies: {
    blurb:
      "Clusters proteins into families and builds a model for each. It can write samplesheets for proteinfold and proteinannotator.",
    takes: "Samplesheet: sample, fasta (amino acids: .fa, .fasta, .faa or .fas, optionally gzipped)",
    gives: "Families, HMMs, alignments, family representatives (_reps.faa)",
  },
  proteinfold: {
    blurb: "Predicts protein structures with AlphaFold2, ColabFold, ESMFold and others.",
    takes: "Samplesheet: id, fasta (or sequence); --split_fasta for a multi-FASTA",
    gives: "Predicted structures, reports",
  },
  raredisease: {
    blurb:
      "Calls and scores SNVs, SVs and CNVs from WGS or WES of rare disease patients, with GATK gCNV for CNVs and Gens files for CNV review.",
    takes:
      "Samplesheet: sample, lane, fastq_1, fastq_2 (or spring_1, spring_2, or bam, bai), sex, phenotype, paternal_id, maternal_id, case_id",
    gives: "Aligned BAM/CRAM, ranked SNV, SV and CNV VCFs, Gens files",
  },
  "reference sequences": {
    ext: true,
    url: "https://www.ncbi.nlm.nih.gov/datasets/",
    blurb: "Reference genomes or proteins with their NCBI taxonomy ids, for example from NCBI Datasets.",
    takes: "",
    gives: "FASTA, taxid",
  },
  references: {
    blurb:
      "Builds reference files once, for many tools: from a FASTA the aligner indices (BWA, BWA-MEM2, Bowtie1 and 2, DRAGMAP), dict, fai, sizes, intervals and MSIsensor-pro list; with a GTF or GFF3 the STAR, HISAT2, Salmon, Kallisto and RSEM indices, splice sites and transcript FASTA; with a VCF its tabix index.",
    takes: "Samplesheet: genome, source, species, fasta, gtf or gff, vcf; --tools",
    gives: "Files in <species>/<source>/<genome>/Sequence/..., the iGenomes layout",
  },
  "references-assets": {
    ext: true,
    url: "https://github.com/nf-core/references-assets",
    blurb: "Repository of the input sheets nf-core/references builds from, one per genome and source.",
    takes: "",
    gives: "Samplesheets of genome, source, species and file URLs",
  },
  rnadnavar: {
    blurb: "Integrated RNA and DNA analysis for somatic mutation detection, with Mutect2 among its callers.",
    takes: "Samplesheet: patient, sample, status, lane, fastq_1, fastq_2 (or bam, cram, vcf, maf), normal_id",
    gives: "Somatic variants supported by DNA and RNA",
  },
  rnafusion: {
    blurb:
      "Fusion genes from RNA-seq: STAR-Fusion, Arriba and FusionCatcher calls, merged by fusion-report and checked with FusionInspector, with CTAT-SPLICING, StringTie and QC alongside.",
    takes:
      "Samplesheet: sample, strandedness, then fastq_1 and fastq_2, or a STAR bam or cram with junctions and splice_junctions; --genomes_base",
    gives:
      "Fusion calls per caller, fusion-report HTML and TSV, FusionInspector results, a fusions VCF, Arriba plots, StringTie GTFs",
  },
  "rnafusion references": {
    ext: true,
    url: "https://nf-co.re/rnafusion/4.2.0/docs/usage/#download-and-build-references",
    blurb:
      "rnafusion's prebuilt GRCh38 references on the nf-core S3 bucket. rnafusion's --references_only mode builds most of them itself, but not the Arriba and FusionCatcher ones.",
    takes: "",
    gives:
      "GENCODE FASTA and GTF, STAR and STAR-Fusion CTAT library, Arriba, FusionCatcher and fusion-report databases",
  },
  rnaseq: {
    blurb: "Bulk RNA-seq: alignment, quantification and extensive QC.",
    takes: "Samplesheet: sample, fastq_1, fastq_2, strandedness (or genome_bam, transcriptome_bam)",
    gives: "Duplicate-marked BAMs, gene and transcript counts, QC",
  },
  rnavar: {
    blurb:
      "GATK best-practice variant calling on RNA-seq: STAR alignment, duplicate marking, SplitNCigarReads, recalibration, HaplotypeCaller, filtering, and VEP or snpEff annotation. Optional HLA typing with seq2HLA.",
    takes: "Samplesheet: sample with fastq_1, fastq_2, or bam, bai, or cram, crai, or vcf, tbi (extra columns allowed)",
    gives: "variant_calling/<SAMPLE>/*.haplotypecaller.filtered.vcf.gz, annotated VCFs, BAMs, HLA types",
  },
  sarek: {
    blurb:
      "Germline and somatic variant calling from WGS, WES and panels: alignment, preprocessing, 20+ callers, VEP and snpEff annotation. Restart any step with --step and the CSVs in {outdir}/preprocessing/csv.",
    takes: "Samplesheet: patient, sex, status, sample, lane, fastq_1, fastq_2 (or spring, bam, cram, vcf)",
    gives: "BAM/CRAM, VCFs per caller, annotated VCFs, MultiQC report, restart CSVs",
  },
  "sequencing run": {
    ext: true,
    url: "https://nf-co.re/demultiplex/1.8.0/docs/usage/",
    blurb: "The run folder a sequencer writes: base calls for every cluster, with the flowcell SampleSheet.csv.",
    takes: "",
    gives: "Run folder (or tar.gz), SampleSheet.csv",
  },
  seqinspector: {
    intercepts: ["fetchngs", "demultiplex"],
    blurb:
      "QC of sequencing runs and FASTQ, with MultiQC reports per run and per group. Bundles: illumina, ont, fastq, bam, minimal.",
    takes: "Samplesheet: sample, fastq_1, fastq_2, rundir, tags",
    gives: "MultiQC QC report",
  },
  seqsubmit: {
    blurb: "Submits reads, assemblies, MAGs and bins to ENA through Webin-CLI.",
    takes:
      "--mode mags, bins, metagenomic_assemblies or reads, each with its own samplesheet; ENA_WEBIN and ENA_WEBIN_PASSWORD secrets",
    gives: "ENA accessions",
  },
  taxprofiler: {
    blurb:
      "Taxonomic classification and profiling of shotgun short- and long-read metagenomic data, with several classifiers in one run.",
    takes:
      "Samplesheet: sample, run_accession, instrument_platform, fastq_1, fastq_2, fasta; --databases: tool, db_name, db_params, db_path",
    gives: "Taxonomic profiles, merged tables",
  },
  tumourevo: {
    blurb:
      "Reconstructs tumour evolution: subclonal deconvolution, driver annotation and mutational signatures, for one or many samples per patient.",
    takes:
      "Samplesheet: dataset, patient, tumour_sample, normal_sample, vcf, tbi, cna_segments, cna_extra, cna_caller, cancer_type",
    gives: "Subclonal clusters, drivers, signatures",
  },
  variantbenchmarking: {
    blurb: "Compares variant calls against a truth set and reports precision and recall per caller.",
    takes: "Samplesheet: id, caller, test_vcf; --truth_vcf",
    gives: "Benchmark metrics and plots",
  },
  variantprioritization: {
    blurb: "Filters and ranks somatic and germline variants, with copy-number input and a panel of normals.",
    takes: "Samplesheet: patient, status, sample, vcf, cna",
    gives: "Ranked variant reports",
  },
  viralmetagenome: {
    blurb: "Reconstructs viral genomes from metagenomic reads and calls variants against them.",
    takes: "Samplesheet: sample, fastq_1, fastq_2 (gzipped)",
    gives: "Viral contigs, consensus genomes, variants",
  },
  viralrecon: {
    blurb: "Assembly and intrahost and low-frequency variant calling for viral samples.",
    takes: "Samplesheet: sample, fastq_1, fastq_2 (or barcode for Nanopore)",
    gives: "Consensus genomes, variants",
  },
};
