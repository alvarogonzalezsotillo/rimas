

const {corpusBySyllable} = require("./corpus/corpus-by-syllable");
const {corpusByFrequency} = require("./corpus/corpus-by-frequency");
const {Palabra} = require("./palabras/palabra");
const {rimaConsonanteCon, rimaAsonanteCon} = require("./palabras/rimas");

const palabraARimar = "acondroplasia";

for( candidata of corpusByFrequency ){
    if( rimaConsonanteCon(palabraARimar,candidata) ){
        console.log(`${candidata} rima consonante con ${palabraARimar}`);
        const p = Palabra.from(candidata);
        console.log(`${p.explicacionPronunciacion} ${p.pronunciacionAFI}`);
        console.log();
    }
}

console.log("Done.");


