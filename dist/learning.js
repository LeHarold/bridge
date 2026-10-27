export const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function examplesFor(c){return Array.isArray(c.examples)?c.examples:(c.example||'').split(/\s+-\s*(?=[A-Z"“])|\n+/).map(s=>s.trim()).filter(Boolean)}
export function examplesHtml(c){const items=examplesFor(c);return items.length?items.map(s=>`<p class="example-line">${escapeHtml(s)}</p>`).join(''):'<p class="example-line muted">No example available in this entry.</p>'}
export function phoneticsHtml(c){return `<span class="phonetic" title="American pronunciation in KK notation${c.kkKind==='phrase'?'; phrase assembled word by word':''}">KK ${escapeHtml(c.kk||'Not available')}</span>`}
export function validFilters(filters,cards,records){
 const tags=new Set(Object.values(records).flatMap(r=>r.tags||[]));
 const next={...filters};
 if(next.tag&&!tags.has(next.tag))next.tag='';
 if(next.end&&!cards.some(c=>c.id===next.end&&c.page>=next.from&&c.page<=next.to))next.end='';
 return next;
}
export function matchingCards(cards,records,filters,status){
 const end=filters.end?cards.findIndex(c=>c.id===filters.end):cards.length-1;
 const query=(filters.search||'').trim().toLowerCase();
 return cards.filter((c,i)=>c.page>=filters.from&&c.page<=filters.to&&i<=end&&(!filters.tag||(records[c.id]?.tags||[]).includes(filters.tag))&&(!filters.state||status(records[c.id]||{})===filters.state)&&(!query||(c.word+' '+c.meaning+' '+examplesFor(c).join(' ')).toLowerCase().includes(query)));
}
export function printHtml(cards,records,filters,status){
 const range=matchingCards(cards,records,filters,status);
 return `<h1>THE BRIDGE · Word list</h1><p class="print-summary">Book pages ${range[0]?.page??filters.from}–${range.at(-1)?.page??filters.to} · ${range.length} words${filters.end?' · Through: '+escapeHtml(cards.find(c=>c.id===filters.end)?.word):''}${filters.tag?' · Tag: '+escapeHtml(filters.tag):''}${filters.search?' · Search: '+escapeHtml(filters.search):''}</p>${range.map((c,i)=>`<article class="print-word"><div><strong>${i+1}. ${escapeHtml(c.word)}</strong> ${phoneticsHtml(c)} <span class="print-page">Book p.${c.page}</span></div><p>${escapeHtml(c.meaning)}</p><div class="print-examples">${examplesHtml(c)}</div>${records[c.id]?.tags?.length?`<small>Tags: ${escapeHtml(records[c.id].tags.join(', '))}</small>`:''}</article>`).join('')}`;
}
