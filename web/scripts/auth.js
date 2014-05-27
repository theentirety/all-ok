/**
 * scripts/auth.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Auth(app) {
	var self = this;

	var auth = app.myViewModel.auth = {};

	auth.currentUser = ko.observable();
	auth.errorMessage = ko.observable('');
	auth.signUpMode = ko.observable(false);
	auth.isAdmin = ko.observable(false);
	auth.forgotMode = ko.observable(false);
	auth.signInMode = ko.observable(false);

	var currentUser = Parse.User.current();
	if (currentUser) {
		auth.currentUser(currentUser);
	}

	auth.init = function() {
		// if (auth.currentUser()) {
		// 	app.goToView('select-project');
		// } else {
		// 	app.goToView('auth');
		// }
		// Parse.Cloud.run('checkAdminStatus', {}, {
		// 	success: function(isAdmin) {
		// 		auth.isAdmin(isAdmin);
		// 	}, error: function(error) {
		// 		console.log(error);
		// 	}
		// });
	}

	auth.resetError = function() {
		auth.errorMessage('');
	}

	auth.signInUp = function(formElement) {
		// ko.postbox.publish('isLoading', true);
		auth.resetError();

		var email = $(formElement).find('input[name=auth_email]').val().toLowerCase();
		var password = $(formElement).find('input[name=auth_password]').val();

		if (auth.signUpMode()) {
			var displayName = $(formElement).find('input[name=auth_displayName]').val();
			var passwordConfirm = $(formElement).find('input[name=auth_confirmPassword]').val();

			// validation
			if (email.length < 1) {
				auth.errorMessage('Please enter your email address.');
				return false;
			}

			if (displayName.length < 1) {
				auth.errorMessage('Please enter your first and last name.');
				return false;
			}

			if (password.length < 1 || passwordConfirm < 1 || password != passwordConfirm) {
				auth.errorMessage('Please enter and confirm a password.');
				return false;
			}

			var user = new Parse.User();
			user.set('username', email);
			user.set('password', password);
			user.set('email', email);
			user.set('displayName', displayName);

			user.signUp(null, {
				success: function(user) {
					auth.currentUser(user);
					// app.goToView('select-project');
					// app.myViewModel.selectProject.init();
					// if (user.attributes.isAdmin) {
					// 	auth.isAdmin(true);
					// }
				},
				error: function(user, error) {
					auth.errorMessage(auth.sanitizeErrors(error));
					console.log(error);
				}
			});

		} else {
			Parse.User.logIn(email, password, {
				success: function(user) {
					auth.currentUser(user);
					auth.signInMode(false);
					app.myViewModel.report.init();
					// app.goToView('select-project');
					// app.myViewModel.selectProject.init();
					// if (user.attributes.isAdmin) {
					// 	auth.isAdmin(true);
					// }
				},
				error: function(user, error) {
					// The login failed. Check error to see why.
					auth.errorMessage(auth.sanitizeErrors(error));
					console.log(error);
				}
			});
		}
	}

	auth.forgot = function(formElement) {
		var email = $(formElement).find('input[name=auth_forgot]').val();

		Parse.User.requestPasswordReset(email, {
			success: function() {
				auth.forgotMode(false);
				$(formElement).find('input[name=auth_forgot]').val('');
				auth.errorMessage('Please check your email for instructions on resetting your password.');
			},
			error: function(error) {
				auth.errorMessage(auth.sanitizeErrors(error));
			}
		});
	}

	auth.logout = function() {
		auth.signUpMode(false);
		app.myViewModel.report.resetReport();
		auth.signInMode(false);
		auth.forgotMode(false);
		Parse.User.logOut();
		auth.currentUser(null);
	}

	auth.showSignUp = function() {
		auth.errorMessage('');
		if (auth.signUpMode()) {
			auth.signUpMode(false);
		} else {
			auth.signUpMode(true);
		}
	}

	auth.goSignIn = function() {
		auth.resetError();
		if (auth.signInMode()) {
			auth.signInMode(false);
		} else {
			$('input').val('');
			auth.signInMode(true);
		}
	}

	auth.goSignUp = function() {
		auth.resetError();
		if (auth.signUpMode()) {
			auth.signUpMode(false);
		} else {
			$('input').val('');
			auth.signUpMode(true);
		}
	}

	auth.goForgot = function() {
		auth.resetError();
		if (auth.forgotMode()) {
			auth.forgotMode(false);
		} else {
			$('input').val('');
			auth.forgotMode(true);
		}
	}

	auth.sanitizeErrors = function(error) {
		switch(error.code)
		{
			case 200:
				if (error.message == 'missing username') {
					return error.message = 'Please enter an email address.';
				}
			case 101:
				return 'Please enter a valid email and password.';
			case 124:
				return 'Oops! We messed up. Please try again.';
			default:
				return error.message.charAt(0).toUpperCase() + error.message.slice(1) + '.';
		}
	}

	auth.init();

	return self;
}

module.exports = Auth;