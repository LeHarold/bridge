import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createTranslator,createSpeaker,sourceKey} from './dist/library-tools.js';
const card={id:'b6',word:'abide by',meaning:'to obey',examples:['They abide by the rules.','We abide by the decision.']};
const data=new Map(),cache={async get(k){return data.get(k)},async set(k,v){data.set(k,v)}};let calls=0;
const fetcher=async url=>{calls++;assert.equal(url.origin,'https://api.mymemory.translated.net');assert.equal(url.searchParams.get('langpair'),'en|zh-TW');assert(new TextEncoder().encode(url.searchParams.get('q')).length<=450);return {ok:true,async json(){return {responseStatus:200,responseData:{translatedText:'中文：'+url.searchParams.get('q')}}}}};
const translate=createTranslator({fetcher,cache});
const [a,b]=await Promise.all([translate(card),translate(card)]);assert.equal(calls,4);assert.deepEqual(a,b);assert.equal(a.examples.length,2);assert(a.stored);
const offline=createTranslator({fetcher:async()=>{throw Error('offline')},cache});assert.deepEqual(await offline(card),a);assert.equal(calls,4);
assert.notEqual(sourceKey(card),sourceKey({...card,meaning:'different'}));
await assert.rejects(()=>offline({...card,meaning:'different'}),/offline/);
const quota=createTranslator({fetcher:async()=>({ok:true,json:async()=>({responseStatus:429,quotaFinished:true})})});await assert.rejects(()=>quota(card),/Daily translation limit/);
const malformed=createTranslator({fetcher:async()=>({ok:true,json:async()=>({responseStatus:200,responseData:{}})})});await assert.rejects(()=>malformed(card),/unavailable/);
const noStorage=createTranslator({fetcher,cache:{async get(){throw Error()},async set(){throw Error()}}});assert.equal((await noStorage(card)).stored,false);
await translate({...card,meaning:'x'.repeat(1200)});
let spoken,canceled=0,active;
class Utterance{constructor(text){this.text=text}}
const synth={getVoices:()=>[{lang:'en-US',name:'English'}],cancel(){canceled++},speak(u){spoken=u}};
const speaker=createSpeaker({synth,Utterance});speaker.speak(card.word,'word',id=>active=id);assert.equal(spoken.text,'abide by');assert.equal(spoken.lang,'en-US');assert.equal(active,'word');speaker.speak(card.word,'word',id=>active=id);assert.equal(active,null);speaker.speak(card.examples[1],'example',id=>active=id);assert.equal(spoken.text,card.examples[1]);spoken.onend();assert.equal(active,null);assert(canceled>=3);
assert.throws(()=>createSpeaker({synth:null,Utterance:null}).speak('test','test'),/not supported/);
const app=fs.readFileSync('dist/app.js','utf8');
vm.runInNewContext(app.slice(app.indexOf('const translations='),app.indexOf('function saveBookmark('))+`
translations.set('b6',{open:true,data:{word:'遵守',meaning:'服從',examples:['他們遵守規則。','我們遵從決定。']}});
const html=row(card,true);assert(html.includes('遵守'));assert(html.includes('服從'));assert(html.indexOf('他們遵守規則。')<html.indexOf('我們遵從決定。'));assert.equal((html.match(/audioButton/g)||[]).length,3);
translations.set('b6',{open:false,data:{word:'遵守'}});assert(!row(card,true).includes('遵守'));
`,{assert,card,createTranslator:()=>()=>{},translationCache:()=>({}),createSpeaker:()=>({}),esc:s=>String(s??'').replaceAll('<','&lt;'),phoneticsHtml:()=>'',rec:()=>({tags:[]}),lamp:()=>''});
console.log('PASS: separate word/example audio, stop toggle, English voice, translations aligned under source, hide/show, cached offline reuse, request deduplication, source changes, long text, limits and failures');
