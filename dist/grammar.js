import nlp from './compromise.js';
export function analyzeSentence(text){
 const doc=nlp(text);const sentences=doc.sentences().json().map(s=>({text:s.text,subject:s.sentence?.subject||'',verb:s.sentence?.verb||'',predicate:s.sentence?.predicate||'',terms:s.terms.map(t=>({text:t.text,tags:t.tags})),grammar:s.sentence?.grammar||{}}));
 const notes=[];
 if(/\b(can|could|may|might|must|shall|should|will|would)\b/i.test(text))notes.push('情態助動詞後通常接原形動詞；例如 must 表示必須，should 常表示建議或應當。');
 if(/\b(has|have|had)\s+(?:\w+ly\s+)?(?:been|\w+ed|done|seen|gone|taken|written|made|known)\b/i.test(text))notes.push('可能包含完成式：have／has／had + 過去分詞。請依上下文判斷時間關係。');
 if(/\b(am|is|are|was|were|be|been)\s+\w+ing\b/i.test(text))notes.push('可能包含進行式：be + V-ing，通常用來描述正在進行或特定時段持續的動作。');
 if(/\b(am|is|are|was|were|be|been)\s+(?:\w+ed|given|taken|known|seen|made|written)\b/i.test(text))notes.push('be + 過去分詞可能表示被動語態，也可能描述狀態，需要配合語意判斷。');
 if(/\b(if|unless|when|while|because|although|before|after|until|since)\b/i.test(text))notes.push('句中的連接詞可能引導時間、條件、原因或讓步子句；先分清主句與從屬子句。');
 if(/\bto\s+\w+\b/i.test(text))notes.push('to 後接原形動詞時可構成不定詞；若 to 是介系詞，後面則可接名詞或 V-ing。');
 if(/\b(not|never|cannot|can't|don't|doesn't|didn't|isn't|aren't|wasn't|weren't)\b/i.test(text))notes.push('這個句子包含否定語意；注意否定詞與助動詞的位置。');
 return {sentences,notes,verbs:doc.verbs().json().map(v=>({text:v.text,root:v.verb?.root||'',tense:v.verb?.grammar?.tense||'',negative:!!v.verb?.negative}))};
}
export function partOfSpeech(tags){for(const [tag,label] of [['Modal','情態助動詞'],['Auxiliary','助動詞'],['Pronoun','代名詞'],['Verb','動詞'],['Adjective','形容詞'],['Adverb','副詞'],['Preposition','介系詞'],['Conjunction','連接詞'],['Determiner','限定詞／冠詞'],['Noun','名詞'],['Value','數量詞']])if(tags.includes(tag))return label;return '其他／待判讀'}
