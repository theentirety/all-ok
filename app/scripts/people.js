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
	people.allPeople = ko.observableArray();

	people.weeks = ko.observableArray([
		{
			date: ko.observable(moment(people.today).format('MMM D'))
		},
		{
			date: ko.observable(moment(people.today).add('days', 7).format('MMM D'))
		},
		{  
			date: ko.observable(moment(people.today).add('days', 14).format('MMM D'))
		}
	]);

	people.getPeople = function() {
		Parse.Cloud.run('getPeople', {}, {
			success: function(peopleList) {
				people.allPeople([]);
				var peopleLength = peopleList.length;
				for (var i = 0; i < peopleLength; i++) {
					peopleList[i].percentages = ko.observableArray();
					people.allPeople.push(peopleList[i]);
				}
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	people.init = function() {
		people.getPeople();
	}

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

	people.refresh = function() {
		people.getPeople();
	}

	people.init();

	return self;
}

module.exports = People;