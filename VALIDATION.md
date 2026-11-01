# Browser validation

The current dashboard was checked in headless Chromium using Playwright at desktop
(1440 × 1000) and mobile (390 × 844) viewport sizes.

Passed in both sizes:

- Initial collection: 200 records, 12 visible cards, 40 word-cloud terms, three sentiment categories.
- Entity highlights appear and can be toggled off and on.
- Combined Colorado / July / Wildfire filters return one record describing the Alexander Mountain Fire, labeled negative by VADER.
- Changing the area to Iowa with those other filters returns an empty result and removes the sentiment distribution.
- Reset restores all 200 records; Show more expands the visible cards to 24.
- No horizontal page overflow and no uncaught JavaScript errors during these interactions.

Data checks also passed: all 755 entity spans match their source narrative text;
all 200 stored sentiment scores match fresh VADER calculations. Score boundaries,
missing sentiment data, word-count normalization, stopwords, and empty results were
checked separately.

These checks verify rendering and behavior, not NLP accuracy. Entity and sentiment
predictions have not been evaluated against human annotations. Desktop/mobile
viewport checks do not establish compatibility with every browser, physical device,
or assistive technology. Public deployment has not been verified.

## Version 1 completion review

The final local build was checked in Chromium at 1440 × 1000, 390 × 844,
and 320 × 700. All passed:

- Correct distinctive-term counts and percentage-point differences for both groups.
- Comparison independence from main browsing filters; identical-group and small-group states.
- Actual filtered CSV downloads match expected source records and model predictions.
- Existing word clouds, entity highlights, and sentiment summaries render correctly.
- About navigation and all four explanatory sections are present.
- No horizontal page overflow or uncaught JavaScript errors in these interactions.

Additional mobile checks passed for keyboard access to the skip link, the Dubuque
location correction, highlight toggle, no-match results, reset, pagination, and
explicit export/comparison failure states when the dataset request fails.
Three distinctive-word regression tests and six location-correction tests passed.
Desktop/mobile About screenshots were visually inspected.

Direct public-site review was attempted but the environment's network proxy returned
403 Forbidden. This is an access restriction, not evidence that the public site is
broken. User reports confirmed previous deployments, but the final About deployment
still needs confirmation on the public site. No new NLP accuracy claims are made.
