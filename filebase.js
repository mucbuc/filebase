#!/usr/bin/env node

'use strict';

const inject = require( 'inject-json' )
  , flatten = require( 'json-flatten' )
  , tempFile = './tmp.json'
  , fs = require( 'fs' )
  , path = require( 'path' )
  , traverse = require( 'traverjs' ); 

function getSources(pathJSON) {

  return new Promise( (resolve, reject) => {

    inject( pathJSON, 'include', (result, next, pathJSON, cb) => {
      
      if (!next.hasOwnProperty('sources')) {
        cb( Object.assign( result, next ) );
      }
      else {
        flatten( next, 'sources' )
        .then( (src) => {
          let merged = [];

          traverse( src, ( file, done ) => {
            const mergedPath = path.join( path.dirname(pathJSON), file );

            merged.push( mergedPath );
            done();
          })
          .then( () => {
            cb( Object.assign( result, { "sources": merged } ) );         
          })
          .catch( (err) => {
            console.log( 'error', err );
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

        //result = result["inc.json"];
        
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