#!/usr/bin/env node

'use strict';

const program = require( 'commander' )
  , compose = require( './compose' )
  , list = require( './list' );

program
.version( '0.0.0' )
.usage( '<json file>' )
.option('-l, --list', 'list target branches')
.parse( process.argv );

if (program.args.length != 1) {
  program.help();
}
else if (program.list) {
  list( program.args[0] )
  .then( (result) => {
    console.log( JSON.stringify( result, null, 2 ) );
  })
  .catch( (err) => {
    process.stderr.write( 'error:', err ); 
  });
}
else {
  compose( program.args[0] )
  .then( (result) => {
    console.log( JSON.stringify( result, null, 2 ) );
  })
  .catch( (err) => {
    process.stderr.write( 'error:', err ); 
  });
}

