// -*- mode: js2; -*-


import{
    corpusByFrequency
} from "./corpus-by-frequency.mjs";



function log(s){
    // console.log(s);
}


const letrasPermitidas = {
    "a": "A",
    "b": "B",
    "c": "C",
    "d": "D",
    "e": "E",
    "f": "F",
};

const letrasExtraPermitidas = {
    "a": "A",
    "b": "B",
    "c": "C",
    "d": "D",
    "e": "E",
    "f": "F",
    "o": "0",
    "i": "1",
    "g": "6",
    "s": "5"
};



function colorDesdePalabra(s,permitidas){

    function quitaAcentos(silaba){
        const map = { "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u" };
        return silaba.toLowerCase().split("").map( l =>{
            return map[l] ? map[l] : l;
        }).join("");
    }

    
    if( s.length != 6 ){
        return null;
    }
    s = quitaAcentos(s.toLowerCase());

    const ls = s.split("");
    if( ls.some( l => !permitidas[l] ) ){
        return null;
    }

    return ls.map( l => permitidas[l] ).join("");
}


function colorHTML(out,s,permitidas){
    const color = colorDesdePalabra(s,permitidas);
    if( !color ){
        return;
    }
    const c = "#" + color;
    out(
      `
      <div class="color" style="background-color:${c}" title="${c}">
        ${s}
      </div>
      `
    );
}

// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function computeTextShadowStyle(color,em){
    let ret = [];
    for( let x = -1 ; x <= 1 ; x += 1){
        for( let y = -1 ; y <= 1 ; y += 1){
            ret.push( `${em*x}em ${em*y}em 1px ${color}` );
        }
    }
    return ret.join(",");
}

function dumpStyle(out){
    out(`<style> .color {vertical-align: middle; text-align: center; border-radius: 3px; font-size: 1.5em; display:inline-block;margin:0.3em; padding:0.4em; text-shadow: ${computeTextShadowStyle("#ffffff",0.01)};} </style>`);
}

function dumpHTML(out){
    out("<!DOCTYPE html>");
    out("<html>");
    out("<head>");
    out(`<meta charset="utf-8">`);
    dumpStyle(out);
    out("</head>");
    out("<body>");
    for( let palabra of corpusByFrequency ){
        colorHTML(out,palabra,letrasExtraPermitidas);
    }
    out("</body>");
    out("</html>");
}

function setUpUI(){
    const container = document.getElementById("colores");
    const contador = document.getElementById("contador");

    let style = "";
    dumpStyle( s => style = s);
    document.head.appendChild(htmlToElement(style));

    const worker = createWorker();
    worker.postMessage({
        type: "search",
        corpus: corpusByFrequency
    });
    worker.onmessage = (event) => {

        const data = event.data;

        if( data.finalizado ){
            contador.value = contador.max;
            contador.style = "display:none";
            return;
        }

        contador.max = data.total;
        contador.value = data.indice;
        
        // console.log("Page: recibo del worker:" + event.data );
        const color = data.palabra;
        let html = "";
        colorHTML(s => html = s,color,letrasExtraPermitidas);
        // console.log( "Page: html: " + html );
        const element = htmlToElement(html);
        element.onclick = clickOnColor(element);
        if( element ){
            container.appendChild(element);
        }
    };
}

function clickOnColor(element){

    return function (event){
        const div = element;
        const expandido = div.expandido;
        console.log(event);
        console.log( div );
        console.log(expandido);
        const color = div.title.trim();
        if( !expandido ){
            const palabra = div.innerHTML.trim();
            div.innerHTML = `<p style="font-size: 3em;">${palabra}</p><p>Se parece al color ${color}</p>`;
            div.expandido = true;
            div.palabra = palabra;
        }
        else{
            const palabra = div.palabra;
            div.innerHTML = palabra;
            div.expandido = false;
        }
    };
}

function createWorker(){
    const worker = new Worker("colores-worker.js");
    return worker;
}


function isBrowserPage(){
    return typeof window != "undefined";
}

function isBrowserWorker(){
    return typeof importScripts != "undefined";
}

function isNode(){
    return !isBrowserPage() && !isBrowserWorker();
}


if( isBrowserPage() ){
    // window.addEventListener("load", ()=>{
    //     console.log("on load");
    //     setUpUI();
    // });
    setUpUI();
}
else if( isNode() ){
    dumpHTML(console.log);
}
else{
    throw "No se pudo detectar el entorno de ejecución";
}

