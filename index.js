// -*- mode: js2; -*-


var log = function(module,s){
    //console.log(`${module}: ${s()}` );
};

const d = document;

// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function activaIndicacionProgreso(){
    const div = d.getElementById("progreso");
    div.style.display="initial";
}

function desactivaIndicacionProgreso(){
    const div = d.getElementById("progreso");
    div.style.display="none";
}

function agregaPalabra(palabra){
    if( !palabra ){
        return;
    }
    const div = d.getElementById("resultado");
    const p = htmlToElement(`<div class="palabra">${palabra}</div>`);
    log("index", ()=>"agregaPalabra:" + palabra );
    div.appendChild(p);
}

function palabraARimar(){
    const palabraInput = d.getElementById("palabra");
    return palabraInput.value;
}

function pidePaso(palabra, asonante, silabas, paso){

    paso = 1000;
    
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

const JS = o => JSON.stringify(o);


function onWorkerMessage(event){
    log("index", ()=>`onWorkerMessage: ${JS(event.data)}`);
    const {cargaInicialFinalizada,rima,done,palabra,asonante,silabas,finDePaso} = event.data;

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
        pidePaso(palabra, asonante, silabas, 2 );
    }
    
    if( done ){
        desactivaIndicacionProgreso();
    }
}

function createWorker(){
    const ret = new Worker( "./rimas-worker.js" );
    ret.addEventListener("message",onWorkerMessage);
    ret.postMessage({
        cargaInicial: true 
    });
    return ret;
}

const workerData = {
    worker : createWorker()
};




function paraProgreso(){
    if( workerData && workerData.worker ){
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

    const numeroDeSilabas = d.getElementById("numeroDeSilabas");
    const rimaConsonante = d.getElementById("rimaConsonante");
    const palabra = palabraARimar();
    const asonante = !rimaConsonante.checked;
    const silabas = numeroDeSilabas.value;
    if( workerData.palabra != palabra  ||
        workerData.asonante != asonante ||
        workerData.silabas != silabas ){
        const div = d.getElementById("resultado");
        div.innerHTML = "";
    }
    pidePaso( palabra, asonante, silabas, 2 );
}

function setUpUI(){
    desactivaIndicacionProgreso();
    const palabraInput = d.getElementById("palabra");
    const rimaConsonante = d.getElementById("rimaConsonante");
    const numeroDeSilabas = d.getElementById("numeroDeSilabas");
    
    palabraInput.addEventListener("keyup",()=>{
        iniciaPeticionRima();
    });

    const botonPararProgreso = d.getElementById("botonPararProgreso");
    botonPararProgreso.addEventListener("click",()=>{
        paraProgreso(); 
    });

    rimaConsonante.addEventListener("click",()=>{
        iniciaPeticionRima();
    });

    numeroDeSilabas.addEventListener("click",()=>{
        iniciaPeticionRima();
    });
}


window.addEventListener("load", ()=>{
    setUpUI();
});
