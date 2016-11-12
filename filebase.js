#!/usr/bin/env node

const inject = require( 'inject-json' )
  , flatten = require( 'json-flatten' )
  , tempFile = './tmp.json'
  , fs = require( 'fs' );

function getSources(pathJSON) {

	console.log( 'getSources', pathJSON );
	console.log( process.cwd() );

	inject( pathJSON, 'include' )
	.then( (result) => {
		//result = result["inc.json"];
		console.log( 'inject', result ); 
		fs.writeFile( tempFile, JSON.stringify( result ), (err) => {
			if (err) throw err; 
			flatten( result, 'sources' )
			.then( (result) => {
				console.log( 'flattened', result ); 
			});

			//.catch( (err) => {
		//		console.log( err ); 
		//	});
		}); 
	})
	.catch( (err) => {
		console.log( err ); 
	});

}

module.exports = getSources; 