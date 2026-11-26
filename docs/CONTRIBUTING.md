# Contributing

## Update the pipeline list

The Update catalogue workflow regenerates `catalogue.js` every Monday and opens a pull request when a pipeline, description or release changed. To do it by hand, regenerate it from the nf-core website's `public/pipelines.json` (see `bin/update-catalogue.py`), then place any new pipeline in `pipelines.js`. The Render check fails while a catalogue pipeline is missing from the tree.

## Add a pipeline

1. Add the pipeline to its group in `TREE` in `pipelines.js` (or add a group: any node with `children`). Tiles are placed in a spiral from the centre in the order listed, group ids must be unique, and a pipeline may be listed in several groups.
2. To give it a map, copy `maps/sarek.js` to `maps/<pipeline>.js`, set `id` to the pipeline, and mark its station with `hub: true`. Releases come from `catalogue.js`: give a station `rel` only when it is not an nf-core pipeline.
3. Load it in `index.html` with `<script src="maps/<pipeline>.js"></script>`, next to the sarek line.

A station on any map that has its own map opens it on a second click, or from the button in its card.

## Checks

The Render workflow runs on each pull request. It checks that every catalogue pipeline sits in the tree and that every map has one hub, unique stations and handoffs between them, then loads the honeycomb, every group and every map in headless Chrome and fails on script errors.

The Linting workflow runs [prek](https://github.com/j178/prek) with the hooks in `.pre-commit-config.yaml`: Prettier, whitespace and end-of-file fixes, and ruff for `bin/`. Run them before each commit with `prek install`, or once with `prek run --all-files`.
