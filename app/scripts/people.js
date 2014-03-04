/**
 * scripts/people.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function People(app) {
	var self = this;

	var people = app.myViewModel.people = {};

	people.registerMouseX = ko.observable();
	people.registerStartPercentage = ko.observable(0);
	people.today = moment(new Date()).startOf('isoweek');
	people.registerRatio = ko.observable($(document).width() - 20);
	people.activeWeek = ko.observable(0);
	people.activePerson = ko.observable();
	people.viewType = ko.observable('hours');
	people.showDetails = ko.observable(false);

	people.all = ko.observableArray([
		{
			name: 'Aaron Martlage',
			id: '1293482934',
			percentages: ko.observableArray([
				32, 42, 2, 12
			])
		},
		{
			name: 'John Doe',
			id: '1293482934',
			percentages: ko.observableArray([
				32, 42, 2, 12
			])
		},
	]);

	people.weeks = ko.observableArray([
		{
			date: ko.observable(moment(people.today).format('MMM D')),
			total: ko.computed(function() {
				var sum = _.reduce(app.myViewModel.selectProject.allProjects(), function(memo, project) {
					var colValue = 0;
					if (project.attributes.active()) {
						colValue = project.attributes.percentage()[0].value();
					}
					return memo + colValue; 
				}, 0);
				return sum;
			})
		},
		{
			date: ko.observable(moment(people.today).add('days', 7).format('MMM D')),
			total: ko.computed(function() {
				var sum = _.reduce(app.myViewModel.selectProject.allProjects(), function(memo, project) {
					var colValue = 0;
					if (project.attributes.active()) {
						colValue = project.attributes.percentage()[1].value();
					}
					return memo + colValue; 
				}, 0);
				return sum;
			})
		},
		{  
			date: ko.observable(moment(people.today).add('days', 14).format('MMM D')),
			total: ko.computed(function() {
				var sum = _.reduce(app.myViewModel.selectProject.allProjects(), function(memo, project) {
					var colValue = 0;
					if (project.attributes.active()) {
						colValue = project.attributes.percentage()[2].value();
					}
					return memo + colValue; 
				}, 0);
				return sum;
			})
		}
	]);

	people.selectWeek = function(index) {
		people.activeWeek(index);
		// go get the data for this week
	}

	people.toggleView = function() {
		if (people.viewType() == 'hours') {
			people.viewType('percent');
		} else {
			people.viewType('hours');
		}
	}

	people.goToPerson = function(item) {
		people.activePerson(item);
		people.showDetails(true);
	}

	return self;
}

module.exports = People;