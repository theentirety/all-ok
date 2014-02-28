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
			name: 'DriveScribe: Sprint',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Liason: CAS',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Internal: Allocate',
			active: ko.observable(false),
			type: 'internal',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Internal: Playbook',
			active: ko.observable(false),
			type: 'internal',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'MetTel: Retainer',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Regions: Regions.com',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'SunTrust: On-boarding',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'SunTrust: Online Banking',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'SunTrust: SunTrust.com',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
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
			name: 'Z Client: Some project 1',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Z Client: Some project 2',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Z Client: Some project 3',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Z Client: Some project 4',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Z Client: Some project 5',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Z Client: Some project 6',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Z Client: Some project 7',
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