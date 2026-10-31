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
const buttons=cards.map(c=>({dataset:{id:c.id},classList:{toggle(k,v){this.active=v}},setAttribute(k,v){this[k]=v},innerHTML:''}));
const document={querySelectorAll:()=>buttons,getElementById:id=>{lastScroll=id;return element}};
const $=()=>element;
function render(){queue=selected();index=0}
function showCard(){}
function syncFloatingTools(){}
${functions}
assert(bookmarkCard().includes('Continue reading'));
toggleBookmark(cards[0],'library');assert(bookmarkCard().includes('Word 1'));assert.equal(bookmark.id,'b1');assert.equal(buttons[0]['aria-pressed'],'true');assert(buttons[0].innerHTML.includes('Bookmarked'));
toggleBookmark(cards[0],'library');assert.equal(bookmark,null);assert.equal(JSON.parse(memory[BOOKMARK_KEY]),null);assert.equal(buttons[0]['aria-pressed'],'false');
toggleBookmark(cards[0],'library');toggleBookmark(cards[1],'library');assert.equal(bookmark.id,'b2');assert.equal(buttons[0]['aria-pressed'],'false');assert.equal(buttons[1]['aria-pressed'],'true');
assert(bookmarkButton(cards[1]).includes('aria-pressed="true"'));
saveBookmark(cards[149],'library',true);
assert.equal(JSON.parse(memory[BOOKMARK_KEY]).id,'b150');
bookmark=JSON.parse(localStorage.getItem(BOOKMARK_KEY));
resumeReading();assert.equal(view,'library');assert.equal(visible,150);assert.equal(lastFocus,'focused');
saveBookmark(cards[149],'cards');filters.search='Word 1';resumeReading();assert.equal(queue[index].id,'b150');assert.equal(bookmark.id,'b150');
saveBookmark(cards[199],'library');bookmark.filters={from:2,to:2,search:'absent'};resumeReading();assert.equal(filters.search,'');assert.equal(visible,200);
const original=bookmark;localStorage.setItem=()=>{throw Error('blocked')};saveBookmark(cards[0],'library',true);assert.equal(bookmark,original);assert(toasts.at(-1).includes('Could not save'));
toggleBookmark(cards[199],'library');assert.equal(bookmark,original);assert(toasts.at(-1).includes('Could not remove'));
`,context);
assert(!app.slice(app.indexOf('function showCard(){'),app.indexOf('function next(){')).includes('saveBookmark(c)'));
console.log('PASS: bookmark toggle, green light, cancellation persisted, replacement, reload restore, exact resume, stale-filter recovery and storage failure; browsing does not overwrite bookmark');
