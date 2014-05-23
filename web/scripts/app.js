/**
 * scripts/app.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function App() {
	var self = this;
	self.myViewModel = {};

	self.initialize = function() {

		ko.applyBindings(self.myViewModel);		
		$('body').css('display', 'block');
	}

	return self;
}

module.exports = App;