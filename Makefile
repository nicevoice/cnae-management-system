TESTS = test/*.js
TESTTIMEOUT = 25000
REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) --timeout $(TESTTIMEOUT) $(TESTS)

.PHONY: site docs test docclean
