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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL3dlYi9zY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvYXV0aC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvZmFrZV81ZTE4NzQzYS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvZ3JvdXBzLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS93ZWIvc2NyaXB0cy9oZWFkZXIuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL3dlYi9zY3JpcHRzL3Blb3BsZS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvd2ViL3NjcmlwdHMvcHJvamVjdHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBzY3JpcHRzL2FwcC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBcHAoKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0c2VsZi5teVZpZXdNb2RlbCA9IHt9O1xuXG5cdHNlbGYuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0a28uYXBwbHlCaW5kaW5ncyhzZWxmLm15Vmlld01vZGVsKTtcdFx0XG5cdFx0JCgnYm9keScpLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwOyIsIi8qKlxuICogc2NyaXB0cy9hdXRoLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEF1dGgoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgYXV0aCA9IGFwcC5teVZpZXdNb2RlbC5hdXRoID0ge307XG5cblx0YXV0aC5jdXJyZW50VXNlciA9IGtvLm9ic2VydmFibGUoKTtcblx0YXV0aC5lcnJvck1lc3NhZ2UgPSBrby5vYnNlcnZhYmxlKCcnKTtcblx0YXV0aC5zaWduVXBNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGF1dGguaXNBZG1pbiA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhdXRoLmZvcmdvdE1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0YXV0aC5zaWduSW5Nb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0dmFyIGN1cnJlbnRVc2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cdGlmIChjdXJyZW50VXNlcikge1xuXHRcdGF1dGguY3VycmVudFVzZXIoY3VycmVudFVzZXIpO1xuXHR9XG5cblx0YXV0aC5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0Ly8gaWYgKGF1dGguY3VycmVudFVzZXIoKSkge1xuXHRcdC8vIFx0YXBwLmdvVG9WaWV3KCdzZWxlY3QtcHJvamVjdCcpO1xuXHRcdC8vIH0gZWxzZSB7XG5cdFx0Ly8gXHRhcHAuZ29Ub1ZpZXcoJ2F1dGgnKTtcblx0XHQvLyB9XG5cdFx0Ly8gUGFyc2UuQ2xvdWQucnVuKCdjaGVja0FkbWluU3RhdHVzJywge30sIHtcblx0XHQvLyBcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGlzQWRtaW4pIHtcblx0XHQvLyBcdFx0YXV0aC5pc0FkbWluKGlzQWRtaW4pO1xuXHRcdC8vIFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0Ly8gXHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHQvLyBcdH1cblx0XHQvLyB9KTtcblx0fVxuXG5cdGF1dGgucmVzZXRFcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGguZXJyb3JNZXNzYWdlKCcnKTtcblx0fVxuXG5cdGF1dGguc2lnbkluVXAgPSBmdW5jdGlvbihmb3JtRWxlbWVudCkge1xuXHRcdC8vIGtvLnBvc3Rib3gucHVibGlzaCgnaXNMb2FkaW5nJywgdHJ1ZSk7XG5cdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cblx0XHR2YXIgZW1haWwgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZW1haWxdJykudmFsKCkudG9Mb3dlckNhc2UoKTtcblx0XHR2YXIgcGFzc3dvcmQgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfcGFzc3dvcmRdJykudmFsKCk7XG5cblx0XHRpZiAoYXV0aC5zaWduVXBNb2RlKCkpIHtcblx0XHRcdHZhciBkaXNwbGF5TmFtZSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9kaXNwbGF5TmFtZV0nKS52YWwoKTtcblx0XHRcdHZhciBwYXNzd29yZENvbmZpcm0gPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfY29uZmlybVBhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0XHQvLyB2YWxpZGF0aW9uXG5cdFx0XHRpZiAoZW1haWwubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZW1haWwgYWRkcmVzcy4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZGlzcGxheU5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZmlyc3QgYW5kIGxhc3QgbmFtZS4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocGFzc3dvcmQubGVuZ3RoIDwgMSB8fCBwYXNzd29yZENvbmZpcm0gPCAxIHx8IHBhc3N3b3JkICE9IHBhc3N3b3JkQ29uZmlybSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIGFuZCBjb25maXJtIGEgcGFzc3dvcmQuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHVzZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuXHRcdFx0dXNlci5zZXQoJ3VzZXJuYW1lJywgZW1haWwpO1xuXHRcdFx0dXNlci5zZXQoJ3Bhc3N3b3JkJywgcGFzc3dvcmQpO1xuXHRcdFx0dXNlci5zZXQoJ2VtYWlsJywgZW1haWwpO1xuXHRcdFx0dXNlci5zZXQoJ2Rpc3BsYXlOYW1lJywgZGlzcGxheU5hbWUpO1xuXG5cdFx0XHR1c2VyLnNpZ25VcChudWxsLCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0XHRhdXRoLmN1cnJlbnRVc2VyKHVzZXIpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRQYXJzZS5Vc2VyLmxvZ0luKGVtYWlsLCBwYXNzd29yZCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0XHRhdXRoLnNpZ25Jbk1vZGUoZmFsc2UpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHQvLyBUaGUgbG9naW4gZmFpbGVkLiBDaGVjayBlcnJvciB0byBzZWUgd2h5LlxuXHRcdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguZm9yZ290ID0gZnVuY3Rpb24oZm9ybUVsZW1lbnQpIHtcblx0XHR2YXIgZW1haWwgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZm9yZ290XScpLnZhbCgpO1xuXG5cdFx0UGFyc2UuVXNlci5yZXF1ZXN0UGFzc3dvcmRSZXNldChlbWFpbCwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGF1dGguZm9yZ290TW9kZShmYWxzZSk7XG5cdFx0XHRcdCQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9mb3Jnb3RdJykudmFsKCcnKTtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBjaGVjayB5b3VyIGVtYWlsIGZvciBpbnN0cnVjdGlvbnMgb24gcmVzZXR0aW5nIHlvdXIgcGFzc3dvcmQuJyk7XG5cdFx0XHR9LFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGF1dGgubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5zaWduVXBNb2RlKGZhbHNlKTtcblx0XHRhcHAubXlWaWV3TW9kZWwucGVvcGxlLnJlc2V0RGF0YSgpO1xuXHRcdGF1dGguc2lnbkluTW9kZShmYWxzZSk7XG5cdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0XHRQYXJzZS5Vc2VyLmxvZ091dCgpO1xuXHRcdGF1dGguY3VycmVudFVzZXIobnVsbCk7XG5cdH1cblxuXHRhdXRoLnNob3dTaWduVXAgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLmVycm9yTWVzc2FnZSgnJyk7XG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5nb1NpZ25JbiA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXHRcdGlmIChhdXRoLnNpZ25Jbk1vZGUoKSkge1xuXHRcdFx0YXV0aC5zaWduSW5Nb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnaW5wdXQnKS52YWwoJycpO1xuXHRcdFx0YXV0aC5zaWduSW5Nb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguZ29TaWduVXAgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblx0XHRpZiAoYXV0aC5zaWduVXBNb2RlKCkpIHtcblx0XHRcdGF1dGguc2lnblVwTW9kZShmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJ2lucHV0JykudmFsKCcnKTtcblx0XHRcdGF1dGguc2lnblVwTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLmdvRm9yZ290ID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cdFx0aWYgKGF1dGguZm9yZ290TW9kZSgpKSB7XG5cdFx0XHRhdXRoLmZvcmdvdE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCdpbnB1dCcpLnZhbCgnJyk7XG5cdFx0XHRhdXRoLmZvcmdvdE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5zYW5pdGl6ZUVycm9ycyA9IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0c3dpdGNoKGVycm9yLmNvZGUpXG5cdFx0e1xuXHRcdFx0Y2FzZSAyMDA6XG5cdFx0XHRcdGlmIChlcnJvci5tZXNzYWdlID09ICdtaXNzaW5nIHVzZXJuYW1lJykge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvci5tZXNzYWdlID0gJ1BsZWFzZSBlbnRlciBhbiBlbWFpbCBhZGRyZXNzLic7XG5cdFx0XHRcdH1cblx0XHRcdGNhc2UgMTAxOlxuXHRcdFx0XHRyZXR1cm4gJ1BsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsIGFuZCBwYXNzd29yZC4nO1xuXHRcdFx0Y2FzZSAxMjQ6XG5cdFx0XHRcdHJldHVybiAnT29wcyEgV2UgbWVzc2VkIHVwLiBQbGVhc2UgdHJ5IGFnYWluLic7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gZXJyb3IubWVzc2FnZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGVycm9yLm1lc3NhZ2Uuc2xpY2UoMSkgKyAnLic7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0aDsiLCIvKipcbiAqIHNjcmlwdHMvbWFpbi5qc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgdmFyIEFwcCA9IHJlcXVpcmUoJy4vYXBwLmpzJyk7XG4gICAgdmFyIEF1dGggPSByZXF1aXJlKCcuL2F1dGguanMnKTtcbiAgICB2YXIgUGVvcGxlID0gcmVxdWlyZSgnLi9wZW9wbGUuanMnKTtcbiAgICB2YXIgSGVhZGVyID0gcmVxdWlyZSgnLi9oZWFkZXIuanMnKTtcbiAgICB2YXIgUHJvamVjdHMgPSByZXF1aXJlKCcuL3Byb2plY3RzLmpzJyk7XG4gICAgdmFyIEdyb3VwcyA9IHJlcXVpcmUoJy4vZ3JvdXBzLmpzJyk7XG5cbiAgICAvLyBpbml0aWFsaXplIHBhcnNlXG4gICAgUGFyc2UuaW5pdGlhbGl6ZShcIkprWU5mUEJ3MmFQZ2NjN1BlVEdITUFVMlhLdmp6ZXFWSWt5Q2xWdW9cIiwgXCI0NU9NVTNaUzNvNWMxNjhsUXhhMGlseFF1NEZkTVZIVDFOVlRrT1JsXCIpO1xuXG4gICAgLy8gaW5pdGlhbGl6ZSB0eXBla2l0XG4gICAgKGZ1bmN0aW9uKGQpIHtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAga2l0SWQ6ICdhZWU2amdxJyxcbiAgICAgIHNjcmlwdFRpbWVvdXQ6IDMwMDBcbiAgICB9LFxuICAgIGg9ZC5kb2N1bWVudEVsZW1lbnQsdD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7aC5jbGFzc05hbWU9aC5jbGFzc05hbWUucmVwbGFjZSgvXFxid2YtbG9hZGluZ1xcYi9nLFwiXCIpK1wiIHdmLWluYWN0aXZlXCI7fSxjb25maWcuc2NyaXB0VGltZW91dCksdGs9ZC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpLGY9ZmFsc2Uscz1kLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpWzBdLGE7aC5jbGFzc05hbWUrPVwiIHdmLWxvYWRpbmdcIjt0ay5zcmM9Jy8vdXNlLnR5cGVraXQubmV0LycrY29uZmlnLmtpdElkKycuanMnO3RrLmFzeW5jPXRydWU7dGsub25sb2FkPXRrLm9ucmVhZHlzdGF0ZWNoYW5nZT1mdW5jdGlvbigpe2E9dGhpcy5yZWFkeVN0YXRlO2lmKGZ8fGEmJmEhPVwiY29tcGxldGVcIiYmYSE9XCJsb2FkZWRcIilyZXR1cm47Zj10cnVlO2NsZWFyVGltZW91dCh0KTt0cnl7VHlwZWtpdC5sb2FkKGNvbmZpZyl9Y2F0Y2goZSl7fX07cy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0ayxzKVxuICAgIH0pKGRvY3VtZW50KTtcblxuICAgIHZhciBhcHAgPSBuZXcgQXBwKCk7XG4gICAgdmFyIGF1dGggPSBuZXcgQXV0aChhcHApO1xuICAgIHZhciBwZW9wbGUgPSBuZXcgUGVvcGxlKGFwcCk7XG4gICAgdmFyIGhlYWRlciA9IG5ldyBIZWFkZXIoYXBwKTtcbiAgICB2YXIgcHJvamVjdHMgPSBuZXcgUHJvamVjdHMoYXBwKTtcbiAgICB2YXIgZ3JvdXBzID0gbmV3IEdyb3VwcyhhcHApO1xuXG4gICAgLy8gQ3VzdG9tIGtub2Nrb3V0IGV4dGVuZGVyc1xuXG4gICAgLy8gSGVyZSdzIGEgY3VzdG9tIEtub2Nrb3V0IGJpbmRpbmcgdGhhdCBtYWtlcyBlbGVtZW50cyBzaG93bi9oaWRkZW4gdmlhIGpRdWVyeSdzIGZhZGVJbigpL2ZhZGVPdXQoKSBtZXRob2RzXG4gICAgLy8gQ291bGQgYmUgc3RvcmVkIGluIGEgc2VwYXJhdGUgdXRpbGl0eSBsaWJyYXJ5XG4gICAga28uYmluZGluZ0hhbmRsZXJzLmZhZGVWaXNpYmxlID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgICAgICAvLyBJbml0aWFsbHkgc2V0IHRoZSBlbGVtZW50IHRvIGJlIGluc3RhbnRseSB2aXNpYmxlL2hpZGRlbiBkZXBlbmRpbmcgb24gdGhlIHZhbHVlXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLnRvZ2dsZShrby51bndyYXAodmFsdWUpKTsgLy8gVXNlIFwidW53cmFwT2JzZXJ2YWJsZVwiIHNvIHdlIGNhbiBoYW5kbGUgdmFsdWVzIHRoYXQgbWF5IG9yIG1heSBub3QgYmUgb2JzZXJ2YWJsZVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgICAgIC8vIFdoZW5ldmVyIHRoZSB2YWx1ZSBzdWJzZXF1ZW50bHkgY2hhbmdlcywgc2xvd2x5IGZhZGUgdGhlIGVsZW1lbnQgaW4gb3Igb3V0XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICAgICBrby51bndyYXAodmFsdWUpID8gJChlbGVtZW50KS5mYWRlSW4oKSA6ICQoZWxlbWVudCkuZmFkZU91dCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAga28uYmluZGluZ0hhbmRsZXJzLnNsaWRlUGFuZWxWaXNpYmxlID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgICAgICAvLyBJbml0aWFsbHkgc2V0IHRoZSBlbGVtZW50IHRvIGJlIGluc3RhbnRseSB2aXNpYmxlL2hpZGRlbiBkZXBlbmRpbmcgb24gdGhlIHZhbHVlXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICAgICAvLyAkKGVsZW1lbnQpLnRvZ2dsZShrby51bndyYXAodmFsdWUpKTsgLy8gVXNlIFwidW53cmFwT2JzZXJ2YWJsZVwiIHNvIHdlIGNhbiBoYW5kbGUgdmFsdWVzIHRoYXQgbWF5IG9yIG1heSBub3QgYmUgb2JzZXJ2YWJsZVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgICAgIC8vIFdoZW5ldmVyIHRoZSB2YWx1ZSBzdWJzZXF1ZW50bHkgY2hhbmdlcywgc2xvd2x5IGZhZGUgdGhlIGVsZW1lbnQgaW4gb3Igb3V0XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICAgICBpZiAoa28udW53cmFwKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgwLDAsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlld3BvcnRIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgJChlbGVtZW50KS5yZW1vdmVDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDAsJyArIHZpZXdwb3J0SGVpZ2h0ICsgJ3B4LDApJykuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGtvLmJpbmRpbmdIYW5kbGVycy5zaGlmdFBhbmVsVmlzaWJsZSA9IHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGx5IHNldCB0aGUgZWxlbWVudCB0byBiZSBpbnN0YW50bHkgdmlzaWJsZS9oaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZVxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAgLy8gJChlbGVtZW50KS50b2dnbGUoa28udW53cmFwKHZhbHVlKSk7IC8vIFVzZSBcInVud3JhcE9ic2VydmFibGVcIiBzbyB3ZSBjYW4gaGFuZGxlIHZhbHVlcyB0aGF0IG1heSBvciBtYXkgbm90IGJlIG9ic2VydmFibGVcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgICAgICAvLyBXaGVuZXZlciB0aGUgdmFsdWUgc3Vic2VxdWVudGx5IGNoYW5nZXMsIHNsb3dseSBmYWRlIHRoZSBlbGVtZW50IGluIG9yIG91dFxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAgaWYgKGtvLnVud3JhcCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmFkZENsYXNzKCdvcGVuJykuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlM2QoMCUsMCwwKScpLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3cG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLnJlbW92ZUNsYXNzKCdvcGVuJykuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlM2QoMTAwJSwwLDApJykuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFwcC5pbml0aWFsaXplKCk7XG59KTtcblxua28uYmluZGluZ0hhbmRsZXJzLmlzb3RvcGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzQWNjZXNzb3IsIHZpZXdNb2RlbCwgYmluZGluZ0NvbnRleHQpIHt9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzQWNjZXNzb3IsIHZpZXdNb2RlbCwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgdmFyICRlbCA9ICQoZWxlbWVudCk7XG4gICAgICAgIHZhciB2YWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKTtcbiAgICAgICAgdmFyICRjb250YWluZXIgPSAkKHZhbHVlLmNvbnRhaW5lcik7XG4gICAgICAgICRjb250YWluZXIuaXNvdG9wZSh7XG4gICAgICAgICAgICBpdGVtU2VsZWN0b3I6IHZhbHVlLml0ZW1TZWxlY3RvclxuICAgICAgICB9KTtcbiAgICAgICAgJGNvbnRhaW5lci5pc290b3BlKCdhcHBlbmRlZCcsICRlbCk7XG4gICAgfVxufTtcblxuXG4kLmZuLnNlcmlhbGl6ZU9iamVjdCA9IGZ1bmN0aW9uKCkge1xuICAgdmFyIG8gPSB7fTtcbiAgIHZhciBhID0gdGhpcy5zZXJpYWxpemVBcnJheSgpO1xuICAgJC5lYWNoKGEsIGZ1bmN0aW9uKCkge1xuICAgICAgIGlmIChvW3RoaXMubmFtZV0pIHtcbiAgICAgICAgICAgaWYgKCFvW3RoaXMubmFtZV0ucHVzaCkge1xuICAgICAgICAgICAgICAgb1t0aGlzLm5hbWVdID0gW29bdGhpcy5uYW1lXV07XG4gICAgICAgICAgIH1cbiAgICAgICAgICAgb1t0aGlzLm5hbWVdLnB1c2godGhpcy52YWx1ZSB8fCAnJyk7XG4gICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgb1t0aGlzLm5hbWVdID0gdGhpcy52YWx1ZSB8fCAnJztcbiAgICAgICB9XG4gICB9KTtcbiAgIHJldHVybiBvO1xufTsiLCIvKipcbiAqIHNjcmlwdHMvaGVhZGVyLmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBHcm91cHMoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgZ3JvdXBzID0gYXBwLm15Vmlld01vZGVsLmdyb3VwcyA9IHt9O1xuXG5cdGdyb3Vwcy5taW5lID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdGdyb3Vwcy5vdGhlcnMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0Z3JvdXBzLnNob3dOZXcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0Z3JvdXBzLm5ld0dyb3VwTmFtZSA9IGtvLm9ic2VydmFibGUoKTtcblx0Z3JvdXBzLm5ld0dyb3VwUHJpdmFjeSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cdGdyb3Vwcy50b2dnbGVOZXcgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgdGFyZ2V0ID0gJCgnI2dyb3VwcyAudG9nZ2xlLW5ldycpO1xuXHRcdGlmIChncm91cHMuc2hvd05ldygpKSB7XG5cdFx0XHRncm91cHMuc2hvd05ldyhmYWxzZSk7XG5cdFx0XHR0YXJnZXQucmVtb3ZlQ2xhc3MoJ2ZhLXRpbWVzIHJlZCcpLmFkZENsYXNzKCdmYS1wbHVzIGdyZWVuJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGdyb3Vwcy5zaG93TmV3KHRydWUpO1xuXHRcdFx0dGFyZ2V0LmFkZENsYXNzKCdmYS10aW1lcyByZWQnKS5yZW1vdmVDbGFzcygnZmEtcGx1cyBncmVlbicpO1xuXHRcdH1cblx0fVxuXG5cdGdyb3Vwcy5zYXZlR3JvdXAgPSBmdW5jdGlvbihmb3JtRWxlbWVudCkge1xuXHRcdGNvbnNvbGUubG9nKGdyb3Vwcy5uZXdHcm91cE5hbWUoKSlcblx0XHRpZiAoZ3JvdXBzLm5ld0dyb3VwTmFtZSgpKSB7XG5cdFx0XHRQYXJzZS5DbG91ZC5ydW4oJ3NhdmVHcm91cCcsIHtcblx0XHRcdFx0bmFtZTogZ3JvdXBzLm5ld0dyb3VwTmFtZSgpXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGdyb3Vwcykge1xuXHRcdFx0XHRcdGFwcC5teVZpZXdNb2RlbC5ncm91cHMubWluZShncm91cHMpO1xuXHRcdFx0XHRcdGFwcC5teVZpZXdNb2RlbC5ncm91cHMubmV3R3JvdXBOYW1lKG51bGwpO1xuXHRcdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0Z3JvdXBzLnRvZ2dsZU5ldygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhbGVydCgnUGxlYXNlIGVudGVyIGEgZ3JvdXAgbmFtZS4nKVxuXHRcdH1cblx0fVxuXG5cdGdyb3Vwcy5nZXRNeUdyb3VwcyA9IGZ1bmN0aW9uKCkge1xuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0R3JvdXBzJywge1xuXHRcdFx0dXNlcklkOiBhcHAubXlWaWV3TW9kZWwuYXV0aC5jdXJyZW50VXNlcigpLmlkXG5cdFx0fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZ3JvdXBzKSB7XG5cdFx0XHRcdGFwcC5teVZpZXdNb2RlbC5ncm91cHMubWluZShncm91cHMpO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGdyb3Vwcy5nZXRPdGhlckdyb3VwcyA9IGZ1bmN0aW9uKCkge1xuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0R3JvdXBzJywge30sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGdyb3Vwcykge1xuXHRcdFx0XHRhcHAubXlWaWV3TW9kZWwuZ3JvdXBzLm90aGVycyhncm91cHMpO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGdyb3Vwcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0Z3JvdXBzLmdldE15R3JvdXBzKCk7XG5cdFx0Z3JvdXBzLmdldE90aGVyR3JvdXBzKCk7XG5cdH1cblxuXHQvLyBzdWJzY3JpYmUgdG8gdGhlIGF1dGggZXZlbnQgdG8gaW5pdCB0aGUgcGVvcGxlc1xuXHRhcHAubXlWaWV3TW9kZWwuYXV0aC5jdXJyZW50VXNlci5zdWJzY3JpYmUoZnVuY3Rpb24odXNlcikge1xuXHRcdGlmICh1c2VyKSB7XG5cdFx0XHRncm91cHMuaW5pdCgpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gaWYgYWxyZWFkeSBsb2dnZWQgaW4gYW5kIHJlZnJlc2ggdGhlIHBhZ2UgaW5pdCB0aGUgcGVvcGxlc1xuXHRpZiAoYXBwLm15Vmlld01vZGVsLmF1dGguY3VycmVudFVzZXIoKSkge1xuXHRcdGdyb3Vwcy5pbml0KCk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBHcm91cHM7IiwiLyoqXG4gKiBzY3JpcHRzL2hlYWRlci5qc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gSGVhZGVyKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGhlYWRlciA9IGFwcC5teVZpZXdNb2RlbC5oZWFkZXIgPSB7fTtcblxuXHRoZWFkZXIudmlld1R5cGUgPSBrby5vYnNlcnZhYmxlKCdwZW9wbGUnKTtcblxuXHRoZWFkZXIuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vIHJlcG9ydC5zaG93KHRydWUpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyOyIsIi8qKlxuICogc2NyaXB0cy9wZW9wbGUuanNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFBlb3BsZShhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBwZW9wbGUgPSBhcHAubXlWaWV3TW9kZWwucGVvcGxlID0ge307XG5cdHBlb3BsZS5zaG93ID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHBlb3BsZS50aW1lcyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG5cdHBlb3BsZS52aWV3VHlwZSA9IGtvLm9ic2VydmFibGUoJ2hvdXJzJyk7XG5cdHBlb3BsZS5hY3RpdmVXZWVrID0ga28ub2JzZXJ2YWJsZSgwKTtcblxuXHRwZW9wbGUuYWxsUHJvamVjdHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblxuXHRwZW9wbGUubnVtV2Vla3MgPSAzO1xuXHRwZW9wbGUudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRwZW9wbGUud2Vla3MgPSBrby5vYnNlcnZhYmxlQXJyYXkoW10pO1xuXG5cdHBlb3BsZS5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cGVvcGxlLnNob3codHJ1ZSk7XG5cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFByb2plY3RzJywge30sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHByb2plY3RzKSB7XG5cdFx0XHRcdHBlb3BsZS5hbGxQcm9qZWN0cyhwcm9qZWN0cyk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cGVvcGxlLndlZWtzKFtdKTtcblx0XHR2YXIgZGF0ZXMgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBlb3BsZS5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHR2YXIgd2VlayA9IHtcblx0XHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ01NTSBEJykpXG5cdFx0XHR9O1xuXHRcdFx0ZGF0ZXMucHVzaChtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ1lZWVksIE0sIEQnKSk7XG5cdFx0XHRwZW9wbGUud2Vla3MucHVzaCh3ZWVrKTtcblx0XHR9XG5cblx0XHR2YXIgaXNvQ29udGFpbmVyID0gJCgnI3Blb3BsZT4uY29udGVudCcpO1xuXHRcdGlzb0NvbnRhaW5lci5pc290b3BlKHtcblx0XHRcdGxheW91dE1vZGU6ICdmaXRSb3dzJyxcblx0XHRcdGhpZGRlblN0eWxlOiB7XG5cdFx0XHRcdG9wYWNpdHk6IDBcblx0XHRcdH0sXG5cdFx0XHR2aXNpYmxlU3R5bGU6IHtcblx0XHRcdFx0b3BhY2l0eTogMVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGlzb0NvbnRhaW5lci5pc290b3BlKCdiaW5kUmVzaXplJyk7XG5cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFRpbWVzJywge1xuXHRcdFx0ZGF0ZXM6IGRhdGVzXG5cdFx0fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24odGltZXMpIHtcblx0XHRcdFx0cGVvcGxlLnRpbWVzKFtdKTtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB0aW1lcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YSA9ICQucGFyc2VKU09OKHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YSk7XG5cdFx0XHRcdFx0dmFyIHRvdGFsID0gXyh0aW1lc1tqXS5hdHRyaWJ1dGVzLmRhdGEucHJvamVjdHMpLnJlZHVjZShmdW5jdGlvbihhY2MsIG9iaikge1xuXHRcdFx0XHRcdFx0XyhvYmopLmVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkgeyBhY2Nba2V5XSA9IChhY2Nba2V5XSA/IGFjY1trZXldIDogMCkgKyB2YWx1ZSB9KTtcblx0XHRcdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHRcdFx0fSwge30pO1xuXG5cdFx0XHRcdFx0dGltZXNbal0uYXR0cmlidXRlcy50b3RhbCA9IGtvLm9ic2VydmFibGUodG90YWwucGVyY2VudGFnZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBlb3BsZS5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHRcdFx0dmFyIHdlZWtEYXRlID0gbW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJyk7XG5cdFx0XHRcdFx0dmFyIHdlZWsgPSBfLmZpbHRlcih0aW1lcywgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb2JqLmF0dHJpYnV0ZXMuZGF0YS5kYXRlID09IHdlZWtEYXRlO1xuXHRcdFx0XHRcdH0pO1xuXG5cblx0XHRcdFx0XHRmb3IgKGogPSAwOyBqIDwgd2Vlay5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0dmFyIHNvcnRlZCA9IF8uc29ydEJ5KHdlZWtbal0uYXR0cmlidXRlcy5kYXRhLnByb2plY3RzLCBmdW5jdGlvbihwcm9qZWN0KSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiAtcHJvamVjdC5wZXJjZW50YWdlO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHZhciBmaWx0ZXJlZCA9IF8uZmlsdGVyKHNvcnRlZCwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBvYmoucGVyY2VudGFnZSA+IDA7XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0d2Vla1tqXS5hdHRyaWJ1dGVzLmRhdGEucHJvamVjdHMgPSBmaWx0ZXJlZDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRwZW9wbGUudGltZXMucHVzaCh3ZWVrKTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHBlb3BsZS5zZWxlY3RXZWVrID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRwZW9wbGUuYWN0aXZlV2VlayhpbmRleCk7XG5cdH1cblxuXHRwZW9wbGUuc3R5bGVXZWVrID0gZnVuY3Rpb24oaW5kZXgsIGRhdGUpIHtcblx0XHR2YXIgc3R5bGVkRGF0ZSA9ICdXZWVrIG9mICcgK2RhdGU7XG5cdFx0aWYgKGluZGV4ID09IDApIHsgc3R5bGVkRGF0ZSA9ICdUaGlzIHdlZWsnIH07XG5cdFx0aWYgKGluZGV4ID09IDEpIHsgc3R5bGVkRGF0ZSA9ICdOZXh0IHdlZWsnIH07XG5cdFx0cmV0dXJuIHN0eWxlZERhdGU7XG5cdH1cblxuXHRwZW9wbGUudG9nZ2xlVmlldyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChwZW9wbGUudmlld1R5cGUoKSA9PSAnaG91cnMnKSB7XG5cdFx0XHRwZW9wbGUudmlld1R5cGUoJ3BlcmNlbnQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGVvcGxlLnZpZXdUeXBlKCdob3VycycpO1xuXHRcdH1cblx0fVxuXG5cdHBlb3BsZS50b2dnbGVQcm9qZWN0cyA9IGZ1bmN0aW9uKGl0ZW0sIGUpIHtcblx0XHR2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG5cdFx0dmFyIHBhcmVudCA9ICQodGFyZ2V0KS5wYXJlbnRzKCdvbCcpO1xuXHRcdGlmIChwYXJlbnQuaGFzQ2xhc3MoJ2hpZGUnKSkge1xuXHRcdFx0cGFyZW50LnJlbW92ZUNsYXNzKCdoaWRlJykuYWRkQ2xhc3MoJ3Nob3cnKTtcblx0XHRcdCQodGFyZ2V0KS50ZXh0KCdIaWRlJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBhcmVudC5hZGRDbGFzcygnaGlkZScpLnJlbW92ZUNsYXNzKCdzaG93Jyk7XG5cdFx0XHQkKHRhcmdldCkudGV4dCgnU2hvdyBhbGwgcHJvamVjdHMnKTtcblx0XHR9XG5cdFx0dmFyIGlzb0NvbnRhaW5lciA9ICQoJyNwZW9wbGU+LmNvbnRlbnQnKTtcblx0XHRpc29Db250YWluZXIuaXNvdG9wZSgnbGF5b3V0Jyk7XG5cdH1cblxuXHRwZW9wbGUuZ2V0Q29tcGFueU5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBuYW1lID0gJyc7XG5cdFx0dmFyIHByb2plY3QgPSBfLmZpbmQocGVvcGxlLmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0cmV0dXJuIG9iai5pZCA9PSBpZDtcblx0XHR9KTtcblxuXHRcdGlmICh0eXBlb2YgcHJvamVjdCA9PT0gJ29iamVjdCcpIHtcblx0XHRcdG5hbWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMuY29tcGFueTtcblx0XHR9XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH1cblxuXHRwZW9wbGUuZ2V0UHJvamVjdE5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBuYW1lID0gJyc7XG5cdFx0dmFyIHByb2plY3QgPSBfLmZpbmQocGVvcGxlLmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0cmV0dXJuIG9iai5pZCA9PSBpZDtcblx0XHR9KTtcblxuXHRcdGlmICh0eXBlb2YgcHJvamVjdCA9PT0gJ29iamVjdCcpIHtcblx0XHRcdG5hbWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMubmFtZTtcblx0XHR9XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH1cblxuXHRwZW9wbGUucmVzZXREYXRhID0gZnVuY3Rpb24oKSB7XG5cdFx0cGVvcGxlLnRpbWVzKFtdKTtcblx0fVxuXG5cdC8vIHN1YnNjcmliZSB0byB0aGUgYXV0aCBldmVudCB0byBpbml0IHRoZSBwZW9wbGVzXG5cdGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyLnN1YnNjcmliZShmdW5jdGlvbih1c2VyKSB7XG5cdFx0aWYgKHVzZXIpIHtcblx0XHRcdHBlb3BsZS5pbml0KCk7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBpZiBhbHJlYWR5IGxvZ2dlZCBpbiBhbmQgcmVmcmVzaCB0aGUgcGFnZSBpbml0IHRoZSBwZW9wbGVzXG5cdGlmIChhcHAubXlWaWV3TW9kZWwuYXV0aC5jdXJyZW50VXNlcigpKSB7XG5cdFx0cGVvcGxlLmluaXQoKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBlb3BsZTsiLCIvKipcbiAqIHNjcmlwdHMvaGVhZGVyLmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQcm9qZWN0cyhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBwcm9qZWN0cyA9IGFwcC5teVZpZXdNb2RlbC5wcm9qZWN0cyA9IHt9O1xuXG5cdHByb2plY3RzLnNob3cgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0cHJvamVjdHMudGltZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0cHJvamVjdHMud2Vla3MgPSBrby5vYnNlcnZhYmxlQXJyYXkoW10pO1xuXG5cdHByb2plY3RzLnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0cHJvamVjdHMubnVtV2Vla3MgPSAzO1xuXG5cdHByb2plY3RzLmdldERhdGVDb2x1bW5Qb3NpdGlvbiA9IGZ1bmN0aW9uKGRhdGUpIHtcblx0XHR2YXIgaW5kZXggPSBfLmluZGV4T2YoYXBwLm15Vmlld01vZGVsLnByb2plY3RzLndlZWtzKCksIGRhdGUpO1xuXHRcdHJldHVybiBpbmRleDtcblx0fVxuXG5cdHByb2plY3RzLmdldENvbXBhbnlOYW1lID0gZnVuY3Rpb24oaWQpIHtcblx0XHRpZiAoYXBwLm15Vmlld01vZGVsLnBlb3BsZS5hbGxQcm9qZWN0cygpLmxlbmd0aCA+IDApIHtcblx0XHRcdHZhciBwcm9qZWN0ID0gXy5maW5kKGFwcC5teVZpZXdNb2RlbC5wZW9wbGUuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0XHRyZXR1cm4gcHJvamVjdC5pZCA9PSBpZDtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHByb2plY3QuYXR0cmlidXRlcy5jb21wYW55O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHRwcm9qZWN0cy5nZXRQcm9qZWN0TmFtZSA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0aWYgKGFwcC5teVZpZXdNb2RlbC5wZW9wbGUuYWxsUHJvamVjdHMoKS5sZW5ndGggPiAwKSB7XG5cdFx0XHR2YXIgcHJvamVjdCA9IF8uZmluZChhcHAubXlWaWV3TW9kZWwucGVvcGxlLmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKHByb2plY3QpIHtcblx0XHRcdFx0cmV0dXJuIHByb2plY3QuaWQgPT0gaWQ7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBwcm9qZWN0LmF0dHJpYnV0ZXMubmFtZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0cHJvamVjdHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHByb2plY3RzLnRpbWVzKFtdKTtcblx0XHRwcm9qZWN0cy5zaG93KHRydWUpO1xuXG5cdFx0dmFyIGRhdGVzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9qZWN0cy5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHRkYXRlcy5wdXNoKG1vbWVudChwcm9qZWN0cy50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJykpO1xuXHRcdH1cblxuXHRcdHByb2plY3RzLndlZWtzKGRhdGVzKTtcblxuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0VGltZXNCeVByb2plY3QnLCB7XG5cdFx0XHRkYXRlczogZGF0ZXNcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih0aW1lcykge1xuXHRcdFx0XHRwcm9qZWN0cy50aW1lcyh0aW1lcyk7XG5cdFx0XHR9LFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8vIHN1YnNjcmliZSB0byB0aGUgYXV0aCBldmVudCB0byBpbml0IHRoZSBwZW9wbGVzXG5cdGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyLnN1YnNjcmliZShmdW5jdGlvbih1c2VyKSB7XG5cdFx0aWYgKHVzZXIpIHtcblx0XHRcdHByb2plY3RzLmluaXQoKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIGlmIGFscmVhZHkgbG9nZ2VkIGluIGFuZCByZWZyZXNoIHRoZSBwYWdlIGluaXQgdGhlIHBlb3BsZXNcblx0aWYgKGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHRwcm9qZWN0cy5pbml0KCk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0czsiXX0=
