
/* V10 presentation upgrades. Preserve state, storage, workout execution and update flow. */
(function(){
'use strict';
if(typeof home!=='function'||typeof train!=='function')return;
var previousHome=home,previousTrain=train;
home=function(){
  return previousHome().replace('class="tx-home"','class="tx-home v10-home"')
    .replace('TITANIUM X · V8.0','TITANIUM ELITE · V10.0')
    .replace('YOUR PERSONAL TRAINING SYSTEM','KILLA FITNESS // TITANIUM ELITE')
    .replace('INTELLIGENT SESSION SUGGESTION','TODAY\'S INTELLIGENT WORKOUT')
    .replace('CHOOSE YOUR WORKOUT','SELECT YOUR MUSCLE GROUP');
};
train=function(){
  var content=previousTrain().replace('class="tx-page"','class="tx-page v10-train"')
  .replace('TRAINING HQ','TRAINING COMMAND CENTRE')
  .replace('KILLA FITNESS · PERSONAL TRAINING','KILLA FITNESS // TITANIUM ELITE')
  .replace('BUILD TODAY\'S WORKOUT','CREATE YOUR NEXT SESSION');
  return '<div class="v10-strap">⚡ ADAPTIVE TRAINING · CHEST · ARMS · BACK · SHOULDERS</div>'+content;
};
if(typeof render==='function')render();
})();
