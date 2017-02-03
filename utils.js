'use strict';

let path = require( 'path' );

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

module.exports = {
  prependPath: prependPath,
  mergeObjects: mergeObjects,
  copyMatches: copyMatches
};