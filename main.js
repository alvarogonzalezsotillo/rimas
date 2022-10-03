

const {corpusByFrequency} = require("./corpus/corpus-by-frequency");
const {Palabra} = require("./palabras/palabra");
const {rimaConsonanteCon, rimaAsonanteCon} = require("./palabras/rimas");


function examples(){
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
}


function createFileContents(variableName, json){
    
    return `// -*- mode: fundamental;coding:utf-8 -*-\n
                const  ${variableName} = 
                ${json};
                module.exports = {
                ${variableName} : ${variableName}
                };`;
}


function indiceConsonantePorSufijo(){

    const sufixes = {};

    Palabra.cacheActivo = false;
    let i = 0;
    for( let candidata of corpusByFrequency ){
        i+= 1;
        if( i%100000 == 0){
            console.log("c:"+i);
        }
        const p = Palabra.from(candidata);
        const s = p.sufijoRimaConsonante;

        if( sufixes[s] ){
            sufixes[s].push(candidata);
        }
        else{
            sufixes[s] = [candidata];
        }
    }

    const fs = require( "fs" );

    fs.writeFile(
        "corpus-por-rima-consonante.js",
        createFileContents( "corpusPorRimaConsonante", JSON.stringify(sufixes, null, null) ),
        (error)=>{
            if(error){
                console.log(`ERROR: ${error}`);
            }
            console.log("corpus-por-rima-consonante.js OK");
        }
    );

    
}

function indiceAsonantePorSufijo(){

    const sufixes = {};

    Palabra.cacheActivo = false;

    let i = 0;
    for( let candidata of corpusByFrequency ){
        i+= 1;
        if( i%100000 == 0){
            console.log("a:"+i);
        }
        const p = Palabra.from(candidata);
        const s = p.sufijoRimaAsonante;

        if( sufixes[s] ){
            sufixes[s].push(candidata);
        }
        else{
            sufixes[s] = [candidata];
        }
    }


    const fs = require( "fs" );

    fs.writeFile(
        "corpus-por-rima-asonante.js",
        createFileContents( "corpusPorRimaAsonante", JSON.stringify(sufixes, null, null) ),
        (error)=>{
            if(error){
                console.log(`ERROR: ${error}`);
            }
            console.log("corpus-por-rima-asonante.js OK");
        }
    );

    
}


function testSufijos(){
    const palabra = Palabra.from("telesforo");

    const {corpusPorRimaAsonante} = require("./corpus-por-rima-asonante.js");
    const rimasA = corpusPorRimaAsonante[palabra.sufijoRimaAsonante];
    console.log(`${palabra} rima asonante con ${rimasA}`);
    
    const {corpusPorRimaConsonante} = require("./corpus-por-rima-consonante.js");
    const rimasC = corpusPorRimaConsonante[palabra.sufijoRimaConsonante];
    console.log(`${palabra} rima consonante con ${rimasC}`);
    
}

// indiceConsonantePorSufijo();
// indiceAsonantePorSufijo();

testSufijos()


