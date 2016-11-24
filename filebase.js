#!/usr/bin/env node

'use strict';

const assert = require( 'assert' )
  , inject = require( 'inject-json' )
  , flatten = require( 'json-flatten' )
  , tempFile = './tmp.json'
  , fs = require( 'fs' )
  , path = require( 'path' )
  , traverse = require( 'traverjs' )
  , program = require( 'commander' );

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

    inject( pathJSON, 'import', (next, pathJSON, cb) => {
      
      if (!next.hasOwnProperty('sources')) {
        
        console.log( '*', next ); 

        cb();
      }
      else {
        flatten( next, 'sources' )
        .then( src => {
          prependPath( src, path.join( path.dirname(pathJSON) ) ) 
          .then( preped => {
            
            if (!flat.hasOwnProperty('sources')) {
              flat.sources = [];
            }

            flat.sources = flat.sources.concat( preped );
            cb();
          });
        })
        .catch( (err) => {
          console.log( 'error', err ); 
        });
      }
    } )
    .then( () => {
      resolve( flat ); 
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
