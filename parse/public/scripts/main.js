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
		app.myViewModel.people.resetData();
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
    var People = require('./people.js');
    var Header = require('./header.js');
    var Projects = require('./projects.js');

    // initialize parse
    Parse.initialize("JkYNfPBw2aPgcc7PeTGHMAU2XKvjzeqVIkyClVuo", "45OMU3ZS3o5c168lQxa0ilxQu4FdMVHT1NVTkORl");

    // initialize typekit
    try{Typekit.load();}catch(e){}

    var app = new App();
    var auth = new Auth(app);
    var people = new People(app);
    var header = new Header(app);
    var projects = new Projects(app);

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
},{"./app.js":1,"./auth.js":2,"./header.js":4,"./people.js":5,"./projects.js":6}],4:[function(require,module,exports){
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
 * scripts/people.js
 */

'use strict';

function People(app) {
	var self = this;

	var people = app.myViewModel.people = {};
	people.show = ko.observable(false);
	people.times = ko.observableArray([]);
	people.viewType = ko.observable('hours');
	people.activeWeek = ko.observable(0);

	people.allProjects = ko.observableArray();

	people.numWeeks = 3;
	people.today = moment(new Date()).startOf('isoweek');
	people.weeks = ko.observableArray([]);

	people.init = function() {
		people.show(true);

		Parse.Cloud.run('getProjects', {}, {
			success: function(projects) {
				people.allProjects(projects);
			}, error: function(error) {
				console.log(error);
			}
		});

		people.weeks([]);
		var dates = [];
		for (var i = 0; i < people.numWeeks; i++) {
			var week = {
				date: ko.observable(moment(people.today).add('days', (i * 7)).format('MMM D'))
			};
			dates.push(moment(people.today).add('days', (i * 7)).format('YYYY, M, D'));
			people.weeks.push(week);
		}

		var isoContainer = $('#people>.content');
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
				people.times([]);
				for (var j = 0; j < times.length; j++) {
					times[j].attributes.data = $.parseJSON(times[j].attributes.data);
					var total = _(times[j].attributes.data.projects).reduce(function(acc, obj) {
						_(obj).each(function(value, key) { acc[key] = (acc[key] ? acc[key] : 0) + value });
						return acc;
					}, {});

					times[j].attributes.total = ko.observable(total.percentage);
				}

				for (var i = 0; i < people.numWeeks; i++) {
					var weekDate = moment(people.today).add('days', (i * 7)).format('YYYY, M, D');
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

					people.times.push(week);

					console.log(people.times())

				}
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	people.selectWeek = function(index) {
		people.activeWeek(index);
	}

	people.styleWeek = function(index, date) {
		var styledDate = 'Week of ' +date;
		if (index == 0) { styledDate = 'This week' };
		if (index == 1) { styledDate = 'Next week' };
		return styledDate;
	}

	people.toggleView = function() {
		if (people.viewType() == 'hours') {
			people.viewType('percent');
		} else {
			people.viewType('hours');
		}
	}

	people.toggleProjects = function(item, e) {
		var target = e.target;
		var parent = $(target).parents('ol');
		if (parent.hasClass('hide')) {
			parent.removeClass('hide').addClass('show');
			$(target).text('Hide');
		} else {
			parent.addClass('hide').removeClass('show');
			$(target).text('Show all projects');
		}
		var isoContainer = $('#people>.content');
		isoContainer.isotope('layout');
	}

	people.getCompanyName = function(id) {
		var name = '';
		var project = _.find(people.allProjects(), function(obj) {
			return obj.id == id;
		});

		if (typeof project === 'object') {
			name = project.attributes.company;
		}
		return name;
	}

	people.getProjectName = function(id) {
		var name = '';
		var project = _.find(people.allProjects(), function(obj) {
			return obj.id == id;
		});

		if (typeof project === 'object') {
			name = project.attributes.name;
		}
		return name;
	}

	people.resetData = function() {
		people.times([]);
	}

	// subscribe to the auth event to init the peoples
	app.myViewModel.auth.currentUser.subscribe(function(user) {
		if (user) {
			people.init();
		}
	});

	// if already logged in and refresh the page init the peoples
	if (app.myViewModel.auth.currentUser()) {
		people.init();
	}

	return self;
}

module.exports = People;
},{}],6:[function(require,module,exports){
/**
 * scripts/header.js
 */

'use strict';

function Projects(app) {
	var self = this;

	var projects = app.myViewModel.projects = {};

	projects.show = ko.observable(false);
	projects.times = ko.observableArray();
	projects.weeks = ko.observableArray([]);

	projects.today = moment(new Date()).startOf('isoweek');
	projects.numWeeks = 3;

	projects.getDateColumnPosition = function(date) {
		var index = _.indexOf(app.myViewModel.projects.weeks(), date);
		return index;
	}

	projects.getCompanyName = function(id) {
		var project = _.find(app.myViewModel.people.allProjects(), function(project) {
			return project.id == id;
		});
		return project.attributes.company;
	}

	projects.getProjectName = function(id) {
		var project = _.find(app.myViewModel.people.allProjects(), function(project) {
			return project.id == id;
		});
		return project.attributes.name;
	}

	projects.init = function() {
		projects.times([]);
		projects.show(true);

		var dates = [];
		for (var i = 0; i < projects.numWeeks; i++) {
			dates.push(moment(projects.today).add('days', (i * 7)).format('YYYY, M, D'));
		}

		projects.weeks(dates);

		Parse.Cloud.run('getTimesByProject', {
			dates: dates
		}, {
			success: function(times) {
				projects.times(times);
			},
			error: function(error) {
				console.log(error);
			}
		});
	}

	// subscribe to the auth event to init the peoples
	app.myViewModel.auth.currentUser.subscribe(function(user) {
		if (user) {
			projects.init();
		}
	});

	// if already logged in and refresh the page init the peoples
	if (app.myViewModel.auth.currentUser()) {
		projects.init();
	}

	return self;
}

module.exports = Projects;
},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL3dlYi9zY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvYXV0aC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvZmFrZV82ODhmZDM0Ny5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvaGVhZGVyLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS93ZWIvc2NyaXB0cy9wZW9wbGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL3dlYi9zY3JpcHRzL3Byb2plY3RzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBzY3JpcHRzL2FwcC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBcHAoKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0c2VsZi5teVZpZXdNb2RlbCA9IHt9O1xuXG5cdHNlbGYuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0a28uYXBwbHlCaW5kaW5ncyhzZWxmLm15Vmlld01vZGVsKTtcdFx0XG5cdFx0JCgnYm9keScpLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwOyIsIi8qKlxuICogc2NyaXB0cy9hdXRoLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEF1dGgoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgYXV0aCA9IGFwcC5teVZpZXdNb2RlbC5hdXRoID0ge307XG5cblx0YXV0aC5jdXJyZW50VXNlciA9IGtvLm9ic2VydmFibGUoKTtcblx0YXV0aC5lcnJvck1lc3NhZ2UgPSBrby5vYnNlcnZhYmxlKCcnKTtcblx0YXV0aC5zaWduVXBNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGF1dGguaXNBZG1pbiA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhdXRoLmZvcmdvdE1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0YXV0aC5zaWduSW5Nb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0dmFyIGN1cnJlbnRVc2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cdGlmIChjdXJyZW50VXNlcikge1xuXHRcdGF1dGguY3VycmVudFVzZXIoY3VycmVudFVzZXIpO1xuXHR9XG5cblx0YXV0aC5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0Ly8gaWYgKGF1dGguY3VycmVudFVzZXIoKSkge1xuXHRcdC8vIFx0YXBwLmdvVG9WaWV3KCdzZWxlY3QtcHJvamVjdCcpO1xuXHRcdC8vIH0gZWxzZSB7XG5cdFx0Ly8gXHRhcHAuZ29Ub1ZpZXcoJ2F1dGgnKTtcblx0XHQvLyB9XG5cdFx0Ly8gUGFyc2UuQ2xvdWQucnVuKCdjaGVja0FkbWluU3RhdHVzJywge30sIHtcblx0XHQvLyBcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGlzQWRtaW4pIHtcblx0XHQvLyBcdFx0YXV0aC5pc0FkbWluKGlzQWRtaW4pO1xuXHRcdC8vIFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0Ly8gXHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHQvLyBcdH1cblx0XHQvLyB9KTtcblx0fVxuXG5cdGF1dGgucmVzZXRFcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGguZXJyb3JNZXNzYWdlKCcnKTtcblx0fVxuXG5cdGF1dGguc2lnbkluVXAgPSBmdW5jdGlvbihmb3JtRWxlbWVudCkge1xuXHRcdC8vIGtvLnBvc3Rib3gucHVibGlzaCgnaXNMb2FkaW5nJywgdHJ1ZSk7XG5cdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cblx0XHR2YXIgZW1haWwgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZW1haWxdJykudmFsKCkudG9Mb3dlckNhc2UoKTtcblx0XHR2YXIgcGFzc3dvcmQgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfcGFzc3dvcmRdJykudmFsKCk7XG5cblx0XHRpZiAoYXV0aC5zaWduVXBNb2RlKCkpIHtcblx0XHRcdHZhciBkaXNwbGF5TmFtZSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9kaXNwbGF5TmFtZV0nKS52YWwoKTtcblx0XHRcdHZhciBwYXNzd29yZENvbmZpcm0gPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfY29uZmlybVBhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0XHQvLyB2YWxpZGF0aW9uXG5cdFx0XHRpZiAoZW1haWwubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZW1haWwgYWRkcmVzcy4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZGlzcGxheU5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZmlyc3QgYW5kIGxhc3QgbmFtZS4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocGFzc3dvcmQubGVuZ3RoIDwgMSB8fCBwYXNzd29yZENvbmZpcm0gPCAxIHx8IHBhc3N3b3JkICE9IHBhc3N3b3JkQ29uZmlybSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIGFuZCBjb25maXJtIGEgcGFzc3dvcmQuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHVzZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuXHRcdFx0dXNlci5zZXQoJ3VzZXJuYW1lJywgZW1haWwpO1xuXHRcdFx0dXNlci5zZXQoJ3Bhc3N3b3JkJywgcGFzc3dvcmQpO1xuXHRcdFx0dXNlci5zZXQoJ2VtYWlsJywgZW1haWwpO1xuXHRcdFx0dXNlci5zZXQoJ2Rpc3BsYXlOYW1lJywgZGlzcGxheU5hbWUpO1xuXG5cdFx0XHR1c2VyLnNpZ25VcChudWxsLCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0XHRhdXRoLmN1cnJlbnRVc2VyKHVzZXIpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRQYXJzZS5Vc2VyLmxvZ0luKGVtYWlsLCBwYXNzd29yZCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0XHRhdXRoLnNpZ25Jbk1vZGUoZmFsc2UpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHQvLyBUaGUgbG9naW4gZmFpbGVkLiBDaGVjayBlcnJvciB0byBzZWUgd2h5LlxuXHRcdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguZm9yZ290ID0gZnVuY3Rpb24oZm9ybUVsZW1lbnQpIHtcblx0XHR2YXIgZW1haWwgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZm9yZ290XScpLnZhbCgpO1xuXG5cdFx0UGFyc2UuVXNlci5yZXF1ZXN0UGFzc3dvcmRSZXNldChlbWFpbCwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGF1dGguZm9yZ290TW9kZShmYWxzZSk7XG5cdFx0XHRcdCQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9mb3Jnb3RdJykudmFsKCcnKTtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBjaGVjayB5b3VyIGVtYWlsIGZvciBpbnN0cnVjdGlvbnMgb24gcmVzZXR0aW5nIHlvdXIgcGFzc3dvcmQuJyk7XG5cdFx0XHR9LFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGF1dGgubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5zaWduVXBNb2RlKGZhbHNlKTtcblx0XHRhcHAubXlWaWV3TW9kZWwucGVvcGxlLnJlc2V0RGF0YSgpO1xuXHRcdGF1dGguc2lnbkluTW9kZShmYWxzZSk7XG5cdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0XHRQYXJzZS5Vc2VyLmxvZ091dCgpO1xuXHRcdGF1dGguY3VycmVudFVzZXIobnVsbCk7XG5cdH1cblxuXHRhdXRoLnNob3dTaWduVXAgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLmVycm9yTWVzc2FnZSgnJyk7XG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5nb1NpZ25JbiA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXHRcdGlmIChhdXRoLnNpZ25Jbk1vZGUoKSkge1xuXHRcdFx0YXV0aC5zaWduSW5Nb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnaW5wdXQnKS52YWwoJycpO1xuXHRcdFx0YXV0aC5zaWduSW5Nb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguZ29TaWduVXAgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblx0XHRpZiAoYXV0aC5zaWduVXBNb2RlKCkpIHtcblx0XHRcdGF1dGguc2lnblVwTW9kZShmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJ2lucHV0JykudmFsKCcnKTtcblx0XHRcdGF1dGguc2lnblVwTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLmdvRm9yZ290ID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cdFx0aWYgKGF1dGguZm9yZ290TW9kZSgpKSB7XG5cdFx0XHRhdXRoLmZvcmdvdE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCdpbnB1dCcpLnZhbCgnJyk7XG5cdFx0XHRhdXRoLmZvcmdvdE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5zYW5pdGl6ZUVycm9ycyA9IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0c3dpdGNoKGVycm9yLmNvZGUpXG5cdFx0e1xuXHRcdFx0Y2FzZSAyMDA6XG5cdFx0XHRcdGlmIChlcnJvci5tZXNzYWdlID09ICdtaXNzaW5nIHVzZXJuYW1lJykge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvci5tZXNzYWdlID0gJ1BsZWFzZSBlbnRlciBhbiBlbWFpbCBhZGRyZXNzLic7XG5cdFx0XHRcdH1cblx0XHRcdGNhc2UgMTAxOlxuXHRcdFx0XHRyZXR1cm4gJ1BsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsIGFuZCBwYXNzd29yZC4nO1xuXHRcdFx0Y2FzZSAxMjQ6XG5cdFx0XHRcdHJldHVybiAnT29wcyEgV2UgbWVzc2VkIHVwLiBQbGVhc2UgdHJ5IGFnYWluLic7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gZXJyb3IubWVzc2FnZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGVycm9yLm1lc3NhZ2Uuc2xpY2UoMSkgKyAnLic7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0aDsiLCIvKipcbiAqIHNjcmlwdHMvbWFpbi5qc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgdmFyIEFwcCA9IHJlcXVpcmUoJy4vYXBwLmpzJyk7XG4gICAgdmFyIEF1dGggPSByZXF1aXJlKCcuL2F1dGguanMnKTtcbiAgICB2YXIgUGVvcGxlID0gcmVxdWlyZSgnLi9wZW9wbGUuanMnKTtcbiAgICB2YXIgSGVhZGVyID0gcmVxdWlyZSgnLi9oZWFkZXIuanMnKTtcbiAgICB2YXIgUHJvamVjdHMgPSByZXF1aXJlKCcuL3Byb2plY3RzLmpzJyk7XG5cbiAgICAvLyBpbml0aWFsaXplIHBhcnNlXG4gICAgUGFyc2UuaW5pdGlhbGl6ZShcIkprWU5mUEJ3MmFQZ2NjN1BlVEdITUFVMlhLdmp6ZXFWSWt5Q2xWdW9cIiwgXCI0NU9NVTNaUzNvNWMxNjhsUXhhMGlseFF1NEZkTVZIVDFOVlRrT1JsXCIpO1xuXG4gICAgLy8gaW5pdGlhbGl6ZSB0eXBla2l0XG4gICAgdHJ5e1R5cGVraXQubG9hZCgpO31jYXRjaChlKXt9XG5cbiAgICB2YXIgYXBwID0gbmV3IEFwcCgpO1xuICAgIHZhciBhdXRoID0gbmV3IEF1dGgoYXBwKTtcbiAgICB2YXIgcGVvcGxlID0gbmV3IFBlb3BsZShhcHApO1xuICAgIHZhciBoZWFkZXIgPSBuZXcgSGVhZGVyKGFwcCk7XG4gICAgdmFyIHByb2plY3RzID0gbmV3IFByb2plY3RzKGFwcCk7XG5cbiAgICAvLyBDdXN0b20ga25vY2tvdXQgZXh0ZW5kZXJzXG5cbiAgICAvLyBIZXJlJ3MgYSBjdXN0b20gS25vY2tvdXQgYmluZGluZyB0aGF0IG1ha2VzIGVsZW1lbnRzIHNob3duL2hpZGRlbiB2aWEgalF1ZXJ5J3MgZmFkZUluKCkvZmFkZU91dCgpIG1ldGhvZHNcbiAgICAvLyBDb3VsZCBiZSBzdG9yZWQgaW4gYSBzZXBhcmF0ZSB1dGlsaXR5IGxpYnJhcnlcbiAgICBrby5iaW5kaW5nSGFuZGxlcnMuZmFkZVZpc2libGUgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIGtvLnVud3JhcCh2YWx1ZSkgPyAkKGVsZW1lbnQpLmZhZGVJbigpIDogJChlbGVtZW50KS5mYWRlT3V0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBrby5iaW5kaW5nSGFuZGxlcnMuc2xpZGVQYW5lbFZpc2libGUgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIC8vICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIGlmIChrby51bndyYXAodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgJChlbGVtZW50KS5hZGRDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDAsMCwwKScpLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3cG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLnJlbW92ZUNsYXNzKCdvcGVuJykuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlM2QoMCwnICsgdmlld3BvcnRIZWlnaHQgKyAncHgsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAga28uYmluZGluZ0hhbmRsZXJzLnNoaWZ0UGFuZWxWaXNpYmxlID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgICAgICAvLyBJbml0aWFsbHkgc2V0IHRoZSBlbGVtZW50IHRvIGJlIGluc3RhbnRseSB2aXNpYmxlL2hpZGRlbiBkZXBlbmRpbmcgb24gdGhlIHZhbHVlXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICAgICAvLyAkKGVsZW1lbnQpLnRvZ2dsZShrby51bndyYXAodmFsdWUpKTsgLy8gVXNlIFwidW53cmFwT2JzZXJ2YWJsZVwiIHNvIHdlIGNhbiBoYW5kbGUgdmFsdWVzIHRoYXQgbWF5IG9yIG1heSBub3QgYmUgb2JzZXJ2YWJsZVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgICAgIC8vIFdoZW5ldmVyIHRoZSB2YWx1ZSBzdWJzZXF1ZW50bHkgY2hhbmdlcywgc2xvd2x5IGZhZGUgdGhlIGVsZW1lbnQgaW4gb3Igb3V0XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICAgICBpZiAoa28udW53cmFwKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgwJSwwLDApJykuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXdwb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkucmVtb3ZlQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgxMDAlLDAsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXBwLmluaXRpYWxpemUoKTtcbn0pO1xuXG5rby5iaW5kaW5nSGFuZGxlcnMuaXNvdG9wZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3NBY2Nlc3Nvciwgdmlld01vZGVsLCBiaW5kaW5nQ29udGV4dCkge30sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3NBY2Nlc3Nvciwgdmlld01vZGVsLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICB2YXIgJGVsID0gJChlbGVtZW50KTtcbiAgICAgICAgdmFyIHZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpO1xuICAgICAgICB2YXIgJGNvbnRhaW5lciA9ICQodmFsdWUuY29udGFpbmVyKTtcbiAgICAgICAgJGNvbnRhaW5lci5pc290b3BlKHtcbiAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogdmFsdWUuaXRlbVNlbGVjdG9yXG4gICAgICAgIH0pO1xuICAgICAgICAkY29udGFpbmVyLmlzb3RvcGUoJ2FwcGVuZGVkJywgJGVsKTtcbiAgICB9XG59O1xuXG5cbiQuZm4uc2VyaWFsaXplT2JqZWN0ID0gZnVuY3Rpb24oKSB7XG4gICB2YXIgbyA9IHt9O1xuICAgdmFyIGEgPSB0aGlzLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAkLmVhY2goYSwgZnVuY3Rpb24oKSB7XG4gICAgICAgaWYgKG9bdGhpcy5uYW1lXSkge1xuICAgICAgICAgICBpZiAoIW9bdGhpcy5uYW1lXS5wdXNoKSB7XG4gICAgICAgICAgICAgICBvW3RoaXMubmFtZV0gPSBbb1t0aGlzLm5hbWVdXTtcbiAgICAgICAgICAgfVxuICAgICAgICAgICBvW3RoaXMubmFtZV0ucHVzaCh0aGlzLnZhbHVlIHx8ICcnKTtcbiAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICBvW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlIHx8ICcnO1xuICAgICAgIH1cbiAgIH0pO1xuICAgcmV0dXJuIG87XG59OyIsIi8qKlxuICogc2NyaXB0cy9oZWFkZXIuanNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEhlYWRlcihhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBoZWFkZXIgPSBhcHAubXlWaWV3TW9kZWwuaGVhZGVyID0ge307XG5cblx0aGVhZGVyLnZpZXdUeXBlID0ga28ub2JzZXJ2YWJsZSgncGVvcGxlJyk7XG5cblx0aGVhZGVyLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHQvLyByZXBvcnQuc2hvdyh0cnVlKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlcjsiLCIvKipcbiAqIHNjcmlwdHMvcGVvcGxlLmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQZW9wbGUoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcGVvcGxlID0gYXBwLm15Vmlld01vZGVsLnBlb3BsZSA9IHt9O1xuXHRwZW9wbGUuc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRwZW9wbGUudGltZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW10pO1xuXHRwZW9wbGUudmlld1R5cGUgPSBrby5vYnNlcnZhYmxlKCdob3VycycpO1xuXHRwZW9wbGUuYWN0aXZlV2VlayA9IGtvLm9ic2VydmFibGUoMCk7XG5cblx0cGVvcGxlLmFsbFByb2plY3RzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cblx0cGVvcGxlLm51bVdlZWtzID0gMztcblx0cGVvcGxlLnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0cGVvcGxlLndlZWtzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKTtcblxuXHRwZW9wbGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHBlb3BsZS5zaG93KHRydWUpO1xuXG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRQcm9qZWN0cycsIHt9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0cykge1xuXHRcdFx0XHRwZW9wbGUuYWxsUHJvamVjdHMocHJvamVjdHMpO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBlb3BsZS53ZWVrcyhbXSk7XG5cdFx0dmFyIGRhdGVzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0dmFyIHdlZWsgPSB7XG5cdFx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdNTU0gRCcpKVxuXHRcdFx0fTtcblx0XHRcdGRhdGVzLnB1c2gobW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJykpO1xuXHRcdFx0cGVvcGxlLndlZWtzLnB1c2god2Vlayk7XG5cdFx0fVxuXG5cdFx0dmFyIGlzb0NvbnRhaW5lciA9ICQoJyNwZW9wbGU+LmNvbnRlbnQnKTtcblx0XHRpc29Db250YWluZXIuaXNvdG9wZSh7XG5cdFx0XHRsYXlvdXRNb2RlOiAnZml0Um93cycsXG5cdFx0XHRoaWRkZW5TdHlsZToge1xuXHRcdFx0XHRvcGFjaXR5OiAwXG5cdFx0XHR9LFxuXHRcdFx0dmlzaWJsZVN0eWxlOiB7XG5cdFx0XHRcdG9wYWNpdHk6IDFcblx0XHRcdH1cblx0XHR9KTtcblx0XHRpc29Db250YWluZXIuaXNvdG9wZSgnYmluZFJlc2l6ZScpO1xuXG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRUaW1lcycsIHtcblx0XHRcdGRhdGVzOiBkYXRlc1xuXHRcdH0sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHRpbWVzKSB7XG5cdFx0XHRcdHBlb3BsZS50aW1lcyhbXSk7XG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgdGltZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHR0aW1lc1tqXS5hdHRyaWJ1dGVzLmRhdGEgPSAkLnBhcnNlSlNPTih0aW1lc1tqXS5hdHRyaWJ1dGVzLmRhdGEpO1xuXHRcdFx0XHRcdHZhciB0b3RhbCA9IF8odGltZXNbal0uYXR0cmlidXRlcy5kYXRhLnByb2plY3RzKS5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBvYmopIHtcblx0XHRcdFx0XHRcdF8ob2JqKS5lYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHsgYWNjW2tleV0gPSAoYWNjW2tleV0gPyBhY2Nba2V5XSA6IDApICsgdmFsdWUgfSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0XHRcdH0sIHt9KTtcblxuXHRcdFx0XHRcdHRpbWVzW2pdLmF0dHJpYnV0ZXMudG90YWwgPSBrby5vYnNlcnZhYmxlKHRvdGFsLnBlcmNlbnRhZ2UpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0XHRcdHZhciB3ZWVrRGF0ZSA9IG1vbWVudChwZW9wbGUudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpO1xuXHRcdFx0XHRcdHZhciB3ZWVrID0gXy5maWx0ZXIodGltZXMsIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9iai5hdHRyaWJ1dGVzLmRhdGEuZGF0ZSA9PSB3ZWVrRGF0ZTtcblx0XHRcdFx0XHR9KTtcblxuXG5cdFx0XHRcdFx0Zm9yIChqID0gMDsgaiA8IHdlZWsubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRcdHZhciBzb3J0ZWQgPSBfLnNvcnRCeSh3ZWVrW2pdLmF0dHJpYnV0ZXMuZGF0YS5wcm9qZWN0cywgZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gLXByb2plY3QucGVyY2VudGFnZTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHR2YXIgZmlsdGVyZWQgPSBfLmZpbHRlcihzb3J0ZWQsIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb2JqLnBlcmNlbnRhZ2UgPiAwO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHdlZWtbal0uYXR0cmlidXRlcy5kYXRhLnByb2plY3RzID0gZmlsdGVyZWQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cGVvcGxlLnRpbWVzLnB1c2god2Vlayk7XG5cblx0XHRcdFx0XHRjb25zb2xlLmxvZyhwZW9wbGUudGltZXMoKSlcblxuXHRcdFx0XHR9XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cGVvcGxlLnNlbGVjdFdlZWsgPSBmdW5jdGlvbihpbmRleCkge1xuXHRcdHBlb3BsZS5hY3RpdmVXZWVrKGluZGV4KTtcblx0fVxuXG5cdHBlb3BsZS5zdHlsZVdlZWsgPSBmdW5jdGlvbihpbmRleCwgZGF0ZSkge1xuXHRcdHZhciBzdHlsZWREYXRlID0gJ1dlZWsgb2YgJyArZGF0ZTtcblx0XHRpZiAoaW5kZXggPT0gMCkgeyBzdHlsZWREYXRlID0gJ1RoaXMgd2VlaycgfTtcblx0XHRpZiAoaW5kZXggPT0gMSkgeyBzdHlsZWREYXRlID0gJ05leHQgd2VlaycgfTtcblx0XHRyZXR1cm4gc3R5bGVkRGF0ZTtcblx0fVxuXG5cdHBlb3BsZS50b2dnbGVWaWV3ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHBlb3BsZS52aWV3VHlwZSgpID09ICdob3VycycpIHtcblx0XHRcdHBlb3BsZS52aWV3VHlwZSgncGVyY2VudCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwZW9wbGUudmlld1R5cGUoJ2hvdXJzJyk7XG5cdFx0fVxuXHR9XG5cblx0cGVvcGxlLnRvZ2dsZVByb2plY3RzID0gZnVuY3Rpb24oaXRlbSwgZSkge1xuXHRcdHZhciB0YXJnZXQgPSBlLnRhcmdldDtcblx0XHR2YXIgcGFyZW50ID0gJCh0YXJnZXQpLnBhcmVudHMoJ29sJyk7XG5cdFx0aWYgKHBhcmVudC5oYXNDbGFzcygnaGlkZScpKSB7XG5cdFx0XHRwYXJlbnQucmVtb3ZlQ2xhc3MoJ2hpZGUnKS5hZGRDbGFzcygnc2hvdycpO1xuXHRcdFx0JCh0YXJnZXQpLnRleHQoJ0hpZGUnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGFyZW50LmFkZENsYXNzKCdoaWRlJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcblx0XHRcdCQodGFyZ2V0KS50ZXh0KCdTaG93IGFsbCBwcm9qZWN0cycpO1xuXHRcdH1cblx0XHR2YXIgaXNvQ29udGFpbmVyID0gJCgnI3Blb3BsZT4uY29udGVudCcpO1xuXHRcdGlzb0NvbnRhaW5lci5pc290b3BlKCdsYXlvdXQnKTtcblx0fVxuXG5cdHBlb3BsZS5nZXRDb21wYW55TmFtZSA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIG5hbWUgPSAnJztcblx0XHR2YXIgcHJvamVjdCA9IF8uZmluZChwZW9wbGUuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRyZXR1cm4gb2JqLmlkID09IGlkO1xuXHRcdH0pO1xuXG5cdFx0aWYgKHR5cGVvZiBwcm9qZWN0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0bmFtZSA9IHByb2plY3QuYXR0cmlidXRlcy5jb21wYW55O1xuXHRcdH1cblx0XHRyZXR1cm4gbmFtZTtcblx0fVxuXG5cdHBlb3BsZS5nZXRQcm9qZWN0TmFtZSA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIG5hbWUgPSAnJztcblx0XHR2YXIgcHJvamVjdCA9IF8uZmluZChwZW9wbGUuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRyZXR1cm4gb2JqLmlkID09IGlkO1xuXHRcdH0pO1xuXG5cdFx0aWYgKHR5cGVvZiBwcm9qZWN0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0bmFtZSA9IHByb2plY3QuYXR0cmlidXRlcy5uYW1lO1xuXHRcdH1cblx0XHRyZXR1cm4gbmFtZTtcblx0fVxuXG5cdHBlb3BsZS5yZXNldERhdGEgPSBmdW5jdGlvbigpIHtcblx0XHRwZW9wbGUudGltZXMoW10pO1xuXHR9XG5cblx0Ly8gc3Vic2NyaWJlIHRvIHRoZSBhdXRoIGV2ZW50IHRvIGluaXQgdGhlIHBlb3BsZXNcblx0YXBwLm15Vmlld01vZGVsLmF1dGguY3VycmVudFVzZXIuc3Vic2NyaWJlKGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRpZiAodXNlcikge1xuXHRcdFx0cGVvcGxlLmluaXQoKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIGlmIGFscmVhZHkgbG9nZ2VkIGluIGFuZCByZWZyZXNoIHRoZSBwYWdlIGluaXQgdGhlIHBlb3BsZXNcblx0aWYgKGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHRwZW9wbGUuaW5pdCgpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGVvcGxlOyIsIi8qKlxuICogc2NyaXB0cy9oZWFkZXIuanNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFByb2plY3RzKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHByb2plY3RzID0gYXBwLm15Vmlld01vZGVsLnByb2plY3RzID0ge307XG5cblx0cHJvamVjdHMuc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRwcm9qZWN0cy50aW1lcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRwcm9qZWN0cy53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG5cblx0cHJvamVjdHMudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRwcm9qZWN0cy5udW1XZWVrcyA9IDM7XG5cblx0cHJvamVjdHMuZ2V0RGF0ZUNvbHVtblBvc2l0aW9uID0gZnVuY3Rpb24oZGF0ZSkge1xuXHRcdHZhciBpbmRleCA9IF8uaW5kZXhPZihhcHAubXlWaWV3TW9kZWwucHJvamVjdHMud2Vla3MoKSwgZGF0ZSk7XG5cdFx0cmV0dXJuIGluZGV4O1xuXHR9XG5cblx0cHJvamVjdHMuZ2V0Q29tcGFueU5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBwcm9qZWN0ID0gXy5maW5kKGFwcC5teVZpZXdNb2RlbC5wZW9wbGUuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0cmV0dXJuIHByb2plY3QuaWQgPT0gaWQ7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHByb2plY3QuYXR0cmlidXRlcy5jb21wYW55O1xuXHR9XG5cblx0cHJvamVjdHMuZ2V0UHJvamVjdE5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBwcm9qZWN0ID0gXy5maW5kKGFwcC5teVZpZXdNb2RlbC5wZW9wbGUuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0cmV0dXJuIHByb2plY3QuaWQgPT0gaWQ7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHByb2plY3QuYXR0cmlidXRlcy5uYW1lO1xuXHR9XG5cblx0cHJvamVjdHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHByb2plY3RzLnRpbWVzKFtdKTtcblx0XHRwcm9qZWN0cy5zaG93KHRydWUpO1xuXG5cdFx0dmFyIGRhdGVzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9qZWN0cy5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHRkYXRlcy5wdXNoKG1vbWVudChwcm9qZWN0cy50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJykpO1xuXHRcdH1cblxuXHRcdHByb2plY3RzLndlZWtzKGRhdGVzKTtcblxuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0VGltZXNCeVByb2plY3QnLCB7XG5cdFx0XHRkYXRlczogZGF0ZXNcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih0aW1lcykge1xuXHRcdFx0XHRwcm9qZWN0cy50aW1lcyh0aW1lcyk7XG5cdFx0XHR9LFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8vIHN1YnNjcmliZSB0byB0aGUgYXV0aCBldmVudCB0byBpbml0IHRoZSBwZW9wbGVzXG5cdGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyLnN1YnNjcmliZShmdW5jdGlvbih1c2VyKSB7XG5cdFx0aWYgKHVzZXIpIHtcblx0XHRcdHByb2plY3RzLmluaXQoKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIGlmIGFscmVhZHkgbG9nZ2VkIGluIGFuZCByZWZyZXNoIHRoZSBwYWdlIGluaXQgdGhlIHBlb3BsZXNcblx0aWYgKGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHRwcm9qZWN0cy5pbml0KCk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0czsiXX0=
