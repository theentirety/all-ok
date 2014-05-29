/**
 * scripts/people.js
 */

'use strict';

function People(app) {
	var self = this;

	var people = app.myViewModel.people = {};
	people.show = ko.observable(false);
	people.times = ko.observableArray([]);
	people.viewType = ko.observable('hours');
	people.activeWeek = ko.observable(0);

	people.allProjects = ko.observableArray();

	people.numWeeks = 3;
	people.today = moment(new Date()).startOf('isoweek');
	people.weeks = ko.observableArray([]);

	people.init = function() {
		people.show(true);

		Parse.Cloud.run('getProjects', {}, {
			success: function(projects) {
				people.allProjects(projects);
			}, error: function(error) {
				console.log(error);
			}
		});

		people.weeks([]);
		var dates = [];
		for (var i = 0; i < people.numWeeks; i++) {
			var week = {
				date: ko.observable(moment(people.today).add('days', (i * 7)).format('MMM D'))
			};
			dates.push(moment(people.today).add('days', (i * 7)).format('YYYY, M, D'));
			people.weeks.push(week);
		}

		var isoContainer = $('#people>.content');
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
				people.times([]);
				for (var j = 0; j < times.length; j++) {
					times[j].attributes.data = $.parseJSON(times[j].attributes.data);
					var total = _(times[j].attributes.data.projects).reduce(function(acc, obj) {
						_(obj).each(function(value, key) { acc[key] = (acc[key] ? acc[key] : 0) + value });
						return acc;
					}, {});

					times[j].attributes.total = ko.observable(total.percentage);
				}

				for (var i = 0; i < people.numWeeks; i++) {
					var weekDate = moment(people.today).add('days', (i * 7)).format('YYYY, M, D');
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

					people.times.push(week);

					console.log(people.times())

				}
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	people.selectWeek = function(index) {
		people.activeWeek(index);
	}

	people.styleWeek = function(index, date) {
		var styledDate = 'Week of ' +date;
		if (index == 0) { styledDate = 'This week' };
		if (index == 1) { styledDate = 'Next week' };
		return styledDate;
	}

	people.toggleView = function() {
		if (people.viewType() == 'hours') {
			people.viewType('percent');
		} else {
			people.viewType('hours');
		}
	}

	people.toggleProjects = function(item, e) {
		var target = e.target;
		var parent = $(target).parents('ol');
		if (parent.hasClass('hide')) {
			parent.removeClass('hide').addClass('show');
			$(target).text('Hide');
		} else {
			parent.addClass('hide').removeClass('show');
			$(target).text('Show all projects');
		}
		var isoContainer = $('#people>.content');
		isoContainer.isotope('layout');
	}

	people.getCompanyName = function(id) {
		var name = '';
		var project = _.find(people.allProjects(), function(obj) {
			return obj.id == id;
		});

		if (typeof project === 'object') {
			name = project.attributes.company;
		}
		return name;
	}

	people.getProjectName = function(id) {
		var name = '';
		var project = _.find(people.allProjects(), function(obj) {
			return obj.id == id;
		});

		if (typeof project === 'object') {
			name = project.attributes.name;
		}
		return name;
	}

	people.resetData = function() {
		people.times([]);
	}

	// subscribe to the auth event to init the peoples
	app.myViewModel.auth.currentUser.subscribe(function(user) {
		if (user) {
			people.init();
		}
	});

	// if already logged in and refresh the page init the peoples
	if (app.myViewModel.auth.currentUser()) {
		people.init();
	}

	return self;
}

module.exports = People;