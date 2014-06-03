/**
 * scripts/header.js
 */

'use strict';

function Groups(app) {
	var self = this;

	var groups = app.myViewModel.groups = {};

	groups.mine = ko.observableArray();
	groups.others = ko.observableArray();
	groups.showNew = ko.observable(false);
	groups.newGroupName = ko.observable();
	groups.newGroupPrivacy = ko.observable(false);

	groups.toggleNew = function() {
		var target = $('#groups .toggle-new');
		if (groups.showNew()) {
			groups.showNew(false);
			target.removeClass('fa-times red').addClass('fa-plus green');
		} else {
			groups.showNew(true);
			target.addClass('fa-times red').removeClass('fa-plus green');
		}
	}

	groups.saveGroup = function(formElement) {
		console.log(groups.newGroupName())
		if (groups.newGroupName()) {
			Parse.Cloud.run('saveGroup', {
				name: groups.newGroupName()
			}, {
				success: function(groups) {
					app.myViewModel.groups.mine(groups);
					app.myViewModel.groups.newGroupName(null);
				}, error: function(error) {
					console.log(error);
				}
			});
			groups.toggleNew();
		} else {
			alert('Please enter a group name.')
		}
	}

	groups.getMyGroups = function() {
		Parse.Cloud.run('getGroups', {
			userId: app.myViewModel.auth.currentUser().id
		}, {
			success: function(groups) {
				app.myViewModel.groups.mine(groups);
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	groups.getOtherGroups = function() {
		Parse.Cloud.run('getGroups', {}, {
			success: function(groups) {
				app.myViewModel.groups.others(groups);
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	groups.init = function() {
		groups.getMyGroups();
		groups.getOtherGroups();
	}

	// subscribe to the auth event to init the peoples
	app.myViewModel.auth.currentUser.subscribe(function(user) {
		if (user) {
			groups.init();
		}
	});

	// if already logged in and refresh the page init the peoples
	if (app.myViewModel.auth.currentUser()) {
		groups.init();
	}

	return self;
}

module.exports = Groups;