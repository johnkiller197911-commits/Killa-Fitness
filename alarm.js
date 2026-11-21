/* KILLA FITNESS v2.7.3: standalone rest timer/alarm, independent of legacy handlers. */
(()=>{'use strict';
const KEY='killa-fitness-v273-rest';
let end=0,remaining=90,duration=90,tickId=null,ringId=null,ctx=null,active=false;
const clock=()=>document.getElementById('restclock');
const button=()=>document.getElementById('resttoggle');
const getPrefs=()=>{try{return JSON.parse(localStorage.getItem('killa-fitness-v27-preferences'))||{}}catch{return {}}};
function save(){try{localStorage.setItem(KEY,JSON.stringify({end,remaining,duration,active}))}catch{}}
function unlock(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx ||= new AC();if(ctx.state!=='running')ctx.resume().catch(()=>{});}catch(e){console.warn('Alarm audio unlock:',e)}}
function sound(){if(!ctx||ctx.state!=='running'){document.getElementById('v273-audio-warning')?.removeAttribute('hidden');return}let v=Math.min(1,Math.max(0,Number(getPrefs().volume??75)/100));for(let i=0;i<3;i++){let t=ctx.currentTime+.02+i*.18,o=ctx.createOscillator(),g=ctx.createGain();o.type='square';o.frequency.value=i===1?1120:880;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.001,v*.14),t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.15);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.16)}}
function buzz(){try{if(getPrefs().vibrate!==false)navigator.vibrate?.([250,120,250])}catch{}}
function stop(){active=false;clearInterval(ringId);ringId=null;document.getElementById('v273-alarm')?.remove();try{navigator.vibrate?.(0)}catch{};save()}
function alarm(){if(active)return;end=0;remaining=0;active=true;clearInterval(tickId);tickId=null;document.getElementById('v27-alarm')?.remove();let el=document.createElement('div');el.id='v273-alarm';el.setAttribute('role','alertdialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Rest complete');el.innerHTML='<div class="v273-panel"><div class="v273-icon">◉</div><h2>REST COMPLETE!</h2><p>Time for your next set</p><button id="v273-dismiss" type="button">✓ DISMISS ALARM</button><p id="v273-audio-warning" hidden>Sound is blocked. Tap ENABLE SOUND to activate it.</p><button id="v273-enable" type="button">🔊 ENABLE SOUND / TEST</button></div>';document.body.append(el);el.querySelector('#v273-dismiss').addEventListener('click',()=>{stop();paint()});el.querySelector('#v273-enable').addEventListener('click',()=>{unlock();setTimeout(sound,120)});paint();save();sound();buzz();ringId=setInterval(()=>{sound();buzz()},1250);el.querySelector('#v273-dismiss').focus()}
function paint(){let sec=Math.max(0,end?Math.ceil((end-Date.now())/1000):remaining);if(clock())clock().textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');if(button())button().textContent=end?'Ⅱ Pause':'▶ Start';if(end&&Date.now()>=end)alarm()}
function start(sec){stop();unlock();duration=sec;remaining=sec;end=Date.now()+sec*1000;save();clearInterval(tickId);tickId=setInterval(paint,200);paint()}
function toggle(){if(active)return;if(end){remaining=Math.max(0,Math.ceil((end-Date.now())/1000));end=0;clearInterval(tickId);tickId=null;save();paint()}else start(remaining>0?remaining:duration)}
function reset(){stop();end=0;remaining=duration;clearInterval(tickId);tickId=null;save();paint()}
// Capture at the document level: stop inline legacy timer handlers before they can run.
document.addEventListener('click',e=>{let target=e.target.closest?.('.timerbuttons button');if(!target)return;let bar=target.closest('.timerbar');if(!bar)return;e.preventDefault();e.stopImmediatePropagation();if(target.id==='resttoggle'){toggle();return}let label=target.textContent.trim();if(label==='↺'||label==='⟳'){reset();return}let match=label.match(/^(60|90|120)s$/);if(match)start(Number(match[1]));},true);
// Reopen pending alarm, or resume countdown, after navigation/reload.
try{let s=JSON.parse(localStorage.getItem(KEY)||'null');if(s){duration=Number(s.duration)||90;remaining=Number(s.remaining)||duration;end=Number(s.end)||0;if(s.active)alarm();else if(end){tickId=setInterval(paint,200)}}}catch{}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
// Used by the Settings test button in v27.js when this fix is installed.
window.killaAlarmTest=()=>{unlock();alarm()};
})();
