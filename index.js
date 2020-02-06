// -*- mode: js2; -*-


var {
    Palabra
} = require( "./palabra.js" );


var log = function(module,s){
    if( !(["conTrazaDeError"].includes(module)) ){
        return false;
    }
    
    //console.log(`${module}: ${s()}` );
    const logE = idE("log");
    child = htmlToElement(`<p>${module}: ${s()}</p>`);
    logE.appendChild(child);
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

function idE(id){
    return d.getElementById(id);
}

function domIdAccessFunctions(ids, suffix="E",object=window){
    ids.forEach( id => {
        object[`${id}${suffix}`] = function(){
            return idE(id);
        };
    });
}

domIdAccessFunctions( ["pronunciacion", "barraDeProgreso", "cabecera","resultado", "progreso", "palabra", "porcentaje", "numeroDeSilabas", "rimaConsonante", "botonPararProgreso"] );

function activaIndicacionProgreso(){
    progresoE().style.display="inline-block";
    botonPararProgresoE().value = "Parar búsqueda";
}

function desactivaIndicacionProgreso(){
    progresoE().style.display="none";
    botonPararProgresoE().value = "Iniciar búsqueda";
    workerData.palabra = null;
    workerData.asonante = null;
    workerData.silabas = null;
}


function pronunciacion(palabra){
    const w = new Palabra(palabra);
    if( !w.pronunciacionAFI ){
        return [];
    }
    const silabas = w.pronunciacionAFI.map(quitaAcentos);
    silabas[w.silabaTonica] = silabas[w.silabaTonica].toUpperCase();
    return silabas;
}

function alternaPalabraODatos(event){
    const div = event.target;
    console.log(div);
    const palabra = div.getAttribute("palabra");
    const expanded = div.getAttribute("expandido");
    if( expanded == "true" ){
        div.innerHTML = palabra;
        div.setAttribute("expandido","false");
    }
    else{
        const silabas = pronunciacion(palabra);
        div.innerHTML = `${palabra} se pronuncia <br> ${silabas.join(".")}`;
        div.setAttribute("expandido","true");
    }
}

function agregaPalabra(palabra){
    if( !palabra ){
        return;
    }
    const div = resultadoE();
    const p = htmlToElement(`<div class="palabra" palabra="${palabra}">${palabra}</div>`);
    log("index", ()=>"agregaPalabra:" + palabra );
    p.addEventListener("click", alternaPalabraODatos );
    div.appendChild(p);
}

function palabraARimar(){
    const palabraInput = palabraE();
    return palabraInput.value;
}

function pidePaso(palabra, asonante, silabas){

    const paso = 1037; // suficientemente grande y casi primo;
    
    log("index", ()=>`pidePaso: ${palabra}`);
    activaIndicacionProgreso();
    workerData.palabra = palabra;
    workerData.asonante = asonante;
    workerData.silabas = silabas;

    
    workerData.worker.postMessage({
        palabra: palabra,
        asonante: asonante,
        silabas: silabas,
        paso: paso
    });
}


function  indicaPorcentaje(indice,total){
    const porcentaje = porcentajeE();
    const barraDeProgreso = barraDeProgresoE();
    if( !indice && !total ){
        porcentaje.innerHTML = "";
    }
    else{
        const palabra = palabraARimar();
        porcentaje.innerHTML = `Buscando rimas para ${palabra} (${pronunciacion(palabra).join(".")}) ${indice}/${total}`;
        barraDeProgreso.min = 0;
        barraDeProgreso.max = total;
        barraDeProgreso.value=indice;
    }
}


const JS = o => JSON.stringify(o);


function onWorkerMessage(event){
    log("index", ()=>`onWorkerMessage: ${JS(event.data)}`);
    const {
        cargaInicialFinalizada,
        rima,
        done,
        palabra,
        asonante,
        silabas,
        finDePaso,
        indice,
        total
    } = event.data;

    indicaPorcentaje(indice,total);

    
    if( !workerData ){
        log("index", ()=>"Sin workerdata");
        return;
    }

    if( cargaInicialFinalizada ){
        log("index", ()=>"Carga inicial finalizada");
        return;
    }

    
    if( workerData.palabra != palabra  ||
        workerData.asonante != asonante ||
        workerData.silabas != silabas ){
        log("index", ()=>"workerData no coincide");
        return;
    }

    if( rima ){
        agregaPalabra(rima);
    }        

    if( finDePaso ){
        pidePaso(palabra, asonante, silabas);
    }
    
    if( done ){
        desactivaIndicacionProgreso();
    }
}

function createWorker(){
    const ret = new Worker( "./rimas-worker.js" );
    ret.addEventListener("message", conTrazaDeError(onWorkerMessage) );
    ret.postMessage({
        cargaInicial: true 
    });
    return ret;
}

const workerData = Object.seal({
    worker : createWorker(),
    palabra : null,
    asonante: null,
    silabas : null
});


function progresoActivado(){
    return workerData && workerData.worker && workerData.palabra;
}


function paraProgreso(){
    if( progresoActivado() ){
        workerData.worker.postMessage({
            terminar: true
        });
        workerData.palabra = null;
        workerData.asonante = null;
        workerData.silabas = null;
    }
    desactivaIndicacionProgreso();
}

function iniciaPeticionRima(){
    log("index", ()=>"iniciaPeticionRima");

    const numeroDeSilabas = numeroDeSilabasE();
    const rimaConsonante = rimaConsonanteE();
    const palabra = palabraARimar();
    const asonante = !rimaConsonante.checked;
    const silabas = numeroDeSilabas.value;
    if( workerData.palabra != palabra  ||
        workerData.asonante != asonante ||
        workerData.silabas != silabas ){
        const div = resultadoE();
        div.innerHTML = "";
    }
    pidePaso( palabra, asonante, silabas);
}

function actualizaPronunciacion(pronunciacion){
    const p = pronunciacionE();
    p.innerHTML = `Pronunciación AFI (aproximada): ${pronunciacion}`;
}

function conTrazaDeError(fun){
    return function(...args){
        try{
            fun.apply(null,args);
        }
        catch(error){
            log("conTrazaDeError",()=> `${error}`);
            if( error.stack ){
                log("conTrazaDeError",()=> `${error.stack}`);
            }
        }
    };
}

function setUpUI(){
    desactivaIndicacionProgreso();
    const palabraInput = palabraE();
    const rimaConsonante = rimaConsonanteE();
    const numeroDeSilabas = numeroDeSilabasE();
    
    palabraInput.addEventListener("keyup", conTrazaDeError( ()=>{
        iniciaPeticionRima();
        actualizaPronunciacion(pronunciacion(palabraARimar()).join("."));
    }));

    const botonPararProgreso = botonPararProgresoE();
    botonPararProgreso.addEventListener("click",conTrazaDeError( ()=>{
        if( progresoActivado() ){
            paraProgreso();
        }
        else{
            iniciaPeticionRima();
        }
    }));

    rimaConsonante.addEventListener("click", conTrazaDeError( ()=>{
        iniciaPeticionRima();
    }));

    numeroDeSilabas.addEventListener("click", conTrazaDeError( ()=>{
        iniciaPeticionRima();
    }));

    resizeUI();
}

function resizeUI(){
    const wh = window.innerHeight;
    const hh = cabeceraE().clientHeight;
    log("index", ()=>`wh:${wh} hh:${hh}` );
    resultadoE().style.height = `${wh - hh - 50}px`;
}


window.addEventListener("load", ()=>{
    setUpUI();
});


window.addEventListener("resize", ()=>{
    resizeUI();
});
