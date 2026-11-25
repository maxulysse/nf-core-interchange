// Tiles on the honeycomb. q and r are axial hex coordinates (pointy-top): (1,0) is east, (0,1) south-east,
// (-1,1) south-west, (-1,0) west, (0,-1) north-west, (1,-1) north-east.
// A tile opens a map when maps/<id>.js registers one (and is loaded in index.html); the others show a card.
// Placeholder list: the pipelines already on the sarek map. Replace with your own.
const PIPELINES = [
  { id: "sarek", q: 0, r: 0 },
  { id: "references", q: 0, r: -1 },
  { id: "createpanelrefs", q: 1, r: -1 },
  { id: "seqinspector", q: -1, r: 0 },
  { id: "bamtofastq", q: -1, r: 1 },
  { id: "fetchngs", q: -1, r: -1 },
  { id: "demultiplex", q: -2, r: 1 },
  { id: "variantbenchmarking", q: 1, r: 0 },
  { id: "variantprioritization", q: 2, r: -1 },
  { id: "tumourevo", q: 2, r: 0 },
  { id: "epitopeprediction", q: 0, r: 1 },
  { id: "hlatyping", q: 1, r: 1 },
];
const MAPS = {};
const registerMap = m => { MAPS[m.id] = m; };
