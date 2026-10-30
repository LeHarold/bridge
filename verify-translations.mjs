import assert from 'node:assert/strict';
import fs from 'node:fs';
const cards=JSON.parse(fs.readFileSync('dist/cards.json','utf8'));
const translations=JSON.parse(fs.readFileSync('dist/offline-translations.json','utf8'));
assert.equal(cards.length,2517);
assert.equal(Object.keys(translations).length,cards.length);
let examples=0;
for(const card of cards){
 const t=translations[card.id];assert(t,'Missing '+card.id);
 for(const field of ['word','meaning']){assert.equal(typeof t[field],'string',card.id+' '+field);assert(/[\u3400-\u9fff]/u.test(t[field]),card.id+' '+field+' needs Chinese');assert(!t[field].includes('▁'),card.id+' tokenizer artifact');assert.notEqual(t[field],card[field],card.id+' untranslated '+field)}
 assert(Array.isArray(t.examples),card.id+' examples');assert.equal(t.examples.length,card.examples.length,card.id+' example alignment');
 t.examples.forEach((text,i)=>{assert.equal(typeof text,'string');assert(text.trim(),card.id+' empty example');assert(/[\u3400-\u9fff]/u.test(text),card.id+' example '+i+' needs Chinese');assert(!text.includes('▁'),card.id+' example artifact');assert.notEqual(text,card.examples[i],card.id+' untranslated example')});
 assert.notEqual(t.review,'draft',card.id+' unreviewed draft');examples+=t.examples.length;
}
const sw=fs.readFileSync('dist/sw.js','utf8');assert(sw.includes("'./offline-translations.json'"));
const app=fs.readFileSync('dist/app.js','utf8');assert(!app.includes('createTranslator('));assert(!app.includes('api.mymemory'));
console.log(`PASS: ${cards.length} Chinese word glosses and definitions, ${examples} aligned example translations, no draft/tokenizer artifacts, bundled offline asset and no live translation request`);
