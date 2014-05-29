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

	header.viewType = ko.observable('people');

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
	report.weeks = ko.observableArray([]);

	report.init = function() {
		report.show(true);

		Parse.Cloud.run('getProjects', {}, {
			success: function(projects) {
				report.allProjects(projects);
			}, error: function(error) {
				console.log(error);
			}
		});

		report.weeks([]);
		var dates = [];
		for (var i = 0; i < report.numWeeks; i++) {
			var week = {
				date: ko.observable(moment(report.today).add('days', (i * 7)).format('MMM D'))
			};
			dates.push(moment(report.today).add('days', (i * 7)).format('YYYY, M, D'));
			report.weeks.push(week);
		}

		var isoContainer = $('#report>.content');
		isoContainer.isotope({
			layoutMode: 'fitRows',
			hiddenStyle: {
				opacity: 0
			},
			visibleStyle: {
				opacity: 1
			}
		});
		isoContainer.isotope('bindResize');

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


					for (j = 0; j < week.length; j++) {
						var sorted = _.sortBy(week[j].attributes.data.projects, function(project) {
							return -project.percentage;
						});

						var filtered = _.filter(sorted, function(obj) {
							return obj.percentage > 0;
						});

						week[j].attributes.data.projects = filtered;
					}

					report.times.push(week);

				}
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	report.selectWeek = function(index) {
		report.activeWeek(index);
	}

	report.styleWeek = function(index, date) {
		var styledDate = 'Week of ' +date;
		if (index == 0) { styledDate = 'This week' };
		if (index == 1) { styledDate = 'Next week' };
		return styledDate;
	}

	report.toggleView = function() {
		if (report.viewType() == 'hours') {
			report.viewType('percent');
		} else {
			report.viewType('hours');
		}
	}

	report.toggleProjects = function(item, e) {
		var target = e.target;
		var parent = $(target).parents('ol');
		if (parent.hasClass('hide')) {
			parent.removeClass('hide').addClass('show');
			$(target).text('Hide');
		} else {
			parent.addClass('hide').removeClass('show');
			$(target).text('Show all projects');
		}
		var isoContainer = $('#report>.content');
		isoContainer.isotope('layout');
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

	// subscribe to the auth event to init the reports
	app.myViewModel.auth.currentUser.subscribe(function(user) {
		if (user) {
			report.init();
		}
	});

	// if already logged in and refresh the page init the reports
	if (app.myViewModel.auth.currentUser()) {
		report.init();
	}

	return self;
}

module.exports = Report;
},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL3dlYi9zY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvYXV0aC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvZmFrZV81ZmE4NjVlYS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvaGVhZGVyLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS93ZWIvc2NyaXB0cy9yZXBvcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIHNjcmlwdHMvYXBwLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEFwcCgpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXHRzZWxmLm15Vmlld01vZGVsID0ge307XG5cblx0c2VsZi5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG5cblx0XHRrby5hcHBseUJpbmRpbmdzKHNlbGYubXlWaWV3TW9kZWwpO1x0XHRcblx0XHQkKCdib2R5JykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBcHA7IiwiLyoqXG4gKiBzY3JpcHRzL2F1dGguanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQXV0aChhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBhdXRoID0gYXBwLm15Vmlld01vZGVsLmF1dGggPSB7fTtcblxuXHRhdXRoLmN1cnJlbnRVc2VyID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRhdXRoLmVycm9yTWVzc2FnZSA9IGtvLm9ic2VydmFibGUoJycpO1xuXHRhdXRoLnNpZ25VcE1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0YXV0aC5pc0FkbWluID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGF1dGguZm9yZ290TW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhdXRoLnNpZ25Jbk1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXHR2YXIgY3VycmVudFVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcblx0aWYgKGN1cnJlbnRVc2VyKSB7XG5cdFx0YXV0aC5jdXJyZW50VXNlcihjdXJyZW50VXNlcik7XG5cdH1cblxuXHRhdXRoLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHQvLyBpZiAoYXV0aC5jdXJyZW50VXNlcigpKSB7XG5cdFx0Ly8gXHRhcHAuZ29Ub1ZpZXcoJ3NlbGVjdC1wcm9qZWN0Jyk7XG5cdFx0Ly8gfSBlbHNlIHtcblx0XHQvLyBcdGFwcC5nb1RvVmlldygnYXV0aCcpO1xuXHRcdC8vIH1cblx0XHQvLyBQYXJzZS5DbG91ZC5ydW4oJ2NoZWNrQWRtaW5TdGF0dXMnLCB7fSwge1xuXHRcdC8vIFx0c3VjY2VzczogZnVuY3Rpb24oaXNBZG1pbikge1xuXHRcdC8vIFx0XHRhdXRoLmlzQWRtaW4oaXNBZG1pbik7XG5cdFx0Ly8gXHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHQvLyBcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdC8vIFx0fVxuXHRcdC8vIH0pO1xuXHR9XG5cblx0YXV0aC5yZXNldEVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5lcnJvck1lc3NhZ2UoJycpO1xuXHR9XG5cblx0YXV0aC5zaWduSW5VcCA9IGZ1bmN0aW9uKGZvcm1FbGVtZW50KSB7XG5cdFx0Ly8ga28ucG9zdGJveC5wdWJsaXNoKCdpc0xvYWRpbmcnLCB0cnVlKTtcblx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblxuXHRcdHZhciBlbWFpbCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9lbWFpbF0nKS52YWwoKS50b0xvd2VyQ2FzZSgpO1xuXHRcdHZhciBwYXNzd29yZCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9wYXNzd29yZF0nKS52YWwoKTtcblxuXHRcdGlmIChhdXRoLnNpZ25VcE1vZGUoKSkge1xuXHRcdFx0dmFyIGRpc3BsYXlOYW1lID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2Rpc3BsYXlOYW1lXScpLnZhbCgpO1xuXHRcdFx0dmFyIHBhc3N3b3JkQ29uZmlybSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9jb25maXJtUGFzc3dvcmRdJykudmFsKCk7XG5cblx0XHRcdC8vIHZhbGlkYXRpb25cblx0XHRcdGlmIChlbWFpbC5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgeW91ciBlbWFpbCBhZGRyZXNzLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChkaXNwbGF5TmFtZS5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgeW91ciBmaXJzdCBhbmQgbGFzdCBuYW1lLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwYXNzd29yZC5sZW5ndGggPCAxIHx8IHBhc3N3b3JkQ29uZmlybSA8IDEgfHwgcGFzc3dvcmQgIT0gcGFzc3dvcmRDb25maXJtKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgYW5kIGNvbmZpcm0gYSBwYXNzd29yZC4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgdXNlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG5cdFx0XHR1c2VyLnNldCgndXNlcm5hbWUnLCBlbWFpbCk7XG5cdFx0XHR1c2VyLnNldCgncGFzc3dvcmQnLCBwYXNzd29yZCk7XG5cdFx0XHR1c2VyLnNldCgnZW1haWwnLCBlbWFpbCk7XG5cdFx0XHR1c2VyLnNldCgnZGlzcGxheU5hbWUnLCBkaXNwbGF5TmFtZSk7XG5cblx0XHRcdHVzZXIuc2lnblVwKG51bGwsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRcdGF1dGguY3VycmVudFVzZXIodXNlcik7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuXHRcdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdFBhcnNlLlVzZXIubG9nSW4oZW1haWwsIHBhc3N3b3JkLCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0XHRhdXRoLmN1cnJlbnRVc2VyKHVzZXIpO1xuXHRcdFx0XHRcdGF1dGguc2lnbkluTW9kZShmYWxzZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuXHRcdFx0XHRcdC8vIFRoZSBsb2dpbiBmYWlsZWQuIENoZWNrIGVycm9yIHRvIHNlZSB3aHkuXG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5mb3Jnb3QgPSBmdW5jdGlvbihmb3JtRWxlbWVudCkge1xuXHRcdHZhciBlbWFpbCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9mb3Jnb3RdJykudmFsKCk7XG5cblx0XHRQYXJzZS5Vc2VyLnJlcXVlc3RQYXNzd29yZFJlc2V0KGVtYWlsLCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0XHRcdFx0JChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2ZvcmdvdF0nKS52YWwoJycpO1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGNoZWNrIHlvdXIgZW1haWwgZm9yIGluc3RydWN0aW9ucyBvbiByZXNldHRpbmcgeW91ciBwYXNzd29yZC4nKTtcblx0XHRcdH0sXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0YXV0aC5sb2dvdXQgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLnNpZ25VcE1vZGUoZmFsc2UpO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5yZXBvcnQucmVzZXRSZXBvcnQoKTtcblx0XHRhdXRoLnNpZ25Jbk1vZGUoZmFsc2UpO1xuXHRcdGF1dGguZm9yZ290TW9kZShmYWxzZSk7XG5cdFx0UGFyc2UuVXNlci5sb2dPdXQoKTtcblx0XHRhdXRoLmN1cnJlbnRVc2VyKG51bGwpO1xuXHR9XG5cblx0YXV0aC5zaG93U2lnblVwID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5lcnJvck1lc3NhZ2UoJycpO1xuXHRcdGlmIChhdXRoLnNpZ25VcE1vZGUoKSkge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguZ29TaWduSW4gPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblx0XHRpZiAoYXV0aC5zaWduSW5Nb2RlKCkpIHtcblx0XHRcdGF1dGguc2lnbkluTW9kZShmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJ2lucHV0JykudmFsKCcnKTtcblx0XHRcdGF1dGguc2lnbkluTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLmdvU2lnblVwID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCdpbnB1dCcpLnZhbCgnJyk7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5nb0ZvcmdvdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXHRcdGlmIChhdXRoLmZvcmdvdE1vZGUoKSkge1xuXHRcdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnaW5wdXQnKS52YWwoJycpO1xuXHRcdFx0YXV0aC5mb3Jnb3RNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguc2FuaXRpemVFcnJvcnMgPSBmdW5jdGlvbihlcnJvcikge1xuXHRcdHN3aXRjaChlcnJvci5jb2RlKVxuXHRcdHtcblx0XHRcdGNhc2UgMjAwOlxuXHRcdFx0XHRpZiAoZXJyb3IubWVzc2FnZSA9PSAnbWlzc2luZyB1c2VybmFtZScpIHtcblx0XHRcdFx0XHRyZXR1cm4gZXJyb3IubWVzc2FnZSA9ICdQbGVhc2UgZW50ZXIgYW4gZW1haWwgYWRkcmVzcy4nO1xuXHRcdFx0XHR9XG5cdFx0XHRjYXNlIDEwMTpcblx0XHRcdFx0cmV0dXJuICdQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhbmQgcGFzc3dvcmQuJztcblx0XHRcdGNhc2UgMTI0OlxuXHRcdFx0XHRyZXR1cm4gJ09vcHMhIFdlIG1lc3NlZCB1cC4gUGxlYXNlIHRyeSBhZ2Fpbi4nO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIGVycm9yLm1lc3NhZ2UuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBlcnJvci5tZXNzYWdlLnNsaWNlKDEpICsgJy4nO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguaW5pdCgpO1xuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF1dGg7IiwiLyoqXG4gKiBzY3JpcHRzL21haW4uanNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIHZhciBBcHAgPSByZXF1aXJlKCcuL2FwcC5qcycpO1xuICAgIHZhciBBdXRoID0gcmVxdWlyZSgnLi9hdXRoLmpzJyk7XG4gICAgdmFyIFJlcG9ydCA9IHJlcXVpcmUoJy4vcmVwb3J0LmpzJyk7XG4gICAgdmFyIEhlYWRlciA9IHJlcXVpcmUoJy4vaGVhZGVyLmpzJyk7XG5cbiAgICAvLyBpbml0aWFsaXplIHBhcnNlXG4gICAgUGFyc2UuaW5pdGlhbGl6ZShcIkprWU5mUEJ3MmFQZ2NjN1BlVEdITUFVMlhLdmp6ZXFWSWt5Q2xWdW9cIiwgXCI0NU9NVTNaUzNvNWMxNjhsUXhhMGlseFF1NEZkTVZIVDFOVlRrT1JsXCIpO1xuXG4gICAgLy8gaW5pdGlhbGl6ZSB0eXBla2l0XG4gICAgdHJ5e1R5cGVraXQubG9hZCgpO31jYXRjaChlKXt9XG5cbiAgICB2YXIgYXBwID0gbmV3IEFwcCgpO1xuICAgIHZhciBhdXRoID0gbmV3IEF1dGgoYXBwKTtcbiAgICB2YXIgcmVwb3J0ID0gbmV3IFJlcG9ydChhcHApO1xuICAgIHZhciBoZWFkZXIgPSBuZXcgSGVhZGVyKGFwcCk7XG5cbiAgICAvLyBDdXN0b20ga25vY2tvdXQgZXh0ZW5kZXJzXG5cbiAgICAvLyBIZXJlJ3MgYSBjdXN0b20gS25vY2tvdXQgYmluZGluZyB0aGF0IG1ha2VzIGVsZW1lbnRzIHNob3duL2hpZGRlbiB2aWEgalF1ZXJ5J3MgZmFkZUluKCkvZmFkZU91dCgpIG1ldGhvZHNcbiAgICAvLyBDb3VsZCBiZSBzdG9yZWQgaW4gYSBzZXBhcmF0ZSB1dGlsaXR5IGxpYnJhcnlcbiAgICBrby5iaW5kaW5nSGFuZGxlcnMuZmFkZVZpc2libGUgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIGtvLnVud3JhcCh2YWx1ZSkgPyAkKGVsZW1lbnQpLmZhZGVJbigpIDogJChlbGVtZW50KS5mYWRlT3V0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBrby5iaW5kaW5nSGFuZGxlcnMuc2xpZGVQYW5lbFZpc2libGUgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIC8vICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIGlmIChrby51bndyYXAodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgJChlbGVtZW50KS5hZGRDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDAsMCwwKScpLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3cG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLnJlbW92ZUNsYXNzKCdvcGVuJykuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlM2QoMCwnICsgdmlld3BvcnRIZWlnaHQgKyAncHgsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAga28uYmluZGluZ0hhbmRsZXJzLnNoaWZ0UGFuZWxWaXNpYmxlID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgICAgICAvLyBJbml0aWFsbHkgc2V0IHRoZSBlbGVtZW50IHRvIGJlIGluc3RhbnRseSB2aXNpYmxlL2hpZGRlbiBkZXBlbmRpbmcgb24gdGhlIHZhbHVlXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICAgICAvLyAkKGVsZW1lbnQpLnRvZ2dsZShrby51bndyYXAodmFsdWUpKTsgLy8gVXNlIFwidW53cmFwT2JzZXJ2YWJsZVwiIHNvIHdlIGNhbiBoYW5kbGUgdmFsdWVzIHRoYXQgbWF5IG9yIG1heSBub3QgYmUgb2JzZXJ2YWJsZVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgICAgIC8vIFdoZW5ldmVyIHRoZSB2YWx1ZSBzdWJzZXF1ZW50bHkgY2hhbmdlcywgc2xvd2x5IGZhZGUgdGhlIGVsZW1lbnQgaW4gb3Igb3V0XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICAgICBpZiAoa28udW53cmFwKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgwJSwwLDApJykuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXdwb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkucmVtb3ZlQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgxMDAlLDAsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXBwLmluaXRpYWxpemUoKTtcbn0pO1xuXG5rby5iaW5kaW5nSGFuZGxlcnMuaXNvdG9wZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3NBY2Nlc3Nvciwgdmlld01vZGVsLCBiaW5kaW5nQ29udGV4dCkge30sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3NBY2Nlc3Nvciwgdmlld01vZGVsLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICB2YXIgJGVsID0gJChlbGVtZW50KTtcbiAgICAgICAgdmFyIHZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpO1xuICAgICAgICB2YXIgJGNvbnRhaW5lciA9ICQodmFsdWUuY29udGFpbmVyKTtcbiAgICAgICAgJGNvbnRhaW5lci5pc290b3BlKHtcbiAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogdmFsdWUuaXRlbVNlbGVjdG9yXG4gICAgICAgIH0pO1xuICAgICAgICAkY29udGFpbmVyLmlzb3RvcGUoJ2FwcGVuZGVkJywgJGVsKTtcbiAgICB9XG59O1xuXG5cbiQuZm4uc2VyaWFsaXplT2JqZWN0ID0gZnVuY3Rpb24oKSB7XG4gICB2YXIgbyA9IHt9O1xuICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAkLmVhY2goYSwgZnVuY3Rpb24oKSB7XG4gICAgICAgaWYgKG9bdGhpcy5uYW1lXSkge1xuICAgICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XG4gICAgICAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcbiAgICAgICAgICAgfVxuICAgICAgICAgICBvW3RoaXMubmFtZV0ucHVzaCh0aGlzLnZhbHVlIHx8ICcnKTtcbiAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICBvW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlIHx8ICcnO1xuICAgICAgIH1cbiAgIH0pO1xuICAgcmV0dXJuIG87XG59OyIsIi8qKlxuICogc2NyaXB0cy9oZWFkZXIuanNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEhlYWRlcihhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBoZWFkZXIgPSBhcHAubXlWaWV3TW9kZWwuaGVhZGVyID0ge307XG5cblx0aGVhZGVyLnZpZXdUeXBlID0ga28ub2JzZXJ2YWJsZSgncGVvcGxlJyk7XG5cblx0aGVhZGVyLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHQvLyByZXBvcnQuc2hvdyh0cnVlKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlcjsiLCIvKipcbiAqIHNjcmlwdHMvYXV0aC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBSZXBvcnQoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcmVwb3J0ID0gYXBwLm15Vmlld01vZGVsLnJlcG9ydCA9IHt9O1xuXHRyZXBvcnQuc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRyZXBvcnQudGltZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW10pO1xuXHRyZXBvcnQudmlld1R5cGUgPSBrby5vYnNlcnZhYmxlKCdob3VycycpO1xuXHRyZXBvcnQuYWN0aXZlV2VlayA9IGtvLm9ic2VydmFibGUoMCk7XG5cblx0cmVwb3J0LmFsbFByb2plY3RzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cblx0cmVwb3J0Lm51bVdlZWtzID0gMztcblx0cmVwb3J0LnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0cmVwb3J0LndlZWtzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKTtcblxuXHRyZXBvcnQuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJlcG9ydC5zaG93KHRydWUpO1xuXG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRQcm9qZWN0cycsIHt9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0cykge1xuXHRcdFx0XHRyZXBvcnQuYWxsUHJvamVjdHMocHJvamVjdHMpO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJlcG9ydC53ZWVrcyhbXSk7XG5cdFx0dmFyIGRhdGVzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXBvcnQubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0dmFyIHdlZWsgPSB7XG5cdFx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHJlcG9ydC50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdNTU0gRCcpKVxuXHRcdFx0fTtcblx0XHRcdGRhdGVzLnB1c2gobW9tZW50KHJlcG9ydC50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJykpO1xuXHRcdFx0cmVwb3J0LndlZWtzLnB1c2god2Vlayk7XG5cdFx0fVxuXG5cdFx0dmFyIGlzb0NvbnRhaW5lciA9ICQoJyNyZXBvcnQ+LmNvbnRlbnQnKTtcblx0XHRpc29Db250YWluZXIuaXNvdG9wZSh7XG5cdFx0XHRsYXlvdXRNb2RlOiAnZml0Um93cycsXG5cdFx0XHRoaWRkZW5TdHlsZToge1xuXHRcdFx0XHRvcGFjaXR5OiAwXG5cdFx0XHR9LFxuXHRcdFx0dmlzaWJsZVN0eWxlOiB7XG5cdFx0XHRcdG9wYWNpdHk6IDFcblx0XHRcdH1cblx0XHR9KTtcblx0XHRpc29Db250YWluZXIuaXNvdG9wZSgnYmluZFJlc2l6ZScpO1xuXG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRUaW1lcycsIHtcblx0XHRcdGRhdGVzOiBkYXRlc1xuXHRcdH0sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHRpbWVzKSB7XG5cdFx0XHRcdHJlcG9ydC50aW1lcyhbXSk7XG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgdGltZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHR0aW1lc1tqXS5hdHRyaWJ1dGVzLmRhdGEgPSAkLnBhcnNlSlNPTih0aW1lc1tqXS5hdHRyaWJ1dGVzLmRhdGEpO1xuXHRcdFx0XHRcdHZhciB0b3RhbCA9IF8odGltZXNbal0uYXR0cmlidXRlcy5kYXRhLnByb2plY3RzKS5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBvYmopIHtcblx0XHRcdFx0XHRcdF8ob2JqKS5lYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHsgYWNjW2tleV0gPSAoYWNjW2tleV0gPyBhY2Nba2V5XSA6IDApICsgdmFsdWUgfSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0XHRcdH0sIHt9KTtcblxuXHRcdFx0XHRcdHRpbWVzW2pdLmF0dHJpYnV0ZXMudG90YWwgPSBrby5vYnNlcnZhYmxlKHRvdGFsLnBlcmNlbnRhZ2UpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXBvcnQubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0XHRcdHZhciB3ZWVrRGF0ZSA9IG1vbWVudChyZXBvcnQudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpO1xuXHRcdFx0XHRcdHZhciB3ZWVrID0gXy5maWx0ZXIodGltZXMsIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9iai5hdHRyaWJ1dGVzLmRhdGEuZGF0ZSA9PSB3ZWVrRGF0ZTtcblx0XHRcdFx0XHR9KTtcblxuXG5cdFx0XHRcdFx0Zm9yIChqID0gMDsgaiA8IHdlZWsubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRcdHZhciBzb3J0ZWQgPSBfLnNvcnRCeSh3ZWVrW2pdLmF0dHJpYnV0ZXMuZGF0YS5wcm9qZWN0cywgZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gLXByb2plY3QucGVyY2VudGFnZTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHR2YXIgZmlsdGVyZWQgPSBfLmZpbHRlcihzb3J0ZWQsIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb2JqLnBlcmNlbnRhZ2UgPiAwO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHdlZWtbal0uYXR0cmlidXRlcy5kYXRhLnByb2plY3RzID0gZmlsdGVyZWQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmVwb3J0LnRpbWVzLnB1c2god2Vlayk7XG5cblx0XHRcdFx0fVxuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHJlcG9ydC5zZWxlY3RXZWVrID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRyZXBvcnQuYWN0aXZlV2VlayhpbmRleCk7XG5cdH1cblxuXHRyZXBvcnQuc3R5bGVXZWVrID0gZnVuY3Rpb24oaW5kZXgsIGRhdGUpIHtcblx0XHR2YXIgc3R5bGVkRGF0ZSA9ICdXZWVrIG9mICcgK2RhdGU7XG5cdFx0aWYgKGluZGV4ID09IDApIHsgc3R5bGVkRGF0ZSA9ICdUaGlzIHdlZWsnIH07XG5cdFx0aWYgKGluZGV4ID09IDEpIHsgc3R5bGVkRGF0ZSA9ICdOZXh0IHdlZWsnIH07XG5cdFx0cmV0dXJuIHN0eWxlZERhdGU7XG5cdH1cblxuXHRyZXBvcnQudG9nZ2xlVmlldyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChyZXBvcnQudmlld1R5cGUoKSA9PSAnaG91cnMnKSB7XG5cdFx0XHRyZXBvcnQudmlld1R5cGUoJ3BlcmNlbnQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVwb3J0LnZpZXdUeXBlKCdob3VycycpO1xuXHRcdH1cblx0fVxuXG5cdHJlcG9ydC50b2dnbGVQcm9qZWN0cyA9IGZ1bmN0aW9uKGl0ZW0sIGUpIHtcblx0XHR2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG5cdFx0dmFyIHBhcmVudCA9ICQodGFyZ2V0KS5wYXJlbnRzKCdvbCcpO1xuXHRcdGlmIChwYXJlbnQuaGFzQ2xhc3MoJ2hpZGUnKSkge1xuXHRcdFx0cGFyZW50LnJlbW92ZUNsYXNzKCdoaWRlJykuYWRkQ2xhc3MoJ3Nob3cnKTtcblx0XHRcdCQodGFyZ2V0KS50ZXh0KCdIaWRlJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBhcmVudC5hZGRDbGFzcygnaGlkZScpLnJlbW92ZUNsYXNzKCdzaG93Jyk7XG5cdFx0XHQkKHRhcmdldCkudGV4dCgnU2hvdyBhbGwgcHJvamVjdHMnKTtcblx0XHR9XG5cdFx0dmFyIGlzb0NvbnRhaW5lciA9ICQoJyNyZXBvcnQ+LmNvbnRlbnQnKTtcblx0XHRpc29Db250YWluZXIuaXNvdG9wZSgnbGF5b3V0Jyk7XG5cdH1cblxuXHRyZXBvcnQuZ2V0Q29tcGFueU5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBuYW1lID0gJyc7XG5cdFx0dmFyIHByb2plY3QgPSBfLmZpbmQocmVwb3J0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0cmV0dXJuIG9iai5pZCA9PSBpZDtcblx0XHR9KTtcblxuXHRcdGlmICh0eXBlb2YgcHJvamVjdCA9PT0gJ29iamVjdCcpIHtcblx0XHRcdG5hbWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMuY29tcGFueTtcblx0XHR9XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH1cblxuXHRyZXBvcnQuZ2V0UHJvamVjdE5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBuYW1lID0gJyc7XG5cdFx0dmFyIHByb2plY3QgPSBfLmZpbmQocmVwb3J0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0cmV0dXJuIG9iai5pZCA9PSBpZDtcblx0XHR9KTtcblxuXHRcdGlmICh0eXBlb2YgcHJvamVjdCA9PT0gJ29iamVjdCcpIHtcblx0XHRcdG5hbWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMubmFtZTtcblx0XHR9XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH1cblxuXHRyZXBvcnQucmVzZXRSZXBvcnQgPSBmdW5jdGlvbigpIHtcblx0XHRyZXBvcnQudGltZXMoW10pO1xuXHR9XG5cblx0Ly8gc3Vic2NyaWJlIHRvIHRoZSBhdXRoIGV2ZW50IHRvIGluaXQgdGhlIHJlcG9ydHNcblx0YXBwLm15Vmlld01vZGVsLmF1dGguY3VycmVudFVzZXIuc3Vic2NyaWJlKGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRpZiAodXNlcikge1xuXHRcdFx0cmVwb3J0LmluaXQoKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIGlmIGFscmVhZHkgbG9nZ2VkIGluIGFuZCByZWZyZXNoIHRoZSBwYWdlIGluaXQgdGhlIHJlcG9ydHNcblx0aWYgKGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHRyZXBvcnQuaW5pdCgpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0OyJdfQ==
