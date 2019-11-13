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

    
    s = quitaAcentos(s.toLowerCase());
    if( s.length != 6 ){
        return null;
    }

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


function dumpHTML(out){
    out("<!DOCTYPE html>");
    out("<html>");
    out("<head>");
    out(`<meta charset="utf-8">`);
    out(`<style> .color {display:inline-block;margin:0.3em; padding:0.4em; text-shadow: ${computeTextShadowStyle("#ffffff",0.01)};} </style>`);
    out("</head>");
    out("<body>");
    for( let palabra of corpusByFrequency ){
        colorHTML(out,palabra,letrasExtraPermitidas);
    }
    out("</body>");
    out("</html>");
}

dumpHTML(console.log);
