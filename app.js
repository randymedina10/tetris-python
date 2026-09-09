const kind=document.body.dataset.game;
const statusEl=document.getElementById('status'),board=document.getElementById('board'),reset=document.getElementById('reset'),retry=document.getElementById('retry');
const colors=['#081C1C','#B8E86B','#E5BA69','#BD9CE0','#73C5AB','#DD8E82','#83A7DC','#C8D9B2'];
let worker,ready=false,state=null,timer,seq=0,loadTimer;
const pending=new Map();
function send(message){
 if(!ready&&message.type!=='init')return Promise.reject(new Error('Python está cargando'));
 const id=++seq;
 return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{pending.delete(id);reject(new Error('La respuesta tardó demasiado'));},message.type==='init'?90000:10000);pending.set(id,{resolve,reject,timeout});worker.postMessage({...message,id});});
}
function render(s){
 state=s; reset.disabled=false;
 if(kind==='tres-en-raya'){
  statusEl.textContent=s.winner?'Gana '+s.winner:s.draw?'Empate. ¿Otra partida?':'Turno de '+s.turn;
  [...board.children].forEach((b,i)=>{b.textContent=s.board[i];b.disabled=!!(s.board[i]||s.winner||s.draw);b.setAttribute('aria-label','Fila '+(Math.floor(i/3)+1)+', columna '+(i%3+1)+': '+(s.board[i]||'vacía'));});
 }else{
  statusEl.textContent=s.over?'Fin de la partida':s.paused?'En pausa':'Encaja las piezas';
  document.getElementById('score').textContent='Puntos '+s.score+' · Líneas '+s.lines+' · Nivel '+s.level;
  [...board.children].forEach((b,i)=>{b.style.backgroundColor=colors[s.board[Math.floor(i/10)][i%10]];});
  board.setAttribute('aria-label','Tablero de Tetris. '+s.lines+' líneas, '+s.score+' puntos.');
  const nextGrid=document.getElementById('next-grid');nextGrid.replaceChildren();
  for(let r=0;r<2;r++)for(let c=0;c<4;c++){const cell=document.createElement('span');cell.style.backgroundColor=colors[s.next[r]?.[c]||0];nextGrid.append(cell);}
  document.body.classList.toggle('paused',s.paused);
  document.getElementById('pause').textContent=s.paused?'Continuar':'Pausar';
  document.querySelectorAll('[data-action]').forEach(b=>b.disabled=s.over);
  clearTimeout(timer);
  if(!s.over&&!s.paused&&!document.hidden)timer=setTimeout(()=>act({type:'action',action:'tick'}),Math.max(120,700-(s.level-1)*60));
 }
}
async function act(message){try{return await send(message);}catch(e){statusEl.textContent=e.message;return null;}}
function setup(){
 ready=false;reset.disabled=true;retry.hidden=true;statusEl.textContent='Cargando Python…';worker?.terminate();clearTimeout(timer);
 for(const p of pending.values()){clearTimeout(p.timeout);p.reject(new Error('Juego reiniciado'));}pending.clear();
 worker=new Worker('worker.js');
 worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;clearTimeout(p.timeout);pending.delete(data.id);if(data.error){p.reject(new Error(data.error));return;}ready=true;render(data.state);p.resolve(data.state);};
 worker.onerror=()=>{statusEl.textContent='No se pudo iniciar Python. Comprueba tu conexión.';retry.hidden=false;ready=false;};
 send({type:'init',kind}).catch(()=>{statusEl.textContent='No se pudo cargar Python. Comprueba tu conexión y reintenta.';retry.hidden=false;});
}
if(kind==='tres-en-raya'){
 for(let i=0;i<9;i++){const b=document.createElement('button');b.disabled=true;b.setAttribute('aria-label','Casilla '+(i+1));b.addEventListener('click',()=>act({type:'move',cell:i}));board.append(b);}
}else{
 for(let i=0;i<200;i++){const c=document.createElement('span');c.className='cell';c.setAttribute('aria-hidden','true');board.append(c);}
 document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>act({type:'action',action:b.dataset.action})));
 document.addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON'&&(e.key===' '||e.key==='Enter'))return;const actions={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'rotate',' ':'drop',p:'pause',P:'pause'};if(actions[e.key]&&ready){e.preventDefault();act({type:'action',action:actions[e.key]});}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&ready&&state&&!state.paused&&!state.over)act({type:'action',action:'pause'});});
 window.addEventListener('blur',()=>{if(ready&&state&&!state.paused&&!state.over)act({type:'action',action:'pause'});});
}
reset.addEventListener('click',()=>act({type:'reset'}));retry.addEventListener('click',setup);
window.addEventListener('pagehide',()=>{worker?.terminate();clearTimeout(timer);});
setup();
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const register=(tool)=>Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});
 register({name:'read_game_state',description:'Lee el tablero y estado del juego visible.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>send({type:'state'})});
 register({name:'play_game_action',description:'Aplica un movimiento al juego local visible. reset reinicia la partida.',inputSchema:{type:'object',properties:{action:{type:'string'},cell:{type:'integer',minimum:0,maximum:8}},required:['action'],additionalProperties:false},execute:async input=>{if(!input||typeof input.action!=='string')throw new Error('Acción requerida');if(input.action==='reset')return send({type:'reset'});if(kind==='tres-en-raya'){if(input.action!=='move'||!Number.isInteger(input.cell)||input.cell<0||input.cell>8)throw new Error('Movimiento inválido');return send({type:'move',cell:input.cell});}if(!['left','right','down','rotate','drop','pause'].includes(input.action))throw new Error('Acción inválida');return send({type:'action',action:input.action});}});
 window.addEventListener('pagehide',()=>lifecycle.abort());
}

