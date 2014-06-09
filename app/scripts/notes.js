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

	notes.show = ko.observable(false);
	notes.rating = ko.observable(2);
	notes.content = ko.observable();

	notes.statusOptions = ko.observableArray();

	notes.init = function() {
		notes.statusOptions.push(new notes.Status('Bring on the work',0));
		notes.statusOptions.push(new notes.Status('I\'m a little light',1));
		notes.statusOptions.push(new notes.Status('Life is good',2));
		notes.statusOptions.push(new notes.Status('I\'m a bit overwhelmed',3));
		notes.statusOptions.push(new notes.Status('Stop the madness!',4));
	}

	notes.Status = function(text, value) {
		var status = {
			label: text,
			value: value
		};
		return status;
	}

	notes.selectStatus = function(item, e) {
		notes.rating(item.value);
	}

	notes.reset = function(index) {
		if (index != null) {
			notes.rating(app.myViewModel.home.totals()[index].rating);
			notes.content(app.myViewModel.home.totals()[index].notes);
		} else {
			notes.rating(2);
			notes.content('');
		}
	}

	notes.goBack = function() {
		app.myViewModel.rateWeek.show(true);
		notes.show(false);
		app.goToView('rate-week');
	}

	notes.goNext = function() {
		notes.show(false);
		app.myViewModel.save.show(true);
		app.myViewModel.save.submit();
		app.goToView('save');
	}

	notes.init();

	return self;
}


module.exports = Notes;