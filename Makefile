specs: compile
	@./node_modules/mocha/bin/mocha \
		--require should \
		--require 'babel/register' \
		--require './test/test-helper' \
		--compilers js:mocha-babel \
		--compilers coffee:coffee-script/register \
		--reporter spec \
		test/**/*-spec.*

spec:
	@./node_modules/mocha/bin/mocha \
		--require should \
		--require 'babel/register' \
		--require './test/test-helper' \
		--compilers js:mocha-babel \
		--compilers coffee:coffee-script/register \
		--reporter spec \
		test/**/*-spec.*

console: compile
	coffee --interactive \
		--require babel/register \
		--require ./test/console

compile:
	babel -q -d lib src
