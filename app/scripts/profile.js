/**
 * scripts/profile.js
 */

'use strict';

function Profile(app) {
	var self = this;

	var profile = app.myViewModel.profile = {};

	profile.show = ko.observable(false);

	profile.save = function() {
		var name = app.myViewModel.auth.currentUser().attributes.displayName;
		var email = app.myViewModel.auth.currentUser().attributes.email;
		if (name.length <= 0 || email.length <= 0) {
			app.myViewModel.auth.errorMessage('Name and Email are required.');
		} else {
			Parse.Cloud.run('saveUser', {
				displayName: name,
				email: email
			}, {
				success: function(user) {
					app.myViewModel.auth.errorMessage('Profile saved successfully.');
				}, error: function(error) {
					app.myViewModel.auth.errorMessage(app.myViewModel.auth.sanitizeErrors(error));
				}
			});
		}
	}

	return self;
}


module.exports = Profile;