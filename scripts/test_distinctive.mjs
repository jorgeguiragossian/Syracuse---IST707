import test from 'node:test';
import assert from 'node:assert/strict';
import {distinctiveWords} from '../website/data.mjs';
const docs = texts => texts.map(EVENT_NARRATIVE => ({EVENT_NARRATIVE}));
test('normalizes by narratives, not raw counts, and ignores within-report repetition',()=>{
 const a=docs(['flood flood flood the 2024','FLOOD and roads','roads']);
 const b=docs(['flood','wind','wind','wind','wind','wind']);
 const terms=distinctiveWords(a,b);
 const flood=terms.find(t=>t.word==='flood');
 assert.equal(flood.count,2);assert.equal(flood.otherCount,1);assert.equal(flood.gap,50);
 assert.equal(terms[0].word,'roads');assert(!terms.some(t=>t.word==='the'));
});
test('identical or empty groups have no distinctive terms',()=>{
 const a=docs(['flood roads','flood wind']);
 assert.deepEqual(distinctiveWords(a,a),[]);
 assert.deepEqual(distinctiveWords([],a),[]);assert.deepEqual(distinctiveWords(a,[]),[]);
});
test('single-document terms are excluded, ties alphabetical, limit respected',()=>{
 const a=docs(['beta alpha singleton','beta alpha']);const b=docs(['wind','wind']);
 assert.deepEqual(distinctiveWords(a,b).map(t=>t.word),['alpha','beta']);
 assert.equal(distinctiveWords(a,b,1).length,1);
});
