/**
 * scripts/notes.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Notes(app) {
	var self = this;

	var notes = app.myViewModel.notes = {};
	notes.statusOptions = ko.observableArray([
		{
			label: 'Bring on the work',
			value: 0,
			icon: 'fa fa-arrow-down'
		},
		{
			label: 'I\'m a little light',
			value: 1,
			icon: 'fa fa-minus'
		},
		{
			label: 'I\'m good',
			value: 2,
			icon: 'fa fa-arrow-right'
		},
		{
			label: 'I\'m a bit overwhelmed',
			value: 3,
			icon: 'fa fa-minus'
		},
		{
			label: 'Stop the madness!',
			value: 4,
			icon: 'fa fa-arrow-up'
		}
	]);

	notes.selectStatus = function(item) {
		app.myViewModel.rateWeek.weeks()[app.myViewModel.rateWeek.activeWeek()].rating(item.value);
	}

	return self;
}


module.exports = Notes;