// -*- mode: js2; -*-

var log = function(module,s){
    //console.log(`${module}: ${s()}` );
};


var {
    palabraConHiatos,
    silabaTonica,
    letraTonica,
    normalizaPronunciacion,
    quitaAcentos
} = require( "./corpus-utils.js" );

const LazyPropIsLazy = true;

function prepareObjectLazyProps(o, ...props){
    // https://draft.li/blog/2016/12/22/javascript-engines-hidden-classes/
    // INTENTO OPTIMIZAR LA VELOCIDAD USANDO HIDDEN CLASSES
    for( p of props ){
        const internalName = `_private_${p}_`;        
        o[internalName] = null;
    }
}

function addObjectLazyProp(o,p,evaluator,notEnumerable){
    const internalName = `_private_${p}_`;
    Object.defineProperty(o,p, {
        enumerable: !(notEnumerable),
        get: function(){

            if( !LazyPropIsLazy ){
                return evaluator.call(this,this);
            }
            
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
            return `${this.texto} ${this.pronunciacion}`;
        }

        toArray(){
            return [
                this.texto, this.pronunciacion, this.silabas, this.silabaTonica, this.letraTonica, this.letraTonicaPronunciacion, this.sufijoRimaConsonante
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
        const sufijoRimaConsonante = array[6];

        const ret = {
            texto : texto,
            pronunciacion : pronunciacion,
            silabas: silabas,
            silabaTonica: silabaTonica,
            letraTonica : letraTonica,
            letraTonicaPronunciacion: letraTonicaPronunciacion,
            sufijoRimaConsonante: sufijoRimaConsonante
        };

        Palabra.cache[texto] = ret;
        return ret;
    };

    Palabra.fromString = function(texto){
        if( texto.constructor.name == "Palabra" ){
            return texto;
        }
        
        if( Palabra.cache[texto] ){
            return Palabra.cache[texto];
        }
        
        const ret = new Palabra(texto);
        Palabra.cache[texto] = ret;
        return ret;
    };


    addClassLazyProp(
        Palabra,
        "sufijoRimaConsonante",
        (p) => {
            const s = p.pronunciacion;
            if( !s ){
                return null;
            }
            const i = p.letraTonicaPronunciacion;
            const fin = s.join("").substring(i);
            return quitaAcentos(fin);
        }
    );

    addClassLazyProp(
        Palabra,
        "sufijoRimaAsonante",
        (p) => {
            const s = p.sufijoRimaConsonante;
            if( !s ){
                return null;
            }
            return quitaConsonantes(quitaAcentos(s));
        }
    );
    
    addClassLazyProp(
        Palabra,
        "pronunciacion",
        (o) => {
            if( !o.silabas ){
                return null;
            }
            return normalizaPronunciacion(o.silabas,o.silabaTonica);
        }
    );

    addClassLazyProp(
        Palabra,
        "letraTonicaPronunciacion",
        (o) => letraTonica(o.pronunciacion.map(s=>s.toLowerCase()))
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
