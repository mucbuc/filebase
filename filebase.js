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

    inject( pathJSON, 'include', (result, next, pathJSON, cb) => {
      
      if (!next.hasOwnProperty('sources')) {
        cb( Object.assign( result, next ) );
      }
      else {
        flatten( next, 'sources' )
        .then( src => {
          prependPath( src, path.join( path.dirname(pathJSON) ) ) 
          .then( preped => {
            cb( Object.assign( result, { "sources": preped } ) );
          });
        });
      }
    } )
    .then( (result) => {

      let flattenedResult = { "sources": [] };

      traverse( result, (lib, next) => { 
        if (lib.hasOwnProperty('sources')) {
          flattenedResult.sources = flattenedResult.sources.concat( lib.sources );
        }
        else {
          const keys = Object.keys(lib);
          const key = keys[0];
          flattenedResult.sources = flattenedResult.sources.concat( lib[key].sources ); 
        }
        next();
      } )
      .then( () => { 

        var jsonString = JSON.stringify( result );
        
        fs.writeFile( tempFile, jsonString, (err) => {
          if (err) throw err; 
          flatten( result, 'sources' )
          .then( (result) => {
            resolve( flattenedResult ); 
          });
        }); 
      });
    })
    .catch( (err) => {
      console.log( 'error', err ); 
    });
  }); 
}

module.exports = getSources; 