
'use strict';

const traverse = require( 'traverjs' )
  , walkJson = require( 'walk-json' )
  , utils = require( './utils' );

function list(pathJSONs) {

  return new Promise( (resolve, reject) => {
    let result = [];

    traverse( utils.makeArray(pathJSONs), (pathJSON, next) => {
      utils.injectDependencies( pathJSON )    
      .then( tree => {
        walkIt(tree)
        .then( sub => {
          result = result.concat( sub );
          next();
        });
      })
      .catch( err => {
        console.log( err );
        reject(err);
      });
    })
    .then( () => {
      resolve( result );
    })
    .catch( reject );
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

module.exports = list;
