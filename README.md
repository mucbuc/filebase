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

	different files for different targets:

	def.json
	{
		"files": "src/main.cpp"
	}

	mac.json
	{
		"import": "def.json",
		"files": "src/mac.cpp"
	}

	win.json
	{
		"import": "def.json",
		"files": "src/win.cpp"
	}

how to specialize for compiler? 

	gcc.json
	{
		"compiler flags": [],
		"linker flags" : []
	}

	clang.json
	{
		"compiler flags": []
		"linker flags": []
	}


