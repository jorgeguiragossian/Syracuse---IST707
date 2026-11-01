# Weather / Words

A static research dashboard for the 200-record NOAA Storm Events exploration sample.

From the repository root, run:

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory website
```

Use a browser connected to that server. An HTTP server is required because the page fetches `events.json`.
No build step, API key, or JavaScript dependencies are needed. Fonts fall back to local system fonts when Google Fonts is unavailable.

Filter by area, month, and event type. Filters combine with AND; reset restores all 200 records. Narratives are shown 12 at a time with optional episode context. A word cloud and accessible count table summarize the top 40 terms across all matching event narratives. Counts exclude common English stopwords, numbers, and words shorter than three letters; word forms remain separate. Episode context is excluded to avoid counting repeated context. Named entities are predicted by spaCy 3.8.11 / en_core_web_sm 3.8.0 and highlighted in event narratives. Predictions are precomputed, so browsing needs no model server or credentials. The toggle hides highlights; numeric quantities are excluded from highlighting. Sentiment is not implemented yet.

`events.json` is a browser-readable copy of `../data/sample/storm_events_2024_sample.csv`, preserving the original field names and values. See that sample's README for provenance and limitations. No remote data calls are made during filtering.


## Regenerate entity predictions

Install `scripts/requirements-nlp.txt` into a Python 3.12 virtual environment, then run `python scripts/build_entities.py` from the repository root. This rebuilds `website/events.json` from the source CSV, including model-predicted entity spans. The model is general-purpose English, not trained specifically on NOAA narratives; predictions are not ground truth. The original narratives remain unchanged. No text is sent to a third-party inference API.
