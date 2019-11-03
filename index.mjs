// -*- mode: js2; -*-
import { 
    todasLasPalabrasConRimaAsonante,
} from "./rimas.mjs";


import {
    palabraConHiatos,
} from "./corpus-utils.mjs";

const d = document;

function muestraPalabrasQueRimanCon(palabra){
    const div = d.getElementById("resultado");
    div.innerHTML = "";
    let i = 0;
    console.log("muestaPalabrasQueRimanCon:" + palabra );
    for( let p of todasLasPalabrasConRimaAsonante(palabra,3) ){
        const silabas = palabraConHiatos(p);
        console.log(`${p}\t${silabas}`);
        div.innerHTML += " " + p + " ";
        i += 1;
        if( i > 10 ){
            break;
        }
    }

    
}

function setUpUI(){
    console.log("setUpUI");
    
    const palabraInput = d.getElementById("palabra");
    palabraInput.addEventListener("keyup",()=>{
        const palabra = palabraInput.value;
        console.log(palabra);
        muestraPalabrasQueRimanCon(palabra);
    },true);
}


window.addEventListener("load", ()=>{
    console.log("on load");
    setUpUI();
});
