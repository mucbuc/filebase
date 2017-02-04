'use strict';

const path = require( 'path' )
  , walkJson = require( 'walk-json' )
  , utils = require( './utils' );

function compose(pathJSON, target) {

  return new Promise( (resolve, reject) => {

    utils.injectDependencies( pathJSON )    
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
          walkIt( utils.copyMatches( prop, target ), target, pathBase )
          .then( (sub) => {
            result = utils.mergeObjects(result, sub);
            skip();
          } );
        }
        else {
          result = utils.mergeObjects(result, processMatches( prop, absPath ) );
          next();
        }
      }
      , utils.join )
      .then( () => {
        resolve( result );
      });
    });
  }

  function processMatches(prop, jsonPath) {

    const matches = jsonPath.match( /(sources|config)/ );
    let result = {};

    if (matches) {
      const match = matches[1];
      const content = utils.prependPath( jsonPath.substr(0, jsonPath.length - match.length), prop );
      result = utils.mergeObjects( result, { [match]: content } ); 
    }
    else if (typeof prop !== 'object') {
      result = utils.mergeObjects( result, { [path.basename(jsonPath)]: prop } );      
    }
    return result;
  }
}

module.exports = compose;
