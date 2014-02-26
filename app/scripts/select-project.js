/**
 * scripts/select-project.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function SelectProject(app) {
	var self = this;

	var selectProject = app.myViewModel.selectProject = {};

	selectProject.allProjects = ko.observableArray([
		{
			name: 'Vacation/Time off',
			active: ko.observable(false),
			type: 'internal',
			increments: {
				type: 'day',
				value: 0.5
			},
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 2',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 3 with a much longer name',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 4',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 5',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 6',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 7',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 8',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 9',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 10',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 11',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 12',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 13',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 14',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 15',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		}
	]);

		selectProject.toggleProject = function(item, event) {
		if (item.active()) {
			item.active(false);
		} else {
			item.active(true);
		}
	}

	return self;
}

module.exports = SelectProject;