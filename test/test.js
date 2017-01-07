#!/usr/bin/env node

'use strict';

let getSources = require( './../filebase.js' )
  , test = require( 'tape' )
  , Expector = require( 'expector' ).SeqExpector; 

test( 'dummy', (t) => {
	let e = new Expector( t );

	e.expect( { sources: [ 'lib/mod/src/fkjdsa.h', 'src/main.cpp' ], config: [ "config.gypi" ] } ); 

	getSources( './test/test.json' )
	.then( (sources) => {
		e.emit( sources ).check(); 		
	});

});

test( 'dummy2', (t) => {
	let e = new Expector( t );

	e.expect( { sources: [ 'lib/mod/src/fkjdsa.h', 'lib/modB/src/aabbcc.h', 'src/main.cpp' ] } ); 

	getSources( './test/test2.json' )
	.then( (sources) => {
		e.emit( sources ); 
		e.check(); 		
	});

});
