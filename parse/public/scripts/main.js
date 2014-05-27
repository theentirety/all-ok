(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * scripts/app.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function App() {
	var self = this;
	self.myViewModel = {};

	self.initialize = function() {

		ko.applyBindings(self.myViewModel);		
		$('body').css('display', 'block');
	}

	return self;
}

module.exports = App;
},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
/**
 * scripts/main.js
 */

'use strict';

$(document).ready(function() {
    var App = require('./app.js');
    var Auth = require('./auth.js');
    var Report = require('./report.js');
    var Header = require('./header.js');

    // initialize parse
    Parse.initialize("JkYNfPBw2aPgcc7PeTGHMAU2XKvjzeqVIkyClVuo", "45OMU3ZS3o5c168lQxa0ilxQu4FdMVHT1NVTkORl");

    // initialize typekit
    try{Typekit.load();}catch(e){}

    var app = new App();
    var auth = new Auth(app);
    var report = new Report(app);
    var header = new Header(app);

    // Custom knockout extenders

    // Here's a custom Knockout binding that makes elements shown/hidden via jQuery's fadeIn()/fadeOut() methods
    // Could be stored in a separate utility library
    ko.bindingHandlers.fadeVisible = {
        init: function(element, valueAccessor) {
            // Initially set the element to be instantly visible/hidden depending on the value
            var value = valueAccessor();
            $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function(element, valueAccessor) {
            // Whenever the value subsequently changes, slowly fade the element in or out
            var value = valueAccessor();
            ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
        }
    }

    ko.bindingHandlers.slidePanelVisible = {
        init: function(element, valueAccessor) {
            // Initially set the element to be instantly visible/hidden depending on the value
            var value = valueAccessor();
            // $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function(element, valueAccessor) {
            // Whenever the value subsequently changes, slowly fade the element in or out
            var value = valueAccessor();
            if (ko.unwrap(value)) {
                $(element).addClass('open').css('transform', 'translate3d(0,0,0)').css('visibility', 'visible');
            } else {
                var viewportHeight = $(window).height();
                $(element).removeClass('open').css('transform', 'translate3d(0,' + viewportHeight + 'px,0)').css('visibility', 'hidden');
            }
        }
    };

    ko.bindingHandlers.shiftPanelVisible = {
        init: function(element, valueAccessor) {
            // Initially set the element to be instantly visible/hidden depending on the value
            var value = valueAccessor();
            // $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function(element, valueAccessor) {
            // Whenever the value subsequently changes, slowly fade the element in or out
            var value = valueAccessor();
            if (ko.unwrap(value)) {
                $(element).addClass('open').css('transform', 'translate3d(0%,0,0)').css('visibility', 'visible');
            } else {
                var viewportHeight = $(window).height();
                $(element).removeClass('open').css('transform', 'translate3d(100%,0,0)').css('visibility', 'hidden');
            }
        }
    };

    app.initialize();
});

ko.bindingHandlers.isotope = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {},
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $el = $(element);
        var value = ko.utils.unwrapObservable(valueAccessor());
        var $container = $(value.container);
        $container.isotope({
            itemSelector: value.itemSelector
        });
        $container.isotope('appended', $el);
    }
};


$.fn.serializeObject = function() {
   var o = {};
   var a = this.serializeArray();
   $.each(a, function() {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
       } else {
           o[this.name] = this.value || '';
       }
   });
   return o;
};
},{"./app.js":1,"./auth.js":2,"./header.js":4,"./report.js":5}],4:[function(require,module,exports){
/**
 * scripts/header.js
 */

'use strict';

function Header(app) {
	var self = this;

	var header = app.myViewModel.header = {};

	header.init = function() {
		// report.show(true);
	}

	return self;
}

module.exports = Header;
},{}],5:[function(require,module,exports){
/**
 * scripts/auth.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Report(app) {
	var self = this;

	var report = app.myViewModel.report = {};
	report.show = ko.observable(false);
	report.times = ko.observableArray([]);
	report.viewType = ko.observable('hours');
	report.activeWeek = ko.observable(0);

	report.allProjects = ko.observableArray();

	report.numWeeks = 3;
	report.today = moment(new Date()).startOf('isoweek');
	report.weeks = ko.observableArray();

	report.init = function() {
		report.show(true);

		Parse.Cloud.run('getProjects', {}, {
			success: function(projects) {
				report.allProjects(projects);
				console.log(projects)
				// for (var i = 0; i < projects.length; i++) {
				// 	report[i].attributes.percentage = ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }]);
				// 	report.allProjects.push(projects[i]);
				// }

			}, error: function(error) {
				console.log(error);
			}
		});


		for (var i = 0; i < report.numWeeks; i++) {
			var week = {
				date: ko.observable(moment(report.today).add('days', (i * 7)).format('MMM D'))
			}
			report.weeks.push(week);
		}

		var isoContainer = $('#report>.content');
		isoContainer.isotope({ layoutMode: 'fitRows' });
		isoContainer.isotope('bindResize');
		var dates = [];
		for (var i = 0; i < report.numWeeks; i++) {
			dates.push(moment(report.today).add('days', (i * 7)).format('YYYY, M, D'));
			report.weeks()[i].date(moment(report.today).add('days', (i * 7)).format('MMM D'));
		}

		Parse.Cloud.run('getTimes', {
			dates: dates
		}, {
			success: function(times) {
				report.times([]);
				for (var j = 0; j < times.length; j++) {
					times[j].attributes.data = $.parseJSON(times[j].attributes.data);
					var total = _(times[j].attributes.data.projects).reduce(function(acc, obj) {
						_(obj).each(function(value, key) { acc[key] = (acc[key] ? acc[key] : 0) + value });
						return acc;
					}, {});

					times[j].attributes.total = ko.observable(total.percentage);
				}
				for (var i = 0; i < report.numWeeks; i++) {
					var weekDate = moment(report.today).add('days', (i * 7)).format('YYYY, M, D');
					var week = _.filter(times, function(obj) {
						return obj.attributes.data.date == weekDate;
					});

					var sorted = _.sortBy(week, function(obj){ 
						return -obj.attributes.total();
					});

					report.times.push(sorted);
				}
				console.log(report.times())
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	report.getCompanyName = function(id) {
		var name = '';
		var project = _.find(report.allProjects(), function(obj) {
			return obj.id == id;
		});

		if (typeof project === 'object') {
			name = project.attributes.company;
		}
		return name;
	}

	report.getProjectName = function(id) {
		var name = '';
		var project = _.find(report.allProjects(), function(obj) {
			return obj.id == id;
		});

		if (typeof project === 'object') {
			name = project.attributes.name;
		}
		return name;
	}

	report.resetReport = function() {
		report.times([]);
	}

	if (app.myViewModel.auth.currentUser()) {
		report.init();
	}

	return self;
}

module.exports = Report;
},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL3dlYi9zY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvYXV0aC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvZmFrZV9kZWE5YzQ4MC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvaGVhZGVyLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS93ZWIvc2NyaXB0cy9yZXBvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogc2NyaXB0cy9hcHAuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQXBwKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdHNlbGYubXlWaWV3TW9kZWwgPSB7fTtcblxuXHRzZWxmLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcblxuXHRcdGtvLmFwcGx5QmluZGluZ3Moc2VsZi5teVZpZXdNb2RlbCk7XHRcdFxuXHRcdCQoJ2JvZHknKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDsiLCIvKipcbiAqIHNjcmlwdHMvYXV0aC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBdXRoKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGF1dGggPSBhcHAubXlWaWV3TW9kZWwuYXV0aCA9IHt9O1xuXG5cdGF1dGguY3VycmVudFVzZXIgPSBrby5vYnNlcnZhYmxlKCk7XG5cdGF1dGguZXJyb3JNZXNzYWdlID0ga28ub2JzZXJ2YWJsZSgnJyk7XG5cdGF1dGguc2lnblVwTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhdXRoLmlzQWRtaW4gPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0YXV0aC5mb3Jnb3RNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGF1dGguc2lnbkluTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cdHZhciBjdXJyZW50VXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuXHRpZiAoY3VycmVudFVzZXIpIHtcblx0XHRhdXRoLmN1cnJlbnRVc2VyKGN1cnJlbnRVc2VyKTtcblx0fVxuXG5cdGF1dGguaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vIGlmIChhdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHQvLyBcdGFwcC5nb1RvVmlldygnc2VsZWN0LXByb2plY3QnKTtcblx0XHQvLyB9IGVsc2Uge1xuXHRcdC8vIFx0YXBwLmdvVG9WaWV3KCdhdXRoJyk7XG5cdFx0Ly8gfVxuXHRcdC8vIFBhcnNlLkNsb3VkLnJ1bignY2hlY2tBZG1pblN0YXR1cycsIHt9LCB7XG5cdFx0Ly8gXHRzdWNjZXNzOiBmdW5jdGlvbihpc0FkbWluKSB7XG5cdFx0Ly8gXHRcdGF1dGguaXNBZG1pbihpc0FkbWluKTtcblx0XHQvLyBcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdC8vIFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0Ly8gXHR9XG5cdFx0Ly8gfSk7XG5cdH1cblxuXHRhdXRoLnJlc2V0RXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLmVycm9yTWVzc2FnZSgnJyk7XG5cdH1cblxuXHRhdXRoLnNpZ25JblVwID0gZnVuY3Rpb24oZm9ybUVsZW1lbnQpIHtcblx0XHQvLyBrby5wb3N0Ym94LnB1Ymxpc2goJ2lzTG9hZGluZycsIHRydWUpO1xuXHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXG5cdFx0dmFyIGVtYWlsID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2VtYWlsXScpLnZhbCgpLnRvTG93ZXJDYXNlKCk7XG5cdFx0dmFyIHBhc3N3b3JkID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX3Bhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHR2YXIgZGlzcGxheU5hbWUgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZGlzcGxheU5hbWVdJykudmFsKCk7XG5cdFx0XHR2YXIgcGFzc3dvcmRDb25maXJtID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2NvbmZpcm1QYXNzd29yZF0nKS52YWwoKTtcblxuXHRcdFx0Ly8gdmFsaWRhdGlvblxuXHRcdFx0aWYgKGVtYWlsLmxlbmd0aCA8IDEpIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciB5b3VyIGVtYWlsIGFkZHJlc3MuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGRpc3BsYXlOYW1lLmxlbmd0aCA8IDEpIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciB5b3VyIGZpcnN0IGFuZCBsYXN0IG5hbWUuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHBhc3N3b3JkLmxlbmd0aCA8IDEgfHwgcGFzc3dvcmRDb25maXJtIDwgMSB8fCBwYXNzd29yZCAhPSBwYXNzd29yZENvbmZpcm0pIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciBhbmQgY29uZmlybSBhIHBhc3N3b3JkLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHZhciB1c2VyID0gbmV3IFBhcnNlLlVzZXIoKTtcblx0XHRcdHVzZXIuc2V0KCd1c2VybmFtZScsIGVtYWlsKTtcblx0XHRcdHVzZXIuc2V0KCdwYXNzd29yZCcsIHBhc3N3b3JkKTtcblx0XHRcdHVzZXIuc2V0KCdlbWFpbCcsIGVtYWlsKTtcblx0XHRcdHVzZXIuc2V0KCdkaXNwbGF5TmFtZScsIGRpc3BsYXlOYW1lKTtcblxuXHRcdFx0dXNlci5zaWduVXAobnVsbCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0XHQvLyBhcHAuZ29Ub1ZpZXcoJ3NlbGVjdC1wcm9qZWN0Jyk7XG5cdFx0XHRcdFx0Ly8gYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuaW5pdCgpO1xuXHRcdFx0XHRcdC8vIGlmICh1c2VyLmF0dHJpYnV0ZXMuaXNBZG1pbikge1xuXHRcdFx0XHRcdC8vIFx0YXV0aC5pc0FkbWluKHRydWUpO1xuXHRcdFx0XHRcdC8vIH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0UGFyc2UuVXNlci5sb2dJbihlbWFpbCwgcGFzc3dvcmQsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRcdGF1dGguY3VycmVudFVzZXIodXNlcik7XG5cdFx0XHRcdFx0YXV0aC5zaWduSW5Nb2RlKGZhbHNlKTtcblx0XHRcdFx0XHRhcHAubXlWaWV3TW9kZWwucmVwb3J0LmluaXQoKTtcblx0XHRcdFx0XHQvLyBhcHAuZ29Ub1ZpZXcoJ3NlbGVjdC1wcm9qZWN0Jyk7XG5cdFx0XHRcdFx0Ly8gYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuaW5pdCgpO1xuXHRcdFx0XHRcdC8vIGlmICh1c2VyLmF0dHJpYnV0ZXMuaXNBZG1pbikge1xuXHRcdFx0XHRcdC8vIFx0YXV0aC5pc0FkbWluKHRydWUpO1xuXHRcdFx0XHRcdC8vIH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0Ly8gVGhlIGxvZ2luIGZhaWxlZC4gQ2hlY2sgZXJyb3IgdG8gc2VlIHdoeS5cblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLmZvcmdvdCA9IGZ1bmN0aW9uKGZvcm1FbGVtZW50KSB7XG5cdFx0dmFyIGVtYWlsID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2ZvcmdvdF0nKS52YWwoKTtcblxuXHRcdFBhcnNlLlVzZXIucmVxdWVzdFBhc3N3b3JkUmVzZXQoZW1haWwsIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhdXRoLmZvcmdvdE1vZGUoZmFsc2UpO1xuXHRcdFx0XHQkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZm9yZ290XScpLnZhbCgnJyk7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgY2hlY2sgeW91ciBlbWFpbCBmb3IgaW5zdHJ1Y3Rpb25zIG9uIHJlc2V0dGluZyB5b3VyIHBhc3N3b3JkLicpO1xuXHRcdFx0fSxcblx0XHRcdGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRhdXRoLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGguc2lnblVwTW9kZShmYWxzZSk7XG5cdFx0YXBwLm15Vmlld01vZGVsLnJlcG9ydC5yZXNldFJlcG9ydCgpO1xuXHRcdGF1dGguc2lnbkluTW9kZShmYWxzZSk7XG5cdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0XHRQYXJzZS5Vc2VyLmxvZ091dCgpO1xuXHRcdGF1dGguY3VycmVudFVzZXIobnVsbCk7XG5cdH1cblxuXHRhdXRoLnNob3dTaWduVXAgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLmVycm9yTWVzc2FnZSgnJyk7XG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5nb1NpZ25JbiA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXHRcdGlmIChhdXRoLnNpZ25Jbk1vZGUoKSkge1xuXHRcdFx0YXV0aC5zaWduSW5Nb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnaW5wdXQnKS52YWwoJycpO1xuXHRcdFx0YXV0aC5zaWduSW5Nb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguZ29TaWduVXAgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblx0XHRpZiAoYXV0aC5zaWduVXBNb2RlKCkpIHtcblx0XHRcdGF1dGguc2lnblVwTW9kZShmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJ2lucHV0JykudmFsKCcnKTtcblx0XHRcdGF1dGguc2lnblVwTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLmdvRm9yZ290ID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cdFx0aWYgKGF1dGguZm9yZ290TW9kZSgpKSB7XG5cdFx0XHRhdXRoLmZvcmdvdE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCdpbnB1dCcpLnZhbCgnJyk7XG5cdFx0XHRhdXRoLmZvcmdvdE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5zYW5pdGl6ZUVycm9ycyA9IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0c3dpdGNoKGVycm9yLmNvZGUpXG5cdFx0e1xuXHRcdFx0Y2FzZSAyMDA6XG5cdFx0XHRcdGlmIChlcnJvci5tZXNzYWdlID09ICdtaXNzaW5nIHVzZXJuYW1lJykge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvci5tZXNzYWdlID0gJ1BsZWFzZSBlbnRlciBhbiBlbWFpbCBhZGRyZXNzLic7XG5cdFx0XHRcdH1cblx0XHRcdGNhc2UgMTAxOlxuXHRcdFx0XHRyZXR1cm4gJ1BsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsIGFuZCBwYXNzd29yZC4nO1xuXHRcdFx0Y2FzZSAxMjQ6XG5cdFx0XHRcdHJldHVybiAnT29wcyEgV2UgbWVzc2VkIHVwLiBQbGVhc2UgdHJ5IGFnYWluLic7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gZXJyb3IubWVzc2FnZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGVycm9yLm1lc3NhZ2Uuc2xpY2UoMSkgKyAnLic7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0aDsiLCIvKipcbiAqIHNjcmlwdHMvbWFpbi5qc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgdmFyIEFwcCA9IHJlcXVpcmUoJy4vYXBwLmpzJyk7XG4gICAgdmFyIEF1dGggPSByZXF1aXJlKCcuL2F1dGguanMnKTtcbiAgICB2YXIgUmVwb3J0ID0gcmVxdWlyZSgnLi9yZXBvcnQuanMnKTtcbiAgICB2YXIgSGVhZGVyID0gcmVxdWlyZSgnLi9oZWFkZXIuanMnKTtcblxuICAgIC8vIGluaXRpYWxpemUgcGFyc2VcbiAgICBQYXJzZS5pbml0aWFsaXplKFwiSmtZTmZQQncyYVBnY2M3UGVUR0hNQVUyWEt2anplcVZJa3lDbFZ1b1wiLCBcIjQ1T01VM1pTM281YzE2OGxReGEwaWx4UXU0RmRNVkhUMU5WVGtPUmxcIik7XG5cbiAgICAvLyBpbml0aWFsaXplIHR5cGVraXRcbiAgICB0cnl7VHlwZWtpdC5sb2FkKCk7fWNhdGNoKGUpe31cblxuICAgIHZhciBhcHAgPSBuZXcgQXBwKCk7XG4gICAgdmFyIGF1dGggPSBuZXcgQXV0aChhcHApO1xuICAgIHZhciByZXBvcnQgPSBuZXcgUmVwb3J0KGFwcCk7XG4gICAgdmFyIGhlYWRlciA9IG5ldyBIZWFkZXIoYXBwKTtcblxuICAgIC8vIEN1c3RvbSBrbm9ja291dCBleHRlbmRlcnNcblxuICAgIC8vIEhlcmUncyBhIGN1c3RvbSBLbm9ja291dCBiaW5kaW5nIHRoYXQgbWFrZXMgZWxlbWVudHMgc2hvd24vaGlkZGVuIHZpYSBqUXVlcnkncyBmYWRlSW4oKS9mYWRlT3V0KCkgbWV0aG9kc1xuICAgIC8vIENvdWxkIGJlIHN0b3JlZCBpbiBhIHNlcGFyYXRlIHV0aWxpdHkgbGlicmFyeVxuICAgIGtvLmJpbmRpbmdIYW5kbGVycy5mYWRlVmlzaWJsZSA9IHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGx5IHNldCB0aGUgZWxlbWVudCB0byBiZSBpbnN0YW50bHkgdmlzaWJsZS9oaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZVxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAgJChlbGVtZW50KS50b2dnbGUoa28udW53cmFwKHZhbHVlKSk7IC8vIFVzZSBcInVud3JhcE9ic2VydmFibGVcIiBzbyB3ZSBjYW4gaGFuZGxlIHZhbHVlcyB0aGF0IG1heSBvciBtYXkgbm90IGJlIG9ic2VydmFibGVcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgICAgICAvLyBXaGVuZXZlciB0aGUgdmFsdWUgc3Vic2VxdWVudGx5IGNoYW5nZXMsIHNsb3dseSBmYWRlIHRoZSBlbGVtZW50IGluIG9yIG91dFxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAga28udW53cmFwKHZhbHVlKSA/ICQoZWxlbWVudCkuZmFkZUluKCkgOiAkKGVsZW1lbnQpLmZhZGVPdXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGtvLmJpbmRpbmdIYW5kbGVycy5zbGlkZVBhbmVsVmlzaWJsZSA9IHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGx5IHNldCB0aGUgZWxlbWVudCB0byBiZSBpbnN0YW50bHkgdmlzaWJsZS9oaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZVxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAgLy8gJChlbGVtZW50KS50b2dnbGUoa28udW53cmFwKHZhbHVlKSk7IC8vIFVzZSBcInVud3JhcE9ic2VydmFibGVcIiBzbyB3ZSBjYW4gaGFuZGxlIHZhbHVlcyB0aGF0IG1heSBvciBtYXkgbm90IGJlIG9ic2VydmFibGVcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgICAgICAvLyBXaGVuZXZlciB0aGUgdmFsdWUgc3Vic2VxdWVudGx5IGNoYW5nZXMsIHNsb3dseSBmYWRlIHRoZSBlbGVtZW50IGluIG9yIG91dFxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAgaWYgKGtvLnVud3JhcCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmFkZENsYXNzKCdvcGVuJykuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlM2QoMCwwLDApJykuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXdwb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkucmVtb3ZlQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgwLCcgKyB2aWV3cG9ydEhlaWdodCArICdweCwwKScpLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBrby5iaW5kaW5nSGFuZGxlcnMuc2hpZnRQYW5lbFZpc2libGUgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIC8vICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIGlmIChrby51bndyYXAodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgJChlbGVtZW50KS5hZGRDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDAlLDAsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlld3BvcnRIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgJChlbGVtZW50KS5yZW1vdmVDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDEwMCUsMCwwKScpLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhcHAuaW5pdGlhbGl6ZSgpO1xufSk7XG5cbmtvLmJpbmRpbmdIYW5kbGVycy5pc290b3BlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5nc0FjY2Vzc29yLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7fSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5nc0FjY2Vzc29yLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgIHZhciAkZWwgPSAkKGVsZW1lbnQpO1xuICAgICAgICB2YXIgdmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgICAgIHZhciAkY29udGFpbmVyID0gJCh2YWx1ZS5jb250YWluZXIpO1xuICAgICAgICAkY29udGFpbmVyLmlzb3RvcGUoe1xuICAgICAgICAgICAgaXRlbVNlbGVjdG9yOiB2YWx1ZS5pdGVtU2VsZWN0b3JcbiAgICAgICAgfSk7XG4gICAgICAgICRjb250YWluZXIuaXNvdG9wZSgnYXBwZW5kZWQnLCAkZWwpO1xuICAgIH1cbn07XG5cblxuJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbigpIHtcbiAgIHZhciBvID0ge307XG4gICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcbiAgICQuZWFjaChhLCBmdW5jdGlvbigpIHtcbiAgICAgICBpZiAob1t0aGlzLm5hbWVdKSB7XG4gICAgICAgICAgIGlmICghb1t0aGlzLm5hbWVdLnB1c2gpIHtcbiAgICAgICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IFtvW3RoaXMubmFtZV1dO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xuICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IHRoaXMudmFsdWUgfHwgJyc7XG4gICAgICAgfVxuICAgfSk7XG4gICByZXR1cm4gbztcbn07IiwiLyoqXG4gKiBzY3JpcHRzL2hlYWRlci5qc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gSGVhZGVyKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGhlYWRlciA9IGFwcC5teVZpZXdNb2RlbC5oZWFkZXIgPSB7fTtcblxuXHRoZWFkZXIuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vIHJlcG9ydC5zaG93KHRydWUpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyOyIsIi8qKlxuICogc2NyaXB0cy9hdXRoLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFJlcG9ydChhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciByZXBvcnQgPSBhcHAubXlWaWV3TW9kZWwucmVwb3J0ID0ge307XG5cdHJlcG9ydC5zaG93ID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHJlcG9ydC50aW1lcyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG5cdHJlcG9ydC52aWV3VHlwZSA9IGtvLm9ic2VydmFibGUoJ2hvdXJzJyk7XG5cdHJlcG9ydC5hY3RpdmVXZWVrID0ga28ub2JzZXJ2YWJsZSgwKTtcblxuXHRyZXBvcnQuYWxsUHJvamVjdHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblxuXHRyZXBvcnQubnVtV2Vla3MgPSAzO1xuXHRyZXBvcnQudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRyZXBvcnQud2Vla3MgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblxuXHRyZXBvcnQuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJlcG9ydC5zaG93KHRydWUpO1xuXG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRQcm9qZWN0cycsIHt9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0cykge1xuXHRcdFx0XHRyZXBvcnQuYWxsUHJvamVjdHMocHJvamVjdHMpO1xuXHRcdFx0XHRjb25zb2xlLmxvZyhwcm9qZWN0cylcblx0XHRcdFx0Ly8gZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9qZWN0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHQvLyBcdHJlcG9ydFtpXS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UgPSBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKTtcblx0XHRcdFx0Ly8gXHRyZXBvcnQuYWxsUHJvamVjdHMucHVzaChwcm9qZWN0c1tpXSk7XG5cdFx0XHRcdC8vIH1cblxuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXBvcnQubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0dmFyIHdlZWsgPSB7XG5cdFx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHJlcG9ydC50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdNTU0gRCcpKVxuXHRcdFx0fVxuXHRcdFx0cmVwb3J0LndlZWtzLnB1c2god2Vlayk7XG5cdFx0fVxuXG5cdFx0dmFyIGlzb0NvbnRhaW5lciA9ICQoJyNyZXBvcnQ+LmNvbnRlbnQnKTtcblx0XHRpc29Db250YWluZXIuaXNvdG9wZSh7IGxheW91dE1vZGU6ICdmaXRSb3dzJyB9KTtcblx0XHRpc29Db250YWluZXIuaXNvdG9wZSgnYmluZFJlc2l6ZScpO1xuXHRcdHZhciBkYXRlcyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVwb3J0Lm51bVdlZWtzOyBpKyspIHtcblx0XHRcdGRhdGVzLnB1c2gobW9tZW50KHJlcG9ydC50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJykpO1xuXHRcdFx0cmVwb3J0LndlZWtzKClbaV0uZGF0ZShtb21lbnQocmVwb3J0LnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ01NTSBEJykpO1xuXHRcdH1cblxuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0VGltZXMnLCB7XG5cdFx0XHRkYXRlczogZGF0ZXNcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih0aW1lcykge1xuXHRcdFx0XHRyZXBvcnQudGltZXMoW10pO1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHRpbWVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0dGltZXNbal0uYXR0cmlidXRlcy5kYXRhID0gJC5wYXJzZUpTT04odGltZXNbal0uYXR0cmlidXRlcy5kYXRhKTtcblx0XHRcdFx0XHR2YXIgdG90YWwgPSBfKHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YS5wcm9qZWN0cykucmVkdWNlKGZ1bmN0aW9uKGFjYywgb2JqKSB7XG5cdFx0XHRcdFx0XHRfKG9iaikuZWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7IGFjY1trZXldID0gKGFjY1trZXldID8gYWNjW2tleV0gOiAwKSArIHZhbHVlIH0pO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdFx0XHR9LCB7fSk7XG5cblx0XHRcdFx0XHR0aW1lc1tqXS5hdHRyaWJ1dGVzLnRvdGFsID0ga28ub2JzZXJ2YWJsZSh0b3RhbC5wZXJjZW50YWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlcG9ydC5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHRcdFx0dmFyIHdlZWtEYXRlID0gbW9tZW50KHJlcG9ydC50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJyk7XG5cdFx0XHRcdFx0dmFyIHdlZWsgPSBfLmZpbHRlcih0aW1lcywgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb2JqLmF0dHJpYnV0ZXMuZGF0YS5kYXRlID09IHdlZWtEYXRlO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0dmFyIHNvcnRlZCA9IF8uc29ydEJ5KHdlZWssIGZ1bmN0aW9uKG9iail7IFxuXHRcdFx0XHRcdFx0cmV0dXJuIC1vYmouYXR0cmlidXRlcy50b3RhbCgpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0cmVwb3J0LnRpbWVzLnB1c2goc29ydGVkKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zb2xlLmxvZyhyZXBvcnQudGltZXMoKSlcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRyZXBvcnQuZ2V0Q29tcGFueU5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBuYW1lID0gJyc7XG5cdFx0dmFyIHByb2plY3QgPSBfLmZpbmQocmVwb3J0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0cmV0dXJuIG9iai5pZCA9PSBpZDtcblx0XHR9KTtcblxuXHRcdGlmICh0eXBlb2YgcHJvamVjdCA9PT0gJ29iamVjdCcpIHtcblx0XHRcdG5hbWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMuY29tcGFueTtcblx0XHR9XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH1cblxuXHRyZXBvcnQuZ2V0UHJvamVjdE5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBuYW1lID0gJyc7XG5cdFx0dmFyIHByb2plY3QgPSBfLmZpbmQocmVwb3J0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0cmV0dXJuIG9iai5pZCA9PSBpZDtcblx0XHR9KTtcblxuXHRcdGlmICh0eXBlb2YgcHJvamVjdCA9PT0gJ29iamVjdCcpIHtcblx0XHRcdG5hbWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMubmFtZTtcblx0XHR9XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH1cblxuXHRyZXBvcnQucmVzZXRSZXBvcnQgPSBmdW5jdGlvbigpIHtcblx0XHRyZXBvcnQudGltZXMoW10pO1xuXHR9XG5cblx0aWYgKGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHRyZXBvcnQuaW5pdCgpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0OyJdfQ==
