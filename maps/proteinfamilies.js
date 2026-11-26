// Interchange map for nf-core/proteinfamilies: where each station sits. Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "proteinfamilies",
  title: "Proteinfamilies Interchange",
  checked: "2026-11-26",
  overview: "Which pipelines give nf-core/proteinfamilies its proteins, and which read the samplesheets it writes.",
  at: {
    proteinfamilies: { x: 500, y: 330 },
    mag: { x: 150, y: 200, side: "below" },
    metatdenovo: { x: 150, y: 460, side: "below" },
    proteinfold: { x: 850, y: 200, side: "below" },
    proteinannotator: { x: 850, y: 460, side: "below" },
  },
});
