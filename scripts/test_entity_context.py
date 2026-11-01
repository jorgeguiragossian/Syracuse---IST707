import unittest
from entity_context import contextual_entity


class LocationContextTests(unittest.TestCase):
    def test_dubuque_matches_county_metadata(self):
        result = contextual_entity('Dubuque', 'PERSON', {'CZ_NAME': 'DUBUQUE'})
        self.assertEqual(result['label'], 'LOC')
        self.assertEqual(result['original_label'], 'PERSON')
        self.assertEqual(result['matched_fields'], ['CZ_NAME'])

    def test_dubuque_language_error(self):
        self.assertEqual(contextual_entity('Dubuque', 'LANGUAGE', {'CZ_NAME': 'DUBUQUE'})['label'], 'LOC')

    def test_full_names_only(self):
        self.assertEqual(contextual_entity('Charles', 'PERSON', {'BEGIN_LOCATION': 'Lake Charles'}), {'label': 'PERSON'})
        self.assertEqual(contextual_entity('Dubuque Regional Airport', 'ORG', {'CZ_NAME': 'DUBUQUE'}), {'label': 'ORG'})

    def test_unmatched_people_and_missing_fields(self):
        self.assertEqual(contextual_entity('John Smith', 'PERSON', {'CZ_NAME': 'DUBUQUE'}), {'label': 'PERSON'})
        self.assertEqual(contextual_entity('King', 'PERSON', {}), {'label': 'PERSON'})
        self.assertEqual(contextual_entity('', 'PERSON', {}), {'label': 'PERSON'})

    def test_case_and_whitespace(self):
        self.assertEqual(contextual_entity('Fort  Myers', 'PERSON', {'END_LOCATION': ' FORT MYERS '})['label'], 'LOC')

    def test_other_labels_are_preserved(self):
        self.assertEqual(contextual_entity('Dubuque', 'GPE', {'CZ_NAME': 'DUBUQUE'}), {'label': 'GPE'})


if __name__ == '__main__':
    unittest.main()
