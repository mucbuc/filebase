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
    if (!result.hasOwnProperty(name)) {
      result[name] = sub[name];
    }
    else {
      if (!Array.isArray(result[name])) {
        result[name] = [ result[name], sub[name] ];
      }
      else {
        result[name] = result[name].concat(sub[name]);
      }
    }
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
    let result = {};

    if (matches) {
      const match = matches[1];
      if (!result.hasOwnProperty(match)) {
        result[match] = [];
      }

      prependPath( prop, jsonPath.substr(0, jsonPath.length - match.length) )
      .then( src => {
        result[match] = result[match].concat( src );
        resolve(result);
      })
      .catch( reject );
    }
    else if (typeof prop !== 'object') {
      const baseName = path.basename(jsonPath);
      if (!result.hasOwnProperty(baseName)) {
        result[baseName] = prop; 
      }
      else if (!Array.isArray(result[baseName]))
      {
        result[baseName] = [result[baseName], prop];
      }
      else
      {
        result[baseName] = result[baseName].concat( prop );
      }
      
      resolve(result);
    }
    else {
      resolve(result);
    }
  });
}

function getProperties(pathJSON, target) {

  return new Promise( (resolve, reject) => {
    
    const pathBase = path.dirname( pathJSON );

    inject( pathJSON, 'import')    
    .then( (tree) => {

      walkIt(tree, target)
      .then( (result) => {
        resolve(result);
      });

      function walkIt( obj, target ) {

        return new Promise( (resolve, reject) => {
          let result = {};
          walkJson( obj, (prop, jsonPath, next, skip) => {
           
            let absPath = path.join( pathBase, jsonPath );

            if (  typeof target !== 'undefined'
              &&  jsonPath == 'branches')
            {
              walkIt( propertiesMatching( prop, target ) )
              .then( (sub) => {
                result = merge(sub, result);
                skip();
              } );
            }
            else {

              processMatches( prop, absPath )
              .then( (sub) => {
                result = merge(sub, result);
                next();
              } );
            }
          }
          , join )
          .then( () => {
            resolve( result );
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
