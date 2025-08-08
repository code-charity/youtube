# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.12.1"></a>
## [0.12.1](https://github.com/reid/node-jslint/compare/v0.12.0...v0.12.1) (2019-01-28)

### Update to es6 latest (2018-11-28)
 Node doesn't like the 'export default' syntax, so I hacked it to use 'var'.

### Update dependencies
 * mocha => 5.2.0
 * glob => 7.1.3
 * nopt => 4.0.1
 * marked-man => 0.2.1

<a name="0.12.0"></a>
## [0.12.0](https://github.com/reid/node-jslint/compare/v0.10.3...v0.12.0) (2018-02-03)

### Update to es6 latest (2018-01-27)

<a name="0.10.3"></a>
## [0.10.3](https://github.com/reid/node-jslint/compare/v0.10.1...v0.10.3) (2016-08-03)


### Bug Fixes

* **lib/jslint-es6:** update jslint-es6 to latest upstream, 2016-07-13 ([7ec74b6](https://github.com/reid/node-jslint/commit/7ec74b6))
* **package.json:** add license, update deps ([55baa7b](https://github.com/reid/node-jslint/commit/55baa7b))



<a name="0.10.2"></a>
## [0.10.2](https://github.com/reid/node-jslint/compare/v0.10.0...v0.10.2) (2016-07-30)


### Bug Fixes

* **package.json:** add license, update deps ([55baa7b](https://github.com/reid/node-jslint/commit/55baa7b))

## Before 2016-07-30

Version 0.9.0 contains the new BETA version of jslint for EcmaScript 6,
which is a ground-up rewrite by Douglas Crockford.  The `latest` alias
still points to the last `es5` version of jslint; you can also use
`--edition=es5` to get the (old) es5 version.  To get the `es6` version
you must use `--edition=es6`.

2015-07-29  Sam Mikes  <smikes@cubane.com>
        * lib/jslint-es6.js: latest jslint from upstream
        * lib/nodelint.js, test/regression.js: correctly report edition for post-es6 jslints, 
        thanks to @bryanjhv for the bug report and fix

2015-02-19  Sam Mikes  <smikes@cubane.com>
	* lib/main.js, test/main.js: new option --no-filter to allow linting paths containing 'node_modules'

2014-12-16  Sam Mikes  <smikes@cubane.com>
	* lib/collector.js: new programmatic interface for collecting lint
	* lib/main.js, lib/nodelint.js: add callback to `runMain`, publicize

2014-10-22  Sam Mikes  <smikes@cubane.com>
	* test/regression.js: add file for misc github issues tests
	* package.json: avoid using prepublish

2014-09-10  Marshall Thompson <marshall.w.thompson.iv@gmail.com>
	* update jslint-latest to upstream edition 2014-07-08

2104-04-13  Sam Mikes  <smikes@cubane.com>

	* lib/linter.js: Fix issue #88 - support user-specified config file, support
 	jslint.conf and .jslint.conf in addition to jslintrc, .jslintrc 

2014-01-30  Sam Mikes  <smikes@cubane.com>

	* lib/linter.js: Fix Issue #80 - crash on empty jslintrc
	Underlying issue was test-then-read rather than just attempting to
	read and parse config, catching exceptions.

2014-01-27  Sam Mikes  <smikes@cubane.com>

	* Version 0.2.8 - update jslint-latest to upstream edition 2014-01-26

2013-12-18  Sam Mikes  <smikes@cubane.com>

	* Version 0.2.6 - move code from src/jslint.js to lib/main.js
	Update list of options in jslint.md
	Remove incorrect options from jslintrc.example (https://github.com/reid/node-jslint/issues/76)
	Document & enable use of --todo flag (https://github.com/reid/node-jslint/issues/76)

Version 0.7.0 creates a new programmatic interface which is used by
https://github.com/hapijs/lab

Version 0.5.1 fixes a regression which crashes jslint when more than
maxerr errors are in a single file.  Thanks to Vasil Velichkov
(@velichkov) for pointing this out.

Version 0.5.0 reorganizes the loading interface, making it easier for
other projects to use node-jslint to load a specific jslint edition.

Version 0.4.0 exposes a stream interface to jslint.

Version 0.3.4 supports globbing with * and ** expressions.

Versions 0.2+ provide multiple editions of jslint to
address backwards and forwards compatibility.
