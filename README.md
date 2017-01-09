# filebase

objective: 
-read and flatten properties of nested objects					 => (source files, compiler/linker flags...)
-optionally preserve structures of nested object when flattening => (source files and their path)


generation of:
	- gyp
	- pro/pri

specs: 
	- project def file must be json
	- files are listed under files property, this can be a regex
	- 

questions: 
how to specialize for os ?
how to specialize for compiler? 

1) explicit definition file 

def.json  // files
mac.json  // files
win.json  // files
gcc.json  // configurations
clang.json  // configurations

filebase win.json gcc.json
filebase mac.json clang.json
filebase mac.json gcc.json










