# Weather / Words

A static research dashboard for the 200-record NOAA Storm Events exploration sample.

From the repository root, run:

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory website
```

Use a browser connected to that server. An HTTP server is required because the page fetches `events.json`.
No build step, API key, or JavaScript dependencies are needed. Fonts fall back to local system fonts when Google Fonts is unavailable.

Filter by area, month, and event type. Filters combine with AND; reset restores all 200 records. Narratives are shown 12 at a time with optional episode context. A word cloud and accessible count table summarize the top 40 terms across all matching event narratives. Counts exclude common English stopwords, numbers, and words shorter than three letters; word forms remain separate. Episode context is excluded to avoid counting repeated context. Named entities are predicted by spaCy 3.8.11 / en_core_web_sm 3.8.0 and highlighted in event narratives. Predictions are precomputed, so browsing needs no model server or credentials. The toggle hides highlights; numeric quantities are excluded from highlighting. VADER 3.3.2 sentiment scores are shown per event and as a distribution across filtered records. Thresholds are ±0.05 on the compound score. These exploratory predictions are not validated for NOAA text and do not measure event severity or author emotion.

`events.json` is a browser-readable copy of `../data/sample/storm_events_2024_sample.csv`, preserving the original field names and values. See that sample's README for provenance and limitations. No remote data calls are made during filtering.


## Regenerate entity predictions

Install `scripts/requirements-nlp.txt` into a Python 3.12 virtual environment, then run `python scripts/build_entities.py` from the repository root. This rebuilds `website/events.json` from the source CSV, including model-predicted entity spans and VADER sentiment scores. The model is general-purpose English, not trained specifically on NOAA narratives; predictions are not ground truth. The original narratives remain unchanged. No text is sent to a third-party inference API.


### Location context corrections

If a PERSON or LANGUAGE entity exactly matches STATE, CZ_NAME, BEGIN_LOCATION, or END_LOCATION
in the same NOAA record (ignoring case and repeated whitespace), it is displayed
as LOC. No partial-name matching or narrative-only gazetteer is used. This corrects
Dubuque in event 1172069 while leaving longer facility names and unmatched person
names intact. The original label and matching fields are retained in events.json;
tooltips identify corrected entities. Metadata matching is a heuristic and cannot
prove the intended referent in every sentence.

Run the correction regression checks with `python -m unittest discover -s scripts -p 'test_*.py'`.


## Export filtered results

Download filtered CSV exports all matching records, regardless of pagination or
whether entity highlights are enabled. Includes source metadata, both narratives,
VADER label/compound score, and entity predictions as JSON in ENTITIES_JSON. Entity
JSON retains offsets, model labels, and provenance of location corrections. Offsets
are JavaScript UTF-16 code units into EVENT_NARRATIVE. Scores remain exploratory.
Files are UTF-8 with a BOM for spreadsheet compatibility. Commas, quotes, and
newlines are escaped. Source strings beginning with a spreadsheet formula marker
are prefixed with an apostrophe unless they are plain numeric values. Coordinates
and numeric sentiment scores are exported unchanged.
Export is disabled for empty results and while data is loading. Downloads happen
in the browser without uploading narratives to another service.


## Compare event types

Two independent event-type selectors compare the full 200-record sample, ignoring
main browsing filters. Default groups are Flash Flood and Tornado. Each shows its
record count, top 20 word cloud, exact count table, and VADER sentiment distribution.
Both clouds use the same font-size scale based on raw term occurrences; counts are
not normalized for group size or narrative length. Groups below 10 records carry
a small-sample note. Selecting the same type twice explicitly reports identical
groups. Resetting the browsing filters does not reset the comparison.


### Distinctive words

Each comparison group lists up to 10 terms with higher document prevalence than
the other group. A word counts at most once per narrative. Terms must appear in
at least two group narratives. Rank by percentage-point difference in prevalence,
then supporting narrative count, then alphabetical order. Tables show both raw
counts/denominators and percentages. Identical groups produce no distinctive terms.
The method is descriptive, not a significance test; report length and small groups
can still affect it. Run `node --test scripts/test_distinctive.mjs` for regression checks.
