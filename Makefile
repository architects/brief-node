run_specs_vimsafe:
	@./node_modules/mocha/bin/mocha \
		--require should \
		--require 'babel/register' \
		--require './test/test-helper' \
		--compilers js:mocha-babel \
		--compilers coffee:coffee-script/register \
		--reporter min \
		test/**/*-spec.*

run_specs:
	@./node_modules/mocha/bin/mocha \
		--require should \
		--require 'babel/register' \
		--require './test/test-helper' \
		--compilers js:mocha-babel \
		--compilers coffee:coffee-script/register \
		--reporter spec \
		test/**/*-spec.*

compile:
	babel -q -d lib src
