# nf-core Interchange

nf-core pipelines on a honeycomb, grouped by field and split into sub-groups. Groups zoom into the next level until you reach a pipeline and its interchange: a metro map with the pipeline as the hub, showing where its input data and resources come from and where its results go next.

It grows out of [Sarek Interchange](https://github.com/maxulysse/sarek-interchange), which is the first map here.

## Layout

| File | What it holds |
| --- | --- |
| `index.html` | Page shell: honeycomb view and map view |
| `pipelines.js` | The tree of groups and pipelines |
| `maps/<pipeline>.js` | One interchange map: stations (`S`) and handoffs (`E`) |
| `js/map.js` | Draws a metro map from a map file |
| `js/app.js` | Honeycombs, zooming between levels, breadcrumbs, routing (`#<id>`), theme |
| `style.css` | Styles for both views |

## Add a pipeline

1. Add the pipeline to its group in `TREE` in `pipelines.js` (or add a group: any node with `children`). Tiles are placed in a spiral from the centre in the order listed, group ids must be unique, and a pipeline may be listed in several groups.
2. To give it a map, copy `maps/sarek.js` to `maps/<pipeline>.js`, set `id` to the pipeline, and mark its station with `hub: true`.
3. Load it in `index.html` with `<script src="maps/<pipeline>.js"></script>`, next to the sarek line.

A station on any map that has its own map gets a button to open it.

No build step: open `index.html` in a browser. The Render workflow loads the honeycomb and every map in headless Chrome on each pull request and fails on script errors.

## Credits

Inspired by the [meta-omics metro map](https://vagkaratzas.github.io/meta-omics-sig/) that [Evangelos Karatzas](https://github.com/vagkaratzas) built for the nf-core [meta-omics special interest group](https://nf-co.re/special-interest-groups/meta-omics). Thanks to [Famke](https://github.com/famosab) and [Rike](https://github.com/FriederikeHanssen) for the Sarek map, and to the whole [nf-core](https://nf-co.re/) community and the contributors of every pipeline on the map.
