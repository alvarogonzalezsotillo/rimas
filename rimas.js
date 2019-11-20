// -*- mode: js2; -*-

function log(s){
    //console.log(s);
}


var corpus_BySyllable = require( "./corpus-by-syllable-no-pp.js" ).corpusBySyllable;
var corpus_Frequency = require( "./corpus-by-frequency.js" ).corpusByFrequency;



var {
    palabraConHiatos,
    silabaTonica,
    letraTonica,
    normalizaPronunciacionDeSilaba,
    quitaConsonantes,
    quitaAcentos
} = require( "./corpus-utils.js" );




function rimaConsonanteCon(p1,p2){
    const silabas1 = palabraConHiatos(p1).map( normalizaPronunciacionDeSilaba );
    const silabas2 = palabraConHiatos(p2).map( normalizaPronunciacionDeSilaba );
    //log( `${silabas1} ${silabas2}`);
    if( silabas1 == null || silabas2 == null ){
        return false;
    }
    const i1 = letraTonica(silabas1);
    const i2 = letraTonica(silabas2);
    const fin1 = silabas1.join("").substring(i1);
    const fin2 = silabas2.join("").substring(i2);
    return fin1 == fin2;
}

function rimaAsonanteCon(p1,p2){
    const ph1 = palabraConHiatos(p1); 
    const ph2 = palabraConHiatos(p2);
    log( `rimaAsonanteCon: ${p1} ${ph1} ${p2} ${ph2}`);
    if( !ph1 || !ph2 ){
        return false;
    }

    const s1 = ph1.map( normalizaPronunciacionDeSilaba );
    const t1 = silabaTonica(s1);
    const s2 = ph2.map( normalizaPronunciacionDeSilaba );
    const t2 = silabaTonica(s2);

    log("  p1:" + p1 );
    log("  s1:" + s1 );
    log("  t1:" + t1 );
    log("  p2:" + p2 );
    log("  s2:" + s2 );
    log("  t2:" + t2 );

    
    function silabaRimaCon(s1,s2){
        log("    s1:" + s1 );
        log("    s2:" + s2 );

        const n1 = quitaConsonantes(quitaAcentos(s1));
        const n2 = quitaConsonantes(quitaAcentos(s2));

        log("    n1:" + n1 );
        log("    n2:" + n2 );
        
        return  n1 == n2;
    }
    
    if( s1.length - t1 != s2.length - t2){
        return false;
    }

    for(let i = 0 ; i < s1.length-t1 ; i++){
        const i1 = s1.length - i - 1;
        const i2 = s2.length - i - 1;
        if(!silabaRimaCon(s1[i1], s2[i2] )){
            return false;
        }
    }
    return true;
}


function* todasLasPalabrasConRimaConsonante(palabra,numeroSilabas){
    log("todasLasPalabrasConRimaConsonante");
    const silabas = palabraConHiatos(palabra);
    const tonica = silabaTonica(silabas);

    log(`tonica:${tonica} numeroSilabas:${numeroSilabas}`);
    log(`tonica+1:${tonica+1} numeroSilabas:${numeroSilabas}`);

    if( !silabas || silabas.length == 0 || tonica == null ){
        return;
    }

    
    if( tonica+1 > numeroSilabas){
        log("tonica+1 >= numeroSilabas");
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

    


    
    log("todasLasPalabrasConRimaAsonante");
    const silabas = palabraConHiatos(palabra);
    const tonica = silabaTonica(silabas);


    log(`tonica:${tonica} numeroSilabas:${numeroSilabas}`);
    log(`tonica+1:${tonica+1} numeroSilabas:${numeroSilabas}`);

    if( !silabas || silabas.length == 0 || tonica == null ){
        return;
    }

    
    if( tonica+1 > numeroSilabas){
        log("tonica+1 >= numeroSilabas");
        return;
    }

    let candidatas = corpus_Frequency;
    if( numeroSilabas > 0 && corpus_BySyllable[numeroSilabas-1] ){
        candidatas = corpus_BySyllable[numeroSilabas-1];
    }

    for( let c of candidatas ){
        if( rimaAsonanteCon(palabra,c) ){
            yield c;
        }
    }
}

module.exports = {
    rimaConsonanteCon: rimaConsonanteCon,
    rimaAsonanteCon: rimaAsonanteCon,
    todasLasPalabrasConRimaConsonante: todasLasPalabrasConRimaConsonante,
    todasLasPalabrasConRimaAsonante: todasLasPalabrasConRimaAsonante
};

