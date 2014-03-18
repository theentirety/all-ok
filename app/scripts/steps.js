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
		// {
		// 	stepNumber: 3,
		// 	stepName: 'selectProject'
		// }
	]);

	// $(document).on('swipe', function() {
	// 	alert('swipe')
	// });

	steps.changeStep = function(item) {
		app.myViewModel.header.close();
		steps.currentStep(item.stepNumber);
		// app.myViewModel.rateProject.initProject();
	}

	steps.nextStep = function(direction) {
		app.myViewModel.header.close();
		steps.currentStep(steps.currentStep() + direction);
		// app.myViewModel.rateProject.initProject();
	}

	return self;
}

module.exports = Steps;