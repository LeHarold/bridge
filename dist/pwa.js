const installButton=document.querySelector('#installApp'),status=document.querySelector('#offlineStatus'),dialog=document.querySelector('#installHelp');
let installPrompt=null;
installButton.addEventListener('click',async()=>{
 if(installPrompt){const pending=installPrompt;installPrompt=null;await pending.prompt();await pending.userChoice;return}
 dialog.showModal();
});
document.querySelector('#closeInstallHelp').onclick=()=>dialog.close();
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;installButton.textContent='Install app ↓'});
window.addEventListener('appinstalled',()=>{installButton.textContent='App installed ✓';installPrompt=null});
if(window.matchMedia('(display-mode: standalone)').matches)installButton.textContent='App installed ✓';
function connectionLabel(ready){status.textContent=ready?(navigator.onLine?'● Ready for offline use':'● Offline · Saved on this device'):'Preparing offline download…'}
async function inspect(worker){if(!worker)return;const channel=new MessageChannel();channel.port1.onmessage=e=>{connectionLabel(e.data.ready);document.querySelector('#offlineHelpStatus').textContent=e.data.ready?'All words, examples and pronunciations are downloaded. You can now use this app without a connection.':'Keep this page open online until the download completes.';channel.port1.close()};worker.postMessage({type:'OFFLINE_STATUS'},[channel.port2])}
if('serviceWorker'in navigator&&window.isSecureContext){
 let alreadyControlled=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(alreadyControlled){location.reload();return}alreadyControlled=true;inspect(navigator.serviceWorker.controller)});
 navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(async registration=>{await navigator.serviceWorker.ready;await inspect(registration.active);registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='activated')inspect(worker)})});registration.update().catch(()=>{})}).catch(()=>{status.textContent='Offline setup unavailable · Open in a full browser';document.querySelector('#offlineHelpStatus').textContent='Open this website in Chrome, Edge or Safari, then try again.'});
 for(const event of ['online','offline'])window.addEventListener(event,()=>inspect(navigator.serviceWorker.controller));
}else{status.textContent='Offline setup needs a supported browser';document.querySelector('#offlineHelpStatus').textContent='Open the HTTPS website in Chrome, Edge or Safari.'}
