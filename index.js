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

domIdAccessFunctions( ["pronunciacion", "palabra", "explicacion", "rimas"] );

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

const JS = o => JSON.stringify(o);

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
    
    palabraInput.addEventListener("keyup", conTrazaDeError( ()=>{
        let palabra = palabraARimar();
        actualizaPronunciacion(palabra);
        iniciaBusquedaRimas(palabra);
    }));

}


function iniciaBusquedaRimas(palabra){

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

    console.log("********* INICIO **********" + palabra);

    const control = asincronizaUnGenerador( rimaCon( palabra, corpusByFrequency, false) , (value,done,control) => {
        const actual = control === iniciaBusquedaRimas.controlActual;
        console.log(`value:${value} done:${done} actual:${actual}`);
        if( value && actual && !done ){
            rimasE().innerHTML += " " + value;
        }
    });
    console.log( "asincronizado" );
    
    
    iniciaBusquedaRimas.controlActual = control;
    console.log( "controlado" );
    
    window.setTimeout( ()=> {
        control.pauseAssap();
        console.log("********* TIMEOUT **********" + palabra);
    }, 50000);

    console.log( "Fin iniciaBusquedaRimas" );
}


function* rimaCon( palabra, candidatas, asonante, maxStep = 100 ){
    const silabas =  Palabra.from(palabra).silabas;
    if( !silabas || silabas.length == 0 ){
        return;
    }

    let step = 0;
    for( let candidata of candidatas ){
        step += 1;
        if( step >= maxStep ){
            step = 0;
            yield null;
        }
        if( asonante && rimaAsonanteCon(palabra, candidata) ){
            step = 0;
            yield candidata;
        }
        if( !asonante && rimaConsonanteCon(palabra, candidata) ){
            step = 0;
            yield candidata;
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
            this.timeout();
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
                this.timeout();
            }
        }

        get steps(){ return this._steps; }
        get done(){ return this._done; }

        timeout(){
            log( "timeout" );
            log( this );
            
            if( this._done ){
                return;
            }
            this._running = true;
            window.setTimeout( ()=> this.step(), this._delay );
        }
        
    }

    const control = new Control(generator,callback);
    control.timeout();
    return control;
    
}

window.addEventListener("load", ()=>{
    setUpUI();
});

