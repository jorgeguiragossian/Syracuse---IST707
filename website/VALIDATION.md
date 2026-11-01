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
