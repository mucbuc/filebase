#!/usr/bin/env node

'use strict';

let getSources = require( './../filebase.js' )
  , test = require( 'tape' )
  , Expector = require( 'expector' ).SeqExpector; 

test( 'dummy', (t) => {
	let e = new Expector( t );

	e.expect( { sources: [ 'test/lib/mod/src/fkjdsa.h', 'test/src/main.cpp' ], config: [ 'test/config.gypi' ] } ); 

	getSources( './test/test.json' )
	.then( (sources) => {

		console.log( '***', sources );

		e.emit( sources ).check(); 		
	});

});

test( 'dummy2', (t) => {
	let e = new Expector( t );

	e.expect( { sources: [ 'test/lib/mod/src/fkjdsa.h', 'test/lib/modB/src/aabbcc.h', 'test/src/main.cpp' ] } ); 

	getSources( './test/test2.json' )
	.then( (sources) => {
		e.emit( sources ); 
		e.check(); 		
	});

});
