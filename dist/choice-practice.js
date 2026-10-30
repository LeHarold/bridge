import {cloze} from './questions.js';
export function shuffle(items,random=Math.random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function distance(a,b){let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]!==b[j-1]));row=next}return row[b.length]}
const normal=s=>s.toLowerCase().replace(/[^a-z]/g,'');
export function makeChoice(card,cards,mode,translation,random=Math.random,sentences=[]){
 const gap=mode==='sentence'?cloze(card,sentences):null;
 if(mode==='sentence'&&!gap)return null;
 if(mode==='chinese'&&!translation?.word)return null;
 const accepted=new Set((card.answers||[card.word]).map(normal));
 const seen=new Set();
 const candidates=shuffle(cards,random).filter(c=>{const w=normal(c.word),sameAnswers=(c.answers||[c.word]).some(a=>accepted.has(normal(a)));if(!w||sameAnswers||seen.has(w)||c.meaning===card.meaning)return false;seen.add(w);return true}).map(c=>({card:c,score:distance(normal(card.word),normal(c.word))+(c.word.split(' ').length===card.word.split(' ').length?0:3)+(c.partOfSpeech&&card.partOfSpeech&&c.partOfSpeech!==card.partOfSpeech?3:0)})).sort((a,b)=>a.score-b.score).slice(0,12);
 if(candidates.length<3)return null;
 const options=shuffle([card,...shuffle(candidates,random).slice(0,3).map(x=>x.card)],random).map(c=>({id:c.id,text:c.word}));
 return {kind:mode,text:mode==='chinese'?translation.word:mode==='sentence'?gap.text:card.meaning,correctId:card.id,options,answer:card.word,definition:card.meaning};
}
