<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/images/nf-core-interchange_logo_dark.png">
    <img alt="nf-core/interchange" src="docs/images/nf-core-interchange_logo_light.png">
  </picture>
</h1>

nf-core pipelines on a honeycomb, grouped by field and split into sub-groups. Groups zoom into the next level until you reach a pipeline and its interchange: a metro map with the pipeline as the hub, showing where its input data and resources come from and where its results go next.

It grows out of [Sarek Interchange](https://github.com/maxulysse/sarek-interchange), which is the first map here.

No build step: open `index.html` in a browser.

- [Layout](docs/layout.md): what each file holds
- [Contributing](docs/CONTRIBUTING.md): update the pipeline list, add a pipeline or a map

## Credits

Inspired by the [nf-core](https://nf-co.re/) community and the contributors of every pipeline on the map.

Thanks to [Evangelos Karatzas](https://github.com/vagkaratzas), [Famke](https://github.com/famosab), [Rike](https://github.com/FriederikeHanssen) and [James Fellows Yates](https://github.com/jfy133) for contributing to the idea.

The meta-omics maps (detaxizer, createtaxdb, ampliseq, taxprofiler, mag, magmap, metatdenovo, viralmetagenome, proteinfamilies) start from the [nf-core meta-omics SIG benchmark](https://github.com/vagkaratzas/meta-omics-sig).
