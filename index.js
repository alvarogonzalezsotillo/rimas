// -*- mode: js2; -*-


var {todasLasPalabrasConRimaAsonante} = require("./rimas.js");
var {palabraConHiatos} = require("./corpus-utils.js");

const d = document;

let palabraActual = "";


function muestraPalabrasQueRimanCon(palabra,max){

    if( palabra == palabraActual ){
        return;
    }
    palabraActual = palabra;
    
    const div = d.getElementById("resultado");
    div.innerHTML = "";
    const iterador = todasLasPalabrasConRimaAsonante(palabra);
    buscaSiguientePalabra(palabra, iterador);
    console.log("salgo de muestraPalabrasQueRimanCon");
    return;

    const maximo = max || 100;
    let i = 0;
    for( let p of iterador ){
        const silabas = palabraConHiatos(p);
        agregaPalabra(p);
        i += 1;
        if( i > maximo ){
            break;
        }
    }
}

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

function buscaSiguientePalabra(palabra, iterador, actual, limite){
    const current = actual || 0;
    const limit = limite || 100;
    if( current > limit ){
        return;
    }

    if( palabraARimar() != palabra ){
        return;
    }
    
    const promise = new Promise( (resolve,reject) => {
        const {value,done} = iterador.next();
        if( value ){
            resolve(value);
        }
        else{
            reject("Iterador vacío");
        }
    });

    promise.then(
        (p) => {
            agregaPalabra(p);
            setTimeout( ()=> buscaSiguientePalabra(palabra, iterador, current+1, limit ), 1 );
        },
        (error) => {
            console.log(error);
        }
    );

}

function palabraARimar(){
    const palabraInput = d.getElementById("palabra");
    return palabraInput.value;
}

function setUpUI(){
    const palabraInput = d.getElementById("palabra");
    palabraInput.addEventListener("keyup",()=>{
        const palabra = palabraARimar();
        console.log(palabra);
        muestraPalabrasQueRimanCon(palabra);
    },true);
}


window.addEventListener("load", ()=>{
    setUpUI();
});
