// -*- mode: js2; -*-


var {
    Palabra
} = require( "./palabras/palabra.js" );

var {
    rimaFast
} = require( "./palabras/rimas-fast.js" );


var log = function(module,s){
    if( !(["conTrazaDeError"].includes(module)) ){
        return false;
    }
    // console.log(`${module}: ${s()}` );
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

domIdAccessFunctions( ["pronunciacion", "palabra", "explicacion", "rimas", "progreso","numeroSilabas", "numeroSilabasText", "asonanteConsonante", "asonanteConsonanteText"] );

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

function actualizaPronunciacion(palabra){
    pronunciacionE().innerHTML = pronunciacionHTML(palabra);
    explicacionE().innerHTML = explicacionHTML(palabra);
}

function setUpUI(){
    const palabraInput = palabraE();
    const numeroRange = numeroSilabasE();
    const numeroSilabasText = numeroSilabasTextE();
    const asonanteConsonanteRange = asonanteConsonanteE();
    const asonanteConsonanteText = asonanteConsonanteTextE();
    

    function algunCambio(){
        console.log("algunCambio");
        const asonante = asonanteConsonanteRange.value == 0;
        const palabra = palabraARimar();
        const numeroSilabas = numeroRange.value;
        const numeroSilabasMax = numeroRange.max;
        iniciaBusquedaRimas(palabra,asonante,numeroSilabas,numeroSilabasMax);
    }
    
    asonanteConsonanteRange.addEventListener("change", (e) =>{
        const asonante = asonanteConsonanteRange.value == 0;
        asonanteConsonanteText.innerHTML = asonante ? "Asonante" : "Consonante";
        algunCambio();
    });

    palabraInput.addEventListener("keyup", ()=>{
        const palabra = palabraARimar();
        actualizaPronunciacion(palabra);
        algunCambio();
    });

    numeroRange.addEventListener("change",()=>{
        const numeroSilabas = numeroRange.value;
        if( numeroSilabas == 0 ){
            numeroSilabasText.innerHTML = "Cualquier número de sílabas";
        }
        else if( numeroSilabas == numeroRange.max ){
            numeroSilabasText.innerHTML = numeroSilabas + " sílabas o más";
        }
        else{
            numeroSilabasText.innerHTML = numeroSilabas + " sílabas";
        }
        algunCambio();
    });
    
    numeroRange.dispatchEvent( new CustomEvent("change") );
    asonanteConsonanteRange.dispatchEvent( new CustomEvent("change") );
    palabraInput.focus();
}

let ultimaBusqueda = null;

function iniciaBusquedaRimas(palabra,asonante,numeroSilabas,numeroSilabasMax){

    
    const log = ()=> {};

    log(`inicia: ${palabra}: ${asonante} ${numeroSilabas}`);
    

    if( ultimaBusqueda ){
        ultimaBusqueda.endASSAP();
        ultimaBusqueda = null;
    }
    
    rimasE().innerHTML = "";

    const rimas = rimaFast(palabra,asonante);
    log(`inicia: encontradas ${rimas.length}`);

    ultimaBusqueda = procesaUnArrayConPaciencia(rimas, (r)=>{
        const p = Palabra.from(r); 
        if( !numeroSilabas || numeroSilabas == 0 ||p.silabas.length == numeroSilabas || (numeroSilabas == numeroSilabasMax && p.silabas.length >= numeroSilabasMax ) ){
            const child = htmlToElement(`<span class="candidata"> ${r}</span>`);
            rimasE().appendChild( child );
        }
    }, ()=>{
        const child = htmlToElement(`<span class="candidata">No se encuentran más palabras</span>`);
        rimasE().appendChild( child );
    });
}

function procesaUnArrayConPaciencia(array,fn,endFn,step=10,ms=1){

    if( !array ){
        return {
            endASSAP: ()=>null
        };
    }
    
    let index = 0;
    const id = window.setInterval( ()=>{
        for( let i = 0 ; i < step ; i++ ){
            if( index >= array.length ){
                endFn();
                endASSAP();
                return;
            }
            fn(array[index]);
            index += 1;
        }
    },ms);
    
    function endASSAP(){
        window.clearInterval(id);
    }

    return {
        endASSAP: endASSAP
    };
}

window.addEventListener("load", ()=>{
    setUpUI();
});


