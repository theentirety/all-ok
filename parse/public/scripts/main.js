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
    var Groups = require('./groups.js');

    // initialize parse
    Parse.initialize("JkYNfPBw2aPgcc7PeTGHMAU2XKvjzeqVIkyClVuo", "45OMU3ZS3o5c168lQxa0ilxQu4FdMVHT1NVTkORl");

    // initialize typekit
    (function(d) {
    var config = {
      kitId: 'aee6jgq',
      scriptTimeout: 3000
    },
    h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='//use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
    })(document);

    var app = new App();
    var auth = new Auth(app);
    var people = new People(app);
    var header = new Header(app);
    var projects = new Projects(app);
    var groups = new Groups(app);

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
},{"./app.js":1,"./auth.js":2,"./groups.js":4,"./header.js":5,"./people.js":6,"./projects.js":7}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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

		// var isoContainer = $('#people>.content');
		// isoContainer.isotope({
		// 	layoutMode: 'fitRows',
		// 	hiddenStyle: {
		// 		opacity: 0
		// 	},
		// 	visibleStyle: {
		// 		opacity: 1
		// 	}
		// });
		// isoContainer.isotope('bindResize');

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
				}
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	people.convertNumToWords = function(number) {
		switch (number) {
			case 0:
				return 'zero';
			case 1:
				return 'one';
			case 2:
				return 'two';
			case 3:
				return 'three';
			case 4:
				return 'four';
			default:
				return 'unknown';
		}
	}

	people.flip = function(item, e) {
		var target = $(e.target).parents('li');
		if (target.hasClass('flipped')) {
			target.removeClass('flipped')
		} else {
			target.addClass('flipped')
		}
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
		// var isoContainer = $('#people>.content');
		// isoContainer.isotope('layout');
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
},{}],7:[function(require,module,exports){
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
		if (app.myViewModel.people.allProjects().length > 0) {
			var project = _.find(app.myViewModel.people.allProjects(), function(project) {
				return project.id == id;
			});
			return project.attributes.company;
		} else {
			return null;
		}
	}

	projects.getProjectName = function(id) {
		if (app.myViewModel.people.allProjects().length > 0) {
			var project = _.find(app.myViewModel.people.allProjects(), function(project) {
				return project.id == id;
			});
			return project.attributes.name;
		} else {
			return null;
		}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL3dlYi9zY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvYXV0aC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvZmFrZV9lZWU2YzQ3OC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvZ3JvdXBzLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS93ZWIvc2NyaXB0cy9oZWFkZXIuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL3dlYi9zY3JpcHRzL3Blb3BsZS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvcHJvamVjdHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogc2NyaXB0cy9hcHAuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQXBwKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdHNlbGYubXlWaWV3TW9kZWwgPSB7fTtcblxuXHRzZWxmLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcblxuXHRcdGtvLmFwcGx5QmluZGluZ3Moc2VsZi5teVZpZXdNb2RlbCk7XHRcdFxuXHRcdCQoJ2JvZHknKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDsiLCIvKipcbiAqIHNjcmlwdHMvYXV0aC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBdXRoKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGF1dGggPSBhcHAubXlWaWV3TW9kZWwuYXV0aCA9IHt9O1xuXG5cdGF1dGguY3VycmVudFVzZXIgPSBrby5vYnNlcnZhYmxlKCk7XG5cdGF1dGguZXJyb3JNZXNzYWdlID0ga28ub2JzZXJ2YWJsZSgnJyk7XG5cdGF1dGguc2lnblVwTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhdXRoLmlzQWRtaW4gPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0YXV0aC5mb3Jnb3RNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGF1dGguc2lnbkluTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cdHZhciBjdXJyZW50VXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuXHRpZiAoY3VycmVudFVzZXIpIHtcblx0XHRhdXRoLmN1cnJlbnRVc2VyKGN1cnJlbnRVc2VyKTtcblx0fVxuXG5cdGF1dGguaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vIGlmIChhdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHQvLyBcdGFwcC5nb1RvVmlldygnc2VsZWN0LXByb2plY3QnKTtcblx0XHQvLyB9IGVsc2Uge1xuXHRcdC8vIFx0YXBwLmdvVG9WaWV3KCdhdXRoJyk7XG5cdFx0Ly8gfVxuXHRcdC8vIFBhcnNlLkNsb3VkLnJ1bignY2hlY2tBZG1pblN0YXR1cycsIHt9LCB7XG5cdFx0Ly8gXHRzdWNjZXNzOiBmdW5jdGlvbihpc0FkbWluKSB7XG5cdFx0Ly8gXHRcdGF1dGguaXNBZG1pbihpc0FkbWluKTtcblx0XHQvLyBcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdC8vIFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0Ly8gXHR9XG5cdFx0Ly8gfSk7XG5cdH1cblxuXHRhdXRoLnJlc2V0RXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLmVycm9yTWVzc2FnZSgnJyk7XG5cdH1cblxuXHRhdXRoLnNpZ25JblVwID0gZnVuY3Rpb24oZm9ybUVsZW1lbnQpIHtcblx0XHQvLyBrby5wb3N0Ym94LnB1Ymxpc2goJ2lzTG9hZGluZycsIHRydWUpO1xuXHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXG5cdFx0dmFyIGVtYWlsID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2VtYWlsXScpLnZhbCgpLnRvTG93ZXJDYXNlKCk7XG5cdFx0dmFyIHBhc3N3b3JkID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX3Bhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHR2YXIgZGlzcGxheU5hbWUgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZGlzcGxheU5hbWVdJykudmFsKCk7XG5cdFx0XHR2YXIgcGFzc3dvcmRDb25maXJtID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2NvbmZpcm1QYXNzd29yZF0nKS52YWwoKTtcblxuXHRcdFx0Ly8gdmFsaWRhdGlvblxuXHRcdFx0aWYgKGVtYWlsLmxlbmd0aCA8IDEpIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciB5b3VyIGVtYWlsIGFkZHJlc3MuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGRpc3BsYXlOYW1lLmxlbmd0aCA8IDEpIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciB5b3VyIGZpcnN0IGFuZCBsYXN0IG5hbWUuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHBhc3N3b3JkLmxlbmd0aCA8IDEgfHwgcGFzc3dvcmRDb25maXJtIDwgMSB8fCBwYXNzd29yZCAhPSBwYXNzd29yZENvbmZpcm0pIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciBhbmQgY29uZmlybSBhIHBhc3N3b3JkLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHZhciB1c2VyID0gbmV3IFBhcnNlLlVzZXIoKTtcblx0XHRcdHVzZXIuc2V0KCd1c2VybmFtZScsIGVtYWlsKTtcblx0XHRcdHVzZXIuc2V0KCdwYXNzd29yZCcsIHBhc3N3b3JkKTtcblx0XHRcdHVzZXIuc2V0KCdlbWFpbCcsIGVtYWlsKTtcblx0XHRcdHVzZXIuc2V0KCdkaXNwbGF5TmFtZScsIGRpc3BsYXlOYW1lKTtcblxuXHRcdFx0dXNlci5zaWduVXAobnVsbCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0UGFyc2UuVXNlci5sb2dJbihlbWFpbCwgcGFzc3dvcmQsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRcdGF1dGguY3VycmVudFVzZXIodXNlcik7XG5cdFx0XHRcdFx0YXV0aC5zaWduSW5Nb2RlKGZhbHNlKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0Ly8gVGhlIGxvZ2luIGZhaWxlZC4gQ2hlY2sgZXJyb3IgdG8gc2VlIHdoeS5cblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLmZvcmdvdCA9IGZ1bmN0aW9uKGZvcm1FbGVtZW50KSB7XG5cdFx0dmFyIGVtYWlsID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2ZvcmdvdF0nKS52YWwoKTtcblxuXHRcdFBhcnNlLlVzZXIucmVxdWVzdFBhc3N3b3JkUmVzZXQoZW1haWwsIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhdXRoLmZvcmdvdE1vZGUoZmFsc2UpO1xuXHRcdFx0XHQkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZm9yZ290XScpLnZhbCgnJyk7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgY2hlY2sgeW91ciBlbWFpbCBmb3IgaW5zdHJ1Y3Rpb25zIG9uIHJlc2V0dGluZyB5b3VyIHBhc3N3b3JkLicpO1xuXHRcdFx0fSxcblx0XHRcdGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRhdXRoLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGguc2lnblVwTW9kZShmYWxzZSk7XG5cdFx0YXBwLm15Vmlld01vZGVsLnBlb3BsZS5yZXNldERhdGEoKTtcblx0XHRhdXRoLnNpZ25Jbk1vZGUoZmFsc2UpO1xuXHRcdGF1dGguZm9yZ290TW9kZShmYWxzZSk7XG5cdFx0UGFyc2UuVXNlci5sb2dPdXQoKTtcblx0XHRhdXRoLmN1cnJlbnRVc2VyKG51bGwpO1xuXHR9XG5cblx0YXV0aC5zaG93U2lnblVwID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5lcnJvck1lc3NhZ2UoJycpO1xuXHRcdGlmIChhdXRoLnNpZ25VcE1vZGUoKSkge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguZ29TaWduSW4gPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblx0XHRpZiAoYXV0aC5zaWduSW5Nb2RlKCkpIHtcblx0XHRcdGF1dGguc2lnbkluTW9kZShmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJ2lucHV0JykudmFsKCcnKTtcblx0XHRcdGF1dGguc2lnbkluTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLmdvU2lnblVwID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCdpbnB1dCcpLnZhbCgnJyk7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5nb0ZvcmdvdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXHRcdGlmIChhdXRoLmZvcmdvdE1vZGUoKSkge1xuXHRcdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnaW5wdXQnKS52YWwoJycpO1xuXHRcdFx0YXV0aC5mb3Jnb3RNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguc2FuaXRpemVFcnJvcnMgPSBmdW5jdGlvbihlcnJvcikge1xuXHRcdHN3aXRjaChlcnJvci5jb2RlKVxuXHRcdHtcblx0XHRcdGNhc2UgMjAwOlxuXHRcdFx0XHRpZiAoZXJyb3IubWVzc2FnZSA9PSAnbWlzc2luZyB1c2VybmFtZScpIHtcblx0XHRcdFx0XHRyZXR1cm4gZXJyb3IubWVzc2FnZSA9ICdQbGVhc2UgZW50ZXIgYW4gZW1haWwgYWRkcmVzcy4nO1xuXHRcdFx0XHR9XG5cdFx0XHRjYXNlIDEwMTpcblx0XHRcdFx0cmV0dXJuICdQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhbmQgcGFzc3dvcmQuJztcblx0XHRcdGNhc2UgMTI0OlxuXHRcdFx0XHRyZXR1cm4gJ09vcHMhIFdlIG1lc3NlZCB1cC4gUGxlYXNlIHRyeSBhZ2Fpbi4nO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIGVycm9yLm1lc3NhZ2UuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBlcnJvci5tZXNzYWdlLnNsaWNlKDEpICsgJy4nO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguaW5pdCgpO1xuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF1dGg7IiwiLyoqXG4gKiBzY3JpcHRzL21haW4uanNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIHZhciBBcHAgPSByZXF1aXJlKCcuL2FwcC5qcycpO1xuICAgIHZhciBBdXRoID0gcmVxdWlyZSgnLi9hdXRoLmpzJyk7XG4gICAgdmFyIFBlb3BsZSA9IHJlcXVpcmUoJy4vcGVvcGxlLmpzJyk7XG4gICAgdmFyIEhlYWRlciA9IHJlcXVpcmUoJy4vaGVhZGVyLmpzJyk7XG4gICAgdmFyIFByb2plY3RzID0gcmVxdWlyZSgnLi9wcm9qZWN0cy5qcycpO1xuICAgIHZhciBHcm91cHMgPSByZXF1aXJlKCcuL2dyb3Vwcy5qcycpO1xuXG4gICAgLy8gaW5pdGlhbGl6ZSBwYXJzZVxuICAgIFBhcnNlLmluaXRpYWxpemUoXCJKa1lOZlBCdzJhUGdjYzdQZVRHSE1BVTJYS3ZqemVxVklreUNsVnVvXCIsIFwiNDVPTVUzWlMzbzVjMTY4bFF4YTBpbHhRdTRGZE1WSFQxTlZUa09SbFwiKTtcblxuICAgIC8vIGluaXRpYWxpemUgdHlwZWtpdFxuICAgIChmdW5jdGlvbihkKSB7XG4gICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgIGtpdElkOiAnYWVlNmpncScsXG4gICAgICBzY3JpcHRUaW1lb3V0OiAzMDAwXG4gICAgfSxcbiAgICBoPWQuZG9jdW1lbnRFbGVtZW50LHQ9c2V0VGltZW91dChmdW5jdGlvbigpe2guY2xhc3NOYW1lPWguY2xhc3NOYW1lLnJlcGxhY2UoL1xcYndmLWxvYWRpbmdcXGIvZyxcIlwiKStcIiB3Zi1pbmFjdGl2ZVwiO30sY29uZmlnLnNjcmlwdFRpbWVvdXQpLHRrPWQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKSxmPWZhbHNlLHM9ZC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKVswXSxhO2guY2xhc3NOYW1lKz1cIiB3Zi1sb2FkaW5nXCI7dGsuc3JjPScvL3VzZS50eXBla2l0Lm5ldC8nK2NvbmZpZy5raXRJZCsnLmpzJzt0ay5hc3luYz10cnVlO3RrLm9ubG9hZD10ay5vbnJlYWR5c3RhdGVjaGFuZ2U9ZnVuY3Rpb24oKXthPXRoaXMucmVhZHlTdGF0ZTtpZihmfHxhJiZhIT1cImNvbXBsZXRlXCImJmEhPVwibG9hZGVkXCIpcmV0dXJuO2Y9dHJ1ZTtjbGVhclRpbWVvdXQodCk7dHJ5e1R5cGVraXQubG9hZChjb25maWcpfWNhdGNoKGUpe319O3MucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGsscylcbiAgICB9KShkb2N1bWVudCk7XG5cbiAgICB2YXIgYXBwID0gbmV3IEFwcCgpO1xuICAgIHZhciBhdXRoID0gbmV3IEF1dGgoYXBwKTtcbiAgICB2YXIgcGVvcGxlID0gbmV3IFBlb3BsZShhcHApO1xuICAgIHZhciBoZWFkZXIgPSBuZXcgSGVhZGVyKGFwcCk7XG4gICAgdmFyIHByb2plY3RzID0gbmV3IFByb2plY3RzKGFwcCk7XG4gICAgdmFyIGdyb3VwcyA9IG5ldyBHcm91cHMoYXBwKTtcblxuICAgIC8vIEN1c3RvbSBrbm9ja291dCBleHRlbmRlcnNcblxuICAgIC8vIEhlcmUncyBhIGN1c3RvbSBLbm9ja291dCBiaW5kaW5nIHRoYXQgbWFrZXMgZWxlbWVudHMgc2hvd24vaGlkZGVuIHZpYSBqUXVlcnkncyBmYWRlSW4oKS9mYWRlT3V0KCkgbWV0aG9kc1xuICAgIC8vIENvdWxkIGJlIHN0b3JlZCBpbiBhIHNlcGFyYXRlIHV0aWxpdHkgbGlicmFyeVxuICAgIGtvLmJpbmRpbmdIYW5kbGVycy5mYWRlVmlzaWJsZSA9IHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGx5IHNldCB0aGUgZWxlbWVudCB0byBiZSBpbnN0YW50bHkgdmlzaWJsZS9oaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZVxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAgJChlbGVtZW50KS50b2dnbGUoa28udW53cmFwKHZhbHVlKSk7IC8vIFVzZSBcInVud3JhcE9ic2VydmFibGVcIiBzbyB3ZSBjYW4gaGFuZGxlIHZhbHVlcyB0aGF0IG1heSBvciBtYXkgbm90IGJlIG9ic2VydmFibGVcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgICAgICAvLyBXaGVuZXZlciB0aGUgdmFsdWUgc3Vic2VxdWVudGx5IGNoYW5nZXMsIHNsb3dseSBmYWRlIHRoZSBlbGVtZW50IGluIG9yIG91dFxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAga28udW53cmFwKHZhbHVlKSA/ICQoZWxlbWVudCkuZmFkZUluKCkgOiAkKGVsZW1lbnQpLmZhZGVPdXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGtvLmJpbmRpbmdIYW5kbGVycy5zbGlkZVBhbmVsVmlzaWJsZSA9IHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGx5IHNldCB0aGUgZWxlbWVudCB0byBiZSBpbnN0YW50bHkgdmlzaWJsZS9oaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZVxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAgLy8gJChlbGVtZW50KS50b2dnbGUoa28udW53cmFwKHZhbHVlKSk7IC8vIFVzZSBcInVud3JhcE9ic2VydmFibGVcIiBzbyB3ZSBjYW4gaGFuZGxlIHZhbHVlcyB0aGF0IG1heSBvciBtYXkgbm90IGJlIG9ic2VydmFibGVcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgICAgICAvLyBXaGVuZXZlciB0aGUgdmFsdWUgc3Vic2VxdWVudGx5IGNoYW5nZXMsIHNsb3dseSBmYWRlIHRoZSBlbGVtZW50IGluIG9yIG91dFxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAgaWYgKGtvLnVud3JhcCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmFkZENsYXNzKCdvcGVuJykuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlM2QoMCwwLDApJykuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXdwb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkucmVtb3ZlQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgwLCcgKyB2aWV3cG9ydEhlaWdodCArICdweCwwKScpLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBrby5iaW5kaW5nSGFuZGxlcnMuc2hpZnRQYW5lbFZpc2libGUgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIC8vICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIGlmIChrby51bndyYXAodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgJChlbGVtZW50KS5hZGRDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDAlLDAsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlld3BvcnRIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgJChlbGVtZW50KS5yZW1vdmVDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDEwMCUsMCwwKScpLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhcHAuaW5pdGlhbGl6ZSgpO1xufSk7XG5cbmtvLmJpbmRpbmdIYW5kbGVycy5pc290b3BlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5nc0FjY2Vzc29yLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7fSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5nc0FjY2Vzc29yLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgIHZhciAkZWwgPSAkKGVsZW1lbnQpO1xuICAgICAgICB2YXIgdmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgICAgIHZhciAkY29udGFpbmVyID0gJCh2YWx1ZS5jb250YWluZXIpO1xuICAgICAgICAkY29udGFpbmVyLmlzb3RvcGUoe1xuICAgICAgICAgICAgaXRlbVNlbGVjdG9yOiB2YWx1ZS5pdGVtU2VsZWN0b3JcbiAgICAgICAgfSk7XG4gICAgICAgICRjb250YWluZXIuaXNvdG9wZSgnYXBwZW5kZWQnLCAkZWwpO1xuICAgIH1cbn07XG5cblxuJC5mbi5zZXJpYWxpemVPYmplY3QgPSBmdW5jdGlvbigpIHtcbiAgIHZhciBvID0ge307XG4gICB2YXIgYSA9IHRoaXMuc2VyaWFsaXplQXJyYXkoKTtcbiAgICQuZWFjaChhLCBmdW5jdGlvbigpIHtcbiAgICAgICBpZiAob1t0aGlzLm5hbWVdKSB7XG4gICAgICAgICAgIGlmICghb1t0aGlzLm5hbWVdLnB1c2gpIHtcbiAgICAgICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IFtvW3RoaXMubmFtZV1dO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIG9bdGhpcy5uYW1lXS5wdXNoKHRoaXMudmFsdWUgfHwgJycpO1xuICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgIG9bdGhpcy5uYW1lXSA9IHRoaXMudmFsdWUgfHwgJyc7XG4gICAgICAgfVxuICAgfSk7XG4gICByZXR1cm4gbztcbn07IiwiLyoqXG4gKiBzY3JpcHRzL2hlYWRlci5qc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gR3JvdXBzKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGdyb3VwcyA9IGFwcC5teVZpZXdNb2RlbC5ncm91cHMgPSB7fTtcblxuXHRncm91cHMubWluZSA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRncm91cHMub3RoZXJzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdGdyb3Vwcy5zaG93TmV3ID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGdyb3Vwcy5uZXdHcm91cE5hbWUgPSBrby5vYnNlcnZhYmxlKCk7XG5cdGdyb3Vwcy5uZXdHcm91cFByaXZhY3kgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXHRncm91cHMudG9nZ2xlTmV3ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHRhcmdldCA9ICQoJyNncm91cHMgLnRvZ2dsZS1uZXcnKTtcblx0XHRpZiAoZ3JvdXBzLnNob3dOZXcoKSkge1xuXHRcdFx0Z3JvdXBzLnNob3dOZXcoZmFsc2UpO1xuXHRcdFx0dGFyZ2V0LnJlbW92ZUNsYXNzKCdmYS10aW1lcyByZWQnKS5hZGRDbGFzcygnZmEtcGx1cyBncmVlbicpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRncm91cHMuc2hvd05ldyh0cnVlKTtcblx0XHRcdHRhcmdldC5hZGRDbGFzcygnZmEtdGltZXMgcmVkJykucmVtb3ZlQ2xhc3MoJ2ZhLXBsdXMgZ3JlZW4nKTtcblx0XHR9XG5cdH1cblxuXHRncm91cHMuc2F2ZUdyb3VwID0gZnVuY3Rpb24oZm9ybUVsZW1lbnQpIHtcblx0XHRjb25zb2xlLmxvZyhncm91cHMubmV3R3JvdXBOYW1lKCkpXG5cdFx0aWYgKGdyb3Vwcy5uZXdHcm91cE5hbWUoKSkge1xuXHRcdFx0UGFyc2UuQ2xvdWQucnVuKCdzYXZlR3JvdXAnLCB7XG5cdFx0XHRcdG5hbWU6IGdyb3Vwcy5uZXdHcm91cE5hbWUoKVxuXHRcdFx0fSwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihncm91cHMpIHtcblx0XHRcdFx0XHRhcHAubXlWaWV3TW9kZWwuZ3JvdXBzLm1pbmUoZ3JvdXBzKTtcblx0XHRcdFx0XHRhcHAubXlWaWV3TW9kZWwuZ3JvdXBzLm5ld0dyb3VwTmFtZShudWxsKTtcblx0XHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGdyb3Vwcy50b2dnbGVOZXcoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YWxlcnQoJ1BsZWFzZSBlbnRlciBhIGdyb3VwIG5hbWUuJylcblx0XHR9XG5cdH1cblxuXHRncm91cHMuZ2V0TXlHcm91cHMgPSBmdW5jdGlvbigpIHtcblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldEdyb3VwcycsIHtcblx0XHRcdHVzZXJJZDogYXBwLm15Vmlld01vZGVsLmF1dGguY3VycmVudFVzZXIoKS5pZFxuXHRcdH0sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGdyb3Vwcykge1xuXHRcdFx0XHRhcHAubXlWaWV3TW9kZWwuZ3JvdXBzLm1pbmUoZ3JvdXBzKTtcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRncm91cHMuZ2V0T3RoZXJHcm91cHMgPSBmdW5jdGlvbigpIHtcblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldEdyb3VwcycsIHt9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihncm91cHMpIHtcblx0XHRcdFx0YXBwLm15Vmlld01vZGVsLmdyb3Vwcy5vdGhlcnMoZ3JvdXBzKTtcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRncm91cHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGdyb3Vwcy5nZXRNeUdyb3VwcygpO1xuXHRcdGdyb3Vwcy5nZXRPdGhlckdyb3VwcygpO1xuXHR9XG5cblx0Ly8gc3Vic2NyaWJlIHRvIHRoZSBhdXRoIGV2ZW50IHRvIGluaXQgdGhlIHBlb3BsZXNcblx0YXBwLm15Vmlld01vZGVsLmF1dGguY3VycmVudFVzZXIuc3Vic2NyaWJlKGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRpZiAodXNlcikge1xuXHRcdFx0Z3JvdXBzLmluaXQoKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIGlmIGFscmVhZHkgbG9nZ2VkIGluIGFuZCByZWZyZXNoIHRoZSBwYWdlIGluaXQgdGhlIHBlb3BsZXNcblx0aWYgKGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHRncm91cHMuaW5pdCgpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gR3JvdXBzOyIsIi8qKlxuICogc2NyaXB0cy9oZWFkZXIuanNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEhlYWRlcihhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBoZWFkZXIgPSBhcHAubXlWaWV3TW9kZWwuaGVhZGVyID0ge307XG5cblx0aGVhZGVyLnZpZXdUeXBlID0ga28ub2JzZXJ2YWJsZSgncGVvcGxlJyk7XG5cblx0aGVhZGVyLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHQvLyByZXBvcnQuc2hvdyh0cnVlKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlcjsiLCIvKipcbiAqIHNjcmlwdHMvcGVvcGxlLmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQZW9wbGUoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcGVvcGxlID0gYXBwLm15Vmlld01vZGVsLnBlb3BsZSA9IHt9O1xuXHRwZW9wbGUuc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRwZW9wbGUudGltZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW10pO1xuXHRwZW9wbGUudmlld1R5cGUgPSBrby5vYnNlcnZhYmxlKCdob3VycycpO1xuXHRwZW9wbGUuYWN0aXZlV2VlayA9IGtvLm9ic2VydmFibGUoMCk7XG5cblx0cGVvcGxlLmFsbFByb2plY3RzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cblx0cGVvcGxlLm51bVdlZWtzID0gMztcblx0cGVvcGxlLnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0cGVvcGxlLndlZWtzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKTtcblxuXHRwZW9wbGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHBlb3BsZS5zaG93KHRydWUpO1xuXG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRQcm9qZWN0cycsIHt9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0cykge1xuXHRcdFx0XHRwZW9wbGUuYWxsUHJvamVjdHMocHJvamVjdHMpO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBlb3BsZS53ZWVrcyhbXSk7XG5cdFx0dmFyIGRhdGVzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0dmFyIHdlZWsgPSB7XG5cdFx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdNTU0gRCcpKVxuXHRcdFx0fTtcblx0XHRcdGRhdGVzLnB1c2gobW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJykpO1xuXHRcdFx0cGVvcGxlLndlZWtzLnB1c2god2Vlayk7XG5cdFx0fVxuXG5cdFx0Ly8gdmFyIGlzb0NvbnRhaW5lciA9ICQoJyNwZW9wbGU+LmNvbnRlbnQnKTtcblx0XHQvLyBpc29Db250YWluZXIuaXNvdG9wZSh7XG5cdFx0Ly8gXHRsYXlvdXRNb2RlOiAnZml0Um93cycsXG5cdFx0Ly8gXHRoaWRkZW5TdHlsZToge1xuXHRcdC8vIFx0XHRvcGFjaXR5OiAwXG5cdFx0Ly8gXHR9LFxuXHRcdC8vIFx0dmlzaWJsZVN0eWxlOiB7XG5cdFx0Ly8gXHRcdG9wYWNpdHk6IDFcblx0XHQvLyBcdH1cblx0XHQvLyB9KTtcblx0XHQvLyBpc29Db250YWluZXIuaXNvdG9wZSgnYmluZFJlc2l6ZScpO1xuXG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRUaW1lcycsIHtcblx0XHRcdGRhdGVzOiBkYXRlc1xuXHRcdH0sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHRpbWVzKSB7XG5cdFx0XHRcdHBlb3BsZS50aW1lcyhbXSk7XG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgdGltZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHR0aW1lc1tqXS5hdHRyaWJ1dGVzLmRhdGEgPSAkLnBhcnNlSlNPTih0aW1lc1tqXS5hdHRyaWJ1dGVzLmRhdGEpO1xuXHRcdFx0XHRcdHZhciB0b3RhbCA9IF8odGltZXNbal0uYXR0cmlidXRlcy5kYXRhLnByb2plY3RzKS5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBvYmopIHtcblx0XHRcdFx0XHRcdF8ob2JqKS5lYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHsgYWNjW2tleV0gPSAoYWNjW2tleV0gPyBhY2Nba2V5XSA6IDApICsgdmFsdWUgfSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0XHRcdH0sIHt9KTtcblxuXHRcdFx0XHRcdHRpbWVzW2pdLmF0dHJpYnV0ZXMudG90YWwgPSBrby5vYnNlcnZhYmxlKHRvdGFsLnBlcmNlbnRhZ2UpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0XHRcdHZhciB3ZWVrRGF0ZSA9IG1vbWVudChwZW9wbGUudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpO1xuXHRcdFx0XHRcdHZhciB3ZWVrID0gXy5maWx0ZXIodGltZXMsIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9iai5hdHRyaWJ1dGVzLmRhdGEuZGF0ZSA9PSB3ZWVrRGF0ZTtcblx0XHRcdFx0XHR9KTtcblxuXG5cdFx0XHRcdFx0Zm9yIChqID0gMDsgaiA8IHdlZWsubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRcdHZhciBzb3J0ZWQgPSBfLnNvcnRCeSh3ZWVrW2pdLmF0dHJpYnV0ZXMuZGF0YS5wcm9qZWN0cywgZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gLXByb2plY3QucGVyY2VudGFnZTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHR2YXIgZmlsdGVyZWQgPSBfLmZpbHRlcihzb3J0ZWQsIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb2JqLnBlcmNlbnRhZ2UgPiAwO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHdlZWtbal0uYXR0cmlidXRlcy5kYXRhLnByb2plY3RzID0gZmlsdGVyZWQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cGVvcGxlLnRpbWVzLnB1c2god2Vlayk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRwZW9wbGUuY29udmVydE51bVRvV29yZHMgPSBmdW5jdGlvbihudW1iZXIpIHtcblx0XHRzd2l0Y2ggKG51bWJlcikge1xuXHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRyZXR1cm4gJ3plcm8nO1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRyZXR1cm4gJ29uZSc7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHJldHVybiAndHdvJztcblx0XHRcdGNhc2UgMzpcblx0XHRcdFx0cmV0dXJuICd0aHJlZSc7XG5cdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdHJldHVybiAnZm91cic7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gJ3Vua25vd24nO1xuXHRcdH1cblx0fVxuXG5cdHBlb3BsZS5mbGlwID0gZnVuY3Rpb24oaXRlbSwgZSkge1xuXHRcdHZhciB0YXJnZXQgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCdsaScpO1xuXHRcdGlmICh0YXJnZXQuaGFzQ2xhc3MoJ2ZsaXBwZWQnKSkge1xuXHRcdFx0dGFyZ2V0LnJlbW92ZUNsYXNzKCdmbGlwcGVkJylcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFyZ2V0LmFkZENsYXNzKCdmbGlwcGVkJylcblx0XHR9XG5cdH1cblxuXHRwZW9wbGUuc2VsZWN0V2VlayA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0cGVvcGxlLmFjdGl2ZVdlZWsoaW5kZXgpO1xuXHR9XG5cblx0cGVvcGxlLnN0eWxlV2VlayA9IGZ1bmN0aW9uKGluZGV4LCBkYXRlKSB7XG5cdFx0dmFyIHN0eWxlZERhdGUgPSAnV2VlayBvZiAnICtkYXRlO1xuXHRcdGlmIChpbmRleCA9PSAwKSB7IHN0eWxlZERhdGUgPSAnVGhpcyB3ZWVrJyB9O1xuXHRcdGlmIChpbmRleCA9PSAxKSB7IHN0eWxlZERhdGUgPSAnTmV4dCB3ZWVrJyB9O1xuXHRcdHJldHVybiBzdHlsZWREYXRlO1xuXHR9XG5cblx0cGVvcGxlLnRvZ2dsZVZpZXcgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAocGVvcGxlLnZpZXdUeXBlKCkgPT0gJ2hvdXJzJykge1xuXHRcdFx0cGVvcGxlLnZpZXdUeXBlKCdwZXJjZW50Jyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBlb3BsZS52aWV3VHlwZSgnaG91cnMnKTtcblx0XHR9XG5cdH1cblxuXHRwZW9wbGUudG9nZ2xlUHJvamVjdHMgPSBmdW5jdGlvbihpdGVtLCBlKSB7XG5cdFx0dmFyIHRhcmdldCA9IGUudGFyZ2V0O1xuXHRcdHZhciBwYXJlbnQgPSAkKHRhcmdldCkucGFyZW50cygnb2wnKTtcblx0XHRpZiAocGFyZW50Lmhhc0NsYXNzKCdoaWRlJykpIHtcblx0XHRcdHBhcmVudC5yZW1vdmVDbGFzcygnaGlkZScpLmFkZENsYXNzKCdzaG93Jyk7XG5cdFx0XHQkKHRhcmdldCkudGV4dCgnSGlkZScpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwYXJlbnQuYWRkQ2xhc3MoJ2hpZGUnKS5yZW1vdmVDbGFzcygnc2hvdycpO1xuXHRcdFx0JCh0YXJnZXQpLnRleHQoJ1Nob3cgYWxsIHByb2plY3RzJyk7XG5cdFx0fVxuXHRcdC8vIHZhciBpc29Db250YWluZXIgPSAkKCcjcGVvcGxlPi5jb250ZW50Jyk7XG5cdFx0Ly8gaXNvQ29udGFpbmVyLmlzb3RvcGUoJ2xheW91dCcpO1xuXHR9XG5cblx0cGVvcGxlLmdldENvbXBhbnlOYW1lID0gZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgbmFtZSA9ICcnO1xuXHRcdHZhciBwcm9qZWN0ID0gXy5maW5kKHBlb3BsZS5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdHJldHVybiBvYmouaWQgPT0gaWQ7XG5cdFx0fSk7XG5cblx0XHRpZiAodHlwZW9mIHByb2plY3QgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRuYW1lID0gcHJvamVjdC5hdHRyaWJ1dGVzLmNvbXBhbnk7XG5cdFx0fVxuXHRcdHJldHVybiBuYW1lO1xuXHR9XG5cblx0cGVvcGxlLmdldFByb2plY3ROYW1lID0gZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgbmFtZSA9ICcnO1xuXHRcdHZhciBwcm9qZWN0ID0gXy5maW5kKHBlb3BsZS5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdHJldHVybiBvYmouaWQgPT0gaWQ7XG5cdFx0fSk7XG5cblx0XHRpZiAodHlwZW9mIHByb2plY3QgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRuYW1lID0gcHJvamVjdC5hdHRyaWJ1dGVzLm5hbWU7XG5cdFx0fVxuXHRcdHJldHVybiBuYW1lO1xuXHR9XG5cblx0cGVvcGxlLnJlc2V0RGF0YSA9IGZ1bmN0aW9uKCkge1xuXHRcdHBlb3BsZS50aW1lcyhbXSk7XG5cdH1cblxuXHQvLyBzdWJzY3JpYmUgdG8gdGhlIGF1dGggZXZlbnQgdG8gaW5pdCB0aGUgcGVvcGxlc1xuXHRhcHAubXlWaWV3TW9kZWwuYXV0aC5jdXJyZW50VXNlci5zdWJzY3JpYmUoZnVuY3Rpb24odXNlcikge1xuXHRcdGlmICh1c2VyKSB7XG5cdFx0XHRwZW9wbGUuaW5pdCgpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gaWYgYWxyZWFkeSBsb2dnZWQgaW4gYW5kIHJlZnJlc2ggdGhlIHBhZ2UgaW5pdCB0aGUgcGVvcGxlc1xuXHRpZiAoYXBwLm15Vmlld01vZGVsLmF1dGguY3VycmVudFVzZXIoKSkge1xuXHRcdHBlb3BsZS5pbml0KCk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQZW9wbGU7IiwiLyoqXG4gKiBzY3JpcHRzL2hlYWRlci5qc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUHJvamVjdHMoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcHJvamVjdHMgPSBhcHAubXlWaWV3TW9kZWwucHJvamVjdHMgPSB7fTtcblxuXHRwcm9qZWN0cy5zaG93ID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHByb2plY3RzLnRpbWVzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHByb2plY3RzLndlZWtzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKTtcblxuXHRwcm9qZWN0cy50b2RheSA9IG1vbWVudChuZXcgRGF0ZSgpKS5zdGFydE9mKCdpc293ZWVrJyk7XG5cdHByb2plY3RzLm51bVdlZWtzID0gMztcblxuXHRwcm9qZWN0cy5nZXREYXRlQ29sdW1uUG9zaXRpb24gPSBmdW5jdGlvbihkYXRlKSB7XG5cdFx0dmFyIGluZGV4ID0gXy5pbmRleE9mKGFwcC5teVZpZXdNb2RlbC5wcm9qZWN0cy53ZWVrcygpLCBkYXRlKTtcblx0XHRyZXR1cm4gaW5kZXg7XG5cdH1cblxuXHRwcm9qZWN0cy5nZXRDb21wYW55TmFtZSA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0aWYgKGFwcC5teVZpZXdNb2RlbC5wZW9wbGUuYWxsUHJvamVjdHMoKS5sZW5ndGggPiAwKSB7XG5cdFx0XHR2YXIgcHJvamVjdCA9IF8uZmluZChhcHAubXlWaWV3TW9kZWwucGVvcGxlLmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKHByb2plY3QpIHtcblx0XHRcdFx0cmV0dXJuIHByb2plY3QuaWQgPT0gaWQ7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBwcm9qZWN0LmF0dHJpYnV0ZXMuY29tcGFueTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0cHJvamVjdHMuZ2V0UHJvamVjdE5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdGlmIChhcHAubXlWaWV3TW9kZWwucGVvcGxlLmFsbFByb2plY3RzKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0dmFyIHByb2plY3QgPSBfLmZpbmQoYXBwLm15Vmlld01vZGVsLnBlb3BsZS5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihwcm9qZWN0KSB7XG5cdFx0XHRcdHJldHVybiBwcm9qZWN0LmlkID09IGlkO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcHJvamVjdC5hdHRyaWJ1dGVzLm5hbWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXG5cdHByb2plY3RzLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRwcm9qZWN0cy50aW1lcyhbXSk7XG5cdFx0cHJvamVjdHMuc2hvdyh0cnVlKTtcblxuXHRcdHZhciBkYXRlcyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJvamVjdHMubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0ZGF0ZXMucHVzaChtb21lbnQocHJvamVjdHMudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpKTtcblx0XHR9XG5cblx0XHRwcm9qZWN0cy53ZWVrcyhkYXRlcyk7XG5cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFRpbWVzQnlQcm9qZWN0Jywge1xuXHRcdFx0ZGF0ZXM6IGRhdGVzXG5cdFx0fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24odGltZXMpIHtcblx0XHRcdFx0cHJvamVjdHMudGltZXModGltZXMpO1xuXHRcdFx0fSxcblx0XHRcdGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBzdWJzY3JpYmUgdG8gdGhlIGF1dGggZXZlbnQgdG8gaW5pdCB0aGUgcGVvcGxlc1xuXHRhcHAubXlWaWV3TW9kZWwuYXV0aC5jdXJyZW50VXNlci5zdWJzY3JpYmUoZnVuY3Rpb24odXNlcikge1xuXHRcdGlmICh1c2VyKSB7XG5cdFx0XHRwcm9qZWN0cy5pbml0KCk7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBpZiBhbHJlYWR5IGxvZ2dlZCBpbiBhbmQgcmVmcmVzaCB0aGUgcGFnZSBpbml0IHRoZSBwZW9wbGVzXG5cdGlmIChhcHAubXlWaWV3TW9kZWwuYXV0aC5jdXJyZW50VXNlcigpKSB7XG5cdFx0cHJvamVjdHMuaW5pdCgpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdHM7Il19
