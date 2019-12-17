// -*- mode: js2; -*-

function log(s){
}


var {
    palabraConHiatos,
    silabaTonica,
    letraTonica,
    normalizaPronunciacionDeSilaba
} = require( "./corpus-utils.js" );

function addObjectLazyProp(o,p,evaluator,notEnumerable){
    const internalName = `_private_${p}_`;
    Object.defineProperty(o,p, {
        enumerable: !(notEnumerable),
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

function body(){

    class Palabra{
        constructor(texto){
            this.texto = texto;
        }

        toString(){
            return `${this.texto} ${this.silabasConTonica}`;
        }

        toArray(){
            return [
                this.texto, this.pronunciacion, this.silabas, this.silabaTonica, this.letraTonica, this.letraTonicaPronuncacion
            ];
        }
    }

    Palabra.cache = {};

    Palabra.fromArray = function(array){
        const texto = array[0];
        if( Palabra.cache[texto] ){
            return Palabra.cache[texto];
        }
        const pronunciacion = array[1];
        const silabas = array[2];
        const silabaTonica = array[3];
        const letraTonica = array[4];
        const letraTonicaPronunciacion = array[5];

        const ret = {
            texto : texto,
            pronunciacion : pronunciacion,
            silabas: silabas,
            silabaTonica: silabaTonica,
            letraTonica : letraTonica,
            letraTonicaPronunciacion: letraTonicaPronunciacion
        };

        Palabra.cache[texto] = ret;
        return ret;
    };

    Palabra.fromString = function(texto){
        if( Palabra.cache[texto] ){
            return Palabra.cache[texto];
        }
        const ret = new Palabra(texto);
        Palabra.cache[texto] = ret;
        return ret;
    };

    addClassLazyProp(
        Palabra,
        "pronunciacion",
        (o) => {
            if( !o.silabas ){
                return null;
            }
            return o.silabas.map( s => normalizaPronunciacionDeSilaba(s) );
        }
    );

    addClassLazyProp(
        Palabra,
        "letraTonicaPronunciacion",
        (o) => silabaTonica(o.pronunciacion)
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
            //Object.freeze(ret);
            return ret;
        },
        true
    );

    return Palabra;
}

module.exports = {
    Palabra: body()
};
