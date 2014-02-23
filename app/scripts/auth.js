/**
 * scripts/auth.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Auth(app) {
	var self = this;

	var auth = app.myViewModel.auth = {};

	auth.test = ko.observable('what up auth');

	auth.testFunction = function() {
		auth.test('new text')
	}

	return self;
}

module.exports = Auth;