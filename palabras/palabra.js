// -*- mode: js2; -*-

var log = function(module,s){
    //console.log(`${module}: ${s()}` );
};


var {
    palabraConHiatos,
    silabaTonica,
    letraTonica,
    normalizaPronunciacion,
    quitaAcentos,
    quitaConsonantes,
    sufijoRimaConsonante,
    explicacionPronunciacion
} = require( "./corpus-utils.js" );

function internalNameOfLazyProp(propName){
    return `_private_${propName}_`;
}


function prepareObjectLazyProps(o, ...props){
    // https://draft.li/blog/2016/12/22/javascript-engines-hidden-classes/
    // INTENTO OPTIMIZAR LA VELOCIDAD USANDO HIDDEN CLASSES
    for( p of props ){
        const internalName = internalNameOfLazyProp(p);
        o[internalName] = null;
    }
}


function sideloadLazyProp(object,propName,value){

    const internalName = internalNameOfLazyProp(propName);

    Object.defineProperty(object,internalName,{
        writable: false,
        enumerable: false,
        value: value
    });

}
const LazyPropIsLazy = true;

function addObjectLazyProp(o,p,evaluator,notEnumerable){
    Object.defineProperty(o,p, {
        enumerable: !(notEnumerable),
        get: function(){
            const internalName = internalNameOfLazyProp(p);

            if( !LazyPropIsLazy ){
                return evaluator.call(this,this);
            }
            
            if(!this[internalName]){
                const value = evaluator.call(this,this);
                sideloadLazyProp(this,p,value);
            }
            return this[internalName];
        },
        set: function(v){
            throw new Error(`Property ${p} is lazy, so is not writable`);  
        }
    });
}

function addClassLazyProp(clazz,p,evaluator){
    addObjectLazyProp(clazz.prototype,p,evaluator);
}

function body(){

    class Palabra{
        constructor(texto){
            this.texto = texto.toLowerCase();
        }

        toString(){
            return `${this.texto} ${this.pronunciacion}`;
        }

    }



    Palabra.from = function(texto,sufijoConsonante,sufijoAsonante){

        texto = texto.toLowerCase();
        
        // Por si construyo una Palabra desde una Palabra
        if( texto.constructor.name == "Palabra" ){
            return texto;
        }
       
        const ret = new Palabra(texto);
        if( sufijoConsonante ){
            sideloadLazyProp(ret,"sufijoRimaConsonante",sufijoConsonante);
        }
        if( sufijoAsonante ){
            sideloadLazyProp(ret,"sufijoRimaAsonante",sufijoAsonante);
        }
       
        return ret;
    };


    addClassLazyProp(
        Palabra,
        "sufijoRimaConsonante",
        (p, AFI=false) => {
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
            if( !p.silabas ){
                return null;
            }
            const s = p.texto.substring(p.letraTonica);
            if( !s ){
                return null;
            }

            const sufijo = new Palabra(s);
            if( !sufijo.silabas ){
                return null;
            }
            return sufijo.silabas.
                map(quitaAcentos).
                map(quitaConsonantes).
                join(".");
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
        "pronunciacionAFI",
        (o) => {
            if( !o.silabas ){
                return null;
            }
            return normalizaPronunciacion(o.silabas,o.silabaTonica,true);
        }
    );

    addClassLazyProp(
        Palabra,
        "explicacionPronunciacion",
        (o) => explicacionPronunciacion(o.silabas, o.silabaTonica)
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
