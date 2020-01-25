#!/bin/bash
doit(){

    local header="// -*- mode: fundamental; -*-
    const corpusByFrequency = ["

    cat <<<"$header"

    for linea in $(cat ./corpus-por-frecuencia.txt)
    do
        echo '"'$linea'",'
    done;



    echo ' "chimpún" ];'

    local tail="
    module.exports = {
      corpusByFrequency : corpusByFrequency
    };"

    cat <<<"$tail"
    
}

echo DOING...
doit > corpus-by-frequency.js
echo DONE
