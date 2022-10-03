const {corpusByFrequency} = require("../corpus/corpus-by-frequency");
const {Palabra} = require("./palabra");
    

function calculaIndices(){

    const sufixesA = {};
    const sufixesC = {};    

    Palabra.cacheActivo = false;

    let i = 0;
    for( let candidata of corpusByFrequency ){
        i+= 1;
        if( i%10000 == 0){
            console.log(""+i+"/"+corpusByFrequency.length);
        }
        const p = Palabra.from(candidata);
        const sA = p.sufijoRimaAsonante;
        const sC = p.sufijoRimaConsonante;

        if( sA ){
            if( sufixesA[sA] ){
                sufixesA[sA].push(candidata);
            }
            else{
                sufixesA[sA] = [candidata];
            }
        }

        if( sC ){
            if( sufixesC[sC] ){
                sufixesC[sC].push(candidata);
            }
            else{
                sufixesC[sC] = [candidata];
            }
        }
    }

    return {sufixesA,sufixesC};
}

function escribeIndices({sufixesA,sufixesC}){

    const fs = require( "fs" );

    function createFileContents(variableName, json){
        return `// -*- mode: fundamental;coding:utf-8 -*-\n
                var  ${variableName} = 
                ${json};
                module.exports = {
                ${variableName} : ${variableName}
                };`;
    }

    const indent = 2;

    fs.writeFile(
        "corpus-por-rima-asonante.js",
        createFileContents( "corpusPorRimaAsonante", JSON.stringify(sufixesA, null, indent) ),
        (error)=>{
            if(error){
                console.log(`ERROR: ${error}`);
            }
            console.log("./corpus-por-rima-asonante.js OK");
        }
    );

    fs.writeFile(
        "corpus-por-rima-consonante.js",
        createFileContents( "corpusPorRimaConsonante", JSON.stringify(sufixesC, null, indent) ),
        (error)=>{
            if(error){
                console.log(`ERROR: ${error}`);
            }
            console.log("./corpus-por-rima-consonante.js OK");
        }
    );
}

escribeIndices(calculaIndices())
