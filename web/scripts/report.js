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
	report.weeks = ko.observableArray();

	report.init = function() {
		report.show(true);

		Parse.Cloud.run('getProjects', {}, {
			success: function(projects) {
				report.allProjects(projects);
			}, error: function(error) {
				console.log(error);
			}
		});


		for (var i = 0; i < report.numWeeks; i++) {
			var week = {
				date: ko.observable(moment(report.today).add('days', (i * 7)).format('MMM D'))
			}
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
		var dates = [];
		for (var i = 0; i < report.numWeeks; i++) {
			dates.push(moment(report.today).add('days', (i * 7)).format('YYYY, M, D'));
			report.weeks()[i].date(moment(report.today).add('days', (i * 7)).format('MMM D'));
		}

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

					var sorted = _.sortBy(week, function(obj){ 
						return -obj.attributes.total();
					});

					report.times.push(sorted);
				}
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	report.selectWeek = function(index) {
		report.activeWeek(index);
	}

	report.toggleView = function() {
		if (report.viewType() == 'hours') {
			report.viewType('percent');
		} else {
			report.viewType('hours');
		}
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

	if (app.myViewModel.auth.currentUser()) {
		report.init();
	}

	return self;
}

module.exports = Report;