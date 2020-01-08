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
    log("rimas",()=>`p1:${p1} p2:${p2} fin1:${fin1} fin2:${fin2}`);
    if( !fin1 || !fin2 ){
        return false;
    }
    return fin1 == fin2;
}


function rimaAsonanteCon(p1,p2){
    log("rimas.rimaAsonanteCon",()=> `rimaAsonanteCon: ${p1}  ${p2}`);

    const palabra1 = Palabra.fromString(p1);
    const palabra2 = Palabra.fromString(p2);
    const s1 = palabra1.pronunciacion;
    const s2 = palabra2.pronunciacion;
    const t1 = palabra1.silabaTonica;
    const t2 = palabra2.silabaTonica;
    
    log("rimas.rimaAsonanteCon",()=>"  p1:" + p1 );
    log("rimas.rimaAsonanteCon",()=>"  s1:" + s1 );
    log("rimas.rimaAsonanteCon",()=>"  t1:" + t1 );
    log("rimas.rimaAsonanteCon",()=>"  p2:" + p2 );
    log("rimas.rimaAsonanteCon",()=>"  s2:" + s2 );
    log("rimas.rimaAsonanteCon",()=>"  t2:" + t2 );

    if( !palabra1 || !palabra2 || !s1 || !s2  ){
        log("rimas.rimaAsonanteCon",()=>"mala palabra:" + p1 + " -- " + p2 );
        return false;
    }

    
    function silabaRimaCon(s1,s2){
        log("rimas.rimaAsonanteCon.silabaRimaCon",()=>"    s1:" + s1 );
        log("rimas.rimaAsonanteCon.silabaRimaCon",()=>"    s2:" + s2 );

        const n1 = quitaConsonantes(quitaAcentos(s1));
        const n2 = quitaConsonantes(quitaAcentos(s2));

        log("rimas.rimaAsonanteCon.silabaRimaCon",()=>"    n1:" + n1 );
        log("rimas.rimaAsonanteCon.silabaRimaCon",()=>"    n2:" + n2 );
        
        return  n1 == n2;
    }
    
    if( s1.length - t1 != s2.length - t2){
        return false;
    }

    for(let i = 0 ; i < s1.length-t1 ; i++){
        const i1 = s1.length - i - 1;
        const i2 = s2.length - i - 1;
        log("rimas.rimaAsonanteCon",()=> `    i1: ${i1} s1[i1]:${s1[i1]}  i2:${i2}  s2[i2]:${s2[i2]}`);
        if(!silabaRimaCon(s1[i1], s2[i2] )){
            return false;
        }
    }
    return true;
}



module.exports = {
    rimaConsonanteCon: rimaConsonanteCon,
    rimaAsonanteCon: rimaAsonanteCon,
};

