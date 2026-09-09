let runtime;
async function init(kind) {
 importScripts('https://cdn.jsdelivr.net/pyodide/v314.0.6/full/pyodide.js');
 runtime = await loadPyodide();
 const moduleName=kind==='tetris'?'tetris':'tic_tac_toe';
 const response=await fetch(moduleName+'.py');
 if(!response.ok) throw new Error('No se pudo cargar el juego');
 runtime.FS.writeFile(moduleName+'.py',await response.text());
 runtime.runPython('from '+moduleName+' import '+(kind==='tetris'?'Tetris':'TicTacToe')+'\nimport json\ngame = '+(kind==='tetris'?'Tetris':'TicTacToe')+'()');
 return JSON.parse(runtime.runPython('json.dumps(game.state())'));
}
let chain=Promise.resolve();
self.onmessage=({data})=>{
 chain=chain.then(async()=>{
  try{
   let result;
   if(data.type==='init') result=await init(data.kind);
   else {
    if(!runtime) throw new Error('Python no está preparado');
    if(data.type==='reset') runtime.runPython('game = type(game)()');
    else if(data.type==='move') {
     if(!Number.isInteger(data.cell)||data.cell<0||data.cell>8) throw new Error('Casilla inválida');
     runtime.globals.set('cell',data.cell);runtime.runPython('game.move(cell)');
    } else if(data.type==='action'){
     if(!['left','right','down','rotate','drop','tick','pause'].includes(data.action)) throw new Error('Acción inválida');
     runtime.globals.set('action',data.action);runtime.runPython('game.action(action)');
    } else if(data.type!=='state') throw new Error('Comando inválido');
    result=JSON.parse(runtime.runPython('json.dumps(game.state())'));
   }
   self.postMessage({id:data.id,state:result});
  }catch(e){self.postMessage({id:data.id,error:String(e.message||e)});}
 });
};
