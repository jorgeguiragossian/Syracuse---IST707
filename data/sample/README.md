# NOAA storm narrative sample

Source: NOAA NCEI Storm Events Database, 2024 details file.

Download URL: https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/StormEvents_details-ftp_v1.0_d2024_c20260728.csv.gz

This is a reproducible exploration sample of 200 event records, selected using
Python random.Random(707).sample from records with nonempty EVENT_NARRATIVE.
Rows are sorted by numeric EVENT_ID; selected source columns are preserved unchanged.
The full downloaded file remains outside the Git checkout in /workspace/.ist707/noaa/.

The source contains 69,801 records, of which 57,896 have an event narrative.
All records have an episode narrative. It contains 50 event types and 68 distinct
STATE labels; those labels include marine areas, so they are not 68 US states.

Use EVENT_NARRATIVE for initial text exploration. EPISODE_NARRATIVE provides
broader context and can repeat across events sharing EPISODE_ID. Avoid counting
repeated episode text as independent documents. This sample excludes missing event
narratives and is for exploration, not an estimate of disaster frequency or risk.
Damage values retain NOAA suffixes such as K and M and need parsing before sums.
Dates retain source format and CZ_TIMEZONE; they have not been converted to UTC.
Sentiment has no ground-truth labels here and requires evaluation before interpretation.

Dataset documentation: https://www.ncei.noaa.gov/stormevents/details.jsp
