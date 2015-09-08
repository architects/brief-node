run_specs: compile
	@./node_modules/mocha/bin/mocha \
		--require should \
		--require 'babel/register' \
		--require './test/test-helper' \
		--reporter spec \
		--compilers js:mocha-babel \
		--compilers coffee:coffee-script/register \
		test/**/*-spec.*

compile:
	babel -q -d lib src
