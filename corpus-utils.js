// -*- mode: js2; -*-

// http://tulengua.es/es/separar-en-silabas

function log(s){
    //console.log(s);
}

function warn(s){
//    console.log(`WARN: ${s}` );
}


const acentuadas = "áéíóú".split("");
const abiertas = "aáeéoó".split("");
const cerradas = "iíuúü".split("");
const vocales = abiertas.concat(cerradas);
const trasVocales = ["b","c","d","f","g","l","m","n","ns","p","r","rs","s","t","x","y","z"];
const consonantes = ["b","c", "d", "f", "g", "h", "j", "k", "l", "m", "n","ñ","p","q","r","s","t","v","w","x","y","z"];
const doblesConsonantes = ["ch", "rr","ll","dr","tr","ps"].
      concat(["b","c","f","g","p"].map(l=>l+"l")).
      concat(["b","c","f","g","p"].map(l=>l+"r"));

const silabasEspeciales = ["trans"];


class Extraccion{
    constructor(extraido,resto){
        this.extraido = extraido;
        this.resto = resto;
    }

    toString(){
        return `${this.extraido}:${this.resto}`;
    }
}

function E(e,r){
    return new Extraccion(e,r);
}


function buscaSubstr(array,s){
    // extrae todos los prefijos posibles, en orden
    return array.
        filter(a=>s.startsWith(a)).
        map(r=>E(r,s.substr(r.length)));
    
}


function primero(array,s){
    // resultado del primer extractor valido
    for(let a of array){
        const r = a(s);
        if(r.length) {
            return r;
        }
    }
    return [];
}






const vocal = s => buscaSubstr(vocales,s);
const consonante = s => buscaSubstr(consonantes,s);
const dobleConsonante = s => buscaSubstr(doblesConsonantes,s);
const trasVocal = s => buscaSubstr(trasVocales,s);


const grupoConsonanticoInicial =
      s =>primero([dobleConsonante,consonante],s);

function grupoVocalico(s){
    const log = ()=>null;
    log(`grupoVocalico: ${s}`);
    const a = s.split("");
    let i = 0;
    for( i = 0 ; i < a.length ; i++){
        const c = a[i];
        log(`grupoVocalico: ${s} i:${i} c:${c}`);
        if(vocales.find(v=> v==c)){
            log(`grupoVocalico: ${s} es vocal`);
            continue;
        }
        if(i>0 &&
           a[i-1]!="h" &&
           a[i]=="h" &&
           i < a.length-1 &&
           a[i+1] &&
           vocales.find(v=>v==a[i+1]) ){
            log(`grupoVocalico: ${s} es h intercalada`);
            continue;
        }
        log(`grupoVocalico: ${s} es consonante`);
        break;
    }
    const ret = i ?
          [E(s.substring(0,i),s.substring(i))] :
          [];
    log(`grupoVocalico: ${s} i:${i} ret:${ret}`);
    return ret;
    

    
    
}
grupoVocalico.toString = ()=> "grupoVocalico";


function silabaTodoDiptongo(str){
    // extrae todas las siguientes posibles sílabas, dejando primero la que debe ser explorada primero
    const silabas = [
        [s=>buscaSubstr(silabasEspeciales,s)],
        [grupoVocalico],
        [grupoConsonanticoInicial,grupoVocalico],
        [grupoVocalico,trasVocal],    
        [grupoConsonanticoInicial,grupoVocalico,trasVocal],
    ];

    log(`silaba: str:${str}`);
    
    const ret = silabas.
          map(s=> secuencia(s,str)).
          filter(e=> e.length).
          flat();
    log(`silaba: str:${str} ret:${ret.join("  ")}`);
    return ret;
}



function palabraSinHiatos(str){
    // extrae sílabas de forma recursiva, devielve el primer éxito
    function palabraR(silabas,resto){
        if(!resto){
            return silabas;
        }

        log(`palabraR: silabas:${silabas}  resto:${resto}`);
        
        const ss = silabaTodoDiptongo(resto);
        log(`palabraR: resto:${resto} ss:${ss}`);
        for(let s of ss){
            const newSilabas = silabas.concat(s.extraido);
            const ret = palabraR(newSilabas, s.resto);
            if(ret){
                return ret;
            }
        }
        
        return null;
    }
    return palabraR([],str);
}

function secuencia(buscas,str){
    // aplica varios extractores uno tras otro, y devuelve todas las posibilidades
    const log = ()=>null;
    log(`secuencia: str:${str}`);
    if(!str && buscas.length > 0){
        return [];
    }
    
    let ret = [E("",str)];
    for(let b of buscas){
        log(`secuencia: str:${str} b:${b}`);

        ret = ret.map( r =>{
            const nrs = b(r.resto);
            return nrs.map(
                nr => E(r.extraido + nr.extraido, nr.resto)   
            );
        }).flat();
        

        log(`secuencia: str:${str} b:${b} ret:${ret}`);
        
    }
    return ret;
}








function acentuaSilabas(silabas){
    let i = silabaTonica(silabas);
    log(`acentuaSilabas ${silabas} i:${i}`);
    const ret = silabas.slice();
    ret[i] = ret[i].toUpperCase();
    return ret;

}


function vocalTonicaDeSilaba(silaba){
    const ls = silaba.split("");
    const acento = ls.findIndex( l=> acentuadas.includes(l) );

    // si hay una vocal acentuada, es esa
    if( acento >= 0 ){
        return acento;
    }

    // el acento estará en la última vocal abierta
    for( let i = ls.length -1 ; i >= 0 ; i-- ){
        if( abiertas.includes(ls[i]) ){
            return i;
        }
    }

    // en otro caso, en la última vocal
    for( let i = ls.length -1 ; i >= 0 ; i-- ){
        if( vocales.includes(ls[i]) ){
            return i;
        }
    }

    return null;
}

function letraTonica(silabas){
    const t = silabaTonica(silabas);
    if( t == null ){
        return null;
    }
    const s = silabas[t];
    const i = vocalTonicaDeSilaba(s);

    log(`letraTonica: ${silabas} t:${t} s:${s} i:${i}`);
    return silabas.slice(0,t).join("").length + i;
}

function silabaTonica(silabas){
    // https://lengualdia.blogspot.com/2012/02/excepciones-de-la-rima-los-diptongos-y.html?m=1
    // https://www.poemas-del-alma.com/blog/taller/hiatos-diptongos-y-triptongos 
    
    function posicionAcentoGrafico(){
        for(let i in silabas){
            if( silabas[i].split("").find(l=>acentuadas.includes(l))){
                return parseInt(i);
            }
            
        }
        return null;
    }

    if( !silabas ){
        return -1;
    }
    
    if(silabas.length < 2){
        // monosílabo
        return 0;
    }

    const acento = posicionAcentoGrafico();
    if( acento != null ){
        return acento;
    }

 


    const ultima = silabas[silabas.length-1].toLowerCase();
    const penultima = silabas[silabas.length-2].toLowerCase();
    const mente =
          silabas.length > 2 &&
          ultima == "te" &&
          penultima == "men";

    if(mente){
        // adverbio a partir de adjetivo
        const raiz = silabas.slice(0,-2);
        return silabaTonica(raiz);
    }

    const ultimaL = ultima.charAt(ultima.length-1);
    const acabaNSVocal =
          ultimaL == "n" ||
          ultimaL == "s" ||
          vocales.includes(ultimaL);

    log( `silabaTonica: ${silabas} ${ultimaL} ${acabaNSVocal}`);
    
    let i = -1;
    if( acabaNSVocal ){
        // acaba en nsa sin acento gráfico, es llana
        log( `silabaTonica: llana` );
        i = silabas.length-2;
    }
    else{
        // no acaba en nsa ni acento gráfico, es aguda
        log( `silabaTonica: aguda` );
        i = silabas.length-1;
    }

    log( `silabaTonica: ${i}` );
    return i;
}

function palabraConHiatos(str){
    const condiptongos = palabraSinHiatos(str);
    if( !condiptongos ){
        warn(`condiptongos es null:${str}`);
        return null;
    }
    let ret = [];
    log(`palabraConHiatos:  ${str} condiptongos:${condiptongos}`);
    for(let s of condiptongos){
        ret = ret.concat(separaHiato(s));
    }
    return ret;
    


    function separaHiato(silabaS){

        // la silabaS proviene de palabra()
        // las y pueden aparecer al principio como consonante o al final como vocal. Si es vocal es siempre diptongo.
        // Puede haber h intercalada, si se separa va en la segunda sílaba
        // https://www.ejemplos.co/50-ejemplos-de-palabras-con-hiato/
        const esAbierta = v => abiertas.includes(v);
        const esAcentuada = v => acentuadas.includes(v);
        const esVocal = v => vocales.includes(v);


        function separables(v1,v2){
            log(`separables:  v1:${v1} v2:${v2}`);
            const c1 = !esAbierta(v1);
            const c2 = !esAbierta(v2);
            const a1 = esAcentuada(v1);
            const a2 = esAcentuada(v2);

            log(`separables: c1:${c1}  a1:${a1} c2:${c2} a2:${a2}`);

            if( !c1 && !a1 && !c2 && !a2){
                return true; // ae
            }
            if( !c1 && !a1 && !c2 && a2){
                return true; // aé
            }
            if( !c1 && !a1 && c2 && !a2){
                return false; // ai
            }
            if( !c1 && !a1 && c2 && a2){
                return true; // aí
            }
            if( !c1 && a1 && !c2 && !a2){
                return true; // áe
            }
            if( !c1 && a1 && !c2 && a2){
                return null; //throw "imposible"; // áé
            } 
            if( !c1 && a1 && c2 && !a2){
                return false; // ái
            }
            if( !c1 && a1 && c2 && a2){
                return null; //throw "imposible"; // áí
            }
            if( c1 && !a1 && !c2 && !a2){
                return false; // ia
            }
            if( c1 && !a1 && !c2 && a2){
                return false; // iá
            }
            if( c1 && !a1 && c2 && !a2 ){
                return false; // iu
            }
            if( c1 && !a1 && c2 && a2){
                return false; // iú
            }
            if( c1 && a1 && !c2 && !a2){
                return true; // ía
            }
            if( c1 && a1 && !c2 && a2){
                return null; //throw "imposible"; // íá
            }
            if( c1 && a1 && c2 && !a2){
                return true; // íu
            }
            if( c1 && a1 && c2 && a2){
                return null; //throw "imposible"; // íú
            }
            throw "inesperado";
        }
        

        function separaPor(i){
            return [
                silabaS.substr(0,i+1),
                silabaS.substr(i+1)
            ];
        }
        
        const silabas = silabaS.split("");


        
        function buscaVocal(desde){
            // log(`buscaVocal: ${vocales} ${silabas} desde:${desde}`);
            for( let i = desde; i < silabas.length ; i++ ){
                if( esVocal(silabas[i]) ){
                    return i;
                }
            }
            return null;
        }
        
        let i1 = buscaVocal(0);
        if(i1==null){
            throw "esperaba vocal";
        }
        let i2 = buscaVocal(i1+1);
        if(i2==null){
            return [silabaS];
        }
        
        log(`separaHiato: ${silabaS}: i1:${i1} i2:${i2}`);
        if(separables(silabas[i1],silabas[i2]) == true){
            let [ret,resto] = separaPor(i1);
            log(`separaHiato: ret:${ret} resto:${resto}`);
            let recursion = separaHiato(resto);
            log(`separaHiato: recursion:${recursion}`);
            return [ret].concat(recursion);
        }
        return [silabaS];
    }    
    
}

function quitaConsonantes(silaba){
    return silaba.split("").filter( l=> !consonantes.includes(l) ).join();
}


function quitaAcentos(silaba){
    const map = { "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u" };
    return silaba.toLowerCase().split("").map( l =>{
        return map[l] ? map[l] : l;
    }).join("");
}


function normalizaPronunciacion(palabra){
    return palabraConHiatos(palabra).map(s => normalizaPronunciacionDeSilaba(s) );
}

function normalizaPronunciacionDeSilaba(silaba){
    /*
      GUI -> GI
      GÜI -> GUI
      GI  -> JI
      HA  -> A
      VI  -> BI
      QUI -> KI
      CA  -> KA
      CI  -> ZI
      LL  -> Y
      Yv  -> Yv
      Y   -> i  
      
    */

    const map = [
        ["gue", "ge"],
        ["gué", "gé"],
        ["gui", "gi"],
        ["guí", "gí"],
        ["güe", "gue"],
        ["güé", "gué"],
        ["güi", "gui"],
        ["güí", "guí"],
        ["que", "ke"],
        ["qué", "ké"],
        ["qui", "ki"],
        ["quí", "kí"],
        ["ce", "ze"],
        ["cé", "zé"],
        ["ci", "zi"],
        ["cí", "zí"],
        ["ge", "je"],
        ["gé", "jé"],
        ["gi", "ji"],
        ["gí", "jí"],
        ["ch", "ch"],
        ["ll", "y"],
        ["ya", "ya"],
        ["ye", "ye"],
        ["yi", "yi"],
        ["yo", "yo"],
        ["yu", "yu"],
        ["yá", "yá"],
        ["yé", "yé"],
        ["yí", "yí"],
        ["yó", "yó"],
        ["yú", "yú"],
        ["y", "i"],
        ["h", ""],
        ["v", "b"],
        ["c", "k"],
    ];

    function match(restoDeSilaba){
        if( restoDeSilaba.length == 0 ){
            return {
                traduccion : "",
                restoDeSilaba : ""
            };
        }
        
        for( let i = 0 ; i < map.length ; i++ ){
            if( restoDeSilaba.startsWith(map[i][0]) ){
                return {
                    traduccion : map[i][1],
                    restoDeSilaba : restoDeSilaba.substring( map[i][0].length )
                };
            }
        }
        
        return {
            traduccion : restoDeSilaba.substring(0,1),
            restoDeSilaba : restoDeSilaba.substring(1)
        };
    }
    
    let ret = "";
    let restoDeSilaba = silaba;
    while( restoDeSilaba != "" ){
        
        const m = match(restoDeSilaba);
        restoDeSilaba = m.restoDeSilaba;
        ret += m.traduccion;
    }

    return ret;
}

const testExport = {
    vocalTonicaDeSilaba: vocalTonicaDeSilaba,
};

module.exports = {
    palabraConHiatos: palabraConHiatos,
    silabaTonica: silabaTonica,
    letraTonica: letraTonica,
    normalizaPronunciacion: normalizaPronunciacion,
    normalizaPronunciacionDeSilaba: normalizaPronunciacionDeSilaba,
    quitaConsonantes: quitaConsonantes,
    quitaAcentos: quitaAcentos,
    testExport: testExport
};

