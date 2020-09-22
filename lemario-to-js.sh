#!/bin/bash
doit(){

    local header="// -*- mode: fundamental; -*-
    const lemario= ["

    cat <<<"$header"

    for linea in $(cat ./lemario.cpmario.txt)
    do
        echo '"'$linea'",'
    done;



    echo ' "último" ];'

    local tail="
    module.exports = {
      lemario : lemario
    };"

    cat <<<"$tail"
    
}

echo DOING...
doit > lemario.js
echo DONE
