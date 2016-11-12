#!/usr/bin/env node

'use strict';

let getSources = require( './../filebase.js' )
  , test = require( 'tape' )
  , Expector = require( 'expector' ).SeqExpector; 

test( 'dummy', (t) => {
	let e = new Expector( t );

	getSources( './test/test.json' ); 

	e.check(); 
});
