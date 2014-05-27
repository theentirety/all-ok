/**
 * scripts/header.js
 */

'use strict';

function Header(app) {
	var self = this;

	var header = app.myViewModel.header = {};

	header.init = function() {
		// report.show(true);
	}

	return self;
}

module.exports = Header;