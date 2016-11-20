#!/usr/bin/env node

'use strict';

const assert = require( 'assert' )
  , inject = require( 'inject-json' )
  , flatten = require( 'json-flatten' )
  , tempFile = './tmp.json'
  , fs = require( 'fs' )
  , path = require( 'path' )
  , traverse = require( 'traverjs' ); 

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

    let flat = [];

    inject( pathJSON, 'include', (next, pathJSON, cb) => {
      
      if (!next.hasOwnProperty('sources')) {
        cb();
      }
      else {
        flatten( next, 'sources' )
        .then( src => {
          prependPath( src, path.join( path.dirname(pathJSON) ) ) 
          .then( preped => {
            flat = flat.concat( preped );
            cb();
          });
        });
      }
    } )
    .then( () => {
      resolve( { "sources": flat } ); 
    })
    .catch( (err) => {
      console.log( 'error', err ); 
    });
  }); 
}

module.exports = getSources; 