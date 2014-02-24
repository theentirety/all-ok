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
			name: 'test 1',
			active: ko.observable(false)
		},
		{
			name: 'test 2',
			active: ko.observable(false)
		},
		{
			name: 'test 3',
			active: ko.observable(false)
		},
		{
			name: 'test 4',
			active: ko.observable(false)
		},
		{
			name: 'test 5',
			active: ko.observable(false)
		},
		{
			name: 'test 6',
			active: ko.observable(false)
		},
		{
			name: 'test 7',
			active: ko.observable(false)
		},
		{
			name: 'test 8',
			active: ko.observable(false)
		},
		{
			name: 'test 9',
			active: ko.observable(false)
		},
		{
			name: 'test 10',
			active: ko.observable(false)
		},
		{
			name: 'test 11',
			active: ko.observable(false)
		},
		{
			name: 'test 12',
			active: ko.observable(false)
		},
		{
			name: 'test 13',
			active: ko.observable(false)
		}
	]);

	selectProject.toggleProject = function(item, event) {
		console.log(item)
		if (item.active()) {
			item.active(false);
		} else {
			item.active(true);
		}
	}

	return self;
}

module.exports = SelectProject;