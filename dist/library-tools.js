// Optional library helpers. Learning progress remains in its existing database.
export function sourceKey(card){return JSON.stringify([card.word,card.meaning,card.examples||[]])}
export function createTranslator({fetcher=globalThis.fetch,cache}={}){
 const pending=new Map();
 async function segment(value){
  if(!value.trim())return '';
  const url=new URL('https://api.mymemory.translated.net/get');
  for(const [k,v] of Object.entries({langpair:'en|zh-TW',q:value}))url.searchParams.set(k,v);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{const r=await fetcher(url,{signal:controller.signal});if(!r.ok)throw Error('Translation service unavailable');const data=await r.json();
   if(data.quotaFinished||Number(data.responseStatus)===429)throw Error('Daily translation limit reached. Saved translations remain available; try new translations tomorrow.');
   if(Number(data.responseStatus)!==200||typeof data.responseData?.translatedText!=='string')throw Error('Translation unavailable. Please try again later.');
   const translated=data.responseData.translatedText.trim();
   if(!translated)throw Error('Empty translation response');return translated;
  }finally{clearTimeout(timer)}
 }
 async function text(value){
  const chunks=[];let chunk='';
  for(const character of value){if(new TextEncoder().encode(chunk+character).length>450){chunks.push(chunk);chunk=''}chunk+=character}
  if(chunk)chunks.push(chunk);
  const translated=[];for(const part of chunks)translated.push(await segment(part));return translated.join('');
 }
 return async card=>{
  const key=sourceKey(card);if(pending.has(key))return pending.get(key);
  const task=(async()=>{
   const saved=await cache?.get(key).catch(()=>null);
   if(saved&&typeof saved.word==='string'&&typeof saved.meaning==='string'&&Array.isArray(saved.examples)&&saved.examples.length===(card.examples||[]).length&&saved.examples.every(e=>typeof e==='string'))return {...saved,stored:true};
   const [word,meaning]=await Promise.all([text(card.word),text(card.meaning)]);
   const examples=[];for(const example of card.examples||[])examples.push(await text(example));
   const result={word,meaning,examples};let stored=false;
   if(cache)try{await cache.set(key,result);stored=true}catch{}
   return {...result,stored};
  })();pending.set(key,task);try{return await task}finally{pending.delete(key)}
 };
}
export function translationCache(){
 let connection;
 function open(){return connection??=new Promise((resolve,reject)=>{const request=indexedDB.open('bridge-library-translations',1);request.onupgradeneeded=()=>request.result.createObjectStore('translations');request.onsuccess=()=>resolve(request.result);request.onerror=()=>{connection=null;reject(request.error)}})}
 return {
  async get(key){const db=await open();return new Promise((resolve,reject)=>{const r=db.transaction('translations').objectStore('translations').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})},
  async set(key,value){const db=await open();return new Promise((resolve,reject)=>{const t=db.transaction('translations','readwrite');t.objectStore('translations').put(value,key);t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error)})}
 };
}
export function createSpeaker({synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance}={}){
 let active=null;
 return {stop(){synth?.cancel();active=null},speak(text,id,changed=()=>{}){
  if(!synth||!Utterance)throw Error('Speech is not supported in this browser.');
  const previous=active;synth.cancel();active=null;changed(null);
  if(previous===id)return;
  const u=new Utterance(text),voice=synth.getVoices().find(v=>v.lang.replace('_','-').toLowerCase()==='en-us')||synth.getVoices().find(v=>/^en[-_]/i.test(v.lang));
  if(voice)u.voice=voice;u.lang='en-US';u.rate=.9;
  u.onend=u.onerror=()=>{if(active===id){active=null;changed(null)}};
  active=id;changed(id);synth.speak(u);
 }};
}
