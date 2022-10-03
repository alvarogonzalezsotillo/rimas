var {corpusPorRimaAsonante} = require("./corpus-por-rima-asonante.js");
var {corpusPorRimaConsonante} = require("./corpus-por-rima-consonante.js");
var {Palabra} = require("./palabra.js");



function rimaFast(palabra,asonante,numeroSilabas){
    const p = Palabra.from(palabra);
    const suffix = asonante ? p.sufijoRimaAsonante : p.sufijoRimaConsonante;
    const corpus = asonante ? corpusPorRimaAsonante : corpusPorRimaConsonante;
    const candidatas = corpus[suffix];

    if( !candidatas ){
        console.log("sin candidatas");
        return [];
    }

    console.log(candidatas);
    
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

