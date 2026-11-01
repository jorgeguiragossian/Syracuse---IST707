"""Conservative corrections using location metadata from the same NOAA record."""

LOCATION_FIELDS = ('STATE', 'CZ_NAME', 'BEGIN_LOCATION', 'END_LOCATION')


def normalize_name(value):
    return ' '.join(value.split()).casefold()


def contextual_entity(text, label, record):
    """Correct PERSON or LANGUAGE only when the whole entity matches a location field.

    This is a context-based heuristic, not a claim of geographic ground truth.
    Longer facility entities and names mentioned only in narrative text stay intact.
    """
    if label in {'PERSON', 'LANGUAGE'}:
        name = normalize_name(text)
        fields = [field for field in LOCATION_FIELDS
                  if name and name == normalize_name(record.get(field, ''))]
        if fields:
            return {'label': 'LOC', 'original_label': label,
                    'source': 'noaa_location_context', 'matched_fields': fields}
    return {'label': label}
