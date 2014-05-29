/**
 * scripts/auth.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Report(app) {
	var self = this;

	var report = app.myViewModel.report = {};
	report.show = ko.observable(false);
	report.times = ko.observableArray([]);
	report.viewType = ko.observable('hours');
	report.activeWeek = ko.observable(0);

	report.allProjects = ko.observableArray();

	report.numWeeks = 3;
	report.today = moment(new Date()).startOf('isoweek');
	report.weeks = ko.observableArray([]);

	report.init = function() {
		report.show(true);

		Parse.Cloud.run('getProjects', {}, {
			success: function(projects) {
				report.allProjects(projects);
			}, error: function(error) {
				console.log(error);
			}
		});

		report.weeks([]);
		var dates = [];
		for (var i = 0; i < report.numWeeks; i++) {
			var week = {
				date: ko.observable(moment(report.today).add('days', (i * 7)).format('MMM D'))
			};
			dates.push(moment(report.today).add('days', (i * 7)).format('YYYY, M, D'));
			report.weeks.push(week);
		}

		var isoContainer = $('#report>.content');
		isoContainer.isotope({
			layoutMode: 'fitRows',
			hiddenStyle: {
				opacity: 0
			},
			visibleStyle: {
				opacity: 1
			}
		});
		isoContainer.isotope('bindResize');

		Parse.Cloud.run('getTimes', {
			dates: dates
		}, {
			success: function(times) {
				report.times([]);
				for (var j = 0; j < times.length; j++) {
					times[j].attributes.data = $.parseJSON(times[j].attributes.data);
					var total = _(times[j].attributes.data.projects).reduce(function(acc, obj) {
						_(obj).each(function(value, key) { acc[key] = (acc[key] ? acc[key] : 0) + value });
						return acc;
					}, {});

					times[j].attributes.total = ko.observable(total.percentage);
				}

				for (var i = 0; i < report.numWeeks; i++) {
					var weekDate = moment(report.today).add('days', (i * 7)).format('YYYY, M, D');
					var week = _.filter(times, function(obj) {
						return obj.attributes.data.date == weekDate;
					});


					for (j = 0; j < week.length; j++) {
						var sorted = _.sortBy(week[j].attributes.data.projects, function(project) {
							return -project.percentage;
						});

						var filtered = _.filter(sorted, function(obj) {
							return obj.percentage > 0;
						});

						week[j].attributes.data.projects = filtered;
					}

					report.times.push(week);

				}
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	report.selectWeek = function(index) {
		report.activeWeek(index);
	}

	report.styleWeek = function(index, date) {
		var styledDate = 'Week of ' +date;
		if (index == 0) { styledDate = 'This week' };
		if (index == 1) { styledDate = 'Next week' };
		return styledDate;
	}

	report.toggleView = function() {
		if (report.viewType() == 'hours') {
			report.viewType('percent');
		} else {
			report.viewType('hours');
		}
	}

	report.toggleProjects = function(item, e) {
		var target = e.target;
		var parent = $(target).parents('ol');
		if (parent.hasClass('hide')) {
			parent.removeClass('hide').addClass('show');
			$(target).text('Hide');
		} else {
			parent.addClass('hide').removeClass('show');
			$(target).text('Show all projects');
		}
		var isoContainer = $('#report>.content');
		isoContainer.isotope('layout');
	}

	report.getCompanyName = function(id) {
		var name = '';
		var project = _.find(report.allProjects(), function(obj) {
			return obj.id == id;
		});

		if (typeof project === 'object') {
			name = project.attributes.company;
		}
		return name;
	}

	report.getProjectName = function(id) {
		var name = '';
		var project = _.find(report.allProjects(), function(obj) {
			return obj.id == id;
		});

		if (typeof project === 'object') {
			name = project.attributes.name;
		}
		return name;
	}

	report.resetReport = function() {
		report.times([]);
	}

	// subscribe to the auth event to init the reports
	app.myViewModel.auth.currentUser.subscribe(function(user) {
		if (user) {
			report.init();
		}
	});

	// if already logged in and refresh the page init the reports
	if (app.myViewModel.auth.currentUser()) {
		report.init();
	}

	return self;
}

module.exports = Report;