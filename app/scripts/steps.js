/**
 * scripts/steps.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Steps(app) {
	var self = this;

	var steps = app.myViewModel.steps = {};

	steps.currentStep = ko.observable(0);
	steps.changing = ko.observable(false);
	steps.steps = ko.observableArray([
		{
			stepNumber: 0,
			stepName: 'selectProject'
		},
		{
			stepNumber: 1,
			stepName: 'rateWeek'
		},
		{
			stepNumber: 2,
			stepName: 'notes'
		}
	]);

	steps.changeStep = function(item) {
		if (!steps.changing() && app.myViewModel.selectProject.count() > 0) {
			steps.changing(true);
			app.myViewModel.header.close();
			steps.currentStep(item.stepNumber);
			setTimeout(function() {
				steps.changing(false);
			}, 500);
		}
	}

	steps.nextStep = function(direction) {
		if (!steps.changing() && app.myViewModel.selectProject.count() > 0) {
			steps.changing(true);
			app.myViewModel.header.close();
			steps.currentStep(steps.currentStep() + direction);
			setTimeout(function() {
				steps.changing(false);
			}, 500);
		}
	}

	return self;
}

module.exports = Steps;