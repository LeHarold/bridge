import {examplesFor} from './learning.js';
const escapeRegex=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function clozeExample(card){
 const example=(card.example||'').trim();
 if(!example)return null;
 const word=card.word.replace(/\s*\((?:adj\.?|adv\.?|n|v|n\+v)\)\s*$/i,'').trim();
 const words=word.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g)||[];
 if(!words.length||/\b(?:sb|sth|someone|somebody|something)\b/i.test(word))return null;
 let pattern=words.map(escapeRegex).join('[\\s-]+');
 if(words.length===1){const w=words[0];const forms=new Set([w,w+'s',w+'es',w+'d',w+'ed',w+'ing']);if(w.endsWith('e'))forms.add(w.slice(0,-1)+'ing');if(w.endsWith('y')){forms.add(w.slice(0,-1)+'ied');forms.add(w.slice(0,-1)+'ies')}pattern=[...forms].sort((a,b)=>b.length-a.length).map(escapeRegex).join('|')}
 const re=new RegExp('\\b(?:'+pattern+')\\b','gi');
 if(!re.test(example))return null;
 re.lastIndex=0;
 const answers=[...example.matchAll(re)].map(m=>m[0]);
 re.lastIndex=0;
 return {text:example.replace(re,'_____'),answers};
}
export function cloze(card){for(const example of examplesFor(card)){for(const word of card.answers||[card.word]){const result=clozeExample({...card,word,example});if(result)return result}}return null}
export function question(card,preferExample){const answers=card.answers||[card.word];const gap=preferExample?cloze(card):null;return gap?{kind:'Sentence blank',text:gap.text,answers:[...answers,...gap.answers]}:{kind:'Definition',text:card.meaning,answers}}
