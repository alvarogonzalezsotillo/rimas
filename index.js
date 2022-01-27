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

domIdAccessFunctions( ["pronunciacion", "palabra", "explicacion", "rimas", "progreso","numeroSilabas"] );

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
    const numeroRange = numeroSilabasE();
    let asonante = false;
    

    createToggle( d.getElementById("toggle-test"), (r)=>{
        asonante = !r.on;
        let palabra = palabraARimar();
        iniciaBusquedaRimas(palabra,asonante,numeroRange.value);
    });

    palabraInput.addEventListener("keyup", conTrazaDeError( ()=>{
        let palabra = palabraARimar();
        actualizaPronunciacion(palabra);
        iniciaBusquedaRimas(palabra,asonante,numeroRange.value);
    }));

    numeroRange.addEventListener("change", conTrazaDeError( ()=>{
        let palabra = palabraARimar();
        iniciaBusquedaRimas(palabra,asonante,numeroRange.value);
    }));
}


function iniciaBusquedaRimas(palabra,asonante,numeroSilabas){

    const log = ()=> {};

    if( palabra == iniciaBusquedaRimas.palabraActual &&
        asonante == iniciaBusquedaRimas.asonanteActual &&
        numeroSilabas == iniciaBusquedaRimas.numeroSilabasActual ){
        return;
    }   

    rimasE().innerHTML = "";
    log("NO ES LO MISMO");

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
    }

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


function createToggle(parentDiv,callback){
    function toggle(on,handle,labelOn,labelOff){
        // handle
        if( on ){
            handle.style.left = "calc(100% - 1em)";
            handle.style.right = "0%";
        }
        else{
            handle.style.right = "calc(100% - 1em)";
            handle.style.left = "0%";

        }
        // label on
        if( on ){
            labelOn.style.right = "1.5em";
        }
        else{
            labelOn.style.right = "100%";
        }

        // label off
        if( on ){
            labelOff.style.left = "100%";
        }
        else{
            labelOff.style.left = "1.5em";
        }


        return false;
    }

    const html = `
        <div class="toggle-outter">
            <div class="toggle-track">
                <div class="toggle-handle" style="right:0%; left:calc(100% - 1em)"></div>
            </div>
        </div>
    `;
    const t = htmlToElement(html);

    const ret = {
        element : t,
        on : true,
        callback: callback
    };


    const handle = t.querySelector(".toggle-handle");
    const labelOn = parentDiv.querySelector(".toggle-label-on");
    const labelOff = parentDiv.querySelector(".toggle-label-off");
    const toggleTrack = t.querySelector(".toggle-track");

    toggleTrack.appendChild(labelOn);
    toggleTrack.appendChild(labelOff);

    window.setTimeout( ()=> {
        const width = Math.max(labelOn.clientWidth,labelOff.clientWidth);
        t.style.width = `calc(${width}px + 1.5em)`;
    },100);

    const listener = (evt)=> {
        let on = handle.style.right == "0%";
        toggle(!on, handle,labelOn,labelOff);
        if( evt ){
            evt.stopPropagation();
        }
        ret.on = !on;
        if( ret.callback ){
            callback(ret);
        }
    };
    handle.addEventListener("click",listener);
    toggleTrack.addEventListener("click",listener);
    t.addEventListener("click",listener);
    parentDiv.appendChild(t);

    listener();
    listener();

    return ret;
}
