// Interchange map for nf-core/proteinfamilies: where each station sits around the hub, which is always at (500, 340). Station text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "proteinfamilies",
  overview: "Which pipelines give nf-core/proteinfamilies its proteins, and which read the samplesheets it writes.",
  at: {
    mag: { x: 150, y: 210, side: "below" },
    metatdenovo: { x: 150, y: 470, side: "below" },
    proteinfold: { x: 850, y: 210, side: "below" },
    proteinannotator: { x: 850, y: 470, side: "below" },
  },
});
