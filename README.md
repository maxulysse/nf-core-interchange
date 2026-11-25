# nf-core Interchange

A honeycomb of pipelines. Each tile opens that pipeline's interchange: a metro map with the pipeline as the hub, showing where its input data and resources come from and where its results go next.

It grows out of [Sarek Interchange](https://github.com/maxulysse/sarek-interchange), which is the first map here.

## Layout

| File | What it holds |
| --- | --- |
| `index.html` | Page shell: honeycomb view and map view |
| `pipelines.js` | The tiles on the honeycomb and their positions |
| `maps/<pipeline>.js` | One interchange map: stations (`S`) and handoffs (`E`) |
| `js/map.js` | Draws a metro map from a map file |
| `js/app.js` | Honeycomb, zoom into a map, routing (`#<pipeline>`), theme |
| `style.css` | Styles for both views |

## Add a pipeline

1. Add a tile to `PIPELINES` in `pipelines.js`, with its axial hex position `q`, `r`.
2. To give it a map, copy `maps/sarek.js` to `maps/<pipeline>.js`, set `id` to the pipeline, and mark its station with `hub: true`.
3. Load it in `index.html` with `<script src="maps/<pipeline>.js"></script>`, next to the sarek line.

A station on any map that has its own map gets a button to open it.

No build step: open `index.html` in a browser. The Render workflow loads the honeycomb and every map in headless Chrome on each pull request and fails on script errors.

## Credits

Inspired by the [meta-omics metro map](https://vagkaratzas.github.io/meta-omics-sig/) that [Evangelos Karatzas](https://github.com/vagkaratzas) built for the nf-core [meta-omics special interest group](https://nf-co.re/special-interest-groups/meta-omics). Thanks to [Famke](https://github.com/famosab) and [Rike](https://github.com/FriederikeHanssen) for the Sarek map, and to the whole [nf-core](https://nf-co.re/) community and the contributors of every pipeline on the map.
