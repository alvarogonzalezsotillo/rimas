// -*- mode: js2; -*-
console.log("worker: loading");


self.importScripts( "./dummy-modules.js");
self.importScripts( "./corpus-by-syllable-no-pp.js");
self.importScripts( "./corpus-by-frequency.js");
self.importScripts( "./corpus-utils.js");
self.importScripts( "./rimas.js");


let palabraActual = "";
let iteradorActual = null;


self.onmessage = function(e){
    const data = e.data;
    const {palabra,asonante,silabas} = data;
    console.log( `worker: palabra:${palabra} asonante:${asonante} silabas:${silabas}` );

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

    console.log( `worker: value:${value} done:${done}` );

    self.postMessage({
        rima : value,
        done : done,
        palabra : palabra,
        asonante : asonante,
        silabas : silabas
    });
};

console.log("worker: loaded");
