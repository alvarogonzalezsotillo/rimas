// -*- mode: js2; -*-


const d = document;

// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}


function agregaPalabra(palabra){
    const div = d.getElementById("resultado");
    const p = htmlToElement(`<div class="palabra">${palabra}</div>`);
    console.log("agregaPalabra:" + palabra );
    div.appendChild(p);
}

function palabraARimar(){
    const palabraInput = d.getElementById("palabra");
    return palabraInput.value;
}

let workerData = {
    worker : null,
    palabra : null,
    asonante : null,
    silabas : null
};

function onWorkerMessage(event){
    console.log(event);
    const {rima,done,palabra,asonante,silabas} = event.data;

    if( workerData.palabra != palabra  ||
        workerData.asonante != asonante ||
        workerData.silabas != silabas ){
        return;
    }

    agregaPalabra(rima);

    if( !done ){
        pideRima(palabra, asonante, silabas);
    }
}

function getWorkerData(palabra, asonante, silabas ){
    let changed = false;
    if( workerData.palabra != palabra  ||
        workerData.asonante != asonante ||
        workerData.silabas != silabas ){

        if( workerData.worker ){
            workerData.worker.terminate();
        }
        console.log("Creo nuevo worker");
        const worker = new Worker( "./rimas-worker.js" );
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
    const wd = getWorkerData(palabra,asonante,silabas).workerData;
    wd.worker.postMessage({
        palabra: palabra,
        asonante: asonante,
        silabas: silabas
    });
}

function setUpUI(){
    const palabraInput = d.getElementById("palabra");
    palabraInput.addEventListener("keyup",()=>{
        const palabra = palabraARimar();
        const asonante = true;
        const silabas = 0;
        const wd = getWorkerData(palabra,asonante,silabas);
        if( wd.changed ){
            const div = d.getElementById("resultado");
            div.innerHTML = "";
        }
        console.log(wd);
        pideRima( palabra, asonante, silabas );
    },true);
}


window.addEventListener("load", ()=>{
    setUpUI();
});
