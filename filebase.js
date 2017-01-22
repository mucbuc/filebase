#!/usr/bin/env node

/* todo: 

1) return promise from processMatches with sub result for flat
2) merge sub result from branches 
*/ 

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

function getProperties(pathJSON, target) {

  return new Promise( (resolve, reject) => {

    let flat = {};
    const pathBase = path.dirname( pathJSON );

    inject( pathJSON, 'import')    
    .then( (someResult) => {

      walkJson( someResult, (prop, jsonPath, next) => {
       
        console.log( 'jsonPath', jsonPath );

        if (  typeof target !== 'undefined'
          &&  jsonPath == 'branches')
        {
          let trimmed = {};

          for (var name in prop) {
            if (name.match(target)) {
              trimmed[name] = prop[name]
            }
          }
          console.log( 'trimmed', trimmed, jsonPath );
          processMatches( trimmed, pathBase )
          .then( next );
        }
        else {
          processMatches( prop, path.join( pathBase, jsonPath ) )
          .then( next );
        }

        function processMatches(prop, jsonPath) {
          
          console.log( 'processMatches: ', prop, jsonPath );

          return new Promise( (resolve, reject) => {

            const matches = jsonPath.match( /(sources|config)/ );

            if (matches) {
              const match = matches[1];
              if (!flat.hasOwnProperty(match)) {
                flat[match] = [];
              }

              prependPath( prop, jsonPath.substr(0, jsonPath.length - match.length) )
              .then( src => {
                flat[match] = flat[match].concat( src );
                resolve();
              })
              .catch( resolve );
            }
            else if (typeof prop !== 'object')
            {
              console.log( 'prop != object' );

              flat[path.basename(jsonPath)] = prop; 
              resolve();
            }
            else {

              console.log( 'ignore:', prop );

              resolve();
            }
          });
        }
      }
      , join )
      .then( () => {
        resolve( flat );
      });
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
