// -*- mode: js2; -*-

var log = function(module,s){
    console.log(`${module}: ${s()}` );
};


var corpus_BySyllable = require( "./corpus-by-syllable.js" ).corpusBySyllable;
var corpus_Frequency = require( "./corpus-by-frequency.js" ).corpusByFrequency;



var {
    palabraConHiatos,
    silabaTonica,
    letraTonica,
    normalizaPronunciacionDeSilaba,
    quitaConsonantes,
    quitaAcentos
} = require( "./corpus-utils.js" );

var {Palabra} = require( "./palabra.js" );



function rimaConsonanteCon(p1,p2){

    const palabra1 = Palabra.fromString(p1);
    const palabra2 = Palabra.fromString(p2);

    
    const s1 = palabra1.pronunciacion;
    const s2 = palabra2.pronunciacion;
    if( !s1 || !s2 ){
        return false;
    }

    if( s1 == null || s2 == null ){
        return false;
    }
    const i1 = palabra1.letraTonicaPronunciacion;
    const i2 = palabra2.letraTonicaPronunciacion;
    const fin1 = s1.join("").substring(i1);
    const fin2 = s2.join("").substring(i2);
    if( fin1 == fin2 ){
        log("rimas",()=>`p1:${p1} p2:${p2} s1:${s1} s2:${s2} i1:${i1} i2:${i2} fin1:${fin1} fin2:${fin2}`);
    }
    return fin1 == fin2;
}


function rimaAsonanteCon(p1,p2){
    log("rimas",()=> `rimaAsonanteCon: ${p1}  ${p2}`);

    const palabra1 = Palabra.fromString(p1);
    const palabra2 = Palabra.fromString(p2);
    const s1 = palabra1.pronunciacion;
    const s2 = palabra2.pronunciacion;
    const t1 = palabra1.silabaTonica;
    const t2 = palabra2.silabaTonica;
    
    log("rimas",()=>"  p1:" + p1 );
    log("rimas",()=>"  s1:" + s1 );
    log("rimas",()=>"  t1:" + t1 );
    log("rimas",()=>"  p2:" + p2 );
    log("rimas",()=>"  s2:" + s2 );
    log("rimas",()=>"  t2:" + t2 );

    if( !palabra1 || !palabra2 || !s1 || !s2  ){
        log("rimas",()=>"mala palabra:" + p1 + " -- " + p2 );
        return false;
    }

    
    function silabaRimaCon(s1,s2){
        log("rimas",()=>"    s1:" + s1 );
        log("rimas",()=>"    s2:" + s2 );

        const n1 = quitaConsonantes(quitaAcentos(s1));
        const n2 = quitaConsonantes(quitaAcentos(s2));

        log("rimas",()=>"    n1:" + n1 );
        log("rimas",()=>"    n2:" + n2 );
        
        return  n1 == n2;
    }
    
    if( s1.length - t1 != s2.length - t2){
        return false;
    }

    for(let i = 0 ; i < s1.length-t1 ; i++){
        const i1 = s1.length - i - 1;
        const i2 = s2.length - i - 1;
        log("rimas",()=> `    i1: ${i1} s1[i1]:${s1[i1]}  i2:${i2}  s2[i2]:${s2[i2]}`);
        if(!silabaRimaCon(s1[i1], s2[i2] )){
            return false;
        }
    }
    return true;
}


function* todasLasPalabrasConRimaConsonante(palabra,numeroSilabas){
    log("rimas",()=>"todasLasPalabrasConRimaConsonante");
    const silabas = palabraConHiatos(palabra);
    const tonica = silabaTonica(silabas);

    log("rimas",()=>`tonica:${tonica} numeroSilabas:${numeroSilabas}`);
    log("rimas",()=>`tonica+1:${tonica+1} numeroSilabas:${numeroSilabas}`);

    if( !silabas || silabas.length == 0 || tonica == null ){
        return;
    }

    
    if( silabas.length - tonica+1 > numeroSilabas && numeroSilabas > 0 ){
        log("rimas",()=>"tonica+1 >= numeroSilabas");
        return;
    }

    let candidatas = corpus_Frequency;
    if( numeroSilabas > 0 && corpus_BySyllable[numeroSilabas-1] ){
        candidatas = corpus_BySyllable[numeroSilabas-1];
    }

    for( let c of candidatas ){
        if( rimaConsonanteCon(palabra,c) ){
            yield c;
        }
    }
}

function* todasLasPalabrasConRimaAsonante(palabra,numeroSilabas){
  
    log("rimas",()=>"todasLasPalabrasConRimaAsonante");
    const silabas = palabraConHiatos(palabra);
    const tonica = silabaTonica(silabas);


    log("rimas",()=>`todasLasPalabrasConRimaAsonante tonica:${tonica} numeroSilabas:${numeroSilabas}`);
    log("rimas",()=>`todasLasPalabrasConRimaAsonante tonica+1:${tonica+1} numeroSilabas:${numeroSilabas}`);

    if( !silabas || silabas.length == 0 || tonica == null ){
        log("rimas",()=> "todasLasPalabrasConRimaAsonante: return");
        return;
    }

     
    if( silabas.length -tonica+1 > numeroSilabas  && numeroSilabas > 0 ){
        log("rimas",()=>"todasLasPalabrasConRimaAsonante: return tonica+1 >= numeroSilabas: " + tonica );
        return;
    }

    let candidatas = corpus_Frequency;
    if( numeroSilabas > 0 && corpus_BySyllable[numeroSilabas-1] ){
        candidatas = corpus_BySyllable[numeroSilabas-1];
    }

    for( let c of candidatas ){
        if( rimaAsonanteCon(palabra,c) ){
            log("rimas",()=> `todasLasPalabrasConRimaAsonante: yield: ${c}`); 
            yield c;
        }
    }


    log("rimas",()=> `todasLasPalabrasConRimaAsonante: Se acabó el generator: ${palabra} ${numeroSilabas}`);
}

module.exports = {
    rimaConsonanteCon: rimaConsonanteCon,
    rimaAsonanteCon: rimaAsonanteCon,
    todasLasPalabrasConRimaConsonante: todasLasPalabrasConRimaConsonante,
    todasLasPalabrasConRimaAsonante: todasLasPalabrasConRimaAsonante
};

