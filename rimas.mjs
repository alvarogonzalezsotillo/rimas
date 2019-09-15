// -*- mode: js2; -*-

function log(s){
}


import {corpus as corpusBySyllable} from "./corpus-by-syllable-no-pp.mjs";
import {corpusByFrequency} from "./corpus-by-frequency.mjs";



import {
    palabraConHiatos,
    silabaTonica,
    letraTonica,
    normalizaPronunciacion
} from "./corpus-utils.mjs";




function rimaConsonanteCon(p1,p2){
    const silabas1 = palabraConHiatos(p1).map( normalizaPronunciacionDeSilaba );
    const silabas2 = palabraConHiatos(p2).map( normalizaPronunciacionDeSilaba );
    if( silabas1 == null || silabas2 == null ){
        return false;
    }
    const i1 = letraTonica(silabas1);
    const i2 = letraTonica(silabas2);
    const fin1 = p1.substring(i1);
    const fin2 = p2.substring(i2);
    return fin1 == fin2;
}

function* todasLasPalabrasConRimaConsonante(palabra,numeroSilabas){
    console.log("todasLasPalabrasConRimaConsonante");
    const silabas = palabraConHiatos(palabra);
    const tonica = silabaTonica(silabas);

    console.log(`tonica:${tonica} numeroSilabas:${numeroSilabas}`);
    console.log(`tonica+1:${tonica+1} numeroSilabas:${numeroSilabas}`);
    if( tonica+1 > numeroSilabas){
        console.log("tonica+1 >= numeroSilabas");
        return;
    }

    let candidatas = corpusByFrequency;
    if( numeroSilabas > 0 && corpusBySyllable[numeroSilabas-1] ){
        candidatas = corpusBySyllable[numeroSilabas-1];
    }

    for( let c of candidatas ){
        if( rimaConsonanteCon(palabra,c) ){
            yield c;
        }
    }
}

function* todasLasPalabrasConRimaAsonante(palabra,numeroSilabas){
    if( !corpus[numeroSilabas+1] ){
        return;
    }

    const silabas = palabraConHiatos(palabra);
    const tonica = silabaTonica(silabas);
    if( tonica+1 >= numeroSilabas){
        return;
    }

    function silabaRimaCon(s1,s2,esTonica){
        if( !esTonica){
            return s1 == s2;
        }
        const ls1 = s1.split("").filter(l=>l!="h");
        const ls2 = s2.split("").filter(l=>l!="h");

        const i1 = ls1.findIndex(l=>vocales.includes(l));
        const i2 = ls2.findIndex(l=>vocales.includes(l));

        if(i1==-1 || i2==-1){
            return false;
        }

        return s1.substr(i1)==s2.substr(i2);
    }
    
    function palabraRimaCon(p){
        const ss = palabraConHiatos(p);
        if(ss.length != numeroSilabas ){
            return false;
        }
        const t = silabaTonica(ss);
        if( silabas.length - tonica != ss.length - t){
            return false;
        }

        for(let i = 0 ; i < ss.length-tonica ; i++){
            const iPalabra = silabas.length - i - 1;
            const iP = ss.length - i - 1;
            const esTonica = iPalabra == tonica;
            if(!silabaRimaCon(silabas[iPalabra], ss[iP], esTonica)){
                return false;
            }
        }
        return true;
    }

    
    const candidatas = corpusBySyllable[numeroSilabas+1];
    for(c of candidatas){
        yield c;
    }
}

export{
    rimaConsonanteCon,
    todasLasPalabrasConRimaConsonante,
    todasLasPalabrasConRimaAsonante
};

