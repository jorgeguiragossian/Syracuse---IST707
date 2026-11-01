import {months, filterEvents, summarize, wordFrequencies} from './data.mjs';
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
    mark.title = `${group[1]} (${entity.label})`; mark.tabIndex = 0;
    mark.setAttribute('aria-label', `${entity.text}: ${group[1]}`);
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
    if (event.EPISODE_NARRATIVE.trim()) { const details = node('details',''); details.append(node('summary','Read broader episode context'),node('p',event.EPISODE_NARRATIVE.replace(/\|\|/g,'\n\n'),'narrative')); card.append(details); }
    card.append(node('p',`EVENT ${event.EVENT_ID} · EPISODE ${event.EPISODE_ID}`,'record-id')); cards.append(card);
  }
  $('more').hidden = visible >= filtered.length;
}
function renderWords() {
  const words = wordFrequencies(filtered);
  const cloud = $('word-cloud'); cloud.replaceChildren();
  const table = $('word-counts'); table.replaceChildren();
  if (!words.length) {
    cloud.append(node('p', 'No words to display. Try a broader selection.', 'word-description'));
    return;
  }
  const max = words[0].count;
  for (const {word, count} of words) {
    const term = node('span', word, 'cloud-word');
    term.style.fontSize = `${14 + 30 * Math.sqrt(count / max)}px`;
    term.title = `${word}: ${count} occurrence${count === 1 ? '' : 's'}`;
    term.setAttribute('aria-label', term.title);
    cloud.append(term);
    const row = document.createElement('tr'); row.append(node('td', word), node('td', count.toLocaleString())); table.append(row);
  }
}
function update() {
  visible = 12;
  filtered = filterEvents(events,{state:$('state').value,month:$('month').value,type:$('type').value});
  const summary = summarize(filtered); for (const key of Object.keys(summary)) $(key).textContent = summary[key].toLocaleString();
  $('status').textContent = `${filtered.length} of ${events.length} sample events match your filters.`;
  renderWords();
  renderCards();
}
for (const id of ['state','month','type']) $(id).addEventListener('change', update);
$('reset').addEventListener('click',()=>{ for (const id of ['state','month','type']) $(id).value=''; update(); });
$('more').addEventListener('click',()=>{ const previous = visible; visible += 12; renderCards(); $('cards').children[previous]?.querySelector('h3')?.setAttribute('tabindex','-1'); $('cards').children[previous]?.querySelector('h3')?.focus(); });
try {
  const response = await fetch('events.json'); if (!response.ok) throw new Error(`HTTP ${response.status}`);
  events = await response.json();
  options('state',[...new Set(events.map(e=>e.STATE))].sort()); options('month',months); options('type',[...new Set(events.map(e=>e.EVENT_TYPE))].sort());
  update();
} catch (error) { $('status').textContent = 'The collection could not be loaded. Please refresh the page or check that the site is served over HTTP.'; console.error(error); }
