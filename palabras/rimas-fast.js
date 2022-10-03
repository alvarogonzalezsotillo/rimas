var {corpusPorRimaAsonante} = require("./corpus-por-rima-asonante.js");
var {corpusPorRimaConsonante} = require("./corpus-por-rima-consonante.js");
var {Palabra} = require("./palabra.js");

console.log(">>cargando rimaFast");
console.log(corpusPorRimaAsonante["e.e"]);
console.log(corpusPorRimaConsonante["epe"]);
console.log("<<cargando rimaFast");


function rimaFast(palabra,asonante,numeroSilabas){

    const log = ()=>null;

    console.log(corpusPorRimaAsonante["e.e"]);
    console.log(corpusPorRimaConsonante["epe"]);

    
    const p = Palabra.from(palabra);
    const suffix = asonante ? p.sufijoRimaAsonante : p.sufijoRimaConsonante;
    const corpus = asonante ? corpusPorRimaAsonante : corpusPorRimaConsonante;

    log(`rimaFast: suffix:${suffix}`);
    const candidatas = corpus[suffix];
    log(`rimaFast: candidatas:${candidatas}`);

    if( !candidatas ){
        log("sin candidatas");
        return [];
    }

    log(candidatas);
    
    if( numeroSilabas ){
        return candidatas.filter( (pa,index)=> {
            const pal = Palabra.from(pa);
            return pal.silabas.length = numeroSilabas;
        });
    }

    return candidatas;
}


module.exports = {
    rimaFast: rimaFast
};

