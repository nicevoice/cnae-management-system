TEST = test/test.3.*.js
TESTS = test/*.js
TESTTIMEOUT = 5000
REPORTER = spec 

test:
	@./node_modules/jake/bin/cli.js -f src/Jakefile.js maketestconf
	@mv config.test.json ./src/
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) --timeout $(TESTTIMEOUT) $(TEST)
testall:
	@./node_modules/jake/bin/cli.js -f src/Jakefile.js maketestconf
	@mv config.test.json ./src/
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) --timeout $(TESTTIMEOUT) $(TESTS)

.PHONY: site docs test docclean
