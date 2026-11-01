export const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export function filterEvents(events, {state = '', month = '', type = ''} = {}) {
  return events.filter(e => (!state || e.STATE === state) && (!month || e.MONTH_NAME === month) && (!type || e.EVENT_TYPE === type));
}
export function summarize(events) {
  return {count: events.length, narratives: events.filter(e => e.EVENT_NARRATIVE.trim()).length, areas: new Set(events.map(e => e.STATE)).size, types: new Set(events.map(e => e.EVENT_TYPE)).size};
}

// Count event text only: episode context can repeat across several records.
const stopwords = new Set(`a an the and or but if as at by for from in into of on onto to with without about above after again against all also am are around be because been before being below between both can could did do does doing down during each few had has have having he her here hers herself him himself his how i its it itself just me more most my myself no nor not off once only other our ours ourselves out over own same she should so some such than that their theirs them themselves then there these they this those through too under until up upon us very was we were what when where which while who whom why will would you your yours yourself yourselves is said`.split(/\s+/));
function narrativeWords(text) {
  return (text.toLowerCase().replace(/[’']/g, '').match(/[a-z]+/g) || [])
    .filter(word => word.length >= 3 && !stopwords.has(word));
}
export function wordFrequencies(events, limit = 40) {
  const counts = new Map();
  for (const event of events) {
    const words = narrativeWords(event.EVENT_NARRATIVE);
    for (const word of words) {
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

export function eventsCSV(events) {
  // Explicit source fields keep column order stable as model outputs evolve.
  const fields = ['EVENT_ID','EPISODE_ID','YEAR','STATE','MONTH_NAME','EVENT_TYPE','BEGIN_DATE_TIME','CZ_TIMEZONE','CZ_NAME','BEGIN_LOCATION','END_LOCATION','INJURIES_DIRECT','INJURIES_INDIRECT','DEATHS_DIRECT','DEATHS_INDIRECT','DAMAGE_PROPERTY','DAMAGE_CROPS','BEGIN_LAT','BEGIN_LON','EVENT_NARRATIVE','EPISODE_NARRATIVE'];
  const headers = [...fields, 'SENTIMENT_LABEL','SENTIMENT_COMPOUND','ENTITIES_JSON'];
  function cell(value) {
    let text = String(value ?? '');
    // Prevent source text from becoming a formula when opened in a spreadsheet.
    if (/^[\s\u0000-\u001f]*[=+@-]/u.test(text) && typeof value !== 'number' && !/^-?\d+(?:\.\d+)?$/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"','""') + '"';
  }
  const rows = events.map(event => [...fields.map(field => event[field]), sentimentLabel(event.sentiment?.compound), event.sentiment?.compound ?? '', JSON.stringify(event.entities || [])]);
  return '\uFEFF' + [headers, ...rows].map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}

// Document prevalence avoids letting repeated words within one report dominate.
export function distinctiveWords(group, other, limit = 10) {
  if (!group.length || !other.length) return [];
  function documents(events) {
    const counts = new Map();
    for (const event of events) {
      for (const word of new Set(narrativeWords(event.EVENT_NARRATIVE))) {
        counts.set(word, (counts.get(word) || 0) + 1);
      }
    }
    return counts;
  }
  const counts = documents(group), others = documents(other);
  return [...counts].map(([word,count]) => {
    const otherCount = others.get(word) || 0;
    const rate = count / group.length, otherRate = otherCount / other.length;
    return {word, count, otherCount, rate, otherRate, gap:100 * (rate - otherRate)};
  }).filter(term => term.count >= 2 && term.gap > 0)
    .sort((a,b) => b.gap - a.gap || b.count - a.count || a.word.localeCompare(b.word,'en'))
    .slice(0,limit);
}
