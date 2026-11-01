# Weather / Words

A static research dashboard for the 200-record NOAA Storm Events exploration sample.

From the repository root, run:

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory website
```

Use a browser connected to that server. An HTTP server is required because the page fetches `events.json`.
No build step, API key, or JavaScript dependencies are needed. Fonts fall back to local system fonts when Google Fonts is unavailable.

Filter by area, month, and event type. Filters combine with AND; reset restores all 200 records. Narratives are shown 12 at a time with optional episode context. No NER, sentiment, or word cloud is implemented in this first increment.

`events.json` is a browser-readable copy of `../data/sample/storm_events_2024_sample.csv`, preserving the original field names and values. See that sample's README for provenance and limitations. No remote data calls are made during filtering.
