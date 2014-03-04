/**
 * scripts/header.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Header(app) {
	var self = this;

	var header = app.myViewModel.header = {};

	header.activePage = ko.observable(0);
	header.isModal = ko.observable(false);
	header.pages = ko.observableArray([
		{
			display: 'My Time',
			link: 'mytime'
		},
		{
			display: 'People',
			link: 'people'
		}
	]);

	header.goToPage = function(index) {
		header.activePage(index);
		$('#header .navbar-collapse').removeClass('in');
		app.myViewModel.steps.currentStep(0);
		if (index != 1) {
			app.myViewModel.people.showDetails(false);
		}
	}

	header.logout = function() {
		app.myViewModel.auth.logout();
	}

	return self;
}

module.exports = Header;