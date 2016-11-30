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

    let flat = { sources: [] };

    inject( pathJSON, 'import' )    
    .then( (someResult) => {

      walkJson( someResult, (prop, jsonPath) => {
        if (jsonPath.match( /sources/ )) {
          prependPath( prop, jsonPath.substr(0, jsonPath.length -'sources'.length) )
          .then( src => {
            flat.sources = flat.sources.concat( src );
          });
        }
        else if (typeof prop !== 'object' && !jsonPath.match( /sources/ ))
        {
          flat[path.basename(jsonPath)] = prop; 
        }
      }, (a, b) => {
        return path.join( path.dirname(a), b );
      })
      .then( () => {
        console.log( 'rrresult', JSON.stringify( flat, null, 2 ) );
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
