// -*- mode: js2; -*-

function log(s){
    
}

const {Palabra} = require( "./palabra.js" );
const {corpusByFrequency} = require( "./corpus-by-frequency.js" );
const fs = require( "fs" );

const corpusArrayCached = {};
const corpusBySyllable = [];

function addToCorpus(p){
    const palabra = new Palabra(p);

    if( !palabra.silabas ){
        return false;
    }
    
    const l = palabra.silabas.length;

    
    let array = corpusBySyllable[l-1];
    if( !array ){
        array = [];
        corpusBySyllable[l-1] = array;
    }


    corpusArrayCached[p] = palabra.toArray();
    array.push(p);

    return true;
}

for(let i in corpusByFrequency){
    const p = corpusByFrequency[i];
    if( i % 10000 == 0 ){
        console.log( `${i}/${corpusByFrequency.length}:${p}`);
    }
    addToCorpus(p);
}



function createFileContents(variableName, json){
    
    return `// -*- mode: fundamental;coding:utf-8 -*-\n
const  ${variableName} = 
${json};
module.exports = {
  ${variableName} : ${variableName}
};`;
    
}

console.log( "WARN: to MJS file...");


fs.writeFile(
    "corpus-by-syllable-no-pp.js",
    createFileContents( "corpusBySyllable", JSON.stringify(corpusArrayCached) ),
    (error)=>{
    if(error){
        console.log(`ERROR: ${error}`);
    }
    console.log("corpus-by-syllable.js OK");
} );

