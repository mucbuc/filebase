#!/usr/bin/env node

'use strict';

let getProperties = require( './../filebase.js' ).getProperties
  , test = require( 'tape' )
  , Expector = require( 'expector' ).SeqExpector
  , path = require( 'path' );

process.chdir( path.join( __dirname, '..' ) );

test( 'single import', (t) => {
	let e = new Expector( t );

	e.expect( { sources: [ 'test/lib/mod/src/fkjdsa.h', 'test/src/main.cpp' ], config: [ 'test/config.gypi' ] } ); 

	getProperties( './test/test.json' )
	.then( (sources) => {
		e.emit( sources ).check(); 		
	});

});

test( 'multiple import', (t) => {
	let e = new Expector( t );

	e.expect( { sources: [ 'test/lib/mod/src/fkjdsa.h', 'test/lib/modB/src/aabbcc.h', 'test/src/main.cpp' ] } ); 

	getProperties( './test/test2.json')
	.then( (sources) => {
		e.emit( sources ).check(); 		
	});
});

test( 'inside current working directory', (t) => {

	const cwd = process.cwd();
	process.chdir( __dirname );

	let e = new Expector( t );

	e.expect( { sources: [ 'lib/mod/src/fkjdsa.h', 'lib/modB/src/aabbcc.h', 'src/main.cpp' ] } ); 

	getProperties( './test2.json' )
	.then( (sources) => {
		e.emit( sources ).check(); 		
		process.chdir( cwd );
	});
});

test( 'branching', (t) => {
	let e = new Expector( t );

	e.expect( { config: ["test/config.gypi"] } ); 

	getProperties( './test/branch.json', /mac/ )
	.then( (sources) => {
		e.emit( sources ).check(); 		
	});
});

test( 'other branch', (t) => {
	let e = new Expector( t );

	e.expect( { win: 'something' } );

	getProperties( './test/branch.json', /win/ )
	.then( (sources) => {
		e.emit( sources ).check();
	});
});


test( 'test non matching property names', (t) => {
	let e = new Expector( t );

	e.expect( { something: 'else' } );

	getProperties( './test/random.json', /win/ )
	.then( (sources) => {
		e.emit( sources ).check();
	});
});

	