#!/usr/bin/env node

'use strict';

const assert = require( 'assert' )
  , inject = require( 'inject-json' )
  , path = require( 'path' )
  , traverse = require( 'traverjs' )
  , program = require( 'commander' )
  , walkJson = require( 'walk-json' ); 

function prependPath(dirname, src) {
  return new Promise( (resolve, reject) => {
    let result = [];
    for (const file of src) {
      result.push( path.join( dirname, file ) );
    }
    resolve( result );
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

function insert(src, name, target) 
{
  if (!target.hasOwnProperty(name)) {
    target[name] = src; 
  }
  else if (!Array.isArray(target[name])) {
    target[name] = [target[name], src];
  }
  else {
    target[name] = target[name].concat( src );
  }
  return target;
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
      prependPath( jsonPath.substr(0, jsonPath.length - match.length), prop )
      .then( src => {
        result = insert( src, match, result ); 
        resolve(result);
      })
      .catch( reject );
    }
    else if (typeof prop !== 'object') {
      result = insert(prop, path.basename(jsonPath), result );      
      resolve(result);
    }
    else {
      resolve(result);
    }
  });
}

function walkIt( obj, target, pathBase, cb ) {
  return new Promise( (resolve, reject) => {
    let result = {};
    walkJson( obj, (prop, jsonPath, next, skip) => {
     
      let absPath = path.join( pathBase, jsonPath );

      if (  typeof target !== 'undefined'
        &&  jsonPath == 'branches')
      {
        walkIt( propertiesMatching( prop, target ), target, pathBase )
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
}

function getBranches(pathJSON) {

  return new Promise( (resolve, reject) => {
    injectDependencies( pathJSON )    
    .then( tree => {
      walkIt2(tree)
      .then( result => {
        resolve( result );
      });
    })
    .catch( err => {
      console.log( err );
      reject(err);
    });
  });
  
  function walkIt2(tree) {

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
              walkIt2( branchObj )
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
