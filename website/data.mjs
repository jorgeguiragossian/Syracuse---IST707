export const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export function filterEvents(events, {state = '', month = '', type = ''} = {}) {
  return events.filter(e => (!state || e.STATE === state) && (!month || e.MONTH_NAME === month) && (!type || e.EVENT_TYPE === type));
}
export function summarize(events) {
  return {count: events.length, narratives: events.filter(e => e.EVENT_NARRATIVE.trim()).length, areas: new Set(events.map(e => e.STATE)).size, types: new Set(events.map(e => e.EVENT_TYPE)).size};
}
