#!/usr/bin/env node

'use strict';

const assert = require( 'assert' )
  , inject = require( 'inject-json' )
  , path = require( 'path' )
  , traverse = require( 'traverjs' )
  , program = require( 'commander' )
  , walkJson = require( 'walk-json' ); 

function prependPath(dirname, src) {
  let result = [];
  for (const file of src) {
    result.push( path.join( dirname, file ) );
  }
  return result;
}

function join(a, b) {
  return path.join( path.dirname(a), b );
}

function merge(dest, source) {
  for (let name in source) {
    if (!dest.hasOwnProperty(name)) {
      dest[name] = source[name]; 
    }
    else if (!Array.isArray(dest[name])) {
      dest[name] = [dest[name], source[name]];
    }
    else {
      dest[name] = dest[name].concat( source[name] );
    }
  }
  return dest;
}

function copyMatches(original, regexp) {
  let trimmed = {};

  for (let name in original) {
    if (name.match(regexp)) {
      trimmed[name] = original[name]
    }
  }

  return trimmed;
}

function processMatches(prop, jsonPath) {

  const matches = jsonPath.match( /(sources|config)/ );
  let result = {};

  if (matches) {
    const match = matches[1];
    const content = prependPath( jsonPath.substr(0, jsonPath.length - match.length), prop );
    result = merge( result, { [match]: content } ); 
  }
  else if (typeof prop !== 'object') {
    result = merge( result, { [path.basename(jsonPath)]: prop } );      
  }
  return result;
}

function injectDependencies(pathJSON) {
  return inject( pathJSON, 'import');
}

function getProperties(pathJSON, target) {

  return new Promise( (resolve, reject) => {

    injectDependencies( pathJSON )    
    .then( tree => {

      walkIt(tree, target, path.dirname( pathJSON ))
      .then( result => {
        resolve(result);
      });
    })
    .catch( err => {
      reject( err ); 
    });
  });

  function walkIt( obj, target, pathBase, cb ) {
    return new Promise( (resolve, reject) => {
      let result = {};
      walkJson( obj, (prop, jsonPath, next, skip) => {
       
        let absPath = path.join( pathBase, jsonPath );

        if (  typeof target !== 'undefined'
          &&  jsonPath == 'branches')
        {
          walkIt( copyMatches( prop, target ), target, pathBase )
          .then( (sub) => {
            result = merge(result, sub);
            skip();
          } );
        }
        else {
          result = merge(result, processMatches( prop, absPath ) );
          next();
        }
      }
      , join )
      .then( () => {
        resolve( result );
      });
    });
  }
}

function getBranches(pathJSON) {

  return new Promise( (resolve, reject) => {
    injectDependencies( pathJSON )    
    .then( tree => {
      walkIt(tree)
      .then( result => {
        resolve( result );
      });
    })
    .catch( err => {
      console.log( err );
      reject(err);
    });
  });
  
  function walkIt(tree) {

    return new Promise( (resolve, reject) => {

      let base = '';
      let result = [];
      walkJson( tree, (prop, jsonPath, next, skip) => {
            
        if (jsonPath.endsWith("branches"))
        {
          traverse( prop, (branch, next) => {
            const branchName = Object.keys(branch)[0]
            const branchObj = branch[branchName];

            if (typeof branchObj === 'object') {
              walkIt( branchObj )
              .then( sub => {
                if (!sub.length) 
                {
                  result = result.concat(branchName);
                }
                else {
                  result = result.concat( {[branchName]: sub} );
                }
                next();
              })
              .catch( err => {
                console.log( 'error: ', err );
                reject( err );
              });
            }
            else {
              
              result = result.concat(branchName);

              next();
            }
          })
          .then( skip )
          .catch( next );
        }
        else {
          next();
        }
      })
      .then( () => {
        resolve(result);
      })
      .catch( reject );
    });
  }
}

if (module.parent) {
  module.exports = { 
    getProperties: getProperties,
    getBranches: getBranches
  };
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
