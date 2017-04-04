#!/usr/bin/env node

'use strict';

let test = require( 'tape' )
  , Expector = require( 'expector' ).SeqExpector
  , path = require( 'path' )
  , compose = require( './../compose' )
  , list = require( './../list' );

process.chdir( path.join( __dirname, '..' ) );

test( 'single import', (t) => {
  let e = new Expector( t );

  e.expect( { sources: [ 'test/lib/mod/src/fkjdsa.h', 'test/src/main.cpp' ], config: [ 'test/config.gypi' ] } ); 

  compose( './test/test.json' )
  .then( (sources) => {
    e.emit( sources ).check();    
  })
  .catch( err => {
    console.log( err );
  });

});

test( 'multiple import', (t) => {
  let e = new Expector( t );

  e.expect( { sources: [ 'test/lib/mod/src/fkjdsa.h', 'test/lib/modB/src/aabbcc.h', 'test/src/main.cpp' ] } ); 

  compose( './test/test2.json' )
  .then( (sources) => {
    e.emit( sources ).check();    
  });
});

test( 'inside current working directory', (t) => {

  const cwd = process.cwd();
  process.chdir( __dirname );

  let e = new Expector( t );

  e.expect( { sources: [ 'lib/mod/src/fkjdsa.h', 'lib/modB/src/aabbcc.h', 'src/main.cpp' ] } ); 

  compose( './test2.json' )
  .then( (sources) => {
    e.emit( sources ).check();    
    process.chdir( cwd );
  });
});

test( 'branching', (t) => {
  let e = new Expector( t );

  e.expect( { config: ["test/config.gypi"] } ); 

  compose( './test/branch.json', /mac/ )
  .then( (sources) => {
    e.emit( sources ).check();    
  });
});

test( 'other branch', (t) => {
  let e = new Expector( t );

  e.expect( { win: 'something' } );

  compose( './test/branch.json', /win/ )
  .then( (sources) => {
    e.emit( sources ).check();
  });
});


test( 'test non matching property names', (t) => {
  let e = new Expector( t );

  e.expect( { something: 'else' } );

  compose( './test/random.json', /win/ )
  .then( (sources) => {
    e.emit( sources ).check();
  });
});

test( 'test list', (t) => {
  let e = new Expector( t ); 
  
  e.expect( [ 'mac', 'win' ]);
  list( './test/branch.json' )
  .then( (branches) => {
    e.emit( branches ).check();
  });
});


test( 'test nested branches', (t) => {
  let e = new Expector( t ); 
  
  e.expect( [ { 'x3300': [ 'mac', 'win' ] }, 'x3311' ] );
  list( './test/nested_branches.json' )
  .then( (branches) => {
    e.emit( branches ).check();
  });
}); 

test( 'process array', (t) => {
  let e = new Expector( t ); 

  e.expect( { 
    sources: [ 
      "test/lib/mod/src/fkjdsa.h", 
      "test/src/main.cpp",      
      "test/lib/modB/src/aabbcc.h"
    ], config: [ 
      "test/config.gypi" 
    ] 
  } );
  
  compose( [ './test/test.json', './test/test2.json' ] )
  .then( sources => {
    e.emit( sources ).check();
  });
});

test( 'list array', (t) => {
  let e = new Expector( t );

  e.expect( [ 'mac', 'win', { x3300: ['mac', 'win'] }, 'x3311' ] );
  list( [ './test/branch.json', './test/nested_branches.json' ] )
  .then( targets => {
    e.emit( targets ).check();
  });
});

test( 'nested imports', (t) => {
  let e = new Expector( t );

  e.expect( {
    sources: [ 
      'test/lib/modB/src/aabbcc.h', 
      'test/lib/mod/src/fkjdsa.h',
      'test/src/main.cpp' 
    ] 
  } );

  compose( './test/test3.json' )
  .then( sources => {
    e.emit(sources).check();
  })
  .catch( error => {
    console.log( 'err: ', err );
  });

});

test( 'should not have duplicates', (t) => {
  let e = new Expector( t );

  e.expect( {
    sources: [ 
      'test/lib/mod/src/fkjdsa.h'
    ] 
  } );

  compose( './test/test4.json' )
  .then( sources => {
    e.emit(sources).check();
  })
  .catch( error => {
    console.log( 'err: ', err );
  });

});

  