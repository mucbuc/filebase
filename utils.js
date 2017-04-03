'use strict';

const path = require( 'path' )
  , inject = require( 'inject-json' );

function prependPath(dirname, src) {
  let result = [];
  for (const file of src) {
    result.push( path.join( dirname, file ) );
  }
  return result;
}

function mergeObjects(dest, source) {
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
  let result = {};

  for (let name in original) {
    if (name.match(regexp)) {
      result[name] = original[name]
    }
  }

  return result;
}

function injectDependencies(pathJSON) {
  
  console.log( 'injectDependencies', pathJSON );

  return inject( pathJSON, 'import');
}

function join(a, b) {
  

  console.log( '**** join', a, b );

  return path.join( path.dirname(a), b );
}

function makeArray(obj) {
  return Array.isArray(obj) ? obj : [obj];
}

module.exports = {
  prependPath: prependPath,
  mergeObjects: mergeObjects,
  copyMatches: copyMatches,
  injectDependencies: injectDependencies,
  join: join,
  makeArray: makeArray
};