/*
  Nodejs modules in browser
*/

const module = {
    __exports : {},
    __log : function(s){
        console.log(s);  
    },
    get exports(){
        return this.__exports;
    },
    set exports(exp){
        for( let p in exp ){
            if( this.__exports[p] ){
                this.__log( `module: Más de un export con el mismo nombre: ${p}` );
            }
            else{
                this.__log( `module: Nuevo export: ${p}` );
            }
            this.__exports[p] = exp[p];
        }
    }
};

const require = function(package){
    module.log( `require: Required package:${package}` );
    return module.exports;
}

