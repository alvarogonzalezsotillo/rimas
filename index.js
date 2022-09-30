// -*- mode: js2; -*-


var {
    Palabra
} = require( "./palabras/palabra.js" );

var {
    rimaConsonanteCon,
    rimaAsonanteCon
} = require( "./palabras/rimas.js" );

var {
    corpusByFrequency
} = require( "./corpus/corpus-by-frequency.js" );

var {
    corpusBySyllable
} = require( "./corpus/corpus-by-syllable.js" );

var log = function(module,s){
    if( !(["conTrazaDeError"].includes(module)) ){
        return false;
    }
    
    // console.log(`${module}: ${s()}` );

    //     const logE = idE("log");
    //     child = htmlToElement(`<p>${module}: ${s()}</p>`);
    //     logE.appendChild(child);

    return true;
};

const d = document;

// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
    var template = d.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}


function domIdAccessFunctions(ids, suffix="E",object=window){

    function idE(id){
        return d.getElementById(id);
    }

    ids.forEach( id => {
        object[`${id}${suffix}`] = function(){
            return idE(id);
        };
    });
}

domIdAccessFunctions( ["pronunciacion", "palabra", "explicacion", "rimas", "progreso","numeroSilabas", "numeroSilabasText", "asonanteConsonante", "asonanteConsonanteText"] );

function pronunciacionHTML(palabra){
    const w = new Palabra(palabra);
    if( !w.pronunciacionAFI ){
        return "&nbsp;";
    }
    const silabas = w.pronunciacionAFI.map(quitaAcentos);
    silabas[w.silabaTonica] = `<b>${silabas[w.silabaTonica]}</b>`;
    return silabas.join(".");
}

function explicacionHTML(palabra){
    if( palabra == "" ){
        return "&nbsp;";
    }
    const w = new Palabra(palabra);
    if( !w.explicacionPronunciacion ){
        return "&nbsp;";
    }
    return w.explicacionPronunciacion;
}


function palabraARimar(){
    const palabraInput = palabraE();
    return palabraInput.value.toLowerCase().replaceAll(" ","");
}

function actualizaPronunciacion(palabra){
    pronunciacionE().innerHTML = pronunciacionHTML(palabra);
    explicacionE().innerHTML = explicacionHTML(palabra);
}

function conTrazaDeError(fun){
    return function(...args){
        try{
            log("conTrazaDeError", ()=> "Llamado con:" + fun + " -- " + args );
            fun.apply(null,args);
        }
        catch(error){
            log("conTrazaDeError",()=> `${error} ${fun} ${args}`);
            if( error.stack ){
                log("conTrazaDeError",()=> `${error.stack}`);
            }
        }
    };
}

function setUpUI(){
    const palabraInput = palabraE();
    const numeroRange = numeroSilabasE();
    const numeroSilabasText = numeroSilabasTextE();
    const asonanteConsonanteRange = asonanteConsonanteE();
    const asonanteConsonanteText = asonanteConsonanteTextE();
    

    function algunCambio(){
        const asonante = asonanteConsonanteRange.value == 0;
        const palabra = palabraARimar();
        const numeroSilabas = numeroRange.value;
        iniciaBusquedaRimas(palabra,asonante,numeroSilabas);
    }
    
    asonanteConsonanteRange.addEventListener("change", (e) =>{
        const asonante = asonanteConsonanteRange.value == 0;
        asonanteConsonanteText.innerHTML = asonante ? "Asonante" : "Consonante";
        algunCambio();
    });

    palabraInput.addEventListener("keyup", conTrazaDeError( ()=>{
        const palabra = palabraARimar();
        actualizaPronunciacion(palabra);
        algunCambio();
    }));

    numeroRange.addEventListener("change", conTrazaDeError( ()=>{
        const numeroSilabas = numeroRange.value;
        if( numeroSilabas == 0 ){
            numeroSilabasText.innerHTML = "Cualquier número de sílabas";
        }
        else{
            numeroSilabasText.innerHTML = numeroSilabas + " sílabas";
        }
        algunCambio();
    }));
    
    numeroRange.dispatchEvent( new CustomEvent("change") );
    asonanteConsonanteRange.dispatchEvent( new CustomEvent("change") );
    palabraInput.focus();
}


function iniciaBusquedaRimas(palabra,asonante,numeroSilabas){

    const log = ()=> {};

    if( palabra == iniciaBusquedaRimas.palabraActual &&
        asonante == iniciaBusquedaRimas.asonanteActual &&
        numeroSilabas == iniciaBusquedaRimas.numeroSilabasActual ){
        return;
    }   

    rimasE().innerHTML = "";

    if( iniciaBusquedaRimas.controlActual ){
        iniciaBusquedaRimas.controlActual.pauseAssap();
        iniciaBusquedaRimas.controlActual = null;
    }

    const cacheaPalabra = true;
    if( cacheaPalabra ){
        Palabra.cacheActivo = true;
        Palabra.from(palabra);
        Palabra.cacheActivo = false;
    }

    iniciaBusquedaRimas.palabraActual = palabra;
    iniciaBusquedaRimas.asonanteActual = asonante;
    iniciaBusquedaRimas.numeroSilabasActual = numeroSilabas;

    const corpus = seleccionaCorpus(numeroSilabas);
    
    log("********* INICIO **********" + palabra );

    const control = asincronizaUnGenerador( rimaCon( palabra, corpus, asonante) , (value,done,control) => {
        const actual = control === iniciaBusquedaRimas.controlActual;
        log(`value:${JSON.stringify(value)} done:${done} actual:${actual}`);
        const p = progresoE();
        if( value ){
            p.max=value.total;
            p.value=value.current;
        }

        if( done ){
            p.value=p.max;
        }
        
        if( value && value.value && actual && !done ){
            const child = htmlToElement(`<span class="candidata"> ${value.value}</span>`);
            rimasE().appendChild( child );
        }
    });
    log( "asincronizado" );
    
    
    iniciaBusquedaRimas.controlActual = control;
    log( "controlado" );
    
    window.setTimeout( ()=> {
        control.pauseAssap();
        log("********* TIMEOUT **********" + palabra);
    }, 600000);

    log( "Fin iniciaBusquedaRimas" );
}

function seleccionaCorpus(numeroSilabas){
    if( numeroSilabas > 0 && numeroSilabas < corpusBySyllable.length ){
        return corpusBySyllable[numeroSilabas-1];
    }
    return corpusByFrequency;
}

function* rimaCon( palabra, candidatas, asonante, maxDelay = 9 ){
    const silabas =  Palabra.from(palabra).silabas;
    if( !silabas || silabas.length == 0 ){
        return;
    }

    function ret(current,total,value){
        return {
            "current": current,
            "total": total,
            "value": value
        };
    };

    const ini = new Date().getMilliseconds();
    const total = candidatas.length;
    for( let index = 0 ; index < total ; index += 1 ){
        const candidata = candidatas[index];
        const now = new Date().getMilliseconds();
        if( now > ini + maxDelay ){
            yield ret(index,total,null);
        }
        if( asonante && rimaAsonanteCon(palabra, candidata) ){
            yield ret(index,total,candidata);
        }
        if( !asonante && rimaConsonanteCon(palabra, candidata) ){
            yield ret(index,total,candidata);
        }
    }
}

function asincronizaUnGenerador( generator, callback ){

    const log = (s)=> undefined; //console.log(s);
    
    class Control{
        constructor(generator,callback){
            this._pauseAssap = false;
            this._steps = 0;
            this._callback = callback;
            this._generator = generator;
            this._done = false;
            this._running = false;
            this._delay = 10;
        }

        pauseAssap(){
            this._pauseAssap = true;
        }

        continue(){
            if( this._running ){
                return false;
            }
            this._pauseAssap = false;
            this.tick();
            return true;
        }

        step(){
            log( "step" );
            log( this );
            
            const item = this._generator.next();
            if( item.done ){
                this._done = true;
                this._running = false;
                this._callback(undefined,this.done,this);
                return;
            }
            this._steps += 1;
            this._callback(item.value,this.done,this);
            if( this._pauseAssap ){
                this._running = false;
            }
            else{
                this.tick();
            }
        }

        get steps(){ return this._steps; }
        get done(){ return this._done; }

        tick(){
            log( "tick" );
            log( this );
            
            if( this._done ){
                return;
            }
            this._running = true;
            window.setTimeout( ()=> this.step(), this._delay );
        }
        
    }

    const control = new Control(generator,callback);
    control.tick();
    return control;
    
}

window.addEventListener("load", ()=>{
    setUpUI();
});


