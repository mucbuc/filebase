#!/usr/bin/env node

'use strict';

const assert = require( 'assert' )
  , inject = require( 'inject-json' )
  , flatten = require( 'json-flatten' )
  , tempFile = './tmp.json'
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

function getSources(pathJSON) {

  return new Promise( (resolve, reject) => {

    let flat = {};

    inject( pathJSON, 'import' )    
    .then( (someResult) => {

      flatten( someResult, 'sources', ( key, value, cb, base ) => {        
        prependPath( value, path.dirname(base) )
        .then( result => {
          cb( result ); 
        })
        .catch( err => {
          console.log( err );
        });

      }, path.dirname(pathJSON) )
      .then( src => {
        
        walkJson( someResult, (prop, jsonPath) => {
          
          if (typeof prop !== 'object' && !jsonPath.match( /sources/ ))
          {
            src[jsonPath] = prop; 
          }
        
          console.log( 'rrresult', JSON.stringify( src, null, 2 ) );
        }, (a, b) => {
          return b; 
        }); 
      }); 
    })
    .catch( (err) => {
      console.log( 'error', err ); 
    });
  }); 
}

if (module.parent) {
  module.exports = getSources;
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
    getSources( program.args[0] )
    .then( result => {
      console.log( result ); 
    });
  }
}
