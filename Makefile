run_specs: compile
	@./node_modules/mocha/bin/mocha \
		--require should \
		--require 'babel/register' \
		--require './test/test-helper' \
		--compilers js:mocha-babel \
		--compilers coffee:coffee-script/register \
		--reporter spec \
		test/**/*-spec.*

run_specs_vimsafe:
	@./node_modules/mocha/bin/mocha \
		--require should \
		--require 'babel/register' \
		--require './test/test-helper' \
		--compilers js:mocha-babel \
		--compilers coffee:coffee-script/register \
		--reporter min \
		test/**/*-spec.*

console: compile
	coffee --interactive \
		--require babel/register \
		--require ./test/console

compile:
	babel -q -d lib src
