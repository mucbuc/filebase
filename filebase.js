#!/usr/bin/env node

'use strict';

const assert = require( 'assert' )
  , inject = require( 'inject-json' )
  , path = require( 'path' )
  , traverse = require( 'traverjs' )
  , program = require( 'commander' )
  , walkJson = require( 'walk-json' ); 

function prependPath(src, dirname) {
  assert( Array.isArray( src ) ); 

  return new Promise( (resolve, reject) => {
    let result = [];
    traverse( src, ( file, next ) => {
      result.push( path.join( dirname, file ) );
      next();
    })
    .then( resolve.bind( null, result ) );
  });
}

function join(a, b) {
  return path.join( path.dirname(a), b );
}

function merge(sub, result) {

  for (let name in sub) {
    if (!result.hasOwnProperty(name))
    {
      result[name] = [];
    }

    result[name] = result[name].concat(sub[name]);
  }
  return result;
}

function propertiesMatching(original, regexp) {
  let trimmed = {};

  for (let name in original) {
    if (name.match(regexp)) {
      trimmed[name] = original[name]
    }
  }

  return trimmed;
}

function processMatches(prop, jsonPath) {
  
  return new Promise( (resolve, reject) => {

    const matches = jsonPath.match( /(sources|config)/ );
    let flat = {};

    if (matches) {
      const match = matches[1];
      if (!flat.hasOwnProperty(match)) {
        flat[match] = [];
      }

      prependPath( prop, jsonPath.substr(0, jsonPath.length - match.length) )
      .then( src => {
        flat[match] = flat[match].concat( src );
        resolve(flat);
      })
      .catch( reject );
    }
    else if (typeof prop !== 'object') {
      flat[path.basename(jsonPath)] = prop; 
      resolve(flat);
    }
    else {
      resolve(flat);
    }
  });
}

function getProperties(pathJSON, target) {

  return new Promise( (resolve, reject) => {

    
    const pathBase = path.dirname( pathJSON );

    inject( pathJSON, 'import')    
    .then( (someResult) => {

      walkIt(someResult, target)
      .then( (result) => {
        resolve(result);
      });


      function walkIt( obj, target ) {

        return new Promise( (resolve, reject) => {
          let flat = {};
          walkJson( obj, (prop, jsonPath, next, skip) => {
           
            let absPath = path.join( pathBase, jsonPath );

            if (  typeof target !== 'undefined'
              &&  jsonPath == 'branches')
            {
              walkIt( propertiesMatching( prop, target ) )
              .then( (sub) => {
                flat = merge(sub, flat);
                skip();
              } );
            }
            else {

              processMatches( prop, absPath )
              .then( (sub) => {
                flat = merge(sub, flat);
                next();
              } );
            }
          }
          , join )
          .then( () => {
            resolve( flat );
          });
        });
      }
    })
    .catch( (err) => {
      reject( err ); 
    });
  }); 
}

if (module.parent) {
  module.exports = getProperties;
  return;  
}
else {
  program
  .version( '0.0.0' )
  .usage( '<json file>' )
  .parse( process.argv );

  if (program.args.length != 1) {
    program.help();
  }
  else {
    getProperties( program.args[0] )
    .then( (result) => {
      console.log( JSON.stringify( result, null, 2 ) );
    })
    .catch( (err) => {
      process.stderr.write( 'error:', err ); 
    });
  }
}
