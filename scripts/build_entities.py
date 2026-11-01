"""Regenerate browser data and model predictions from the checked-in NOAA sample."""
import csv
import json
from pathlib import Path
import spacy
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

ROOT = Path(__file__).resolve().parents[1]
with (ROOT / 'data/sample/storm_events_2024_sample.csv').open(newline='', encoding='utf-8') as source:
    records = list(csv.DictReader(source))
nlp = spacy.load('en_core_web_sm')
sentiment = SentimentIntensityAnalyzer()
for record, doc in zip(records, nlp.pipe((r['EVENT_NARRATIVE'] for r in records), batch_size=32)):
    text = record['EVENT_NARRATIVE']
    record['sentiment'] = sentiment.polarity_scores(text)
    # JavaScript slices use UTF-16 code units rather than Python code points.
    record['entities'] = [
        {'text': ent.text, 'label': ent.label_,
         'start': len(text[:ent.start_char].encode('utf-16-le')) // 2,
         'end': len(text[:ent.end_char].encode('utf-16-le')) // 2}
        for ent in doc.ents
    ]
(ROOT / 'website/events.json').write_text(json.dumps(records, ensure_ascii=False), encoding='utf-8')
print(f'Generated predictions for {len(records)} records using spaCy {spacy.__version__}, en_core_web_sm {nlp.meta["version"]}.')
