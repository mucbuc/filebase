#!/usr/bin/env node

'use strict';

const assert = require( 'assert' )
  , inject = require( 'inject-json' )
  , flatten = require( 'json-flatten' )
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

function getProperties(pathJSON) {

  return new Promise( (resolve, reject) => {

    let flat = {};

    inject( pathJSON, 'import' )    
    .then( (someResult) => {

      walkJson( someResult, (prop, jsonPath) => {
        const matches = jsonPath.match( /(sources|config)/ );

        if (matches) {
          const match = matches[1];
          if (!flat.hasOwnProperty(match)) {
            flat[match] = [];
          }

          prependPath( prop, jsonPath.substr(0, jsonPath.length - match.length) )
          .then( src => {
            flat[match] = flat[match].concat( src );
          });
        }
        else if (typeof prop !== 'object')
        {
          flat[path.basename(jsonPath)] = prop; 
        }
      }
      , join )
      .then( () => {

        const result = {
          "includes": flat.config,
          "target_defaults": {
            "sources": flat.sources
          }
        };

        console.log( JSON.stringify( result, null, 2 ) );
      });
    })
    .catch( (err) => {
      process.stderr.write( 'error:', err ); 
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
    .then( result => {
      console.log( result ); 
    });
  }
}
