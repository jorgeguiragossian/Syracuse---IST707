# Syracuse---IST707
A repo containing IST707 projects and Jupyter notebooks.


## Weather / Words

A research dashboard exploring NOAA storm narratives with state/area, month, and
event-type filters, word clouds, named entity highlights, and sentiment analysis.
The initial collection contains 200 sampled 2024 event records.

From this repository's root:

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory website
```

See [website instructions](website/README.md), [data provenance](data/sample/README.md),
and [validation results](website/VALIDATION.md). The site is static: no build step,
API key, or running NLP server is required. NLP predictions are exploratory and do
not measure storm severity or risk.
