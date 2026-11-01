export const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export function filterEvents(events, {state = '', month = '', type = ''} = {}) {
  return events.filter(e => (!state || e.STATE === state) && (!month || e.MONTH_NAME === month) && (!type || e.EVENT_TYPE === type));
}
export function summarize(events) {
  return {count: events.length, narratives: events.filter(e => e.EVENT_NARRATIVE.trim()).length, areas: new Set(events.map(e => e.STATE)).size, types: new Set(events.map(e => e.EVENT_TYPE)).size};
}

// Count event text only: episode context can repeat across several records.
const stopwords = new Set(`a an the and or but if as at by for from in into of on onto to with without about above after again against all also am are around be because been before being below between both can could did do does doing down during each few had has have having he her here hers herself him himself his how i its it itself just me more most my myself no nor not off once only other our ours ourselves out over own same she should so some such than that their theirs them themselves then there these they this those through too under until up upon us very was we were what when where which while who whom why will would you your yours yourself yourselves is said`.split(/\s+/));
export function wordFrequencies(events, limit = 40) {
  const counts = new Map();
  for (const event of events) {
    const words = event.EVENT_NARRATIVE.toLowerCase().replace(/[’']/g, '').match(/[a-z]+/g) || [];
    for (const word of words) {
      if (word.length < 3 || stopwords.has(word)) continue;
      counts.set(word, (counts.get(word) || 0) + 1);
    }
  }
  return [...counts].map(([word, count]) => ({word, count}))
    .sort((a,b) => b.count - a.count || a.word.localeCompare(b.word, 'en')).slice(0,limit);
}

export function sentimentLabel(score) {
  if (!Number.isFinite(score)) return 'Unavailable';
  return score >= 0.05 ? 'Positive' : score <= -0.05 ? 'Negative' : 'Neutral';
}
export function sentimentSummary(events) {
  const counts = {Positive:0, Neutral:0, Negative:0, Unavailable:0};
  for (const event of events) counts[sentimentLabel(event.sentiment?.compound)]++;
  return counts;
}
