import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validFilters,matchingCards,examplesFor,examplesHtml,printHtml} from './dist/learning.js';
import {status} from './dist/logic.js';
import {question} from './dist/questions.js';
const cards=JSON.parse(fs.readFileSync('dist/cards.json','utf8'));
const filters={from:2,to:241,end:'',tag:'Temporary',state:'',search:''};
const records={[cards[0].id]:{id:cards[0].id,tags:['Temporary'],streak:0}};
assert.equal(matchingCards(cards,records,filters,status).length,1);
records[cards[0].id].tags=[];
const clean=validFilters(filters,cards,records);
assert.equal(clean.tag,'');
assert(matchingCards(cards,records,{...clean,search:'absorb shock'},status).some(c=>c.id===cards[0].id));
assert.equal(matchingCards(cards,records,{...clean,from:2,to:2,end:cards[1].id},status).length,2);
const multiple=cards.find(c=>examplesFor(c).length>1);
assert.equal((examplesHtml(multiple).match(/class="example-line"/g)||[]).length,examplesFor(multiple).length);
assert(!examplesHtml({examples:['<img onerror=alert(1)>']}).includes('<img'));
assert(cards.every(c=>c.kk?.startsWith('[')&&!c.kk.includes('?')));
assert(cards.every(c=>Array.isArray(c.examples)));
const printed=printHtml(cards,{},clean,status);
assert.equal((printed.match(/class="print-word"/g)||[]).length,cards.length);
assert(printed.includes('Book p.2')&&printed.includes('KK ['));
assert.equal(question({word:'test',meaning:'A trial',examples:['A test is useful.','The test was easy.']},true).kind,'Sentence blank');
console.log('PASS: stale-tag removal → search, page/end range, separate examples, escaping, KK coverage, full-range print, quiz compatibility');
// Exercise the actual service worker against an in-memory browser cache.
const handlers={},stores=new Map(),origin='https://bridge.test/bridge/';let offline=false,claimed=false;
function cache(){const entries=new Map();return {async addAll(requests){for(const r of requests){const url=new URL(typeof r==='string'?r:r.url,origin);assert(url.pathname.startsWith('/bridge/'));const name=url.pathname.slice('/bridge/'.length)||'index.html';assert(fs.existsSync('dist/'+name),name);entries.set(url.pathname,new Response(fs.readFileSync('dist/'+name)))}},async match(request){const url=new URL(typeof request==='string'?request:request.url,origin);return entries.get(url.pathname)?.clone()}}}
const caches={async open(key){if(!stores.has(key))stores.set(key,cache());return stores.get(key)},async keys(){return [...stores.keys()]},async delete(key){return stores.delete(key)}};
class LocalRequest extends Request{constructor(url,options){super(new URL(url,origin),options)}}
const worker={registration:{scope:origin},location:{origin:new URL(origin).origin},clients:{async claim(){claimed=true}},async skipWaiting(){},addEventListener(name,handler){handlers[name]=handler}};
vm.runInNewContext(fs.readFileSync('dist/sw.js','utf8'),{self:worker,caches,URL,Request:LocalRequest,Response,fetch:async()=>{if(offline)throw Error('Network disconnected');return new Response('network')}});
await stores.set('unrelated-data',cache());
async function run(name,event={}){let done;handlers[name]({...event,waitUntil(p){done=p}});await done}
await run('install');await run('activate');assert(claimed);assert(stores.has('unrelated-data'));
offline=true;
for(const asset of ['','cards.json','app.js','questions.js','learning.js','icon-192.png']){let response;handlers.fetch({request:{url:origin+asset,method:'GET',mode:asset?'cors':'navigate'},respondWith(p){response=p}});assert.equal((await response).status,200);assert((await (await response).arrayBuffer()).byteLength>0)}
let result;await run('message',{data:{type:'OFFLINE_STATUS'},ports:[{postMessage(value){result=value}}]});assert.equal(result.ready,true);
const manifest=JSON.parse(fs.readFileSync('dist/manifest.webmanifest','utf8'));assert.equal(manifest.display,'standalone');assert(manifest.icons.some(i=>i.sizes==='512x512'));
assert.equal(new URL(manifest.start_url,origin+'manifest.webmanifest').href,origin);assert.equal(new URL(manifest.scope,origin).href,origin);
console.log('PASS: install precaches real files, activation, offline navigation/data/modules/icons, readiness message, install manifest');
