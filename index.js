// -*- mode: js2; -*-


function log(s){
    //console.log(s);
}

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
    log("agregaPalabra:" + palabra );
    div.appendChild(p);
}

function palabraARimar(){
    const palabraInput = d.getElementById("palabra");
    return palabraInput.value;
}

let workerData = null;

function onWorkerMessage(event){
    log(`onWorkerMessage: ${event}`);
    const {cargaInicialFinalizada,rima,done,palabra,asonante,silabas} = event.data;

    if( !workerData ){
        log("Sin workerdata");
        return;
    }

    if( cargaInicialFinalizada ){
        console.log("Carga inicial finalizada");
        return;
    }
    
    if( workerData.palabra != palabra  ||
        workerData.asonante != asonante ||
        workerData.silabas != silabas ){
        log("workerData no coincide");
        return;
    }

    agregaPalabra(rima);

    if( !done ){
        pideRima(palabra, asonante, silabas);
    }
    else{
        workerData = null;
        desactivaIndicacionProgreso();
    }
}

function createWorker(){
    const ret = new Worker( "./rimas-worker.js" );
    ret.postMessage({
        cargaInicial: true 
    });
    return ret;
}

function getWorkerData(palabra, asonante, silabas ){
    let changed = false;
    if( !workerData ||
        workerData.palabra != palabra  ||
        workerData.asonante != asonante ||
        workerData.silabas != silabas ){

        if( workerData && workerData.worker ){
            workerData.worker.terminate();
        }
        log("Creo nuevo worker");
        const worker = createWorker();
        workerData = {
            worker : worker,
            palabra : palabra,
            asonante : asonante,
            silabas : silabas
        };
        worker.addEventListener('message', onWorkerMessage);
        changed = true;
    }
    return {
        workerData: workerData,
        changed: changed
    };
}

function pideRima(palabra, asonante, silabas){
    log(`pideRima: ${palabra}`);
    const wd = getWorkerData(palabra,asonante,silabas).workerData;
    activaIndicacionProgreso();
    wd.worker.postMessage({
        palabra: palabra,
        asonante: asonante,
        silabas: silabas
    });
}

function paraProgreso(){
    if( workerData && workerData.worker ){
        workerData.worker.postMessage({
            terminar: true
        });
        workerData = null;
    }
    desactivaIndicacionProgreso();
}

function iniciaPeticionRima(){
    console.log("iniciaPeticionRima");

    const numeroDeSilabas = d.getElementById("numeroDeSilabas");
    const palabra = palabraARimar();
    const asonante = !rimaConsonante.checked;
    const silabas = numeroDeSilabas.value;
    const wd = getWorkerData(palabra,asonante,silabas);
    if( wd.changed ){
        const div = d.getElementById("resultado");
        div.innerHTML = "";
    }
    pideRima( palabra, asonante, silabas );
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
