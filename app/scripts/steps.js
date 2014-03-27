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
			link: 'select-project'
		},
		{
			stepNumber: 1,
			link: 'rate-week'
		},
		{
			stepNumber: 2,
			link: 'notes'
		}
	]);

	steps.nextStep = function(direction) {
		if (!steps.changing() && app.myViewModel.selectProject.count() > 0) {
			steps.changing(true);
			app.myViewModel.header.close();
			steps.currentStep(steps.currentStep() + direction);
			app.goToView(steps.steps()[steps.currentStep()].link);
			setTimeout(function() {
				steps.changing(false);
			}, 500);
		}
	}

	return self;
}

module.exports = Steps;