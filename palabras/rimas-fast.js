var {corpusPorRimaAsonante} = require("./corpus-por-rima-asonante.js");
var {corpusPorRimaConsonante} = require("./corpus-por-rima-consonante.js");
var {Palabra} = require("./palabra.js");


function rimaFast(palabra,asonante){

    const log = ()=>null;

    
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
    
    return candidatas;
}


module.exports = {
    rimaFast: rimaFast
};

