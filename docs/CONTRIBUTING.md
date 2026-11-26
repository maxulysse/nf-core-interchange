# Contributing

## Update the pipeline list

The Update catalogue workflow regenerates `catalogue.js` every Monday and opens a pull request when a pipeline, description or release changed. To do it by hand, regenerate it from the nf-core website's `public/pipelines.json` (see `bin/update-catalogue.py`), then place any new pipeline in `pipelines.js`. The Render check fails while a catalogue pipeline is missing from the tree.

## Add a pipeline

1. Add the pipeline to its group in `TREE` in `pipelines.js` (or add a group: any node with `children`). Tiles are placed in a spiral from the centre in the order listed, group ids must be unique, and a pipeline may be listed in several groups.
2. Describe each new station once in `stations.js` and each new handoff once in `handoffs.js`, with the day you checked it against both pipelines' latest releases. Releases come from `catalogue.js`. A station outside nf-core is a resource: mark it `ext: true` and give it a `url`. Mark a reference or database handoff with `res: true`.
3. To give it a map, add it to `MAPS` in `maps.js` with an `overview`. The map draws every handoff of its hub, and `js/model.js` places the stations: inputs fan in from the left, resources from the top, outputs fan out to the right and spill evenly to the other sides when they do not fit, all in honeycomb-field order (the rules are above `assign()`). List other handoffs to draw in `also`.

A station on any map that has its own map opens it on a second click, or from the button in its card.

## Checks

The Render workflow runs on each pull request. It runs `bin/check.js`, which checks that every catalogue pipeline sits in the tree, that every map's `also` names known handoffs, that no two stations overlap, that every drawn handoff has a route and a colour, and that every station and handoff is on a map. It then loads the honeycomb, every group and every map in headless Chrome and fails on script errors.

The Linting workflow runs [prek](https://github.com/j178/prek) with the hooks in `.pre-commit-config.yaml`: Prettier, whitespace and end-of-file fixes, ruff for `bin/`, and `bin/check.js`. Run them before each commit with `prek install`, or once with `prek run --all-files`.
