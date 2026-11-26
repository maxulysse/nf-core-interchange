# Contributing

## Update the pipeline list

The Update catalogue workflow regenerates `catalogue.js` every Monday and opens a pull request when a pipeline, description or release changed. To do it by hand, regenerate it from the nf-core website's `public/pipelines.json` (see `bin/update-catalogue.py`), then place any new pipeline in `pipelines.js`. The Render check fails while a catalogue pipeline is missing from the tree.

## Add a pipeline

1. Add the pipeline to its group in `TREE` in `pipelines.js` (or add a group: any node with `children`). Tiles are placed in a spiral from the centre in the order listed, group ids must be unique, and a pipeline may be listed in several groups.
2. Describe each new station once in `stations.js` and each new handoff once in `handoffs.js`, with the day you checked it against both pipelines' latest releases. Releases come from `catalogue.js`: give a station `url` and `rel` only when it is not an nf-core pipeline. Mark a reference or database handoff with `res: true`.
3. To give it a map, copy `maps/sarek.js` to `maps/<pipeline>.js`, set `id` to the pipeline and place its stations in `at`. The map draws every handoff of its hub, so place every station those handoffs name; list other handoffs to draw in `also`.
4. Load it in `index.html` with `<script src="maps/<pipeline>.js"></script>`, next to the sarek line.

A station on any map that has its own map opens it on a second click, or from the button in its card.

## Checks

The Render workflow runs on each pull request. It runs `bin/check.js`, which checks that every catalogue pipeline sits in the tree, that every map places known stations, including every station its hub's handoffs name, that every drawn handoff has a colour, and that every station and handoff is on a map. It then loads the honeycomb, every group and every map in headless Chrome and fails on script errors.

The Linting workflow runs [prek](https://github.com/j178/prek) with the hooks in `.pre-commit-config.yaml`: Prettier, whitespace and end-of-file fixes, ruff for `bin/`, and `bin/check.js`. Run them before each commit with `prek install`, or once with `prek run --all-files`.
