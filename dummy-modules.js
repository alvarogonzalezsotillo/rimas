/*
  Nodejs modules in browser
*/

let module = {
    exports : {}
};

let exports = module.exports;

function require(package){
    console.log( `Required package:${package}` );
}

