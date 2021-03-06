// -*- mode: js2; -*-

var log = function(module,s){
    console.log(`${module}: ${s()}` );
};


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

    
    const fin1 = palabra1.sufijoRimaConsonante;
    const fin2 = palabra2.sufijoRimaConsonante;
    if( !fin1 || !fin2 ){
        return false;
    }
    return fin1 == fin2;
}

function rimaAsonanteCon(p1,p2){
    const palabra1 = Palabra.fromString(p1);
    const palabra2 = Palabra.fromString(p2);

    
    const fin1 = palabra1.sufijoRimaAsonante;
    const fin2 = palabra2.sufijoRimaAsonante;
    if( !fin1 || !fin2 ){
        return false;
    }

    return fin1 == fin2;
}




module.exports = {
    rimaConsonanteCon: rimaConsonanteCon,
    rimaAsonanteCon: rimaAsonanteCon,
};

