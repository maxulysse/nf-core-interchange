// The honeycomb tree. A node with children is a group and opens into a honeycomb of them. A plain string is a
// pipeline: it opens its map when maps.js lists one, else a card from catalogue.js.
// Group ids must be unique and differ from pipeline names: an id is also the page address (#sarek, #cancer).
// A pipeline may be listed in several groups; its page shows all of them, and the breadcrumb follows the group
// you opened it from. Tiles are placed in a spiral from the centre, in the order listed: put the busiest first.
// Top level: the field, or what you start from (data or assay). Next level: what you want to do with it.
// Every active pipeline in catalogue.js must appear at least once; the Render check fails otherwise.
const TREE = {
  id: "all",
  label: "All pipelines",
  children: [
    {
      id: "data-in",
      label: "Data in",
      children: [
        {
          id: "get-data",
          label: "Get reads",
          children: ["fetchngs", "demultiplex", "bamtofastq", "readsimulator"],
        },
        { id: "read-qc", label: "QC & clean", children: ["seqinspector", "fastqrepair", "fastquorum", "detaxizer"] },
        {
          id: "ref-dbs",
          label: "References",
          children: ["references", "createpanelrefs", "createtaxdb", "proteogenomicsdb"],
        },
        { id: "share", label: "Share & tooling", children: ["seqsubmit", "provenancereport", "datasync", "demo"] },
      ],
    },
    {
      id: "dna",
      label: "DNA",
      children: [
        {
          id: "germline",
          label: "Germline",
          children: [
            "sarek",
            "raredisease",
            "longraredisease",
            "nanoseq",
            "pacvar",
            "drop",
            "hlatyping",
            "abotyper",
            "mitodetect",
          ],
        },
        {
          id: "cancer",
          label: "Cancer",
          children: [
            "sarek",
            "oncoanalyser",
            "rnadnavar",
            "pacsomatic",
            "variantprioritization",
            "tumourevo",
            "circdna",
            "epitopeprediction",
            "viralintegration",
          ],
        },
        {
          id: "populations",
          label: "Populations",
          children: [
            "phaseimpute",
            "genomicrelatedness",
            "variantcatalogue",
            "gwas",
            "rarevariantburden",
            "radseq",
            "omicsgenetraitassociation",
            "eager",
          ],
        },
        { id: "benchmark", label: "Benchmark", children: ["variantbenchmarking", "readsimulator"] },
        {
          id: "assembly",
          label: "Assembly",
          children: ["genomeassembler", "bacass", "genomeskim", "pangenome", "denovotranscript"],
        },
        {
          id: "annotation",
          label: "Annotation & QC",
          children: ["genomeannotation", "genomeqc", "isoseq", "ncrnannotator", "proteinannotator"],
        },
        {
          id: "evolution",
          label: "Comparison & evolution",
          children: [
            "pairgenomealign",
            "multiplesequencealign",
            "reportho",
            "phyloplace",
            "genephylo",
            "genephylomodeler",
            "kmermaid",
            "proteinfamilies",
          ],
        },
        { id: "ancient", label: "Ancient DNA", children: ["eager", "coproid"] },
      ],
    },
    {
      id: "rna",
      label: "RNA",
      children: [
        {
          id: "expression",
          label: "Expression",
          children: [
            "rnaseq",
            "nanoseq",
            "differentialabundance",
            "stableexpression",
            "alleleexpression",
            "nanostring",
            "dualrnaseq",
          ],
        },
        {
          id: "rna-events",
          label: "Splicing, fusions & variants",
          children: ["rnasplice", "rnafusion", "rnavar", "drop", "circrna", "lncpipe", "rnadnavar"],
        },
        {
          id: "rna-dynamics",
          label: "RNA dynamics & modifications",
          children: ["nascent", "cageseq", "slamseq", "riboseq", "clipseq", "dartseq", "rnastructurome"],
        },
        { id: "small-rna", label: "Small RNA", children: ["smrnaseq", "evexplorer"] },
      ],
    },
    {
      id: "regulation",
      label: "Regulation",
      children: [
        {
          id: "chromatin",
          label: "Chromatin",
          children: ["atacseq", "chipseq", "cutandrun", "mnaseseq", "sammyseq", "callingcards", "tfactivity"],
        },
        {
          id: "methylation",
          label: "Methylation",
          children: ["methylseq", "methylong", "methylarray", "epigenomesegmentation"],
        },
        { id: "genome-3d", label: "3D genome", children: ["hic", "hicar"] },
      ],
    },
    {
      id: "cells-tissues",
      label: "Cells & tissues",
      children: [
        {
          id: "single-cell",
          label: "Single-cell",
          children: ["scrnaseq", "scnanoseq", "marsseq", "scdownstream", "hadge", "pixelator"],
        },
        { id: "spatial", label: "Spatial", children: ["spatialaxe", "spatialvi", "panoramaseq", "sopa", "molkart"] },
        { id: "imaging", label: "Imaging", children: ["mcmicro", "imcyto", "lsmquant", "cellpainting"] },
      ],
    },
    {
      id: "microbes",
      label: "Microbes",
      children: [
        {
          id: "profiling",
          label: "Profiling",
          children: [
            "taxprofiler",
            "ampliseq",
            "funcprofiler",
            "daamicrobiome",
            "magmap",
            "createtaxdb",
            "detaxizer",
            "taxmarker",
          ],
        },
        {
          id: "meta-assembly",
          label: "Assemble & annotate",
          children: ["mag", "metatdenovo", "funcscan", "phageannotator", "metapep"],
        },
        {
          id: "bacteria",
          label: "Bacteria & parasites",
          children: [
            "bacass",
            "bactmap",
            "pathogensurveillance",
            "pathogenepidemiology",
            "tbanalyzer",
            "plasmodiumdrugres",
            "hgtseq",
            "dualrnaseq",
          ],
        },
        { id: "viruses", label: "Viruses", children: ["viralrecon", "viralmetagenome", "viralintegration"] },
      ],
    },
    {
      id: "proteins",
      label: "Proteins & metabolites",
      children: [
        {
          id: "mass-spec",
          label: "Mass spectrometry",
          children: ["diaproteomics", "mspepid", "mhcquant", "metaboigniter", "ribomsqc", "proteogenomicsdb"],
        },
        {
          id: "structure",
          label: "Sequence & structure",
          children: ["proteinfold", "proteinannotator", "proteinfamilies", "moleculardynamics"],
        },
      ],
    },
    {
      id: "immunology",
      label: "Immunology",
      children: ["airrflow", "hlatyping", "epitopeprediction", "mhcquant", "metapep"],
    },
    {
      id: "screens",
      label: "Screens & models",
      children: [
        { id: "perturbation", label: "Perturbation screens", children: ["crisprseq", "deepmutscan", "captnseq"] },
        {
          id: "modelling",
          label: "Models & networks",
          children: ["drugresponseeval", "diseasemodulediscovery", "deepmodeloptim", "bacmodel"],
        },
      ],
    },
    { id: "earth", label: "Earth & environment", children: ["rangeland", "troughgraph"] },
    { id: "astronomy", label: "Astronomy", children: ["meerpipe"] },
    { id: "economics", label: "Economics", children: ["spinningjenny"] },
  ],
};
