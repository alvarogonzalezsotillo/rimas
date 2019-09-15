// -*- mode: js2; -*-

function log(s){
}


import {
    palabraConHiatos,
    silabaTonica,
    letraTonica,
    normalizaPronunciacion
} from "./corpus-utils.mjs";

function addObjectLazyProp(o,p,evaluator){
    const internalName = `_private_${p}_`;
    Object.defineProperty(o,p, {
        enumerable: true,
        get: function(){
            if(!this[internalName]){
                Object.defineProperty(this,internalName,{
                    writable: false,
                    enumerable: false,
                    value: evaluator.call(this,this)
                });
            }
            return this[internalName];
        }
    });
}

function addClassLazyProp(clazz,p,evaluator){
    addObjectLazyProp(clazz.prototype,p,evaluator);
}

class Palabra{
    constructor(texto){
        this.texto = texto;
    }

    toString(){
        return `${this.texto} ${this.silabasConTonica}`;
    }
}

addClassLazyProp(
    Palabra,
    "pronunciacion",
    (o) => o.silabas.map( s => normalizaPronunciacion(s) )
);

addClassLazyProp(
    Palabra,
    "silabas",
    (o) => palabraConHiatos(o.texto)
);

addClassLazyProp(
    Palabra,
    "silabaTonica",
    (o) => silabaTonica(o.silabas)
);

addClassLazyProp(
    Palabra,
    "letraTonica",
    (o) => letraTonica(o.silabas)
);

addClassLazyProp(
    Palabra,
    "silabasConTonica",
    (o) => {
        const ret = o.silabas.slice();
        const i = o.silabaTonica;
        ret[i] = ret[i].toUpperCase();
        return ret;

    }
);

addClassLazyProp(
    Palabra,
    "asPlainObject",
    (o) => {
        const ret = {};
        for( let p in o ){
            if( p != "asPlainObject" ){
                ret[p] = o[p];
            }
        }
        Object.freeze(ret);
        return ret;
    }
);


export {
  Palabra
};
