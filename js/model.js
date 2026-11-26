// Handoff statuses. What a pipeline still lacks goes in the handoff's note.
const ST = {
  native: { label: "Native", note: "the output goes straight in: no conversion needed" },
  conversion: {
    label: "Conversion",
    note: "the output must be reshaped first, into the next pipeline's samplesheet or params",
  },
};

// What a map draws, without the DOM: its stations with their text from stations.js, and the handoffs from
// handoffs.js that it draws, each coloured. renderMap draws it and bin/check.js checks it.
function mapModel(M) {
  // Copies, so rendering twice never stacks state on the shared data.
  const S = Object.entries(M.at).map(([id, at]) => ({
    id,
    ...STATIONS[id],
    ...at,
    ...(id === M.id && { hub: true, side: "inside" }),
  }));
  const HUB = S.find((s) => s.hub);
  const also = new Set(M.also);
  const drawn = (h) => h.f === M.id || h.t === M.id || also.has(`${h.f}>${h.t}`);
  const E = HANDOFFS.filter(drawn).map((h) => ({ ...h, handoff: h }));
  // Colour by direction: into the hub is input (or a resource), out of it is results. A handoff between two
  // other stations takes the colour of the hub line at its target, or at its source.
  E.forEach((e) => (e.line = e.t === M.id ? (e.res ? "res" : "reads") : e.f === M.id ? "out" : null));
  const hubLine = (id) => E.find((h) => h.line && (h.f === id || h.t === id))?.line;
  E.forEach((e) => (e.line ??= e.res ? "res" : (hubLine(e.t) ?? hubLine(e.f))));
  const days = E.map((e) => e.checked).sort();
  return { HUB, S, E, checked: [days[0], days.at(-1)] };
}
