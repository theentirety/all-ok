/**
 * scripts/notes.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Home(app) {
	var self = this;

	var home = app.myViewModel.home = {};

	home.totals = ko.observableArray();
	home.isRefreshDragging = ko.observable(false);
	home.dragStart = ko.observable(0);
	home.today = moment(new Date()).startOf('isoweek');
	home.weeks = ko.observableArray();

	home.showAlerts = function() {
		app.myViewModel.alerts.show(true);
	}

	home.showProfile = function() {
		app.myViewModel.profile.show(true);
	}

	home.styleWeek = function(index) {

		var styledDate = 'Week of ' + moment(home.today).startOf('isoweek').add('days', (index * 7)).format('MMM D');
		if (index == 0) { styledDate = 'This week' };
		if (index == 1) { styledDate = 'Next week' };
		return styledDate;
	}

	home.Week = function(missingWeek) {
		var blankWeek = {
			notes: '',
			rating: -1,
			total: -1,
			week: home.weeks()[missingWeek]
		};
		return blankWeek;
	}

	home.convertNumToWords = function(number) {
		switch (number) {
			case 0:
				return 'zero';
			case 1:
				return 'one';
			case 2:
				return 'two';
			case 3:
				return 'three';
			case 4:
				return 'four';
			default:
				return 'unknown';
		}
	}

	home.getTotalsAndRating = function() {
		home.weeks([]);
		for (var i = 0; i < app.myViewModel.numWeeks; i++) {
			home.weeks.push(moment(home.today).startOf('isoweek').add('days', (i * 7)).format('YYYY, M, D'));
		}
		console.log(home.weeks())
		Parse.Cloud.run('getTotalsAndRating', {
			weeks: home.weeks()
		}, {
			success: function(totalsAndRating) {
				for (var i = totalsAndRating.length; i < app.myViewModel.numWeeks; i++) {
					// add blank entries to the results
					totalsAndRating.push(home.Week(i));
					$('#home .refresh').html('<span class="fa fa-arrow-circle-down"></span> Pull to refresh');
					home.isRefreshDragging(false);
					home.dragStart(0);
					$('#home .page').animate({
						marginTop: 0
					}, 100);
				}
				console.log(totalsAndRating)
				home.totals(totalsAndRating);
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	home.dragRefresh = function(item, event) {
		if (home.isRefreshDragging() && home.dragStart() == 0) {
			var top = $(document).scrollTop();
			var delta = Math.floor(event.gesture.distance);
			if (top == 0 && delta > 30) {
				if (delta > 80) delta = 80;
				$('#home .page').css('margin-top', delta - 30);
				if (delta >= 60) {
					$('#home .refresh').html('<span class="fa fa-arrow-circle-up"></span> Release to refresh');
				} else {
					$('#home .refresh').html('<span class="fa fa-arrow-circle-down"></span> Pull to refresh');
				}
			}
		}
	}

	home.startRefreshDrag = function(item, event) {
		if (!home.isRefreshDragging() && home.dragStart() == 0) {
			home.dragStart($(document).scrollTop());
			home.isRefreshDragging(true);
			$(event.gesture.target).one('dragend', function(event) {
				var delta = parseInt($('#home .page').css('margin-top'));

				if (delta >= 30) {
					home.getTotalsAndRating();
					$('#home .refresh').html('<span class="fa fa-refresh fa-spin"></span> Refreshing...');
				} else {
					$('#home .refresh').html('<span class="fa fa-arrow-circle-down"></span> Pull to refresh');
					home.isRefreshDragging(false);
					home.dragStart(0);
					$('#home .page').animate({
						marginTop: 0
					}, 100);
				}
			})
		}
	}

	home.init = function() {
		home.getTotalsAndRating();
	}

	if (app.myViewModel.auth.currentUser()) {
		home.init();
	}

	return self;
}


module.exports = Home;