/**
 * scripts/notes.js
 */

'use strict';

function Alerts(app) {
	var self = this;

	var alerts = app.myViewModel.alerts = {};

	alerts.list = ko.observableArray();
	alerts.show = ko.observable(false);
	alerts.index = ko.observable(0);

	alerts.greetings = [
		'Hi there!',
		'Hello!',
		'Hi ya!',
		'Greetings!',
		'Well hello there!'
	];

	alert.Alert = function(data) {
		var alert = {
			type: 'join-request',
			title: 'Join Request',
			person: data.person,
			group: data.group
		}
		return alert;
	}

	alerts.current = ko.computed(function() {
		return alerts.list()[alerts.index()];
	});

	alerts.randomGreeting = ko.computed(function() {
		var rand = Math.floor(Math.random() * alerts.greetings.length);
		console.log(alerts.greetings[rand])
		return alerts.greetings[rand];
	});

	alerts.goNext = function() {
		var currentIndex = alerts.index();
		alerts.index(currentIndex + 1);
	}

	alerts.goBack = function() {
		var currentIndex = alerts.index();
		alerts.index(currentIndex - 1);
	}

	alerts.takeAction = function(action, item) {
		console.log(action);

		if (action == 'deny' || action == 'approve') {
			var newList = _.without(alerts.list(), alerts.list()[alerts.index()]);
			alerts.list(newList);

			if (alerts.index() >= alerts.list().length) {
				alerts.goBack();
			}
		}


		// var newList = _.reject(alerts.list(), function(alert) {
		// 	console.log()
		// 	return false;
		// });
		// alerts.list.pop(alerts.index());
		// console.log(alerts.list().length)

	}

	alerts.init = function() {
		alerts.list.push(new alert.Alert({ person: 'Aaron Martlage', group: 'Design Group' }));
		alerts.list.push(new alert.Alert({ person: 'Kieran Evans', group: 'Awesome Group' }));
		console.log(alerts.list())
	}

	alerts.init();

	return self;
}


module.exports = Alerts;