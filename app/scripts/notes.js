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
			icon: 'emoji-1.svg'
		},
		{
			label: 'I\'m a little light',
			value: 1,
			icon: 'emoji-2.svg'
		},
		{
			label: 'Life is good',
			value: 2,
			icon: 'emoji-3.svg'
		},
		{
			label: 'I\'m a bit overwhelmed',
			value: 3,
			icon: 'emoji-4.svg'
		},
		{
			label: 'Stop the madness!',
			value: 4,
			icon: 'emoji-5.svg'
		}
	]);

	notes.selectStatus = function(item) {
		app.myViewModel.rateWeek.weeks()[app.myViewModel.rateWeek.activeWeek()].rating(item.value);
	}

	return self;
}


module.exports = Notes;