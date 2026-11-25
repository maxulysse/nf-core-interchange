// The honeycomb tree. A node with children is a group and opens into a honeycomb of them;
// a node without children is a pipeline and opens its map when maps/<id>.js registers one.
// Group ids must be unique: an id is also the page address (#sarek, #genomics). A pipeline may be listed in
// several groups; its page shows all of them, and the breadcrumb follows the group you opened it from.
// Tiles are placed in a spiral from the centre, in the order listed: put the busiest first.
// Draft grouping: rearrange freely.
const TREE = { id: "all", label: "All pipelines", children: [
  { id: "genomics", label: "Genomics", children: [
    { id: "variants", label: "Variants", children: [
      { id: "sarek" }, { id: "raredisease" }, { id: "createpanelrefs" }, { id: "variantbenchmarking" } ] },
    { id: "cancer", label: "Cancer", children: [
      { id: "sarek" }, { id: "oncoanalyser" }, { id: "variantprioritization" }, { id: "tumourevo" } ] },
    { id: "immunology", label: "Immunology", children: [
      { id: "hlatyping" }, { id: "epitopeprediction" }, { id: "airrflow" } ] },
  ] },
  { id: "data-in", label: "Data in", children: [
    { id: "fetchngs" }, { id: "demultiplex" }, { id: "seqinspector" }, { id: "bamtofastq" }, { id: "references" } ] },
  { id: "transcriptomics", label: "Transcriptomics", children: [
    { id: "bulk-rna", label: "Bulk", children: [
      { id: "rnaseq" }, { id: "differentialabundance" }, { id: "rnafusion" }, { id: "rnasplice" }, { id: "rnavar" }, { id: "drop" } ] },
    { id: "single-cell", label: "Single-cell", children: [ { id: "scrnaseq" } ] },
  ] },
  { id: "epigenomics", label: "Epigenomics", children: [
    { id: "chipseq" }, { id: "atacseq" }, { id: "methylseq" }, { id: "cutandrun" } ] },
  { id: "microbes", label: "Microbes", children: [
    { id: "metagenomics", label: "Metagenomics", children: [
      { id: "taxprofiler" }, { id: "mag" }, { id: "createtaxdb" }, { id: "funcscan" }, { id: "detaxizer" } ] },
    { id: "pathogens", label: "Pathogens", children: [
      { id: "viralrecon" }, { id: "bacass" }, { id: "pathogensurveillance" } ] },
  ] },
  { id: "proteomics", label: "Proteomics", children: [ { id: "quantms" }, { id: "mhcquant" } ] },
] };
const MAPS = {};
const registerMap = m => { MAPS[m.id] = m; };
