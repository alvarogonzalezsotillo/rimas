// -*- mode: js2; -*-

function log(s){
//    console.log("rimas-worker:" + s );
}

log("worker: loading");



self.importScripts( "./dummy-modules.js");
self.importScripts( "./corpus-by-syllable-no-pp.js");
self.importScripts( "./corpus-by-frequency.js");
self.importScripts( "./corpus-utils.js");
self.importScripts( "./rimas.js");


let palabraActual = "";
let iteradorActual = null;


self.addEventListener("message", function(e){
    const data = e.data;

    if( data.terminar ){
        iteradorActual = null;
        return;
    }
    
    const {palabra,asonante,silabas} = data;
    log( `worker: message: palabra:${palabra} asonante:${asonante} silabas:${silabas}` );

    if( palabra != palabraActual ){
        palabraActual = palabra;

        if( asonante ){
            iteradorActual = todasLasPalabrasConRimaAsonante(palabraActual,silabas);
        }
        else{
            iteradorActual = todasLasPalabrasConRimaConsonante(palabraActual,silabas);
        }
    }

    const {value,done} = iteradorActual.next();

    log( `worker: value:${value} done:${done}` );

    self.postMessage({
        rima : value,
        done : done,
        palabra : palabra,
        asonante : asonante,
        silabas : silabas
    });
});

log("worker: loaded");
log(self);
