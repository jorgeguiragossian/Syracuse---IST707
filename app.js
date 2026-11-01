import {months, filterEvents, summarize, wordFrequencies, sentimentLabel, sentimentSummary, eventsCSV, distinctiveWords} from './data.mjs?v=release-1';
const $ = id => document.getElementById(id);
let events = [], filtered = [], visible = 12;
function node(tag, text, cls) { const el = document.createElement(tag); el.textContent = text; if (cls) el.className = cls; return el; }
function options(id, values) { for (const value of values) { const option = node('option',value); option.value = value; $(id).append(option); } }
const entityGroups = {GPE:['place','Geopolitical area'],LOC:['place','Location'],FAC:['place','Facility'],DATE:['date','Date'],TIME:['date','Time'],ORG:['org','Organization'],PERSON:['person','Person'],NORP:['other','Nationality, religious or political group'],EVENT:['other','Named event'],PRODUCT:['other','Product'],WORK_OF_ART:['other','Work of art'],LAW:['other','Law'],LANGUAGE:['other','Language']};
function narrativeNode(event) {
  const paragraph = node('p', '', 'narrative');
  const text = event.EVENT_NARRATIVE;
  let cursor = 0;
  for (const entity of ($('highlight').checked ? (event.entities || []) : [])) {
    const group = entityGroups[entity.label];
    if (!group) continue;
    paragraph.append(document.createTextNode(text.slice(cursor, entity.start).replace(/\|\|/g,'\n\n')));
    const mark = node('mark', text.slice(entity.start, entity.end), `entity ${group[0]}`);
    const context = entity.source === 'noaa_location_context' ? ` · adjusted from ${entity.original_label} using this record’s NOAA location fields` : '';
    mark.title = `${group[1]} (${entity.label})${context}`; mark.tabIndex = 0;
    mark.setAttribute('aria-label', `${entity.text}: ${group[1]}${context}`);
    paragraph.append(mark); cursor = entity.end;
  }
  paragraph.append(document.createTextNode(text.slice(cursor).replace(/\|\|/g,'\n\n')));
  return paragraph;
}
$('highlight').addEventListener('change', renderCards);
function renderCards() {
  const cards = $('cards'); cards.replaceChildren();
  if (!filtered.length) {
    const empty = node('div', '', 'empty'); empty.append(node('h3','No events in this selection'),node('p','Try another month, area, or event type. This collection contains only 200 sampled records.')); cards.append(empty);
  }
  for (const event of filtered.slice(0, visible)) {
    const card = node('article', '', 'card');
    const meta = node('div', '', 'card-meta'); meta.append(node('span', event.EVENT_TYPE, 'event-tag'),node('span',event.STATE.replaceAll('_',' ')));
    const title = event.BEGIN_LOCATION || event.CZ_NAME || event.STATE;
    card.append(meta,node('h3',title.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())),node('p',event.BEGIN_DATE_TIME+' · '+event.CZ_TIMEZONE,'date'),narrativeNode(event));
    const label = sentimentLabel(event.sentiment?.compound);
    card.append(node('p', `Predicted sentiment: ${label}${label === 'Unavailable' ? '' : ' · ' + event.sentiment.compound.toFixed(3)}`, 'sentiment-caption'));
    if (event.EPISODE_NARRATIVE.trim()) { const details = node('details',''); details.append(node('summary','Read broader episode context'),node('p',event.EPISODE_NARRATIVE.replace(/\|\|/g,'\n\n'),'narrative')); card.append(details); }
    card.append(node('p',`EVENT ${event.EVENT_ID} · EPISODE ${event.EPISODE_ID}`,'record-id')); cards.append(card);
  }
  $('more').hidden = visible >= filtered.length;
}
function renderWordCloud(words, cloud, table, max = words[0]?.count || 1) {
  cloud.replaceChildren(); table.replaceChildren();
  if (!words.length) {
    cloud.append(node('p', 'No words to display. Try a broader selection.', 'word-description'));
    return;
  }
  for (const {word, count} of words) {
    const term = node('span', word, 'cloud-word');
    term.style.fontSize = `${14 + 30 * Math.sqrt(count / max)}px`;
    term.title = `${word}: ${count} occurrence${count === 1 ? '' : 's'}`;
    term.setAttribute('aria-label', term.title);
    cloud.append(term);
    const row = document.createElement('tr'); row.append(node('td', word), node('td', count.toLocaleString())); table.append(row);
  }
}
function renderWords() {
  renderWordCloud(wordFrequencies(filtered), $('word-cloud'), $('word-counts'));
}
function renderDistinctive(group, other) {
  const container = $(`distinctive-${group.side}`); container.replaceChildren();
  const words = distinctiveWords(group.records, other.records);
  if (!words.length) {
    container.append(node('p', 'No distinctive words meet the minimum of two narratives and a higher mention rate than the other group.', 'word-description'));
    return;
  }
  const table = document.createElement('table');
  table.append(node('caption', `Group ${group.side.toUpperCase()} (${group.records.length} narratives) versus group ${other.side.toUpperCase()} (${other.records.length})`));
  const head = document.createElement('thead'), heading = document.createElement('tr');
  for (const text of ['Word','This group','Other group','Gap']) {
    const th = node('th',text); th.scope = 'col'; heading.append(th);
  }
  head.append(heading); table.append(head);
  const body = document.createElement('tbody');
  for (const term of words) {
    const row = document.createElement('tr');
    row.append(node('th',term.word),node('td',`${term.count}/${group.records.length} (${(100*term.rate).toFixed(1)}%)`),node('td',`${term.otherCount}/${other.records.length} (${(100*term.otherRate).toFixed(1)}%)`),node('td',`+${term.gap.toFixed(1)} pp`));
    row.firstElementChild.scope = 'row'; body.append(row);
  }
  table.append(body); container.append(table);
}
function renderComparison() {
  const groups = ['a','b'].map(side => {
    const type = $(`compare-${side}`).value;
    const records = filterEvents(events, {type});
    return {side, type, records, words:wordFrequencies(records,20)};
  });
  const max = Math.max(1, ...groups.flatMap(group => group.words.map(term => term.count)));
  for (const {side, type, records, words} of groups) {
    $(`compare-count-${side}`).textContent = `${records.length} event narratives · ${type}`;
    $(`compare-warning-${side}`).textContent = records.length < 10 ? 'Small group: fewer than 10 records. Treat apparent differences cautiously.' : '';
    renderWordCloud(words, $(`compare-cloud-${side}`), $(`compare-words-${side}`), max);
    const counts = sentimentSummary(records);
    $(`compare-sentiment-${side}`).textContent = 'Predicted sentiment: ' + Object.entries(counts).filter(([label,count]) => label !== 'Unavailable' || count).map(([label,count]) => `${label.toLowerCase()} ${count} (${records.length ? (100*count/records.length).toFixed(1) : '0.0'}%)`).join(' · ');
  }
  renderDistinctive(groups[0],groups[1]);
  renderDistinctive(groups[1],groups[0]);
  $('comparison-status').textContent = groups[0].type === groups[1].type ? 'Both groups select the same event type; their results are identical.' : `Comparing ${groups[0].type} (${groups[0].records.length}) with ${groups[1].type} (${groups[1].records.length}).`;
}
for (const side of ['a','b']) $(`compare-${side}`).addEventListener('change', renderComparison);
function renderSentiment() {
  const summary = $('sentiment-summary'); summary.replaceChildren();
  if (!filtered.length) { summary.append(node('p', 'No matching narratives to analyze.', 'word-description')); return; }
  const counts = sentimentSummary(filtered);
  for (const [label, count] of Object.entries(counts)) {
    if (label === 'Unavailable' && !count) continue;
    const row = node('div', '', 'sentiment-row');
    const percent = 100 * count / filtered.length;
    row.append(node('span', label), node('span', `${count} (${percent.toFixed(1)}%)`));
    const track = node('div', '', 'sentiment-track');
    const bar = node('div', '', `sentiment-bar ${label.toLowerCase()}`); bar.style.width = `${percent}%`;
    track.append(bar); row.append(track); summary.append(row);
  }
}
function update() {
  visible = 12;
  filtered = filterEvents(events,{state:$('state').value,month:$('month').value,type:$('type').value});
  const summary = summarize(filtered); for (const key of Object.keys(summary)) $(key).textContent = summary[key].toLocaleString();
  $('status').textContent = `${filtered.length} of ${events.length} sample events match your filters.`;
  $('download').disabled = filtered.length === 0;
  $('download').textContent = filtered.length ? `Download filtered CSV (${filtered.length})` : 'No matching records to export';
  renderSentiment();
  renderWords();
  renderCards();
}
$('download').addEventListener('click', () => {
  if (!filtered.length) return;
  const url = URL.createObjectURL(new Blob([eventsCSV(filtered)], {type:'text/csv;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url; link.download = `weather-words-2024-${filtered.length}-events.csv`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
for (const id of ['state','month','type']) $(id).addEventListener('change', update);
$('reset').addEventListener('click',()=>{ for (const id of ['state','month','type']) $(id).value=''; update(); });
$('more').addEventListener('click',()=>{ const previous = visible; visible += 12; renderCards(); $('cards').children[previous]?.querySelector('h3')?.setAttribute('tabindex','-1'); $('cards').children[previous]?.querySelector('h3')?.focus(); });
try {
  const response = await fetch('events.json'); if (!response.ok) throw new Error(`HTTP ${response.status}`);
  events = await response.json();
  options('state',[...new Set(events.map(e=>e.STATE))].sort()); options('month',months); options('type',[...new Set(events.map(e=>e.EVENT_TYPE))].sort());
  const types = [...new Set(events.map(e => e.EVENT_TYPE))].sort();
  for (const [side, preferred] of [['a','Flash Flood'],['b','Tornado']]) {
    options(`compare-${side}`,types);
    $(`compare-${side}`).value = types.includes(preferred) ? preferred : types[0];
    $(`compare-${side}`).disabled = false;
  }
  renderComparison();
  update();
} catch (error) { $('comparison-status').textContent = 'Comparison unavailable: collection could not be loaded.'; $('download').textContent = 'Export unavailable'; $('status').textContent = 'The collection could not be loaded. Please refresh the page or check that the site is served over HTTP.'; console.error(error); }
