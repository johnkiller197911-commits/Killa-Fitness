/* v28.js */
/* KILLA FITNESS v2.8: additive enhancement. Legacy killa-fitness-v1 data remains unchanged. */
(()=>{'use strict';
const PKEY='killa-fitness-v28-preferences', safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
const prefs=Object.assign({goal:5,units:'kg',quick:true,rest:90,compact:false},get(PKEY,{}));
const persist=()=>localStorage.setItem(PKEY,JSON.stringify(prefs));
const el=(id)=>document.getElementById(id), date=d=>new Date(d).toLocaleDateString(undefined,{month:'short',day:'numeric'});
const volume=h=>Number.isFinite(+h.volume)?+h.volume:(h.exercises||[]).reduce((a,e)=>a+(e.sets||[]).reduce((b,s)=>b+(+s.kg||0)*(+s.reps||0),0),0);
const sessions=()=>Array.isArray(data?.history)?data.history:[];
const weekStart=()=>{let d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d};
const currentWeek=()=>sessions().filter(h=>new Date(h.date)>=weekStart());
const workouts=()=>data?.program||[];
function inject(id,container,html,position='beforeend'){let n=el(id);if(!n&&container){container.insertAdjacentHTML(position,html);n=el(id)}return n}
function dash(){const host=el('dashboard');if(!host)return;let w=currentWeek(),total=w.reduce((a,h)=>a+volume(h),0),last=sessions().at(-1),goal=Math.max(1,Number(prefs.goal)||5),pct=Math.min(100,Math.round(w.length/goal*100)),pbr=Object.keys(typeof getPBs==='function'?getPBs():{}).length;
const ongoing=Object.values(data.draft||{}).some(v=>Object.values(v||{}).some(x=>x&&((x.sets||[]).some(s=>s?.kg!==''&&s?.kg!=null)||x.done)));
const html=`<div class="v28-hero"><div><small>YOUR TRAINING TODAY</small><h2>${safe(workouts()[day]?.name||'Ready to train?')}</h2><p>${ongoing?'Unfinished workout saved — pick up where you left off.':'Make every set count.'}</p></div><button class="primary v28-cta" id="v28-start">${ongoing?'↗ RESUME WORKOUT':'▶ START WORKOUT'}</button></div><div class="v28-stats"><div><small>WEEKLY SESSIONS</small><strong>${w.length}/${goal}</strong></div><div><small>TRAINING VOLUME</small><strong>${Math.round(total).toLocaleString()} kg</strong></div><div><small>PERSONAL RECORDS</small><strong>${pbr}</strong></div></div><div class="v28-progress"><div><strong>Weekly training goal</strong><span>${pct}%</span></div><div class="v28-track"><i style="width:${pct}%"></i></div><small>${w.length} of ${goal} sessions logged this week</small></div><div class="v28-last">${last?'Last session: '+safe(last.name)+' · '+date(last.date):'Your first completed workout will appear here.'}</div>`;
const n=inject('v28-dashboard',host,'<section id="v28-dashboard" class="v28-panel"></section>','afterbegin');n.innerHTML=html;n.querySelector('#v28-start').onclick=()=>switchView('workout');}
function quick(){const host=el('workout');if(!host||!prefs.quick)return;const rows=host.querySelectorAll('.exercise');rows.forEach((row,i)=>{let body=row.querySelector('.body');if(!body||body.querySelector('.v28-quick'))return;let ex=workouts()[day]?.ex?.[i];if(!ex)return;let previousEntry=typeof previous==='function'?previous(ex.name):null;let controls=document.createElement('div');controls.className='v28-quick';controls.innerHTML=`<div class="v28-quick-head"><strong>QUICK SET ENTRY</strong><small>Previous: ${previousEntry?.sets?.[0]?safe(previousEntry.sets[0].kg)+' kg × '+safe(previousEntry.sets[0].reps):'No previous set'}</small></div><div class="v28-quick-controls"><label>Weight (kg)<div><button type="button" data-kind="kg" data-step="-2.5" aria-label="Decrease weight">−</button><input data-kind="kg" type="number" min="0" step="0.5" inputmode="decimal" aria-label="Quick weight"><button type="button" data-kind="kg" data-step="2.5" aria-label="Increase weight">+</button></div></label><label>Reps<div><button type="button" data-kind="reps" data-step="-1" aria-label="Decrease repetitions">−</button><input data-kind="reps" type="number" min="0" step="1" inputmode="numeric" aria-label="Quick repetitions"><button type="button" data-kind="reps" data-step="1" aria-label="Increase repetitions">+</button></div></label></div><button class="primary v28-log" type="button">✓ LOG NEXT SET</button><p class="v28-feedback" aria-live="polite"></p>`;body.prepend(controls);
const getInput=k=>controls.querySelector('input[data-kind="'+k+'"]');const setDefaults=()=>{let d=data.draft?.[day]?.[i]?.sets||[],next=d.findIndex(s=>!(s&&s.kg!==''&&s.kg!=null&&Number(s.reps)>0));if(next<0)next=d.length;let p=d[next]||d[next-1]||previousEntry?.sets?.[next]||previousEntry?.sets?.[0]||{};getInput('kg').value=p.kg??'';getInput('reps').value=p.reps??''};setDefaults();controls.querySelectorAll('button[data-kind]').forEach(b=>b.onclick=()=>{let n=getInput(b.dataset.kind),v=Number(n.value)||0;n.value=Math.max(0,Math.round((v+Number(b.dataset.step))*100)/100)});
controls.querySelector('.v28-log').onclick=()=>{let kg=Number(getInput('kg').value),reps=Number(getInput('reps').value);if(getInput('kg').value===''||getInput('reps').value===''||kg<0||reps<=0){controls.querySelector('.v28-feedback').textContent='Enter a valid weight and repetitions.';return}let d=typeof exDraft==='function'?exDraft(i):null;if(!d)return;let next=Array.from({length:ex.sets},(_,j)=>j).find(j=>!(d.sets?.[j]&&d.sets[j].kg!==''&&d.sets[j].kg!=null&&Number(d.sets[j].reps)>0));if(next===undefined){controls.querySelector('.v28-feedback').textContent='All planned sets are logged. Use the exercise completion button.';return}setEntry(i,next,'kg',kg);setEntry(i,next,'reps',reps);renderWorkout();const target=el('exercises')?.children[i];target?.querySelector('.v28-feedback')&&(target.querySelector('.v28-feedback').textContent=`Set ${next+1} saved ✓`);};});}
function analytics(){const host=el('progress');if(!host)return;let h=sessions(),ranges=[7,30,90,365,0],sel=get('killa-fitness-v28-range',30),filtered=sel?h.filter(x=>Date.now()-new Date(x.date).getTime()<=sel*86400000):h;let weekly={};filtered.forEach(x=>{let d=new Date(x.date),mon=new Date(d);mon.setDate(d.getDate()-(d.getDay()+6)%7);let key=mon.toISOString().slice(0,10);weekly[key]??={count:0,volume:0};weekly[key].count++;weekly[key].volume+=volume(x)});let bars=Object.entries(weekly).sort((a,b)=>a[0].localeCompare(b[0])).slice(-12),max=Math.max(1,...bars.map(x=>x[1].volume));let html=`<div class="v28-section-head"><h3>TRAINING ANALYTICS</h3><label>Period <select id="v28-range">${ranges.map(r=>`<option value="${r}" ${r===sel?'selected':''}>${r?r+' days':'All time'}</option>`).join('')}</select></label></div><div class="v28-stats"><div><small>SESSIONS</small><strong>${filtered.length}</strong></div><div><small>VOLUME</small><strong>${Math.round(filtered.reduce((a,x)=>a+volume(x),0)).toLocaleString()} kg</strong></div><div><small>ACTIVE WEEKS</small><strong>${bars.length}</strong></div></div><h4>Weekly training volume</h4>${bars.length?`<div class="v28-chart" role="img" aria-label="Weekly training volume bar chart">${bars.map(([k,v])=>`<div class="v28-bar" title="${safe(k)}: ${Math.round(v.volume)} kg"><span>${Math.round(v.volume)}</span><i style="height:${Math.max(4,Math.round(v.volume/max*125))}px"></i><small>${k.slice(5)}</small></div>`).join('')}</div>`:'<p class="note">Save a workout to see training trends.</p>'}<p class="note">Volume = sum of weight × repetitions for saved sets. This chart uses only recorded workouts.</p>`;
const n=inject('v28-analytics',host,'<section id="v28-analytics" class="v28-panel"></section>','afterbegin');n.innerHTML=html;n.querySelector('#v28-range').onchange=e=>{localStorage.setItem('killa-fitness-v28-range',JSON.stringify(+e.target.value));analytics()};}
const libraryInfo=[['Bench Press','Chest','Barbell','Keep feet planted and lower under control.'],['Incline Dumbbell Press','Chest','Dumbbells','Set bench to a modest incline and avoid flaring elbows.'],['Cable Chest Fly','Chest','Cable','Maintain a soft elbow bend through the movement.'],['Lat Pulldown','Back','Cable','Pull elbows down without leaning excessively.'],['Seated Cable Row','Back','Cable','Keep your torso stable and squeeze shoulder blades.'],['Dumbbell Curl','Biceps','Dumbbells','Avoid swinging; control the lowering phase.'],['Triceps Pushdown','Triceps','Cable','Keep upper arms still and extend elbows.'],['Shoulder Press','Shoulders','Dumbbells','Brace your core and avoid over-arching.'],['Leg Press','Legs','Machine','Keep knees tracking with toes; avoid locking hard.'],['Goblet Squat','Legs','Dumbbell','Maintain a neutral spine and controlled depth.'],['Plank','Core','Bodyweight','Keep ribs stacked and hips level.'],['Walking Lunge','Legs','Bodyweight','Step with control and maintain balance.']];
function library(){const host=el('library');if(!host)return;const n=inject('v28-library',host,'<section id="v28-library" class="v28-panel"></section>','afterbegin');n.innerHTML=`<h3>VISUAL EXERCISE GUIDE</h3><div class="v28-filters"><input id="v28-library-query" placeholder="Search exercises or equipment" aria-label="Search exercise guide"><select id="v28-library-muscle" aria-label="Filter muscle group"><option value="">All muscle groups</option>${[...new Set(libraryInfo.map(x=>x[1]))].map(g=>`<option>${g}</option>`).join('')}</select></div><div id="v28-library-list" class="v28-library-grid"></div><p class="note">Technique cues are general guidance. Use a qualified trainer for individual instruction.</p>`;
const paint=()=>{let q=el('v28-library-query').value.toLowerCase(),g=el('v28-library-muscle').value;el('v28-library-list').innerHTML=libraryInfo.filter(x=>(!g||x[1]===g)&&x.join(' ').toLowerCase().includes(q)).map(x=>`<article class="v28-library-card"><img class="v28-ex-image" src="./exercise-images/${x[0].toLowerCase().replace(/[^a-z0-9]+/g,'-')}.webp" alt="3D anatomical illustration of ${safe(x[0])}" loading="lazy"><div><strong>${safe(x[0])}</strong><small>${safe(x[1])} · ${safe(x[2])}</small><p>${safe(x[3])}</p></div></article>`).join('')||'<p class="note">No matching exercises.</p>'};n.querySelectorAll('input,select').forEach(x=>x.addEventListener('input',paint));paint();}
// Progress photos are stored in IndexedDB, not localStorage or workout JSON exports.
const db=()=>new Promise((resolve,reject)=>{if(!indexedDB){reject(Error('Photo storage unavailable'));return}let r=indexedDB.open('killa-fitness-v28-photos',1);r.onupgradeneeded=()=>r.result.createObjectStore('photos',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
async function photos(){const list=el('v28-photo-list');if(!list)return;try{let d=await db(),tx=d.transaction('photos','readonly'),r=tx.objectStore('photos').getAll();r.onsuccess=()=>{list.replaceChildren();let items=r.result.sort((a,b)=>b.date.localeCompare(a.date));if(!items.length)list.textContent='No progress photos yet.';items.forEach(p=>{let url=URL.createObjectURL(p.file),card=document.createElement('div');card.className='v28-photo';let img=document.createElement('img');img.src=url;img.alt='Progress photo from '+date(p.date);img.onload=()=>URL.revokeObjectURL(url);let cap=document.createElement('small');cap.textContent=date(p.date);let del=document.createElement('button');del.type='button';del.textContent='Delete';del.onclick=async()=>{if(!confirm('Delete this progress photo?'))return;let d=await db(),t=d.transaction('photos','readwrite');t.objectStore('photos').delete(p.id);t.oncomplete=()=>photos()};card.append(img,cap,del);list.append(card)})};d.onversionchange=()=>d.close()}catch(e){list.textContent='Photo storage unavailable: '+e.message}}
function measurements(){const host=el('measurements');if(!host)return;let arr=data.measurements||[],w=arr.filter(x=>Number.isFinite(+x.weight)&&+x.weight>0),first=w[0],last=w.at(-1),diff=first&&last?(+last.weight-+first.weight).toFixed(1):null;const n=inject('v28-body',host,'<section id="v28-body" class="v28-panel"></section>','afterbegin');n.innerHTML=`<h3>BODY TRANSFORMATION</h3><div class="v28-stats"><div><small>LAST WEIGHT</small><strong>${last?last.weight+' kg':'—'}</strong></div><div><small>CHANGE SINCE FIRST</small><strong>${diff!==null?(+diff>0?'+':'')+diff+' kg':'—'}</strong></div><div><small>MEASUREMENT ENTRIES</small><strong>${arr.length}</strong></div></div><p class="note">Body measurements are stored in your existing workout data. Photos are stored separately on this device.</p><label class="v28-upload">ADD PROGRESS PHOTO <input id="v28-photo-upload" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Add progress photo"></label><div id="v28-photo-status" role="status" aria-live="polite"></div><div id="v28-photo-list" class="v28-photos"></div><button type="button" class="secondary" id="v28-export-photos">Export photo backup</button><label class="v28-import-label">Restore photo backup <input type="file" id="v28-import-photos" accept="application/json,.json"></label>`;
n.querySelector('#v28-photo-upload').onchange=async e=>{let file=e.target.files?.[0];if(!file)return;if(file.size>5*1024*1024){el('v28-photo-status').textContent='Choose a photo under 5 MB.';return}try{let d=await db(),t=d.transaction('photos','readwrite');t.objectStore('photos').put({id:Date.now()+'-'+Math.random().toString(36).slice(2),date:new Date().toISOString(),file});t.oncomplete=()=>{el('v28-photo-status').textContent='Photo saved on this device.';photos()};t.onerror=()=>el('v28-photo-status').textContent='Photo could not be saved.'}catch(err){el('v28-photo-status').textContent=err.message}};
n.querySelector('#v28-import-photos').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const pack=JSON.parse(await file.text());if(pack.version!==1||!Array.isArray(pack.photos)||pack.photos.length>100)throw Error('Unsupported photo backup');if(!confirm('Import '+pack.photos.length+' progress photos into this device?'))return;let items=[];for(const p of pack.photos){if(typeof p.id!=='string'||typeof p.date!=='string'||typeof p.data!=='string'||!/^data:image\/(jpeg|png|webp);base64,/.test(p.data))throw Error('Invalid photo data');const response=await fetch(p.data),blob=await response.blob();if(blob.size>5*1024*1024)throw Error('Photo exceeds 5 MB');items.push({id:p.id,date:p.date,file:blob})}let d=await db(),t=d.transaction('photos','readwrite');items.forEach(p=>t.objectStore('photos').put(p));t.oncomplete=()=>{el('v28-photo-status').textContent='Photo backup restored.';photos()};}catch(err){el('v28-photo-status').textContent='Restore failed: '+err.message}};
n.querySelector('#v28-export-photos').onclick=async()=>{try{let d=await db(),t=d.transaction('photos'),r=t.objectStore('photos').getAll();r.onsuccess=async()=>{let items=await Promise.all(r.result.map(async p=>({id:p.id,date:p.date,type:p.file.type,data:await new Promise((resolve,reject)=>{let reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(p.file)})})));let a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify({version:1,photos:items})],{type:'application/json'}));a.href=url;a.download='killa-fitness-photos-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}}catch(err){alert('Photo export failed: '+err.message)}};photos();}
function settings(){const host=el('settings');if(!host)return;const n=inject('v28-settings',host,'<section id="v28-settings" class="v28-panel"></section>');n.innerHTML=`<h3>PERSONALISE KILLA FITNESS</h3><div class="v28-filters"><label>Weekly workout goal<input id="v28-goal" type="number" min="1" max="14" value="${prefs.goal}"></label><label>Quick workout logging<select id="v28-quick"><option value="true" ${prefs.quick?'selected':''}>Enabled</option><option value="false" ${!prefs.quick?'selected':''}>Disabled</option></select></label><label>Compact layout<select id="v28-compact"><option value="false" ${!prefs.compact?'selected':''}>Standard</option><option value="true" ${prefs.compact?'selected':''}>Compact</option></select></label></div><p class="note">Rest timer alarm settings remain in the v2.7 alarm section below. Existing workout data is never reset by these options.</p><div class="v28-version"><strong>KILLA FITNESS v2.8</strong><span>GitHub Pages · Offline capable</span><button type="button" id="v28-refresh" class="secondary">Check for app update</button><span id="v28-update-status" role="status"></span></div>`;
n.querySelector('#v28-goal').onchange=e=>{prefs.goal=Math.max(1,Math.min(14,Number(e.target.value)||5));persist();dash()};n.querySelector('#v28-quick').onchange=e=>{prefs.quick=e.target.value==='true';persist();renderWorkout()};n.querySelector('#v28-compact').onchange=e=>{prefs.compact=e.target.value==='true';document.body.classList.toggle('v28-compact',prefs.compact);persist()};n.querySelector('#v28-refresh').onclick=async()=>{let label=el('v28-update-status');label.textContent='Checking…';try{if('serviceWorker'in navigator){let reg=await navigator.serviceWorker.getRegistration();await reg?.update()}label.textContent='Update check complete. Reload to use any newly installed version.'}catch(e){label.textContent='Could not check for updates while offline.'}};}
const oldSwitch=window.switchView;window.switchView=function(v){oldSwitch(v);if(v==='dashboard')dash();if(v==='workout')quick();if(v==='progress')analytics();if(v==='library')library();if(v==='measurements')measurements();if(v==='settings')settings()};
const oldRender=window.renderWorkout;window.renderWorkout=function(){oldRender();quick()};
const oldFinish=window.finishWorkout;window.finishWorkout=function(){let before=sessions().length;oldFinish();if(sessions().length>before){dash();analytics()}};
function init(){document.body.classList.toggle('v28-compact',prefs.compact);dash();quick();if(el('progress')?.classList.contains('active'))analytics();if(el('settings')?.classList.contains('active'))settings();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

// v2.8.1 Screen Wake Lock: optional, re-request on visibility changes, release on idle.
const WAKE_KEY='killa-fitness-v281-wake-enabled';
let wakeSentinel=null;
const wakeEnabled=()=>{try{return localStorage.getItem(WAKE_KEY)!=='false'}catch{return true}};
const workoutVisible=()=>{const active=document.querySelector('#workout');return active && getComputedStyle(active).display!=='none' && !active.hidden};
const timerRunning=()=>{const t=document.querySelector('#restTimer, #rest-timer, .rest-timer');return !!(t && getComputedStyle(t).display!=='none' && /[1-9]/.test(t.textContent||''))};
async function syncWake(){
  const want=wakeEnabled() && document.visibilityState==='visible' && (workoutVisible() || timerRunning());
  if(!want){if(wakeSentinel){const old=wakeSentinel;wakeSentinel=null;try{await old.release()}catch{}}return}
  if(wakeSentinel || !('wakeLock' in navigator))return;
  try{wakeSentinel=await navigator.wakeLock.request('screen');wakeSentinel.addEventListener('release',()=>{wakeSentinel=null},{once:true})}catch(e){console.info('Wake lock unavailable:',e.message)}
}
function wakeSettings(){const panel=document.querySelector('#v28-settings');if(!panel||panel.querySelector('#v281-wake'))return;
const row=document.createElement('label');row.className='v281-wake';row.innerHTML='<input type="checkbox" id="v281-wake"> <span><strong>Keep screen awake during workouts</strong><small>Prevents automatic sleep while training or timing rests where supported. Manually locking your phone still works.</small></span>';
row.querySelector('input').checked=wakeEnabled();row.querySelector('input').addEventListener('change',e=>{try{localStorage.setItem(WAKE_KEY,String(e.target.checked))}catch{}syncWake()});panel.append(row)}
const wakeOldSwitch=window.switchView;window.switchView=function(v){wakeOldSwitch(v);if(v==='settings')wakeSettings();syncWake()};
document.addEventListener('visibilitychange',syncWake);document.addEventListener('click',()=>setTimeout(syncWake,80));
setInterval(syncWake,5000);window.addEventListener('pagehide',()=>{if(wakeSentinel)wakeSentinel.release().catch(()=>{})});
})();

;
/* v29-navigation.js */
/* KILLA FITNESS v2.9: mobile navigation enhancements. Existing workout/alarm data is untouched. */
(()=>{'use strict';
const NAV=[['dashboard','Home','⌂'],['workout','Train','▣'],['generator','Generate','⚡'],['progress','Progress','▥'],['history','History','◷'],['library','Exercises','◉'],['measurements','Body','◎'],['calendar','Calendar','▦'],['settings','Settings','⚙']];
const KEY='killa-fitness-v29-nav',WORKOUT_KEY='killa-fitness-v1',REST_KEY='killa-fitness-v273-rest',defaults=['dashboard','workout','generator','progress'];
let prefs={};try{prefs=JSON.parse(localStorage.getItem(KEY))||{}}catch{};
const valid=a=>Array.isArray(a)&&a.length===4&&new Set(a).size===4&&a.every(x=>NAV.some(n=>n[0]===x));
if(!valid(prefs.shortcuts))prefs.shortcuts=defaults.slice();
let moreOpen=false;
const style=document.createElement('style');style.textContent=`
@media(max-width:850px){
body{padding-bottom:calc(105px + env(safe-area-inset-bottom))!important}
.bottomnav{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:3px;padding:8px 7px max(10px,env(safe-area-inset-bottom))!important;background:linear-gradient(180deg,#15231aef,#09120df9)!important;border-top:1px solid #436343!important;box-shadow:0 -9px 30px #0009}
.bottomnav button{min-height:53px!important;border-radius:12px!important;gap:3px!important;transition:background .16s,color .16s,transform .16s}
.bottomnav button:active{transform:scale(.94)}.bottomnav button.active{background:#29432c!important;color:#a5ff30!important}.bottomnav .glyph{font-size:22px!important}.bottomnav .nav-label{font-size:10px;font-weight:800}
#k29-mini,#k29-session{position:fixed;left:12px;right:12px;z-index:39;display:none;align-items:center;gap:12px;border-radius:14px;padding:9px 13px;box-shadow:0 8px 26px #0009;backdrop-filter:blur(15px)}
#k29-mini{bottom:calc(82px + env(safe-area-inset-bottom));background:#16271bea;border:1px solid #486e40}#k29-mini.visible{display:flex}#k29-mini strong{color:#a5ff30;font-size:20px;font-variant-numeric:tabular-nums}#k29-mini small{color:#bbd0be}
#k29-mini button,#k29-session button{border:1px solid #587c4a;background:#28422c;color:#eaffdf;border-radius:9px;padding:9px;font-weight:800;min-height:40px}
#k29-session{bottom:calc(82px + env(safe-area-inset-bottom));background:#223c27;border:1px solid #679351;color:#dfffcd;font-size:12px;font-weight:800;justify-content:space-between}#k29-session.visible{display:flex}#k29-session button{background:#a5ff30;color:#102012;border:0}#k29-mini.visible:has(+ #k29-session.visible){bottom:calc(141px + env(safe-area-inset-bottom))}
#k29-more{position:fixed;bottom:calc(82px + env(safe-area-inset-bottom));left:10px;right:10px;z-index:42;background:#101b14;border:1px solid #476641;border-radius:18px;padding:15px;box-shadow:0 -10px 40px #000c;max-height:65vh;overflow:auto}#k29-more[hidden]{display:none!important}
#k29-more button,#k29-more select{background:#1c2e21;color:#ecf7ea;border:1px solid #36543b;border-radius:10px;padding:11px;min-height:44px}
#k29-more .k29-links,#k29-more .k29-config{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:12px 0}#k29-more label{display:flex;flex-direction:column;gap:4px;color:#afc6b1;font-size:11px}
.view.active{animation:k29-enter .16s ease-out}@keyframes k29-enter{from{opacity:.75;transform:translateY(4px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.view.active{animation:none}.bottomnav button{transition:none}}
}`;document.head.append(style);
const bar=document.querySelector('.bottomnav');if(!bar)return;
const mini=document.createElement('div');mini.id='k29-mini';mini.innerHTML='<span aria-hidden="true">⏱</span><div style="flex:1"><small>REST TIMER</small><br><strong id="k29-clock">00:00</strong></div><button type="button" id="k29-open">Open timer</button>';document.body.append(mini);
const session=document.createElement('div');session.id='k29-session';session.innerHTML='<span>● WORKOUT IN PROGRESS</span><button type="button">Resume</button>';document.body.append(session);
const sheet=document.createElement('section');sheet.id='k29-more';sheet.hidden=true;sheet.setAttribute('aria-label','More navigation and shortcuts');document.body.append(sheet);
const currentView=()=>typeof view==='string'?view:document.querySelector('.view.active')?.id;
function navigate(v){moreOpen=false;render();window.switchView?.(v);render();updateStatus()}
mini.querySelector('#k29-open').onclick=()=>{navigate('workout');document.getElementById('restclock')?.scrollIntoView({block:'center',behavior:'smooth'})};session.querySelector('button').onclick=()=>navigate('workout');
function savePrefs(){try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch(e){console.warn('Shortcut preferences could not be saved',e)}}
function render(){bar.replaceChildren();for(const v of [...prefs.shortcuts,'more']){const n=NAV.find(x=>x[0]===v)||['more','More','☰'];const b=document.createElement('button');b.type='button';b.dataset.view=v;b.setAttribute('aria-label',n[1]);const glyph=document.createElement('span');glyph.className='glyph';glyph.setAttribute('aria-hidden','true');glyph.textContent=n[2];const label=document.createElement('span');label.className='nav-label';label.textContent=n[1];b.append(glyph,label);b.classList.toggle('active',v==='more'?moreOpen:currentView()===v);if(b.classList.contains('active'))b.setAttribute('aria-current','page');b.onclick=()=>v==='more'?(moreOpen=!moreOpen,render(),updateStatus()):navigate(v);bar.append(b)}sheet.hidden=!moreOpen;if(moreOpen)renderSheet()}
function renderSheet(){sheet.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><strong style="color:#a5ff30">MORE & SHORTCUTS</strong><button id="k29-close" type="button">✕ Close</button></div><div class="k29-links"></div><strong>Customise bottom tabs</strong><p style="font-size:12px;color:#afc6b1">Choose four shortcuts. More stays in the fifth position.</p><div class="k29-config"></div><button id="k29-reset" type="button">Restore default tabs</button>';sheet.querySelector('#k29-close').onclick=()=>{moreOpen=false;render();updateStatus()};const links=sheet.querySelector('.k29-links');for(const [v,label] of NAV){const b=document.createElement('button');b.textContent=label;b.onclick=()=>navigate(v);links.append(b)}const config=sheet.querySelector('.k29-config');prefs.shortcuts.forEach((v,i)=>{const l=document.createElement('label');l.textContent='Tab '+(i+1);const sel=document.createElement('select');for(const [id,label] of NAV){const o=document.createElement('option');o.value=id;o.textContent=label;o.selected=id===v;sel.append(o)}sel.onchange=()=>{const next=prefs.shortcuts.slice(),j=next.indexOf(sel.value);if(j!==-1&&j!==i)next[j]=v;next[i]=sel.value;prefs.shortcuts=next;savePrefs();render();updateStatus()};l.append(sel);config.append(l)});sheet.querySelector('#k29-reset').onclick=()=>{prefs.shortcuts=defaults.slice();savePrefs();render();updateStatus()}}
function getStored(k){try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}}
function updateStatus(){const d=getStored(WORKOUT_KEY),drafts=d?.draft||{};const inProgress=Object.values(drafts).some(day=>day&&typeof day==='object'&&Object.values(day).some(ex=>ex&&(ex.done||Object.values(ex.sets||{}).some(set=>set&&(set.kg!==''&&set.kg!=null||set.reps!==''&&set.reps!=null)))));session.classList.toggle('visible',!!inProgress&&!moreOpen&&currentView()!=='workout');const train=bar.querySelector('[data-view="workout"]');if(train)train.setAttribute('aria-label',inProgress?'Train — workout in progress':'Train');
const t=getStored(REST_KEY),running=Number(t.end)>Date.now(),alarm=!!t.active;const sec=running?Math.max(0,Math.ceil((t.end-Date.now())/1000)):0;mini.classList.toggle('visible',running&&!alarm&&!moreOpen&&currentView()!=='workout');mini.querySelector('#k29-clock').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
const original=window.switchView;if(typeof original==='function')window.switchView=function(v){original(v);render();updateStatus()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&moreOpen){moreOpen=false;render();updateStatus()}});
render();updateStatus();setInterval(updateStatus,500);document.addEventListener('visibilitychange',updateStatus);
})();

;
/* v291-metallic.js */
/* v2.9.1: visual-only icon upgrade; leaves existing navigation handlers intact. */
(()=>{'use strict';
const icons={
 dashboard:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 workout:'<path d="M6.5 6.5v11m-3-8v5m-2-4v3m5-2h11m0-5v11m3-8v5m2-4v3"/>',
 generator:'<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
 progress:'<path d="M4 20V11m5 9V6m5 14v-8m5 8V3"/><path d="M2 21h20"/>',
 history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 library:'<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1zM12 6v15"/>',
 measurements:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 3"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
 more:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'
};
function update(){
 const nav=document.querySelector('.bottomnav');if(!nav)return;
 nav.querySelectorAll('button[data-view]').forEach(b=>{
 const glyph=b.querySelector('.glyph'),id=b.dataset.view;
 if(glyph&&icons[id]&&!glyph.querySelector('svg'))
 glyph.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[id]+'</svg>';
 });
}
const nav=document.querySelector('.bottomnav');if(nav){new MutationObserver(update).observe(nav,{childList:true});update()}
})();
;
/* v292-mockup.js */
/* v2.9.2 mockup detail: decorative only, no changes to navigation logic. */
(()=>{'use strict';
const icons={measurements:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2M2 16h20M5 14v4m14-4v4"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M7 14h2m3 0h2m3 0h1M7 18h2m3 0h2"/>',library:'<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1zM12 6v15"/><path d="M6 10h3m6 0h3M6 14h3m6 0h3"/>'};
const links=document.querySelector('.killa-links');if(links){links.querySelectorAll('button').forEach(b=>{const action=b.getAttribute('onclick')||'';const match=action.match(/switchView\(['"]([^'"]+)['"]\)/);const type=match?.[1];if(!icons[type])return;const label=b.textContent.trim().replace(/^[^A-Za-z]+/,'');b.textContent='';const icon=document.createElement('span');icon.className='k292-icon';icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[type]+'</svg>';const txt=document.createElement('span');txt.className='k292-label';txt.textContent=label;b.append(icon,txt)})}
const nav=document.querySelector('.bottomnav');if(nav){const plate=document.createElement('div');plate.className='k292-nameplate';plate.setAttribute('aria-hidden','true');plate.innerHTML='<strong>KILLA <em>FITNESS</em></strong><small>v3.2</small>';nav.append(plate);new MutationObserver(()=>{if(!nav.contains(plate))nav.append(plate)}).observe(nav,{childList:true})}
})();
;
/* v30-chrome.js */
/* KILLA FITNESS v3.0 Chrome Edition — additive UI. */
(()=>{'use strict';
const pages=[
['workout','TRAIN / PERFORM','YOUR WORKOUT','Log every set. Rest with purpose. Build strength.','bench-press.webp'],
['generator','PLAN / GENERATE','BUILD YOUR WORKOUT','Choose your focus and generate a training session.','shoulder-press.webp'],
['progress','TRACK / ANALYSE','YOUR PROGRESS','Strength, personal bests and volume from your saved sessions.','incline-dumbbell-press.webp'],
['history','REVIEW / IMPROVE','WORKOUT HISTORY','Your completed sessions, all in one place.','seated-cable-row.webp'],
['calendar','PLAN / SCHEDULE','TRAINING CALENDAR','See your training days and completed workouts.','lat-pulldown.webp'],
['library','LEARN / EXECUTE','EXERCISE LIBRARY','Find exercises and review the available visual guides.','cable-chest-fly.webp'],
['measurements','MEASURE / EVOLVE','BODY MEASUREMENTS','Record measurements and review changes over time.','bench-press.webp'],
['settings','PERSONALISE / PROTECT','SETTINGS & BACKUP','Edit your program and back up your workout data.','shoulder-press.webp']
];
for(const [id,eyebrow,title,subtitle,img] of pages){
 const section=document.getElementById(id);if(!section||section.querySelector('.v3-page-hero'))continue;
 const hero=document.createElement('header');hero.className='v3-page-hero';
 hero.style.setProperty('--v3-photo',`url("./exercise-images/${img}")`);
 const content=document.createElement('div');
 const a=document.createElement('div');a.className='v3-eyebrow';a.textContent='KILLA FITNESS / '+eyebrow;
 const h=document.createElement('h2');h.textContent=title;
 const p=document.createElement('p');p.textContent=subtitle;
 content.append(a,h,p);hero.append(content);section.prepend(hero);
}
const more=document.getElementById('k29-more');
if(more){
 const links=[['🏋','Training','workout'],['⚡','Workout Generator','generator'],['📈','Progress & Records','progress'],['📚','Exercise Library','library'],['📅','Training Calendar','calendar'],['◉','Body Measurements','measurements'],['◷','Workout History','history'],['⚙','Settings & Backup','settings']];
 const observer=new MutationObserver(()=>{
  if(more.hidden||more.querySelector('.v3-more-grid'))return;
  const target=more.querySelector('.k29-links');if(!target)return;
  const grid=document.createElement('div');grid.className='v3-more-grid';
  for(const [icon,label,view] of links){
   const b=document.createElement('button');b.type='button';
   const i=document.createElement('span');i.className='v3-tile-icon';i.textContent=icon;
   const t=document.createElement('span');t.textContent=label;t.style.flex='1';
   const arrow=document.createElement('span');arrow.textContent='›';arrow.setAttribute('aria-hidden','true');
   b.append(i,t,arrow);b.onclick=()=>{more.hidden=true;window.switchView?.(view)};grid.append(b);
  }
  target.replaceWith(grid);
 });
 observer.observe(more,{childList:true,subtree:false});
}
})();
;
/* KILLA FITNESS v3.2 — read-only focus card; all logging uses existing handlers. */
(()=>{'use strict';
const area=document.getElementById('exercises');if(!area)return;
const panel=document.createElement('section');panel.id='k31-focus';panel.setAttribute('aria-label','Current exercise');
const mount=area.parentElement;mount.insertBefore(panel,area);
let scheduled=false;
function refresh(){
 scheduled=false;
 const cards=[...area.querySelectorAll(':scope > .exercise')];
 if(!cards.length){panel.hidden=true;return}
 let current=cards.findIndex(x=>!!x.querySelector('.body'));
 if(current<0)current=cards.findIndex(x=>!x.classList.contains('done'));
 if(current<0)current=0;
 cards.forEach((x,i)=>x.classList.toggle('k31-current',i===current));
 const card=cards[current],heading=card.querySelector('.desc strong')?.textContent||'Exercise';
 const detail=card.querySelector('.desc small')?.textContent||'';
 const image=card.querySelector('.exphoto')?.getAttribute('src')||'';
 const prev=[...card.querySelectorAll('.sets tbody tr')].map(r=>r.children[1]?.textContent?.trim()).filter(x=>x&&x!=='—')[0]||'No previous sets recorded';
 panel.hidden=false;
 panel.replaceChildren();
 const label=document.createElement('div');label.className='k31-label';label.textContent='CURRENT EXERCISE  •  '+(current+1)+' / '+cards.length;
 const main=document.createElement('div');main.className='k31-main';
 const img=document.createElement('img');img.src=image;img.alt=heading;img.loading='lazy';
 const content=document.createElement('div');
 const title=document.createElement('h3');title.textContent=heading;
 const info=document.createElement('p');info.textContent=detail;
 const prior=document.createElement('p');prior.textContent='Previous: '+prev;
 const actions=document.createElement('div');actions.className='k31-actions';
 const log=document.createElement('button');log.type='button';log.textContent='LOG SETS ↓';
 log.onclick=()=>{const target=card.querySelector('.body')||card.querySelector('.exercisehead');target?.scrollIntoView({behavior:'smooth',block:'center'});if(!card.querySelector('.body'))card.querySelector('.exercisehead')?.click()};
 const next=document.createElement('button');next.type='button';next.textContent='NEXT EXERCISE →';
 next.onclick=()=>{const n=cards[current+1];if(n){n.querySelector('.exercisehead')?.click();n.scrollIntoView({behavior:'smooth',block:'start'})}};
 if(current===cards.length-1)next.disabled=true;
 actions.append(log,next);content.append(title,info,prior,actions);main.append(img,content);panel.append(label,main);
}
const observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(refresh)}});
observer.observe(area,{childList:true,subtree:false});
refresh();
})();