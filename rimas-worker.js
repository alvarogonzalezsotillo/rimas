// -*- mode: js2; -*-

var ultimatelog = function(module,s){
    if( false 
        //|| module == "rimas" 
        //|| module == "rimas-worker"
      ){
        console.log(`${module} hola: ${s()}` );
    }
};

var log = ultimatelog;


function loadModules(){
    self.importScripts("./dummy-modules.js");
    self.importScripts("./corpus-by-syllable.js");
    self.importScripts("./corpus-by-frequency.js");
    self.importScripts("./lemario.js");
    self.importScripts("./corpus-utils.js");
    self.importScripts("./palabra.js");
    self.importScripts("./rimas.js");
    log = ultimatelog;
}



function cargaInicial(){
    loadModules();
    self.postMessage({
        cargaInicialFinalizada: true
    });
    return;
}

const estado = {
    palabra: "",
    iterador: null,
    asonante: null,
    silabas: null,
    candidatas: null
};



function cachedIterator(palabra,asonante,numeroSilabas){


    function* iterador(){
        const silabas = palabraConHiatos(palabra);
        const tonica = silabaTonica(silabas);
        let candidatas = lemario; //corpusByFrequency;
        
        if( !silabas || silabas.length == 0 || tonica == null ){
            return;
        }
        
        if( silabas.length - tonica-1 > numeroSilabas && numeroSilabas > 0 ){
            return;
        }

        if( numeroSilabas > 0 && corpusBySyllable[numeroSilabas-1] ){
            candidatas = corpusBySyllable[numeroSilabas-1];
        }

        estado.candidatas = candidatas;

        for( let c of candidatas ){
            yield c;
        }
    }

    class iteratorWithIndex{
        constructor(iterator){
            this.iterator = iterator;
            this._index = 0;
        }

        next(){
            this._index += 1;
            const ret = this.iterator.next();
            return {
                value : ret.value,
                done : ret.done,
                index : this.index
            };
        }

        get index(){
            return this._index;
        }
    }


    if( palabra != estado.palabra ||
        asonante != estado.asonante ||
        numeroSilabas != estado.silabas ){

        const it = iterador(palabra,numeroSilabas);
        
        estado.iterador = new iteratorWithIndex( it );
        estado.palabra = palabra;
        estado.asonante = asonante;
        estado.silabas = numeroSilabas;
    }

    return estado.iterador;
}

function procesa(palabra,asonante,silabas,paso,callback){
    const iterador = cachedIterator(palabra,asonante,silabas);
    const filtro = asonante ? rimaAsonanteCon : rimaConsonanteCon;
    for( let i = 0 ; i < paso ; i++ ){
        const {value,done} = iterador.next();
        if( value && filtro(palabra,value) ){
            callback(value);
        }
        if( done ){
            return true;
        }
    }
    return false;
}



self.addEventListener("message", function(e){
    const data = e.data;
    log("rimas-worker", ()=>"worker: onMessage:" + JSON.stringify(data) );

    if( data.cargaInicial ){
        cargaInicial();
        return;
    }
    
    const {terminar,palabra,asonante,silabas,paso} = data;
    log("rimas-worker", ()=> `worker: message: palabra:${palabra} asonante:${asonante} silabas:${silabas} terminar:${terminar}` );

    if( terminar || typeof palabra == "undefined" ){
        estado.palabra = null;
        estado.iterador = null;
        return;
    }

    const iteratorDone = procesa(palabra,asonante,silabas,paso, (value) => {
        sendResponse({
            rima : value,
            done : false,
            palabra : palabra,
            asonante : asonante,
            silabas : silabas
        });
    });

    if( iteratorDone ){
        estado.palabra = null;
        estado.iterador = null;
        
        sendResponse({
            done : true,
            palabra : palabra,
            asonante : asonante,
            silabas : silabas
        });
    }
    else{
        sendResponse({
            finDePaso : true,
            done : false,
            palabra : palabra,
            asonante : asonante,
            silabas : silabas
        });
    }
        
});

function sendResponse( {rima,palabra, done, asonante, silabas, index, finDePaso} ){
    const iterador = cachedIterator(palabra,asonante,silabas);

    self.postMessage({
        rima : rima,
        done : done,
        palabra : palabra,
        asonante : asonante,
        indice : iterador.index,
        total : estado.candidatas ? estado.candidatas.length : 0,
        silabas : silabas,
        finDePaso : finDePaso
    });
}
