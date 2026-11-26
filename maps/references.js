// Interchange map for nf-core/references. Stations are placed around the hub by js/model.js; text is in stations.js, handoffs in handoffs.js.
registerMap({
  id: "references",
  overview:
    "Where nf-core/references gets its genomes, and which pipelines can read the indices it builds. No released pipeline reads its datasheet yet, so every pipeline handoff passes files by hand. Each line is a handoff between two pipelines.",
});
