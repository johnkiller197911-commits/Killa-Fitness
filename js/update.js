(()=>{'use strict';
const VERSION='9.5.2',BUILD=952,CHECK_MS=3*60*1000;
let checking=false,installing=false,remindUntil=Number(sessionStorage.getItem('killa-update-remind-until'))||0,pending=null,registration=null;
const activeWorkout=()=>Boolean(typeof state!=='undefined'&&state.draft);
const dialogOpen=()=>!!document.getElementById('killa-update');
function showUpdate(release){
  pending=release;
  if(activeWorkout()||dialogOpen()||Date.now()<remindUntil)return;
  const dialog=document.createElement('dialog');dialog.id='killa-update';
  dialog.style.cssText='max-width:420px;width:min(90vw,420px);background:#101713;color:#fff;border:1px solid #86e535;border-radius:16px;padding:24px;box-shadow:0 20px 80px #000b';
  const heading=document.createElement('h2');heading.textContent='KILLA FITNESS · UPDATE AVAILABLE';heading.style.color='#86e535';dialog.append(heading);
  const version=document.createElement('p');version.textContent='Installed V'+VERSION+'  →  Available V'+release.version;dialog.append(version);
  const notes=document.createElement('ul');
  for(const n of (Array.isArray(release.notes)?release.notes:[]).slice(0,8)){const item=document.createElement('li');item.textContent=String(n);notes.append(item)}dialog.append(notes);
  const status=document.createElement('p');status.textContent='Your workout history and settings will stay on this device.';dialog.append(status);
  const update=document.createElement('button');update.type='button';update.textContent='UPDATE NOW';update.style.cssText='display:block;width:100%;padding:14px;border:0;border-radius:8px;background:#86e535;color:#101710;font-weight:800';dialog.append(update);
  const later=document.createElement('button');later.type='button';later.textContent='REMIND ME LATER';later.style.cssText='display:block;width:100%;padding:12px;margin-top:10px';dialog.append(later);
  function dismiss(){remindUntil=Date.now()+15*60*1000;sessionStorage.setItem('killa-update-remind-until',String(remindUntil));dialog.close();dialog.remove()}
  later.onclick=dismiss;dialog.addEventListener('cancel',e=>{e.preventDefault();dismiss()});
  update.onclick=async()=>{
    if(activeWorkout()){status.textContent='Finish your active workout before updating.';return}
    update.disabled=true;status.textContent='Downloading and preparing the update…';
    try{
      registration=registration||await navigator.serviceWorker.getRegistration();
      if(!registration)throw Error('Update service is unavailable.');
      await registration.update();
      let worker=registration.waiting;
      if(!worker&&registration.installing){
        worker=registration.installing;
        await new Promise((resolve,reject)=>{
          const timeout=setTimeout(()=>reject(Error('Download timed out. Please retry.')),45000);
          const onState=()=>{if(worker.state==='installed'){clearTimeout(timeout);resolve()}else if(worker.state==='redundant'){clearTimeout(timeout);reject(Error('Update could not be installed.'))}};
          worker.addEventListener('statechange',onState);onState()
        });
      }
      worker=registration.waiting;
      if(!worker)throw Error('The update is still preparing. Try again shortly.');
      if(activeWorkout())throw Error('Finish your active workout before updating.');
      installing=true;
      const timeout=setTimeout(()=>{if(installing){installing=false;update.disabled=false;status.textContent='Activation timed out. Please try again.'}},30000);
      window.__killaUpdateTimeout=timeout;
      worker.postMessage({type:'SKIP_WAITING'});
      status.textContent='Installing update…';
    }catch(err){installing=false;update.disabled=false;status.textContent=err.message||'Could not update; try again.'}
  };
  document.body.append(dialog);dialog.showModal();
}
navigator.serviceWorker?.addEventListener('controllerchange',()=>{
  if(installing){clearTimeout(window.__killaUpdateTimeout);installing=false;window.location.reload()}
});
async function check(manual=false){
  if(checking||installing||document.visibilityState==='hidden')return;
  checking=true;
  try{
    if(!navigator.onLine)throw Error('You are offline.');
    const url=new URL('version.json',document.baseURI);url.searchParams.set('check',String(Date.now()));
    const response=await fetch(url,{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
    if(!response.ok)throw Error('Update check failed ('+response.status+').');
    const release=await response.json();
    if(!Number.isSafeInteger(release.build)||typeof release.version!=='string')throw Error('Invalid update information.');
    if(release.build>BUILD){
      registration=await navigator.serviceWorker.getRegistration();
      if(!registration)throw Error('Update service is not ready.');
      pending=release;
      if(activeWorkout()){
        if(manual)alert('V'+release.version+' is available. Finish your workout first.');
      }else if(manual||Date.now()>remindUntil)showUpdate(release);
    }else{pending=null;if(manual)alert('KILLA FITNESS V'+VERSION+' is up to date.')}
  }catch(err){if(manual)alert(err.message||'Unable to check updates.')}finally{checking=false}
}

// Prevent Chrome/Samsung Internet pull-to-refresh when this standalone PWA is scrolled to the top.
// Preserve normal downward scrolling, form controls, and ordinary touch gestures.
(()=>{let startY=0,startX=0;
document.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;startY=e.touches[0].clientY;startX=e.touches[0].clientX},{passive:true});
document.addEventListener('touchmove',e=>{
 if(e.touches.length!==1||!e.cancelable)return;
 const t=e.target;
 if(t.closest('input,textarea,select,[contenteditable="true"]'))return;
 const dy=e.touches[0].clientY-startY,dx=e.touches[0].clientX-startX;
 if(dy<8||Math.abs(dy)<Math.abs(dx))return;
 let node=t;while(node&&node!==document.documentElement){
   if(node.scrollHeight>node.clientHeight+1 && getComputedStyle(node).overflowY!=='visible'){
      if(node.scrollTop>0)return;
   }
   node=node.parentElement;
 }
 if(window.scrollY<=0)e.preventDefault();
},{passive:false});
})();

window.killaCheckUpdate=check;
setTimeout(()=>check(),2500);
setInterval(()=>{if(pending&&!activeWorkout()&&Date.now()>remindUntil)showUpdate(pending);check()},CHECK_MS);
window.addEventListener('online',()=>check());
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
})();