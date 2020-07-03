// -*- mode: js2; -*-


var {
    Palabra
} = require( "./palabra.js" );


var log = function(module,s){
    if( !(["conTrazaDeError"].includes(module)) ){
        return false;
    }
    
     console.log(`${module}: ${s()}` );

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

domIdAccessFunctions( ["pronunciacion", "palabra", "explicacion"] );

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
    
    palabraInput.addEventListener("keyup", conTrazaDeError( ()=>{
        let palabra = palabraARimar();
        actualizaPronunciacion(palabra);
    }));

}

window.addEventListener("load", ()=>{
    setUpUI();
});

