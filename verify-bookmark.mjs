import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const app=fs.readFileSync('dist/app.js','utf8');
const functions=app.slice(app.indexOf('function saveBookmark('),app.indexOf('function home(){'));
const context=vm.createContext({assert,console});
vm.runInContext(`
const cards=Array.from({length:200},(_,i)=>({id:'b'+(i+1),word:'Word '+(i+1),page:2+Math.floor(i/10)}));
let bookmark=null,filters={from:2,to:241,search:''},view='library',visible=80,mode='new',queue=[],index=0,flipped=false,locked=false,records={},lastScroll='',lastFocus='',toasts=[];
const BOOKMARK_KEY='bridge-reading-bookmark-v1',memory={};
const localStorage={setItem(k,v){memory[k]=v},getItem(k){return memory[k]||null}};
const toast=t=>toasts.push(t),esc=String,phoneticsHtml=()=>'',validFilters=f=>f;
const selected=()=>cards.filter(c=>c.page>=filters.from&&c.page<=filters.to&&(!filters.search||c.word.includes(filters.search)));
const persistFilters=()=>{},requestAnimationFrame=f=>f();
const element={scrollIntoView(){lastScroll='scrolled'},focus(){lastFocus='focused'}};
const document={getElementById:id=>{lastScroll=id;return element}};
const $=()=>element;
function render(){queue=selected();index=0}
function showCard(){saveBookmark(queue[index])}
${functions}
assert(bookmarkCard().includes('Continue reading'));
saveBookmark(cards[149],'library',true);
assert.equal(JSON.parse(memory[BOOKMARK_KEY]).id,'b150');
bookmark=JSON.parse(localStorage.getItem(BOOKMARK_KEY));
resumeReading();assert.equal(view,'library');assert.equal(visible,150);assert.equal(lastFocus,'focused');
saveBookmark(cards[149],'cards');filters.search='Word 1';resumeReading();assert.equal(queue[index].id,'b150');assert.equal(bookmark.id,'b150');
saveBookmark(cards[199],'library');bookmark.filters={from:2,to:2,search:'absent'};resumeReading();assert.equal(filters.search,'');assert.equal(visible,200);
const original=bookmark;localStorage.setItem=()=>{throw Error('blocked')};saveBookmark(cards[0],'library',true);assert.equal(bookmark,original);assert(toasts.at(-1).includes('Could not save'));
`,context);
console.log('PASS: bookmark persistence, reload restore, library jump beyond 80 entries, exact study resume, stale-filter recovery and storage failure');
