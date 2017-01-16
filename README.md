# filebase

objective: 
-read and flatten properties of nested objects					 => (source files, compiler/linker flags...)
-optionally preserve structures of nested object when flattening => (source files and their path)

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




whole example:

mac.json
{
	"import": "base.json"
}

win.json
{
	"import": "base.json"
}

ios.json
{
	"import": "base.json"
}

gcc.json
clang.json
msv.json

target.json
{
	mac: [mac.json, clang.json],
	mac-gcc: [mac.json, gcc.json],
	win: [win.json, msv.json]
	defaults: {
		win32: win,
		win64: win,
		osx: mac
	}
}

>>>

build mac mac-gcc

or 

build

or 

build --debug





design, constraints: 

-need some "switch plate" file, mapping target with def file 
-clients should be able to specify target within the def file

mac-gcc: mac.json, gcc.json

>>> 

targets.json
{
	filter: { 
		"*mac*": "mac.json
	}
}













