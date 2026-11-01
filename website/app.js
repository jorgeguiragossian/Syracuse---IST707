import {months, filterEvents, summarize} from './data.mjs';
const $ = id => document.getElementById(id);
let events = [], filtered = [], visible = 12;
function node(tag, text, cls) { const el = document.createElement(tag); el.textContent = text; if (cls) el.className = cls; return el; }
function options(id, values) { for (const value of values) { const option = node('option',value); option.value = value; $(id).append(option); } }
function renderCards() {
  const cards = $('cards'); cards.replaceChildren();
  if (!filtered.length) {
    const empty = node('div', '', 'empty'); empty.append(node('h3','No events in this selection'),node('p','Try another month, area, or event type. This collection contains only 200 sampled records.')); cards.append(empty);
  }
  for (const event of filtered.slice(0, visible)) {
    const card = node('article', '', 'card');
    const meta = node('div', '', 'card-meta'); meta.append(node('span', event.EVENT_TYPE, 'event-tag'),node('span',event.STATE.replaceAll('_',' ')));
    const title = event.BEGIN_LOCATION || event.CZ_NAME || event.STATE;
    card.append(meta,node('h3',title.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())),node('p',event.BEGIN_DATE_TIME+' · '+event.CZ_TIMEZONE,'date'),node('p',event.EVENT_NARRATIVE.replace(/\|\|/g,'\n\n'),'narrative'));
    if (event.EPISODE_NARRATIVE.trim()) { const details = node('details',''); details.append(node('summary','Read broader episode context'),node('p',event.EPISODE_NARRATIVE.replace(/\|\|/g,'\n\n'),'narrative')); card.append(details); }
    card.append(node('p',`EVENT ${event.EVENT_ID} · EPISODE ${event.EPISODE_ID}`,'record-id')); cards.append(card);
  }
  $('more').hidden = visible >= filtered.length;
}
function update() {
  visible = 12;
  filtered = filterEvents(events,{state:$('state').value,month:$('month').value,type:$('type').value});
  const summary = summarize(filtered); for (const key of Object.keys(summary)) $(key).textContent = summary[key].toLocaleString();
  $('status').textContent = `${filtered.length} of ${events.length} sample events match your filters.`;
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
