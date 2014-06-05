/**
 * scripts/notes.js
 */

'use strict';

function Alerts(app) {
	var self = this;

	var alerts = app.myViewModel.alerts = {};

	alerts.list = ko.observableArray();
	alerts.list.push('asdf')
	alerts.show = ko.observable(false);


	return self;
}


module.exports = Alerts;