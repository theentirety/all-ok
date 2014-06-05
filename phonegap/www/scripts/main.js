(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * scripts/notes.js
 */

'use strict';

function Alerts(app) {
	var self = this;

	var alerts = app.myViewModel.alerts = {};

	alerts.list = ko.observableArray();
	alerts.list.push('asdf')
	alerts.show = ko.observable(false);


	return self;
}


module.exports = Alerts;
},{}],2:[function(require,module,exports){
/**
 * scripts/app.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function App() {
	var self = this;

	// initialize knockout
	self.myViewModel = {};

	self.myViewModel.activeView = ko.observable(0);
	self.myViewModel.views = [
		'auth',
		'home',
		'select-project',
		'rate-week',
		'notes',
		'people',
		'people-details',
		'save'
	];

	self.myViewModel.numWeeks = 3;
	self.myViewModel.today = moment(new Date()).startOf('isoweek');
	self.myViewModel.weeks = ko.observableArray();

	self.goToView = function(view) {
		var index = self.myViewModel.views.indexOf(view);
		self.myViewModel.activeView(index);
	}

	self.initialize = function() {
		document.addEventListener('deviceready', self.onDeviceReady, false);
	}

	self.onDeviceReady = function() {
		ko.applyBindings(self.myViewModel);
		setTimeout(function() {
			if (navigator.splashscreen) {
				navigator.splashscreen.hide();
			}
		}, 2000);
		
	}

	return self;
}

module.exports = App;
},{}],3:[function(require,module,exports){
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
	auth.signInMode = ko.observable(false);
	auth.forgotMode = ko.observable(false);

	var currentUser = Parse.User.current();
	if (currentUser) {
		auth.currentUser(currentUser);
	}

	auth.init = function() {
		if (auth.currentUser()) {
			app.goToView('home');
		} else {
			app.goToView('auth');
		}
	}

	auth.resetError = function() {
		auth.errorMessage('');
	}

	auth.signInUp = function(formElement) {
		auth.resetError();

		var username = $(formElement).find('input[name=auth_email]').val();
		var password = $(formElement).find('input[name=auth_password]').val();

		if (auth.signUpMode()) {
			var displayName = $(formElement).find('input[name=auth_displayName]').val();
			var passwordConfirm = $(formElement).find('input[name=auth_confirmPassword]').val();

			// validation
			if (username.length < 1) {
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
			var scrubbedUsername = username.replace(/\s+/g,""); //remove white space
			scrubbedUsername = scrubbedUsername.toLowerCase();

			user.set('username', scrubbedUsername);
			user.set('password', password);
			user.set('email', scrubbedUsername);
			user.set('displayName', displayName);

			user.signUp(null, {
				success: function(user) {
					auth.currentUser(user);
					app.goToView('home');
					app.myViewModel.selectProject.init();
					auth.resetViews();
				},
				error: function(user, error) {
					auth.errorMessage(auth.sanitizeErrors(error));
					console.log(error);
				}
			});

		} else {
			Parse.User.logIn(username, password, {
				success: function(user) {
					auth.currentUser(user);
					app.goToView('home');
					app.myViewModel.selectProject.init();
					auth.resetViews();
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

		if (email.length <= 0) {
			auth.errorMessage('Please enter an email address.');
		} else {
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
	}

	auth.resetError = function() {
		auth.errorMessage('');
	}

	auth.logout = function() {
		app.myViewModel.rateWeek.activeWeek(0);
		app.myViewModel.profile.show(false);
		app.goToView('auth');
		Parse.User.logOut();
		auth.currentUser(null);
		auth.resetViews();
	}

	auth.resetViews = function() {
		auth.resetError();
		auth.signInMode(false);
		auth.signUpMode(false);
		auth.forgotMode(false);
	}

	auth.toggleSignIn = function() {
		if (auth.signInMode()) {
			auth.signInMode(false);
			auth.resetError();
		} else {
			auth.signInMode(true);
		}
	}

	auth.toggleSignUp = function() {
		if (auth.signUpMode()) {
			auth.signUpMode(false);
			auth.resetError();
		} else {
			auth.signUpMode(true);
		}
	}

	auth.toggleForgot = function() {
		if (auth.forgotMode()) {
			auth.forgotMode(false);
			auth.resetError();
		} else {
			auth.forgotMode(true);
		}
	}

	auth.sanitizeErrors = function(error) {
		switch(error.code)
		{
			case 101:
				return 'Please enter a valid username and password.';
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
},{}],4:[function(require,module,exports){
/**
 * scripts/main.js
 *
 * This is the starting point for your application.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

var App = require('./app.js');
var Auth = require('./auth.js');
var SelectProject = require('./select-project.js');
var RateWeek = require('./rate-week.js');
var Notes = require('./notes.js');
var People = require('./people.js');
var Save = require('./save.js');
var PeopleDetails = require('./people-details.js');
var Home = require('./home.js');
var Alerts = require('./alerts.js');
var Profile = require('./profile.js');

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
var home = new Home(app);
var selectProject = new SelectProject(app);
var rateWeek = new RateWeek(app);
var notes = new Notes(app);
var people = new People(app);
var save = new Save(app);
var peopleDetails = new PeopleDetails(app);
var alerts = new Alerts(app);
var profile = new Profile(app);

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
},{"./alerts.js":1,"./app.js":2,"./auth.js":3,"./home.js":5,"./notes.js":6,"./people-details.js":7,"./people.js":8,"./profile.js":9,"./rate-week.js":10,"./save.js":11,"./select-project.js":12}],5:[function(require,module,exports){
/**
 * scripts/notes.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Home(app) {
	var self = this;

	var home = app.myViewModel.home = {};

	home.totals = ko.observableArray();
	home.isRefreshDragging = ko.observable(false);
	home.dragStart = ko.observable(0);
	home.today = moment(new Date()).startOf('isoweek');
	home.weeks = ko.observableArray();

	home.showAlerts = function() {
		app.myViewModel.alerts.show(true);
	}

	home.showProfile = function() {
		app.myViewModel.profile.show(true);
	}

	home.styleWeek = function(index) {

		var styledDate = 'Week of ' + moment(home.today).startOf('isoweek').add('days', (index * 7)).format('MMM D');
		if (index == 0) { styledDate = 'This week' };
		if (index == 1) { styledDate = 'Next week' };
		return styledDate;
	}

	home.Week = function(missingWeek) {
		var blankWeek = {
			notes: '',
			rating: -1,
			total: -1,
			week: home.weeks()[missingWeek]
		};
		return blankWeek;
	}

	home.go = function(index) {
		app.myViewModel.selectProject.init(index);
		app.goToView('select-project');
	}

	home.convertNumToWords = function(number) {
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

	home.getTotalsAndRating = function() {
		home.weeks([]);
		for (var i = 0; i < app.myViewModel.numWeeks; i++) {
			home.weeks.push(moment(home.today).startOf('isoweek').add('days', (i * 7)).format('YYYY, M, D'));
		}
		Parse.Cloud.run('getTotalsAndRating', {
			weeks: home.weeks()
		}, {
			success: function(totalsAndRating) {
				for (var i = totalsAndRating.length; i < app.myViewModel.numWeeks; i++) {
					// add blank entries to the results
					totalsAndRating.push(home.Week(i));
					$('#home .refresh').html('<span class="fa fa-arrow-circle-down"></span> Pull to refresh');
					home.isRefreshDragging(false);
					home.dragStart(0);
					$('#home .page').animate({
						marginTop: 0
					}, 100);
				}
				home.totals(totalsAndRating);
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	home.dragRefresh = function(item, event) {
		if (home.isRefreshDragging() && home.dragStart() == 0) {
			var top = $(document).scrollTop();
			var delta = Math.floor(event.gesture.distance);
			if (top == 0 && delta > 30) {
				if (delta > 150) delta = 150;
				$('#home .page').css('margin-top', delta - 30);
				if (delta >= 100) {
					$('#home .refresh').html('<span class="fa fa-arrow-circle-up"></span> Release to refresh');
				} else {
					$('#home .refresh').html('<span class="fa fa-arrow-circle-down"></span> Pull to refresh');
				}
			}
		}
	}

	home.startRefreshDrag = function(item, event) {
		if (!home.isRefreshDragging() && home.dragStart() == 0) {
			home.dragStart($(document).scrollTop());
			home.isRefreshDragging(true);
			$(event.gesture.target).one('dragend', function(event) {
				var delta = parseInt($('#home .page').css('margin-top'));

				if (delta >= 70) {
					home.getTotalsAndRating();
					$('#home .refresh').html('<span class="fa fa-refresh fa-spin"></span> Refreshing...');
				} else {
					$('#home .refresh').html('<span class="fa fa-arrow-circle-down"></span> Pull to refresh');
					home.isRefreshDragging(false);
					home.dragStart(0);
					$('#home .page').animate({
						marginTop: 0
					}, 100);
				}
			})
		}
	}

	home.init = function() {
		home.getTotalsAndRating();
	}

	if (app.myViewModel.auth.currentUser()) {
		home.init();
	}

	return self;
}


module.exports = Home;
},{}],6:[function(require,module,exports){
/**
 * scripts/notes.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Notes(app) {
	var self = this;

	var notes = app.myViewModel.notes = {};
	notes.statusOptions = ko.observableArray([
		{
			label: 'Bring on the work',
			value: 0,
			icon: 'emoji-1.svg'
		},
		{
			label: 'I\'m a little light',
			value: 1,
			icon: 'emoji-2.svg'
		},
		{
			label: 'Life is good',
			value: 2,
			icon: 'emoji-3.svg'
		},
		{
			label: 'I\'m a bit overwhelmed',
			value: 3,
			icon: 'emoji-4.svg'
		},
		{
			label: 'Stop the madness!',
			value: 4,
			icon: 'emoji-5.svg'
		}
	]);

	notes.selectStatus = function(item) {
		app.myViewModel.rateWeek.weeks()[app.myViewModel.rateWeek.activeWeek()].rating(item.value);
	}

	return self;
}


module.exports = Notes;
},{}],7:[function(require,module,exports){
/**
 * scripts/people-details.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function PeopleDetails(app) {
	var self = this;

	var peopleDetails = app.myViewModel.peopleDetails = {};

	peopleDetails.person = ko.observable(null);
	peopleDetails.weeks = ko.observableArray([]);
	peopleDetails.totals = ko.observableArray([]);

	peopleDetails.getPerson = function(item) {
		peopleDetails.totals([]);
		for (var i = 0; i < app.myViewModel.people.numWeeks; i++) {
			var person = _.find(app.myViewModel.people.times()[i], function(obj) {
				return obj.attributes.user.id == item.attributes.user.id;
			});
			peopleDetails.totals.push(person);
		}

		peopleDetails.person(item);
	}

	peopleDetails.goBack = function() {
		app.goToView('people');
	}

	peopleDetails.getCompanyName = function(id) {
		var name = '';
		var project = _.find(app.myViewModel.selectProject.allProjects(), function(obj) {
			return obj.id == id;
		});

		if (typeof project === 'object') {
			name = project.attributes.company;
		}
		return name;
	}

	peopleDetails.getProjectName = function(id) {
		var name = '';
		var project = _.find(app.myViewModel.selectProject.allProjects(), function(obj) {
			return obj.id == id;
		});

		if (typeof project === 'object') {
			name = project.attributes.name;
		}
		return name;
	}

	return self;
}

module.exports = PeopleDetails;
},{}],8:[function(require,module,exports){
/**
 * scripts/people.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function People(app) {
	var self = this;

	var people = app.myViewModel.people = {};

	people.numWeeks = 3;
	people.today = moment(new Date()).startOf('isoweek');
	people.activeWeek = ko.observable(0);
	people.activePerson = ko.observable();
	people.viewType = ko.observable('hours');
	people.times = ko.observableArray();
	people.weeks = ko.observableArray();
	people.isRefreshDragging = ko.observable(false);
	people.dragStart = ko.observable(0);

	people.getTimes = function() {
		var dates = [];
		for (var i = 0; i < people.numWeeks; i++) {
			dates.push(moment(people.today).add('days', (i * 7)).format('YYYY, M, D'));
			people.weeks()[i].date(moment(people.today).add('days', (i * 7)).format('MMM D'));
		}
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

					var sorted = _.sortBy(week, function(obj){ 
						return -obj.attributes.total();
					});

					people.times.push(sorted);
				}
				$('#people .refresh').html('<span class="fa fa-arrow-circle-down"></span>Pull to refresh');
				people.isRefreshDragging(false);
				people.dragStart(0);
				$('#people .people').animate({
					marginTop: 0
				}, 100);
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	people.init = function() {
		for (var i = 0; i < people.numWeeks; i++) {
			var week = {
				date: ko.observable(moment(people.today).add('days', (i * 7)).format('MMM D'))
			}
			people.weeks.push(week);
		}
		people.getTimes();
	}

	people.selectWeek = function(index) {
		people.activeWeek(index);
		// go get the data for this week
	}

	people.toggleView = function() {
		if (people.viewType() == 'hours') {
			people.viewType('percent');
		} else {
			people.viewType('hours');
		}
	}

	people.goToPerson = function(item) {
		app.myViewModel.peopleDetails.getPerson(item);
		app.goToView('people-details');
	}

	people.dragRefresh = function(item, event) {
		if (people.isRefreshDragging() && people.dragStart() == 0) {
			var top = $(document).scrollTop();
			var delta = Math.floor(event.gesture.distance);
			if (top == 0 && delta > 30) {
				if (delta > 150) delta = 150;
				$('#people .people').css('margin-top', delta - 30);
				if (delta >= 100) {
					$('#people .refresh').html('<span class="fa fa-arrow-circle-up"></span>Release to refresh');
				} else {
					$('#people .refresh').html('<span class="fa fa-arrow-circle-down"></span>Pull to refresh');
				}
			}
		}
	}

	people.startRefreshDrag = function(item, event) {
		if (!people.isRefreshDragging() && !app.myViewModel.header.isOpen() && people.dragStart() == 0) {
			people.dragStart($(document).scrollTop());
			people.isRefreshDragging(true);
			$(event.gesture.target).one('dragend', function(event) {
				people.isRefreshDragging(false);
				var delta = parseInt($('#people .people').css('margin-top'));
				if (delta >= 70) {
					people.getTimes();
					$('#people .refresh').html('<span class="fa fa-refresh fa-spin"></span>Refreshing...');
				} else {
					$('#people .refresh').html('<span class="fa fa-arrow-circle-down"></span>Pull to refresh');
					$('#people .people').animate({
						marginTop: 0
					}, 100);
				}
			})
		}

	}

	people.init();

	return self;
}

module.exports = People;
},{}],9:[function(require,module,exports){
/**
 * scripts/profile.js
 */

'use strict';

function Profile(app) {
	var self = this;

	var profile = app.myViewModel.profile = {};

	profile.show = ko.observable(false);


	return self;
}


module.exports = Profile;
},{}],10:[function(require,module,exports){
/**
 * scripts/rate-week.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function RateWeek(app) {
	var self = this;

	var rateWeek = app.myViewModel.rateWeek = {};

	rateWeek.registerMouseX = ko.observable();
	rateWeek.registerStartPercentage = ko.observable(0);
	rateWeek.today = moment(new Date()).startOf('isoweek');
	rateWeek.registerRatio = ko.observable($(document).width() - 20);
	rateWeek.activeWeek = ko.observable(0);
	rateWeek.viewType = ko.observable('hours');

	rateWeek.weeks = ko.observableArray([
		{
			date: ko.observable(moment(rateWeek.today).format('MMM D')),
			total: ko.computed(function() {
				var sum = _.reduce(app.myViewModel.selectProject.allProjects(), function(memo, project) {
					var colValue = 0;
					if (project.attributes.active()) {
						colValue = project.attributes.percentage()[0].value();
					}
					return memo + colValue; 
				}, 0);
				return sum;
			}),
			rating: ko.observable(2),
			notes: ko.observable(null)
		},
		{
			date: ko.observable(moment(rateWeek.today).add('days', 7).format('MMM D')),
			total: ko.computed(function() {
				var sum = _.reduce(app.myViewModel.selectProject.allProjects(), function(memo, project) {
					var colValue = 0;
					if (project.attributes.active()) {
						colValue = project.attributes.percentage()[1].value();
					}
					return memo + colValue; 
				}, 0);
				return sum;
			}),
			rating: ko.observable(2),
			notes: ko.observable(null)
		},
		{  
			date: ko.observable(moment(rateWeek.today).add('days', 14).format('MMM D')),
			total: ko.computed(function() {
				var sum = _.reduce(app.myViewModel.selectProject.allProjects(), function(memo, project) {
					var colValue = 0;
					if (project.attributes.active()) {
						colValue = project.attributes.percentage()[2].value();
					}
					return memo + colValue; 
				}, 0);
				return sum;
			}),
			rating: ko.observable(2),
			notes: ko.observable(null)
		}
	]);

	rateWeek.drag = function(item, event) {
		var direction = event.gesture.direction;
		if (direction == 'left' || direction == 'right') {
			var startX = event.gesture.startEvent.center.pageX;
			if (rateWeek.registerMouseX() != startX) {
				rateWeek.registerMouseX(startX);
				rateWeek.registerStartPercentage(item.attributes.percentage()[rateWeek.activeWeek()].value());
			}
			var diff = (event.gesture.deltaX / rateWeek.registerRatio()) * 150;
			var newPercentage = Math.floor((diff + rateWeek.registerStartPercentage()) / 5) * 5;

			if (newPercentage > 0 && newPercentage <= 150) {
				item.attributes.percentage()[rateWeek.activeWeek()].value(newPercentage);
			} else if (newPercentage > 150) {
				item.attributes.percentage()[rateWeek.activeWeek()].value(150);
			} else {
				item.attributes.percentage()[rateWeek.activeWeek()].value(0);
			}
		}
	}

	rateWeek.selectWeek = function(index) {
		rateWeek.activeWeek(index);
	}

	rateWeek.takePicture = function() {
		navigator.camera.getPicture(rateWeek.setPicture, function() {
			// fail
			alert('Oops. We couldn\'t access your camera.');
		}, { 
			quality: 100, 
			allowEdit: true, 
			destinationType: navigator.camera.DestinationType.DATA_URL,
			encodingType: Camera.EncodingType.PNG,
			targetWidth: 100,
			targetHeight: 100,
			correctOrientation: true,
			cameraDirection: Camera.Direction.FRONT
		});
	}

	rateWeek.setPicture = function(imageData) {
		$('.avatar').removeClass('fa-camera').css('background-image', 'url(data:image/png;base64,' + imageData + ')');
		Parse.Cloud.run('updateAvatar', {
			avatar: imageData
		}, {
			success: function(user) {
				alert('Avatar successfully saved.')
			}, error: function(error) {
				$('.avatar').addClass('fa-camera');
				console.log('Oops. We messed up. Please try again.');
			}
		});
	}

	rateWeek.toggleView = function() {
		if (rateWeek.viewType() == 'hours') {
			rateWeek.viewType('percent');
		} else {
			rateWeek.viewType('hours');
		}
	}

	return self;
}

module.exports = RateWeek;
},{}],11:[function(require,module,exports){
/**
 * scripts/save.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Save(app) {
	var self = this;

	var save = app.myViewModel.save = {};

	save.saveMode = ko.observable(false);
	save.success = ko.observable(false);
	save.error = ko.observable(false);
	save.saving = ko.observable(false);

	save.result = ko.observableArray();
	save.done = ko.computed(function() {
		var done = false;
		for (var i = 0; i < save.result.length; i++) {
			done = done || save.result[i];
		}
		return done;
	});

	save.submit = function() {
		app.goToView('save');
		save.saveMode(true);
		save.saving(true);
		var temp = {};
		var curWeek;
		var numWeeks = app.myViewModel.rateWeek.weeks().length;
		var projects = _.filter(app.myViewModel.selectProject.allProjects(), function(obj) {
			return obj.attributes.active();
		});
		var numProjects = projects.length;
		var today = app.myViewModel.rateWeek.today;
		var tempProject = {};
		var done = 0;

		for (var i = 0; i < numWeeks; i++) {
			curWeek = app.myViewModel.rateWeek.weeks()[i];
			temp = {
				date: moment(today).add('days', (i * 7)).format('YYYY, M, D'),
				rating: curWeek.rating(),
				notes: curWeek.notes()
			};

			var tempProjects = [];
			for (var j = 0; j < numProjects; j++) {
				tempProject = {
					id: projects[j].id,
					percentage: projects[j].attributes.percentage()[i].value()
				}
				tempProjects.push(tempProject);
			}
			temp.projects = tempProjects;

			Parse.Cloud.run('saveTime', {
				data: JSON.stringify(temp),
				date: temp.date
			}, {
				success: function(data) {
					done = done+1;
					if (done >= numWeeks && save.saving()) {
						save.success(true);
					}
				}, error: function(error) {
					console.log(error);
					save.error(true);
					save.reset();
				}
			});
		}
	}

	save.tryAgain = function() {
		save.error(false);
		save.success(false);
		save.submit();
	}

	save.reset = function() {
		save.saving(false);
		save.saveMode(false);
		save.error(false);
		save.success(false);
		app.myViewModel.steps.currentStep(0);
		app.goToView('select-project');
	}

	return self;
}

module.exports = Save;
},{}],12:[function(require,module,exports){
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

	selectProject.viewType = ko.observable('all');
	selectProject.allProjects = ko.observableArray();
	selectProject.isAddMode = ko.observable(false);
	selectProject.uniqueCompanyNames = ko.observableArray();
	selectProject.filteredProjectList = ko.observableArray();
	selectProject.isRefreshDragging = ko.observable(false);
	selectProject.dragStart = ko.observable(0);
	selectProject.count = ko.observable(0);
	selectProject.week = ko.observable('This Week');
	selectProject.show = ko.observable(false);
	selectProject.today = moment(new Date()).startOf('isoweek');

	selectProject.getProjects = function() {
		Parse.Cloud.run('getProjects', {}, {
			success: function(projects) {
				selectProject.allProjects([]);
				for (var i = 0; i < projects.length; i++) {
					projects[i].attributes.active = ko.observable(false);
					projects[i].attributes.percentage = ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }]);
					selectProject.allProjects.push(projects[i]);
				}

				$('#select-project .refresh').html('<span class="fa fa-arrow-circle-down"></span>Pull to refresh');
				selectProject.isRefreshDragging(false);
				selectProject.dragStart(0);
				$('#select-project .all-projects').animate({
					marginTop: 0
				}, 100);
			}, error: function(error) {
				console.log(error);
			}
		});

		Parse.Cloud.run('getUniqueCompanyNames', {}, {
			success: function(projects) {
				selectProject.uniqueCompanyNames(projects);
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	selectProject.goHome = function() {
		selectProject.show(false);
		app.goToView('home');
	}

	selectProject.init = function(index) {
		var styledDate = 'Week of ' + moment(selectProject.today).add('days', (index * 7)).format('MMM D');
		if (index == 0) styledDate = 'This Week';
		if (index == 1) styledDate = 'Next Week';
		selectProject.week(styledDate);
		selectProject.show(true);
		selectProject.getProjects();
	}

	selectProject.toggleProject = function(item, event) {
		if (item.attributes.active()) {
			item.attributes.active(false);
			selectProject.count(selectProject.count() - 1);
		} else {
			item.attributes.active(true);
			selectProject.count(selectProject.count() + 1);
		}
	}

	selectProject.toggleAddMode = function() {
		if (selectProject.isAddMode()) {
			app.myViewModel.header.isModal(false);
			selectProject.isAddMode(false);
		} else {
			app.myViewModel.header.isModal(true);
			$('.project-typeahead-field').val('');
			$('.project-name-field').val('');
			selectProject.filteredProjectList([]);
			selectProject.isAddMode(true);
		}
	}

	selectProject.toggleView = function() {
		if (selectProject.viewType() == 'all') {
			selectProject.viewType('selected');
		} else {
			selectProject.viewType('all');
		}
	}

	selectProject.selectProjectTypeahead = function(item) {
		$('.project-typeahead-field').val(item);
		selectProject.filteredProjectList([]);
	}

	selectProject.showTypeaheadResults = function(item, event) {
		var needle = event.target.value.toLowerCase().replace(/[^\w\d]/gi, '');

		if (needle.length > 0) {
			var filteredProjects = _.filter(selectProject.uniqueCompanyNames(), function(obj) {
				var haystack = obj.toLowerCase().replace(/[^\w\d]/gi, '');
				return haystack.indexOf(needle) >= 0; 
			});
			var fieldPosition = $('.project-typeahead-field').offset();
			$('.project-typeahead').css('left', fieldPosition.left).css('top', fieldPosition.top + $('.project-typeahead-field').height()+20);
			selectProject.filteredProjectList(filteredProjects);
		} else {
			selectProject.filteredProjectList([]);
		}
	}

	selectProject.saveNewProject = function() {
		var data = {
			company: $('.project-typeahead-field').val(),
			project: $('.project-name-field').val(),
		}
		Parse.Cloud.run('saveProject', data, {
			success: function(project) {
				alert('"' + project.attributes.company + ': ' + project.attributes.name + '" created successfully.');
				selectProject.toggleAddMode();
				selectProject.getProjects();
			}, error: function(error) {
				// alert(error)
				console.log(error);
			}
		});	
	}

	selectProject.dragRefresh = function(item, event) {
		if (selectProject.isRefreshDragging() && selectProject.dragStart() == 0) {
			var top = $('#select-project .all-projects').scrollTop();
			var delta = Math.floor(event.gesture.distance);
			if (top == 0 && delta > 30) {
				if (delta > 150) delta = 150;
				$('#select-project .all-projects').css('margin-top', delta - 30);
				if (delta >= 100) {
					$('#select-project .refresh').html('<span class="fa fa-arrow-circle-up"></span>Release to refresh');
				} else {
					$('#select-project .refresh').html('<span class="fa fa-arrow-circle-down"></span>Pull to refresh');
				}
			}
		}
	}

	selectProject.startRefreshDrag = function(item, event) {
		if (!selectProject.isRefreshDragging() && selectProject.dragStart() == 0) {
			selectProject.dragStart($('#select-project .all-projects').scrollTop());
			selectProject.isRefreshDragging(true);
			$(event.gesture.target).one('dragend', function(event) {
				var delta = parseInt($('#select-project .all-projects').css('margin-top'));

				if (delta >= 70) {
					selectProject.getProjects();
					$('#select-project .refresh').html('<span class="fa fa-refresh fa-spin"></span>Refreshing...');
				} else {
					$('#select-project .refresh').html('<span class="fa fa-arrow-circle-down"></span>Pull to refresh');
					selectProject.isRefreshDragging(false);
					selectProject.dragStart(0);
					$('#select-project .all-projects').animate({
						marginTop: 0
					}, 100);
				}
			})
		}

	}

	selectProject.init();

	return self;
}

module.exports = SelectProject;
},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2FsZXJ0cy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvYXBwLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9hdXRoLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9mYWtlXzZhMzdkOGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2hvbWUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL25vdGVzLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9wZW9wbGUtZGV0YWlscy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcGVvcGxlLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9wcm9maWxlLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9yYXRlLXdlZWsuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3NhdmUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3NlbGVjdC1wcm9qZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogc2NyaXB0cy9ub3Rlcy5qc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQWxlcnRzKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGFsZXJ0cyA9IGFwcC5teVZpZXdNb2RlbC5hbGVydHMgPSB7fTtcblxuXHRhbGVydHMubGlzdCA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRhbGVydHMubGlzdC5wdXNoKCdhc2RmJylcblx0YWxlcnRzLnNob3cgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWxlcnRzOyIsIi8qKlxuICogc2NyaXB0cy9hcHAuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQXBwKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0Ly8gaW5pdGlhbGl6ZSBrbm9ja291dFxuXHRzZWxmLm15Vmlld01vZGVsID0ge307XG5cblx0c2VsZi5teVZpZXdNb2RlbC5hY3RpdmVWaWV3ID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0c2VsZi5teVZpZXdNb2RlbC52aWV3cyA9IFtcblx0XHQnYXV0aCcsXG5cdFx0J2hvbWUnLFxuXHRcdCdzZWxlY3QtcHJvamVjdCcsXG5cdFx0J3JhdGUtd2VlaycsXG5cdFx0J25vdGVzJyxcblx0XHQncGVvcGxlJyxcblx0XHQncGVvcGxlLWRldGFpbHMnLFxuXHRcdCdzYXZlJ1xuXHRdO1xuXG5cdHNlbGYubXlWaWV3TW9kZWwubnVtV2Vla3MgPSAzO1xuXHRzZWxmLm15Vmlld01vZGVsLnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0c2VsZi5teVZpZXdNb2RlbC53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXG5cdHNlbGYuZ29Ub1ZpZXcgPSBmdW5jdGlvbih2aWV3KSB7XG5cdFx0dmFyIGluZGV4ID0gc2VsZi5teVZpZXdNb2RlbC52aWV3cy5pbmRleE9mKHZpZXcpO1xuXHRcdHNlbGYubXlWaWV3TW9kZWwuYWN0aXZlVmlldyhpbmRleCk7XG5cdH1cblxuXHRzZWxmLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdkZXZpY2VyZWFkeScsIHNlbGYub25EZXZpY2VSZWFkeSwgZmFsc2UpO1xuXHR9XG5cblx0c2VsZi5vbkRldmljZVJlYWR5ID0gZnVuY3Rpb24oKSB7XG5cdFx0a28uYXBwbHlCaW5kaW5ncyhzZWxmLm15Vmlld01vZGVsKTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKG5hdmlnYXRvci5zcGxhc2hzY3JlZW4pIHtcblx0XHRcdFx0bmF2aWdhdG9yLnNwbGFzaHNjcmVlbi5oaWRlKCk7XG5cdFx0XHR9XG5cdFx0fSwgMjAwMCk7XG5cdFx0XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBcHA7IiwiLyoqXG4gKiBzY3JpcHRzL2F1dGguanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQXV0aChhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBhdXRoID0gYXBwLm15Vmlld01vZGVsLmF1dGggPSB7fTtcblxuXHRhdXRoLmN1cnJlbnRVc2VyID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRhdXRoLmVycm9yTWVzc2FnZSA9IGtvLm9ic2VydmFibGUoJycpO1xuXHRhdXRoLnNpZ25VcE1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0YXV0aC5zaWduSW5Nb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGF1dGguZm9yZ290TW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cdHZhciBjdXJyZW50VXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuXHRpZiAoY3VycmVudFVzZXIpIHtcblx0XHRhdXRoLmN1cnJlbnRVc2VyKGN1cnJlbnRVc2VyKTtcblx0fVxuXG5cdGF1dGguaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChhdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHRcdGFwcC5nb1RvVmlldygnaG9tZScpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhcHAuZ29Ub1ZpZXcoJ2F1dGgnKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLnJlc2V0RXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLmVycm9yTWVzc2FnZSgnJyk7XG5cdH1cblxuXHRhdXRoLnNpZ25JblVwID0gZnVuY3Rpb24oZm9ybUVsZW1lbnQpIHtcblx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblxuXHRcdHZhciB1c2VybmFtZSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9lbWFpbF0nKS52YWwoKTtcblx0XHR2YXIgcGFzc3dvcmQgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfcGFzc3dvcmRdJykudmFsKCk7XG5cblx0XHRpZiAoYXV0aC5zaWduVXBNb2RlKCkpIHtcblx0XHRcdHZhciBkaXNwbGF5TmFtZSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9kaXNwbGF5TmFtZV0nKS52YWwoKTtcblx0XHRcdHZhciBwYXNzd29yZENvbmZpcm0gPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfY29uZmlybVBhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0XHQvLyB2YWxpZGF0aW9uXG5cdFx0XHRpZiAodXNlcm5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZW1haWwgYWRkcmVzcy4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZGlzcGxheU5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZmlyc3QgYW5kIGxhc3QgbmFtZS4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocGFzc3dvcmQubGVuZ3RoIDwgMSB8fCBwYXNzd29yZENvbmZpcm0gPCAxIHx8IHBhc3N3b3JkICE9IHBhc3N3b3JkQ29uZmlybSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIGFuZCBjb25maXJtIGEgcGFzc3dvcmQuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHVzZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuXHRcdFx0dmFyIHNjcnViYmVkVXNlcm5hbWUgPSB1c2VybmFtZS5yZXBsYWNlKC9cXHMrL2csXCJcIik7IC8vcmVtb3ZlIHdoaXRlIHNwYWNlXG5cdFx0XHRzY3J1YmJlZFVzZXJuYW1lID0gc2NydWJiZWRVc2VybmFtZS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHR1c2VyLnNldCgndXNlcm5hbWUnLCBzY3J1YmJlZFVzZXJuYW1lKTtcblx0XHRcdHVzZXIuc2V0KCdwYXNzd29yZCcsIHBhc3N3b3JkKTtcblx0XHRcdHVzZXIuc2V0KCdlbWFpbCcsIHNjcnViYmVkVXNlcm5hbWUpO1xuXHRcdFx0dXNlci5zZXQoJ2Rpc3BsYXlOYW1lJywgZGlzcGxheU5hbWUpO1xuXG5cdFx0XHR1c2VyLnNpZ25VcChudWxsLCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0XHRhdXRoLmN1cnJlbnRVc2VyKHVzZXIpO1xuXHRcdFx0XHRcdGFwcC5nb1RvVmlldygnaG9tZScpO1xuXHRcdFx0XHRcdGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmluaXQoKTtcblx0XHRcdFx0XHRhdXRoLnJlc2V0Vmlld3MoKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0UGFyc2UuVXNlci5sb2dJbih1c2VybmFtZSwgcGFzc3dvcmQsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRcdGF1dGguY3VycmVudFVzZXIodXNlcik7XG5cdFx0XHRcdFx0YXBwLmdvVG9WaWV3KCdob21lJyk7XG5cdFx0XHRcdFx0YXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuaW5pdCgpO1xuXHRcdFx0XHRcdGF1dGgucmVzZXRWaWV3cygpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHQvLyBUaGUgbG9naW4gZmFpbGVkLiBDaGVjayBlcnJvciB0byBzZWUgd2h5LlxuXHRcdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguZm9yZ290ID0gZnVuY3Rpb24oZm9ybUVsZW1lbnQpIHtcblx0XHR2YXIgZW1haWwgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZm9yZ290XScpLnZhbCgpO1xuXG5cdFx0aWYgKGVtYWlsLmxlbmd0aCA8PSAwKSB7XG5cdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIGFuIGVtYWlsIGFkZHJlc3MuJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdFBhcnNlLlVzZXIucmVxdWVzdFBhc3N3b3JkUmVzZXQoZW1haWwsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0XHRcdFx0XHQkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZm9yZ290XScpLnZhbCgnJyk7XG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBjaGVjayB5b3VyIGVtYWlsIGZvciBpbnN0cnVjdGlvbnMgb24gcmVzZXR0aW5nIHlvdXIgcGFzc3dvcmQuJyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5yZXNldEVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5lcnJvck1lc3NhZ2UoJycpO1xuXHR9XG5cblx0YXV0aC5sb2dvdXQgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsuYWN0aXZlV2VlaygwKTtcblx0XHRhcHAubXlWaWV3TW9kZWwucHJvZmlsZS5zaG93KGZhbHNlKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ2F1dGgnKTtcblx0XHRQYXJzZS5Vc2VyLmxvZ091dCgpO1xuXHRcdGF1dGguY3VycmVudFVzZXIobnVsbCk7XG5cdFx0YXV0aC5yZXNldFZpZXdzKCk7XG5cdH1cblxuXHRhdXRoLnJlc2V0Vmlld3MgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblx0XHRhdXRoLnNpZ25Jbk1vZGUoZmFsc2UpO1xuXHRcdGF1dGguc2lnblVwTW9kZShmYWxzZSk7XG5cdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0fVxuXG5cdGF1dGgudG9nZ2xlU2lnbkluID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGF1dGguc2lnbkluTW9kZSgpKSB7XG5cdFx0XHRhdXRoLnNpZ25Jbk1vZGUoZmFsc2UpO1xuXHRcdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGF1dGguc2lnbkluTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLnRvZ2dsZVNpZ25VcCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChhdXRoLnNpZ25VcE1vZGUoKSkge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKGZhbHNlKTtcblx0XHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC50b2dnbGVGb3Jnb3QgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoYXV0aC5mb3Jnb3RNb2RlKCkpIHtcblx0XHRcdGF1dGguZm9yZ290TW9kZShmYWxzZSk7XG5cdFx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXV0aC5mb3Jnb3RNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguc2FuaXRpemVFcnJvcnMgPSBmdW5jdGlvbihlcnJvcikge1xuXHRcdHN3aXRjaChlcnJvci5jb2RlKVxuXHRcdHtcblx0XHRcdGNhc2UgMTAxOlxuXHRcdFx0XHRyZXR1cm4gJ1BsZWFzZSBlbnRlciBhIHZhbGlkIHVzZXJuYW1lIGFuZCBwYXNzd29yZC4nO1xuXHRcdFx0Y2FzZSAxMjQ6XG5cdFx0XHRcdHJldHVybiAnT29wcyEgV2UgbWVzc2VkIHVwLiBQbGVhc2UgdHJ5IGFnYWluLic7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gZXJyb3IubWVzc2FnZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGVycm9yLm1lc3NhZ2Uuc2xpY2UoMSkgKyAnLic7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0aDsiLCIvKipcbiAqIHNjcmlwdHMvbWFpbi5qc1xuICpcbiAqIFRoaXMgaXMgdGhlIHN0YXJ0aW5nIHBvaW50IGZvciB5b3VyIGFwcGxpY2F0aW9uLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXBwID0gcmVxdWlyZSgnLi9hcHAuanMnKTtcbnZhciBBdXRoID0gcmVxdWlyZSgnLi9hdXRoLmpzJyk7XG52YXIgU2VsZWN0UHJvamVjdCA9IHJlcXVpcmUoJy4vc2VsZWN0LXByb2plY3QuanMnKTtcbnZhciBSYXRlV2VlayA9IHJlcXVpcmUoJy4vcmF0ZS13ZWVrLmpzJyk7XG52YXIgTm90ZXMgPSByZXF1aXJlKCcuL25vdGVzLmpzJyk7XG52YXIgUGVvcGxlID0gcmVxdWlyZSgnLi9wZW9wbGUuanMnKTtcbnZhciBTYXZlID0gcmVxdWlyZSgnLi9zYXZlLmpzJyk7XG52YXIgUGVvcGxlRGV0YWlscyA9IHJlcXVpcmUoJy4vcGVvcGxlLWRldGFpbHMuanMnKTtcbnZhciBIb21lID0gcmVxdWlyZSgnLi9ob21lLmpzJyk7XG52YXIgQWxlcnRzID0gcmVxdWlyZSgnLi9hbGVydHMuanMnKTtcbnZhciBQcm9maWxlID0gcmVxdWlyZSgnLi9wcm9maWxlLmpzJyk7XG5cbi8vIGluaXRpYWxpemUgcGFyc2VcblBhcnNlLmluaXRpYWxpemUoXCJKa1lOZlBCdzJhUGdjYzdQZVRHSE1BVTJYS3ZqemVxVklreUNsVnVvXCIsIFwiNDVPTVUzWlMzbzVjMTY4bFF4YTBpbHhRdTRGZE1WSFQxTlZUa09SbFwiKTtcblxuLy8gaW5pdGlhbGl6ZSB0eXBla2l0XG4oZnVuY3Rpb24oZCkge1xudmFyIGNvbmZpZyA9IHtcbiAga2l0SWQ6ICdhZWU2amdxJyxcbiAgc2NyaXB0VGltZW91dDogMzAwMFxufSxcbmg9ZC5kb2N1bWVudEVsZW1lbnQsdD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7aC5jbGFzc05hbWU9aC5jbGFzc05hbWUucmVwbGFjZSgvXFxid2YtbG9hZGluZ1xcYi9nLFwiXCIpK1wiIHdmLWluYWN0aXZlXCI7fSxjb25maWcuc2NyaXB0VGltZW91dCksdGs9ZC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpLGY9ZmFsc2Uscz1kLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpWzBdLGE7aC5jbGFzc05hbWUrPVwiIHdmLWxvYWRpbmdcIjt0ay5zcmM9Jy8vdXNlLnR5cGVraXQubmV0LycrY29uZmlnLmtpdElkKycuanMnO3RrLmFzeW5jPXRydWU7dGsub25sb2FkPXRrLm9ucmVhZHlzdGF0ZWNoYW5nZT1mdW5jdGlvbigpe2E9dGhpcy5yZWFkeVN0YXRlO2lmKGZ8fGEmJmEhPVwiY29tcGxldGVcIiYmYSE9XCJsb2FkZWRcIilyZXR1cm47Zj10cnVlO2NsZWFyVGltZW91dCh0KTt0cnl7VHlwZWtpdC5sb2FkKGNvbmZpZyl9Y2F0Y2goZSl7fX07cy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0ayxzKVxufSkoZG9jdW1lbnQpO1xuXG52YXIgYXBwID0gbmV3IEFwcCgpO1xudmFyIGF1dGggPSBuZXcgQXV0aChhcHApO1xudmFyIGhvbWUgPSBuZXcgSG9tZShhcHApO1xudmFyIHNlbGVjdFByb2plY3QgPSBuZXcgU2VsZWN0UHJvamVjdChhcHApO1xudmFyIHJhdGVXZWVrID0gbmV3IFJhdGVXZWVrKGFwcCk7XG52YXIgbm90ZXMgPSBuZXcgTm90ZXMoYXBwKTtcbnZhciBwZW9wbGUgPSBuZXcgUGVvcGxlKGFwcCk7XG52YXIgc2F2ZSA9IG5ldyBTYXZlKGFwcCk7XG52YXIgcGVvcGxlRGV0YWlscyA9IG5ldyBQZW9wbGVEZXRhaWxzKGFwcCk7XG52YXIgYWxlcnRzID0gbmV3IEFsZXJ0cyhhcHApO1xudmFyIHByb2ZpbGUgPSBuZXcgUHJvZmlsZShhcHApO1xuXG4vLyBDdXN0b20ga25vY2tvdXQgZXh0ZW5kZXJzXG5cbi8vIEhlcmUncyBhIGN1c3RvbSBLbm9ja291dCBiaW5kaW5nIHRoYXQgbWFrZXMgZWxlbWVudHMgc2hvd24vaGlkZGVuIHZpYSBqUXVlcnkncyBmYWRlSW4oKS9mYWRlT3V0KCkgbWV0aG9kc1xuLy8gQ291bGQgYmUgc3RvcmVkIGluIGEgc2VwYXJhdGUgdXRpbGl0eSBsaWJyYXJ5XG5rby5iaW5kaW5nSGFuZGxlcnMuZmFkZVZpc2libGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBJbml0aWFsbHkgc2V0IHRoZSBlbGVtZW50IHRvIGJlIGluc3RhbnRseSB2aXNpYmxlL2hpZGRlbiBkZXBlbmRpbmcgb24gdGhlIHZhbHVlXG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgJChlbGVtZW50KS50b2dnbGUoa28udW53cmFwKHZhbHVlKSk7IC8vIFVzZSBcInVud3JhcE9ic2VydmFibGVcIiBzbyB3ZSBjYW4gaGFuZGxlIHZhbHVlcyB0aGF0IG1heSBvciBtYXkgbm90IGJlIG9ic2VydmFibGVcbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBXaGVuZXZlciB0aGUgdmFsdWUgc3Vic2VxdWVudGx5IGNoYW5nZXMsIHNsb3dseSBmYWRlIHRoZSBlbGVtZW50IGluIG9yIG91dFxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgIGtvLnVud3JhcCh2YWx1ZSkgPyAkKGVsZW1lbnQpLmZhZGVJbigpIDogJChlbGVtZW50KS5mYWRlT3V0KCk7XG4gICAgfVxufVxuXG5rby5iaW5kaW5nSGFuZGxlcnMuc2xpZGVQYW5lbFZpc2libGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBJbml0aWFsbHkgc2V0IHRoZSBlbGVtZW50IHRvIGJlIGluc3RhbnRseSB2aXNpYmxlL2hpZGRlbiBkZXBlbmRpbmcgb24gdGhlIHZhbHVlXG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgLy8gJChlbGVtZW50KS50b2dnbGUoa28udW53cmFwKHZhbHVlKSk7IC8vIFVzZSBcInVud3JhcE9ic2VydmFibGVcIiBzbyB3ZSBjYW4gaGFuZGxlIHZhbHVlcyB0aGF0IG1heSBvciBtYXkgbm90IGJlIG9ic2VydmFibGVcbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBXaGVuZXZlciB0aGUgdmFsdWUgc3Vic2VxdWVudGx5IGNoYW5nZXMsIHNsb3dseSBmYWRlIHRoZSBlbGVtZW50IGluIG9yIG91dFxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgIGlmIChrby51bndyYXAodmFsdWUpKSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLmFkZENsYXNzKCdvcGVuJykuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlM2QoMCwwLDApJykuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB2aWV3cG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcbiAgICAgICAgICAgICQoZWxlbWVudCkucmVtb3ZlQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgwLCcgKyB2aWV3cG9ydEhlaWdodCArICdweCwwKScpLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmtvLmJpbmRpbmdIYW5kbGVycy5zaGlmdFBhbmVsVmlzaWJsZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAvLyAkKGVsZW1lbnQpLnRvZ2dsZShrby51bndyYXAodmFsdWUpKTsgLy8gVXNlIFwidW53cmFwT2JzZXJ2YWJsZVwiIHNvIHdlIGNhbiBoYW5kbGUgdmFsdWVzIHRoYXQgbWF5IG9yIG1heSBub3QgYmUgb2JzZXJ2YWJsZVxuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIFdoZW5ldmVyIHRoZSB2YWx1ZSBzdWJzZXF1ZW50bHkgY2hhbmdlcywgc2xvd2x5IGZhZGUgdGhlIGVsZW1lbnQgaW4gb3Igb3V0XG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgaWYgKGtvLnVud3JhcCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgwJSwwLDApJykuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB2aWV3cG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcbiAgICAgICAgICAgICQoZWxlbWVudCkucmVtb3ZlQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgxMDAlLDAsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5hcHAuaW5pdGlhbGl6ZSgpOyIsIi8qKlxuICogc2NyaXB0cy9ub3Rlcy5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBIb21lKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGhvbWUgPSBhcHAubXlWaWV3TW9kZWwuaG9tZSA9IHt9O1xuXG5cdGhvbWUudG90YWxzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdGhvbWUuaXNSZWZyZXNoRHJhZ2dpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0aG9tZS5kcmFnU3RhcnQgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRob21lLnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0aG9tZS53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXG5cdGhvbWUuc2hvd0FsZXJ0cyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5hbGVydHMuc2hvdyh0cnVlKTtcblx0fVxuXG5cdGhvbWUuc2hvd1Byb2ZpbGUgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAubXlWaWV3TW9kZWwucHJvZmlsZS5zaG93KHRydWUpO1xuXHR9XG5cblx0aG9tZS5zdHlsZVdlZWsgPSBmdW5jdGlvbihpbmRleCkge1xuXG5cdFx0dmFyIHN0eWxlZERhdGUgPSAnV2VlayBvZiAnICsgbW9tZW50KGhvbWUudG9kYXkpLnN0YXJ0T2YoJ2lzb3dlZWsnKS5hZGQoJ2RheXMnLCAoaW5kZXggKiA3KSkuZm9ybWF0KCdNTU0gRCcpO1xuXHRcdGlmIChpbmRleCA9PSAwKSB7IHN0eWxlZERhdGUgPSAnVGhpcyB3ZWVrJyB9O1xuXHRcdGlmIChpbmRleCA9PSAxKSB7IHN0eWxlZERhdGUgPSAnTmV4dCB3ZWVrJyB9O1xuXHRcdHJldHVybiBzdHlsZWREYXRlO1xuXHR9XG5cblx0aG9tZS5XZWVrID0gZnVuY3Rpb24obWlzc2luZ1dlZWspIHtcblx0XHR2YXIgYmxhbmtXZWVrID0ge1xuXHRcdFx0bm90ZXM6ICcnLFxuXHRcdFx0cmF0aW5nOiAtMSxcblx0XHRcdHRvdGFsOiAtMSxcblx0XHRcdHdlZWs6IGhvbWUud2Vla3MoKVttaXNzaW5nV2Vla11cblx0XHR9O1xuXHRcdHJldHVybiBibGFua1dlZWs7XG5cdH1cblxuXHRob21lLmdvID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5pbml0KGluZGV4KTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3NlbGVjdC1wcm9qZWN0Jyk7XG5cdH1cblxuXHRob21lLmNvbnZlcnROdW1Ub1dvcmRzID0gZnVuY3Rpb24obnVtYmVyKSB7XG5cdFx0c3dpdGNoIChudW1iZXIpIHtcblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0cmV0dXJuICd6ZXJvJztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0cmV0dXJuICdvbmUnO1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRyZXR1cm4gJ3R3byc7XG5cdFx0XHRjYXNlIDM6XG5cdFx0XHRcdHJldHVybiAndGhyZWUnO1xuXHRcdFx0Y2FzZSA0OlxuXHRcdFx0XHRyZXR1cm4gJ2ZvdXInO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuICd1bmtub3duJztcblx0XHR9XG5cdH1cblxuXHRob21lLmdldFRvdGFsc0FuZFJhdGluZyA9IGZ1bmN0aW9uKCkge1xuXHRcdGhvbWUud2Vla3MoW10pO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXBwLm15Vmlld01vZGVsLm51bVdlZWtzOyBpKyspIHtcblx0XHRcdGhvbWUud2Vla3MucHVzaChtb21lbnQoaG9tZS50b2RheSkuc3RhcnRPZignaXNvd2VlaycpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpKTtcblx0XHR9XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRUb3RhbHNBbmRSYXRpbmcnLCB7XG5cdFx0XHR3ZWVrczogaG9tZS53ZWVrcygpXG5cdFx0fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24odG90YWxzQW5kUmF0aW5nKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSB0b3RhbHNBbmRSYXRpbmcubGVuZ3RoOyBpIDwgYXBwLm15Vmlld01vZGVsLm51bVdlZWtzOyBpKyspIHtcblx0XHRcdFx0XHQvLyBhZGQgYmxhbmsgZW50cmllcyB0byB0aGUgcmVzdWx0c1xuXHRcdFx0XHRcdHRvdGFsc0FuZFJhdGluZy5wdXNoKGhvbWUuV2VlayhpKSk7XG5cdFx0XHRcdFx0JCgnI2hvbWUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPiBQdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0XHRob21lLmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0XHRob21lLmRyYWdTdGFydCgwKTtcblx0XHRcdFx0XHQkKCcjaG9tZSAucGFnZScpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdFx0fSwgMTAwKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRob21lLnRvdGFscyh0b3RhbHNBbmRSYXRpbmcpO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGhvbWUuZHJhZ1JlZnJlc2ggPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmIChob21lLmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgaG9tZS5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHR2YXIgdG9wID0gJChkb2N1bWVudCkuc2Nyb2xsVG9wKCk7XG5cdFx0XHR2YXIgZGVsdGEgPSBNYXRoLmZsb29yKGV2ZW50Lmdlc3R1cmUuZGlzdGFuY2UpO1xuXHRcdFx0aWYgKHRvcCA9PSAwICYmIGRlbHRhID4gMzApIHtcblx0XHRcdFx0aWYgKGRlbHRhID4gMTUwKSBkZWx0YSA9IDE1MDtcblx0XHRcdFx0JCgnI2hvbWUgLnBhZ2UnKS5jc3MoJ21hcmdpbi10b3AnLCBkZWx0YSAtIDMwKTtcblx0XHRcdFx0aWYgKGRlbHRhID49IDEwMCkge1xuXHRcdFx0XHRcdCQoJyNob21lIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtdXBcIj48L3NwYW4+IFJlbGVhc2UgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNob21lIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj4gUHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRob21lLnN0YXJ0UmVmcmVzaERyYWcgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmICghaG9tZS5pc1JlZnJlc2hEcmFnZ2luZygpICYmIGhvbWUuZHJhZ1N0YXJ0KCkgPT0gMCkge1xuXHRcdFx0aG9tZS5kcmFnU3RhcnQoJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO1xuXHRcdFx0aG9tZS5pc1JlZnJlc2hEcmFnZ2luZyh0cnVlKTtcblx0XHRcdCQoZXZlbnQuZ2VzdHVyZS50YXJnZXQpLm9uZSgnZHJhZ2VuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHZhciBkZWx0YSA9IHBhcnNlSW50KCQoJyNob21lIC5wYWdlJykuY3NzKCdtYXJnaW4tdG9wJykpO1xuXG5cdFx0XHRcdGlmIChkZWx0YSA+PSA3MCkge1xuXHRcdFx0XHRcdGhvbWUuZ2V0VG90YWxzQW5kUmF0aW5nKCk7XG5cdFx0XHRcdFx0JCgnI2hvbWUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpblwiPjwvc3Bhbj4gUmVmcmVzaGluZy4uLicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNob21lIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj4gUHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdFx0aG9tZS5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdFx0aG9tZS5kcmFnU3RhcnQoMCk7XG5cdFx0XHRcdFx0JCgnI2hvbWUgLnBhZ2UnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0aG9tZS5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aG9tZS5nZXRUb3RhbHNBbmRSYXRpbmcoKTtcblx0fVxuXG5cdGlmIChhcHAubXlWaWV3TW9kZWwuYXV0aC5jdXJyZW50VXNlcigpKSB7XG5cdFx0aG9tZS5pbml0KCk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEhvbWU7IiwiLyoqXG4gKiBzY3JpcHRzL25vdGVzLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIE5vdGVzKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIG5vdGVzID0gYXBwLm15Vmlld01vZGVsLm5vdGVzID0ge307XG5cdG5vdGVzLnN0YXR1c09wdGlvbnMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuXHRcdHtcblx0XHRcdGxhYmVsOiAnQnJpbmcgb24gdGhlIHdvcmsnLFxuXHRcdFx0dmFsdWU6IDAsXG5cdFx0XHRpY29uOiAnZW1vamktMS5zdmcnXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRsYWJlbDogJ0lcXCdtIGEgbGl0dGxlIGxpZ2h0Jyxcblx0XHRcdHZhbHVlOiAxLFxuXHRcdFx0aWNvbjogJ2Vtb2ppLTIuc3ZnJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bGFiZWw6ICdMaWZlIGlzIGdvb2QnLFxuXHRcdFx0dmFsdWU6IDIsXG5cdFx0XHRpY29uOiAnZW1vamktMy5zdmcnXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRsYWJlbDogJ0lcXCdtIGEgYml0IG92ZXJ3aGVsbWVkJyxcblx0XHRcdHZhbHVlOiAzLFxuXHRcdFx0aWNvbjogJ2Vtb2ppLTQuc3ZnJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bGFiZWw6ICdTdG9wIHRoZSBtYWRuZXNzIScsXG5cdFx0XHR2YWx1ZTogNCxcblx0XHRcdGljb246ICdlbW9qaS01LnN2Zydcblx0XHR9XG5cdF0pO1xuXG5cdG5vdGVzLnNlbGVjdFN0YXR1cyA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsud2Vla3MoKVthcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsuYWN0aXZlV2VlaygpXS5yYXRpbmcoaXRlbS52YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGVzOyIsIi8qKlxuICogc2NyaXB0cy9wZW9wbGUtZGV0YWlscy5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQZW9wbGVEZXRhaWxzKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHBlb3BsZURldGFpbHMgPSBhcHAubXlWaWV3TW9kZWwucGVvcGxlRGV0YWlscyA9IHt9O1xuXG5cdHBlb3BsZURldGFpbHMucGVyc29uID0ga28ub2JzZXJ2YWJsZShudWxsKTtcblx0cGVvcGxlRGV0YWlscy53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG5cdHBlb3BsZURldGFpbHMudG90YWxzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKTtcblxuXHRwZW9wbGVEZXRhaWxzLmdldFBlcnNvbiA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRwZW9wbGVEZXRhaWxzLnRvdGFscyhbXSk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcHAubXlWaWV3TW9kZWwucGVvcGxlLm51bVdlZWtzOyBpKyspIHtcblx0XHRcdHZhciBwZXJzb24gPSBfLmZpbmQoYXBwLm15Vmlld01vZGVsLnBlb3BsZS50aW1lcygpW2ldLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdFx0cmV0dXJuIG9iai5hdHRyaWJ1dGVzLnVzZXIuaWQgPT0gaXRlbS5hdHRyaWJ1dGVzLnVzZXIuaWQ7XG5cdFx0XHR9KTtcblx0XHRcdHBlb3BsZURldGFpbHMudG90YWxzLnB1c2gocGVyc29uKTtcblx0XHR9XG5cblx0XHRwZW9wbGVEZXRhaWxzLnBlcnNvbihpdGVtKTtcblx0fVxuXG5cdHBlb3BsZURldGFpbHMuZ29CYWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLmdvVG9WaWV3KCdwZW9wbGUnKTtcblx0fVxuXG5cdHBlb3BsZURldGFpbHMuZ2V0Q29tcGFueU5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBuYW1lID0gJyc7XG5cdFx0dmFyIHByb2plY3QgPSBfLmZpbmQoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRyZXR1cm4gb2JqLmlkID09IGlkO1xuXHRcdH0pO1xuXG5cdFx0aWYgKHR5cGVvZiBwcm9qZWN0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0bmFtZSA9IHByb2plY3QuYXR0cmlidXRlcy5jb21wYW55O1xuXHRcdH1cblx0XHRyZXR1cm4gbmFtZTtcblx0fVxuXG5cdHBlb3BsZURldGFpbHMuZ2V0UHJvamVjdE5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBuYW1lID0gJyc7XG5cdFx0dmFyIHByb2plY3QgPSBfLmZpbmQoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRyZXR1cm4gb2JqLmlkID09IGlkO1xuXHRcdH0pO1xuXG5cdFx0aWYgKHR5cGVvZiBwcm9qZWN0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0bmFtZSA9IHByb2plY3QuYXR0cmlidXRlcy5uYW1lO1xuXHRcdH1cblx0XHRyZXR1cm4gbmFtZTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBlb3BsZURldGFpbHM7IiwiLyoqXG4gKiBzY3JpcHRzL3Blb3BsZS5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQZW9wbGUoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcGVvcGxlID0gYXBwLm15Vmlld01vZGVsLnBlb3BsZSA9IHt9O1xuXG5cdHBlb3BsZS5udW1XZWVrcyA9IDM7XG5cdHBlb3BsZS50b2RheSA9IG1vbWVudChuZXcgRGF0ZSgpKS5zdGFydE9mKCdpc293ZWVrJyk7XG5cdHBlb3BsZS5hY3RpdmVXZWVrID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cGVvcGxlLmFjdGl2ZVBlcnNvbiA9IGtvLm9ic2VydmFibGUoKTtcblx0cGVvcGxlLnZpZXdUeXBlID0ga28ub2JzZXJ2YWJsZSgnaG91cnMnKTtcblx0cGVvcGxlLnRpbWVzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHBlb3BsZS53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0cGVvcGxlLmRyYWdTdGFydCA9IGtvLm9ic2VydmFibGUoMCk7XG5cblx0cGVvcGxlLmdldFRpbWVzID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRhdGVzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0ZGF0ZXMucHVzaChtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ1lZWVksIE0sIEQnKSk7XG5cdFx0XHRwZW9wbGUud2Vla3MoKVtpXS5kYXRlKG1vbWVudChwZW9wbGUudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnTU1NIEQnKSk7XG5cdFx0fVxuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0VGltZXMnLCB7XG5cdFx0XHRkYXRlczogZGF0ZXNcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih0aW1lcykge1xuXHRcdFx0XHRwZW9wbGUudGltZXMoW10pO1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHRpbWVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0dGltZXNbal0uYXR0cmlidXRlcy5kYXRhID0gJC5wYXJzZUpTT04odGltZXNbal0uYXR0cmlidXRlcy5kYXRhKTtcblx0XHRcdFx0XHR2YXIgdG90YWwgPSBfKHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YS5wcm9qZWN0cykucmVkdWNlKGZ1bmN0aW9uKGFjYywgb2JqKSB7XG5cdFx0XHRcdFx0XHRfKG9iaikuZWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7IGFjY1trZXldID0gKGFjY1trZXldID8gYWNjW2tleV0gOiAwKSArIHZhbHVlIH0pO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdFx0XHR9LCB7fSk7XG5cblx0XHRcdFx0XHR0aW1lc1tqXS5hdHRyaWJ1dGVzLnRvdGFsID0ga28ub2JzZXJ2YWJsZSh0b3RhbC5wZXJjZW50YWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBlb3BsZS5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHRcdFx0dmFyIHdlZWtEYXRlID0gbW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJyk7XG5cdFx0XHRcdFx0dmFyIHdlZWsgPSBfLmZpbHRlcih0aW1lcywgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb2JqLmF0dHJpYnV0ZXMuZGF0YS5kYXRlID09IHdlZWtEYXRlO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0dmFyIHNvcnRlZCA9IF8uc29ydEJ5KHdlZWssIGZ1bmN0aW9uKG9iail7IFxuXHRcdFx0XHRcdFx0cmV0dXJuIC1vYmouYXR0cmlidXRlcy50b3RhbCgpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0cGVvcGxlLnRpbWVzLnB1c2goc29ydGVkKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0cGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0cGVvcGxlLmRyYWdTdGFydCgwKTtcblx0XHRcdFx0JCgnI3Blb3BsZSAucGVvcGxlJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cGVvcGxlLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBlb3BsZS5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHR2YXIgd2VlayA9IHtcblx0XHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ01NTSBEJykpXG5cdFx0XHR9XG5cdFx0XHRwZW9wbGUud2Vla3MucHVzaCh3ZWVrKTtcblx0XHR9XG5cdFx0cGVvcGxlLmdldFRpbWVzKCk7XG5cdH1cblxuXHRwZW9wbGUuc2VsZWN0V2VlayA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0cGVvcGxlLmFjdGl2ZVdlZWsoaW5kZXgpO1xuXHRcdC8vIGdvIGdldCB0aGUgZGF0YSBmb3IgdGhpcyB3ZWVrXG5cdH1cblxuXHRwZW9wbGUudG9nZ2xlVmlldyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChwZW9wbGUudmlld1R5cGUoKSA9PSAnaG91cnMnKSB7XG5cdFx0XHRwZW9wbGUudmlld1R5cGUoJ3BlcmNlbnQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGVvcGxlLnZpZXdUeXBlKCdob3VycycpO1xuXHRcdH1cblx0fVxuXG5cdHBlb3BsZS5nb1RvUGVyc29uID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5wZW9wbGVEZXRhaWxzLmdldFBlcnNvbihpdGVtKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3Blb3BsZS1kZXRhaWxzJyk7XG5cdH1cblxuXHRwZW9wbGUuZHJhZ1JlZnJlc2ggPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmIChwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiBwZW9wbGUuZHJhZ1N0YXJ0KCkgPT0gMCkge1xuXHRcdFx0dmFyIHRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpO1xuXHRcdFx0dmFyIGRlbHRhID0gTWF0aC5mbG9vcihldmVudC5nZXN0dXJlLmRpc3RhbmNlKTtcblx0XHRcdGlmICh0b3AgPT0gMCAmJiBkZWx0YSA+IDMwKSB7XG5cdFx0XHRcdGlmIChkZWx0YSA+IDE1MCkgZGVsdGEgPSAxNTA7XG5cdFx0XHRcdCQoJyNwZW9wbGUgLnBlb3BsZScpLmNzcygnbWFyZ2luLXRvcCcsIGRlbHRhIC0gMzApO1xuXHRcdFx0XHRpZiAoZGVsdGEgPj0gMTAwKSB7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLXVwXCI+PC9zcGFuPlJlbGVhc2UgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cGVvcGxlLnN0YXJ0UmVmcmVzaERyYWcgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmICghcGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgIWFwcC5teVZpZXdNb2RlbC5oZWFkZXIuaXNPcGVuKCkgJiYgcGVvcGxlLmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHBlb3BsZS5kcmFnU3RhcnQoJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO1xuXHRcdFx0cGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKHRydWUpO1xuXHRcdFx0JChldmVudC5nZXN0dXJlLnRhcmdldCkub25lKCdkcmFnZW5kJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0cGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0dmFyIGRlbHRhID0gcGFyc2VJbnQoJCgnI3Blb3BsZSAucGVvcGxlJykuY3NzKCdtYXJnaW4tdG9wJykpO1xuXHRcdFx0XHRpZiAoZGVsdGEgPj0gNzApIHtcblx0XHRcdFx0XHRwZW9wbGUuZ2V0VGltZXMoKTtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW5cIj48L3NwYW4+UmVmcmVzaGluZy4uLicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnBlb3BsZScpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdFx0fSwgMTAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9XG5cblx0fVxuXG5cdHBlb3BsZS5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGVvcGxlOyIsIi8qKlxuICogc2NyaXB0cy9wcm9maWxlLmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQcm9maWxlKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHByb2ZpbGUgPSBhcHAubXlWaWV3TW9kZWwucHJvZmlsZSA9IHt9O1xuXG5cdHByb2ZpbGUuc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cblx0cmV0dXJuIHNlbGY7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9maWxlOyIsIi8qKlxuICogc2NyaXB0cy9yYXRlLXdlZWsuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUmF0ZVdlZWsoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcmF0ZVdlZWsgPSBhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsgPSB7fTtcblxuXHRyYXRlV2Vlay5yZWdpc3Rlck1vdXNlWCA9IGtvLm9ic2VydmFibGUoKTtcblx0cmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRyYXRlV2Vlay50b2RheSA9IG1vbWVudChuZXcgRGF0ZSgpKS5zdGFydE9mKCdpc293ZWVrJyk7XG5cdHJhdGVXZWVrLnJlZ2lzdGVyUmF0aW8gPSBrby5vYnNlcnZhYmxlKCQoZG9jdW1lbnQpLndpZHRoKCkgLSAyMCk7XG5cdHJhdGVXZWVrLmFjdGl2ZVdlZWsgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRyYXRlV2Vlay52aWV3VHlwZSA9IGtvLm9ic2VydmFibGUoJ2hvdXJzJyk7XG5cblx0cmF0ZVdlZWsud2Vla3MgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuXHRcdHtcblx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHJhdGVXZWVrLnRvZGF5KS5mb3JtYXQoJ01NTSBEJykpLFxuXHRcdFx0dG90YWw6IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3VtID0gXy5yZWR1Y2UoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24obWVtbywgcHJvamVjdCkge1xuXHRcdFx0XHRcdHZhciBjb2xWYWx1ZSA9IDA7XG5cdFx0XHRcdFx0aWYgKHByb2plY3QuYXR0cmlidXRlcy5hY3RpdmUoKSkge1xuXHRcdFx0XHRcdFx0Y29sVmFsdWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpWzBdLnZhbHVlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBtZW1vICsgY29sVmFsdWU7IFxuXHRcdFx0XHR9LCAwKTtcblx0XHRcdFx0cmV0dXJuIHN1bTtcblx0XHRcdH0pLFxuXHRcdFx0cmF0aW5nOiBrby5vYnNlcnZhYmxlKDIpLFxuXHRcdFx0bm90ZXM6IGtvLm9ic2VydmFibGUobnVsbClcblx0XHR9LFxuXHRcdHtcblx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHJhdGVXZWVrLnRvZGF5KS5hZGQoJ2RheXMnLCA3KS5mb3JtYXQoJ01NTSBEJykpLFxuXHRcdFx0dG90YWw6IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3VtID0gXy5yZWR1Y2UoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24obWVtbywgcHJvamVjdCkge1xuXHRcdFx0XHRcdHZhciBjb2xWYWx1ZSA9IDA7XG5cdFx0XHRcdFx0aWYgKHByb2plY3QuYXR0cmlidXRlcy5hY3RpdmUoKSkge1xuXHRcdFx0XHRcdFx0Y29sVmFsdWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpWzFdLnZhbHVlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBtZW1vICsgY29sVmFsdWU7IFxuXHRcdFx0XHR9LCAwKTtcblx0XHRcdFx0cmV0dXJuIHN1bTtcblx0XHRcdH0pLFxuXHRcdFx0cmF0aW5nOiBrby5vYnNlcnZhYmxlKDIpLFxuXHRcdFx0bm90ZXM6IGtvLm9ic2VydmFibGUobnVsbClcblx0XHR9LFxuXHRcdHsgIFxuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocmF0ZVdlZWsudG9kYXkpLmFkZCgnZGF5cycsIDE0KS5mb3JtYXQoJ01NTSBEJykpLFxuXHRcdFx0dG90YWw6IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3VtID0gXy5yZWR1Y2UoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24obWVtbywgcHJvamVjdCkge1xuXHRcdFx0XHRcdHZhciBjb2xWYWx1ZSA9IDA7XG5cdFx0XHRcdFx0aWYgKHByb2plY3QuYXR0cmlidXRlcy5hY3RpdmUoKSkge1xuXHRcdFx0XHRcdFx0Y29sVmFsdWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpWzJdLnZhbHVlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBtZW1vICsgY29sVmFsdWU7IFxuXHRcdFx0XHR9LCAwKTtcblx0XHRcdFx0cmV0dXJuIHN1bTtcblx0XHRcdH0pLFxuXHRcdFx0cmF0aW5nOiBrby5vYnNlcnZhYmxlKDIpLFxuXHRcdFx0bm90ZXM6IGtvLm9ic2VydmFibGUobnVsbClcblx0XHR9XG5cdF0pO1xuXG5cdHJhdGVXZWVrLmRyYWcgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdHZhciBkaXJlY3Rpb24gPSBldmVudC5nZXN0dXJlLmRpcmVjdGlvbjtcblx0XHRpZiAoZGlyZWN0aW9uID09ICdsZWZ0JyB8fCBkaXJlY3Rpb24gPT0gJ3JpZ2h0Jykge1xuXHRcdFx0dmFyIHN0YXJ0WCA9IGV2ZW50Lmdlc3R1cmUuc3RhcnRFdmVudC5jZW50ZXIucGFnZVg7XG5cdFx0XHRpZiAocmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVgoKSAhPSBzdGFydFgpIHtcblx0XHRcdFx0cmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVgoc3RhcnRYKTtcblx0XHRcdFx0cmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoaXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVtyYXRlV2Vlay5hY3RpdmVXZWVrKCldLnZhbHVlKCkpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGRpZmYgPSAoZXZlbnQuZ2VzdHVyZS5kZWx0YVggLyByYXRlV2Vlay5yZWdpc3RlclJhdGlvKCkpICogMTUwO1xuXHRcdFx0dmFyIG5ld1BlcmNlbnRhZ2UgPSBNYXRoLmZsb29yKChkaWZmICsgcmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoKSkgLyA1KSAqIDU7XG5cblx0XHRcdGlmIChuZXdQZXJjZW50YWdlID4gMCAmJiBuZXdQZXJjZW50YWdlIDw9IDE1MCkge1xuXHRcdFx0XHRpdGVtLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpW3JhdGVXZWVrLmFjdGl2ZVdlZWsoKV0udmFsdWUobmV3UGVyY2VudGFnZSk7XG5cdFx0XHR9IGVsc2UgaWYgKG5ld1BlcmNlbnRhZ2UgPiAxNTApIHtcblx0XHRcdFx0aXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVtyYXRlV2Vlay5hY3RpdmVXZWVrKCldLnZhbHVlKDE1MCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpdGVtLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpW3JhdGVXZWVrLmFjdGl2ZVdlZWsoKV0udmFsdWUoMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmF0ZVdlZWsuc2VsZWN0V2VlayA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0cmF0ZVdlZWsuYWN0aXZlV2VlayhpbmRleCk7XG5cdH1cblxuXHRyYXRlV2Vlay50YWtlUGljdHVyZSA9IGZ1bmN0aW9uKCkge1xuXHRcdG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZShyYXRlV2Vlay5zZXRQaWN0dXJlLCBmdW5jdGlvbigpIHtcblx0XHRcdC8vIGZhaWxcblx0XHRcdGFsZXJ0KCdPb3BzLiBXZSBjb3VsZG5cXCd0IGFjY2VzcyB5b3VyIGNhbWVyYS4nKTtcblx0XHR9LCB7IFxuXHRcdFx0cXVhbGl0eTogMTAwLCBcblx0XHRcdGFsbG93RWRpdDogdHJ1ZSwgXG5cdFx0XHRkZXN0aW5hdGlvblR5cGU6IG5hdmlnYXRvci5jYW1lcmEuRGVzdGluYXRpb25UeXBlLkRBVEFfVVJMLFxuXHRcdFx0ZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcblx0XHRcdHRhcmdldFdpZHRoOiAxMDAsXG5cdFx0XHR0YXJnZXRIZWlnaHQ6IDEwMCxcblx0XHRcdGNvcnJlY3RPcmllbnRhdGlvbjogdHJ1ZSxcblx0XHRcdGNhbWVyYURpcmVjdGlvbjogQ2FtZXJhLkRpcmVjdGlvbi5GUk9OVFxuXHRcdH0pO1xuXHR9XG5cblx0cmF0ZVdlZWsuc2V0UGljdHVyZSA9IGZ1bmN0aW9uKGltYWdlRGF0YSkge1xuXHRcdCQoJy5hdmF0YXInKS5yZW1vdmVDbGFzcygnZmEtY2FtZXJhJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybChkYXRhOmltYWdlL3BuZztiYXNlNjQsJyArIGltYWdlRGF0YSArICcpJyk7XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCd1cGRhdGVBdmF0YXInLCB7XG5cdFx0XHRhdmF0YXI6IGltYWdlRGF0YVxuXHRcdH0sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0YWxlcnQoJ0F2YXRhciBzdWNjZXNzZnVsbHkgc2F2ZWQuJylcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHQkKCcuYXZhdGFyJykuYWRkQ2xhc3MoJ2ZhLWNhbWVyYScpO1xuXHRcdFx0XHRjb25zb2xlLmxvZygnT29wcy4gV2UgbWVzc2VkIHVwLiBQbGVhc2UgdHJ5IGFnYWluLicpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmF0ZVdlZWsudG9nZ2xlVmlldyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChyYXRlV2Vlay52aWV3VHlwZSgpID09ICdob3VycycpIHtcblx0XHRcdHJhdGVXZWVrLnZpZXdUeXBlKCdwZXJjZW50Jyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJhdGVXZWVrLnZpZXdUeXBlKCdob3VycycpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJhdGVXZWVrOyIsIi8qKlxuICogc2NyaXB0cy9zYXZlLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFNhdmUoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgc2F2ZSA9IGFwcC5teVZpZXdNb2RlbC5zYXZlID0ge307XG5cblx0c2F2ZS5zYXZlTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzYXZlLnN1Y2Nlc3MgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2F2ZS5lcnJvciA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzYXZlLnNhdmluZyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cdHNhdmUucmVzdWx0ID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHNhdmUuZG9uZSA9IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkb25lID0gZmFsc2U7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzYXZlLnJlc3VsdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0ZG9uZSA9IGRvbmUgfHwgc2F2ZS5yZXN1bHRbaV07XG5cdFx0fVxuXHRcdHJldHVybiBkb25lO1xuXHR9KTtcblxuXHRzYXZlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5nb1RvVmlldygnc2F2ZScpO1xuXHRcdHNhdmUuc2F2ZU1vZGUodHJ1ZSk7XG5cdFx0c2F2ZS5zYXZpbmcodHJ1ZSk7XG5cdFx0dmFyIHRlbXAgPSB7fTtcblx0XHR2YXIgY3VyV2Vlaztcblx0XHR2YXIgbnVtV2Vla3MgPSBhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsud2Vla3MoKS5sZW5ndGg7XG5cdFx0dmFyIHByb2plY3RzID0gXy5maWx0ZXIoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRyZXR1cm4gb2JqLmF0dHJpYnV0ZXMuYWN0aXZlKCk7XG5cdFx0fSk7XG5cdFx0dmFyIG51bVByb2plY3RzID0gcHJvamVjdHMubGVuZ3RoO1xuXHRcdHZhciB0b2RheSA9IGFwcC5teVZpZXdNb2RlbC5yYXRlV2Vlay50b2RheTtcblx0XHR2YXIgdGVtcFByb2plY3QgPSB7fTtcblx0XHR2YXIgZG9uZSA9IDA7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG51bVdlZWtzOyBpKyspIHtcblx0XHRcdGN1cldlZWsgPSBhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsud2Vla3MoKVtpXTtcblx0XHRcdHRlbXAgPSB7XG5cdFx0XHRcdGRhdGU6IG1vbWVudCh0b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJyksXG5cdFx0XHRcdHJhdGluZzogY3VyV2Vlay5yYXRpbmcoKSxcblx0XHRcdFx0bm90ZXM6IGN1cldlZWsubm90ZXMoKVxuXHRcdFx0fTtcblxuXHRcdFx0dmFyIHRlbXBQcm9qZWN0cyA9IFtdO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBudW1Qcm9qZWN0czsgaisrKSB7XG5cdFx0XHRcdHRlbXBQcm9qZWN0ID0ge1xuXHRcdFx0XHRcdGlkOiBwcm9qZWN0c1tqXS5pZCxcblx0XHRcdFx0XHRwZXJjZW50YWdlOiBwcm9qZWN0c1tqXS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVtpXS52YWx1ZSgpXG5cdFx0XHRcdH1cblx0XHRcdFx0dGVtcFByb2plY3RzLnB1c2godGVtcFByb2plY3QpO1xuXHRcdFx0fVxuXHRcdFx0dGVtcC5wcm9qZWN0cyA9IHRlbXBQcm9qZWN0cztcblxuXHRcdFx0UGFyc2UuQ2xvdWQucnVuKCdzYXZlVGltZScsIHtcblx0XHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkodGVtcCksXG5cdFx0XHRcdGRhdGU6IHRlbXAuZGF0ZVxuXHRcdFx0fSwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdFx0ZG9uZSA9IGRvbmUrMTtcblx0XHRcdFx0XHRpZiAoZG9uZSA+PSBudW1XZWVrcyAmJiBzYXZlLnNhdmluZygpKSB7XG5cdFx0XHRcdFx0XHRzYXZlLnN1Y2Nlc3ModHJ1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdFx0c2F2ZS5lcnJvcih0cnVlKTtcblx0XHRcdFx0XHRzYXZlLnJlc2V0KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHNhdmUudHJ5QWdhaW4gPSBmdW5jdGlvbigpIHtcblx0XHRzYXZlLmVycm9yKGZhbHNlKTtcblx0XHRzYXZlLnN1Y2Nlc3MoZmFsc2UpO1xuXHRcdHNhdmUuc3VibWl0KCk7XG5cdH1cblxuXHRzYXZlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0c2F2ZS5zYXZpbmcoZmFsc2UpO1xuXHRcdHNhdmUuc2F2ZU1vZGUoZmFsc2UpO1xuXHRcdHNhdmUuZXJyb3IoZmFsc2UpO1xuXHRcdHNhdmUuc3VjY2VzcyhmYWxzZSk7XG5cdFx0YXBwLm15Vmlld01vZGVsLnN0ZXBzLmN1cnJlbnRTdGVwKDApO1xuXHRcdGFwcC5nb1RvVmlldygnc2VsZWN0LXByb2plY3QnKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNhdmU7IiwiLyoqXG4gKiBzY3JpcHRzL3NlbGVjdC1wcm9qZWN0LmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFNlbGVjdFByb2plY3QoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgc2VsZWN0UHJvamVjdCA9IGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0ID0ge307XG5cblx0c2VsZWN0UHJvamVjdC52aWV3VHlwZSA9IGtvLm9ic2VydmFibGUoJ2FsbCcpO1xuXHRzZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHNlbGVjdFByb2plY3QuaXNBZGRNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNlbGVjdFByb2plY3QudW5pcXVlQ29tcGFueU5hbWVzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdCA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNlbGVjdFByb2plY3QuZHJhZ1N0YXJ0ID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0c2VsZWN0UHJvamVjdC5jb3VudCA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHNlbGVjdFByb2plY3Qud2VlayA9IGtvLm9ic2VydmFibGUoJ1RoaXMgV2VlaycpO1xuXHRzZWxlY3RQcm9qZWN0LnNob3cgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2VsZWN0UHJvamVjdC50b2RheSA9IG1vbWVudChuZXcgRGF0ZSgpKS5zdGFydE9mKCdpc293ZWVrJyk7XG5cblx0c2VsZWN0UHJvamVjdC5nZXRQcm9qZWN0cyA9IGZ1bmN0aW9uKCkge1xuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0UHJvamVjdHMnLCB7fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocHJvamVjdHMpIHtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cyhbXSk7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJvamVjdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRwcm9qZWN0c1tpXS5hdHRyaWJ1dGVzLmFjdGl2ZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRcdFx0XHRcdHByb2plY3RzW2ldLmF0dHJpYnV0ZXMucGVyY2VudGFnZSA9IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pO1xuXHRcdFx0XHRcdHNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMucHVzaChwcm9qZWN0c1tpXSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoMCk7XG5cdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAuYWxsLXByb2plY3RzJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRVbmlxdWVDb21wYW55TmFtZXMnLCB7fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocHJvamVjdHMpIHtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC51bmlxdWVDb21wYW55TmFtZXMocHJvamVjdHMpO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuZ29Ib21lID0gZnVuY3Rpb24oKSB7XG5cdFx0c2VsZWN0UHJvamVjdC5zaG93KGZhbHNlKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ2hvbWUnKTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuaW5pdCA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0dmFyIHN0eWxlZERhdGUgPSAnV2VlayBvZiAnICsgbW9tZW50KHNlbGVjdFByb2plY3QudG9kYXkpLmFkZCgnZGF5cycsIChpbmRleCAqIDcpKS5mb3JtYXQoJ01NTSBEJyk7XG5cdFx0aWYgKGluZGV4ID09IDApIHN0eWxlZERhdGUgPSAnVGhpcyBXZWVrJztcblx0XHRpZiAoaW5kZXggPT0gMSkgc3R5bGVkRGF0ZSA9ICdOZXh0IFdlZWsnO1xuXHRcdHNlbGVjdFByb2plY3Qud2VlayhzdHlsZWREYXRlKTtcblx0XHRzZWxlY3RQcm9qZWN0LnNob3codHJ1ZSk7XG5cdFx0c2VsZWN0UHJvamVjdC5nZXRQcm9qZWN0cygpO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC50b2dnbGVQcm9qZWN0ID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoaXRlbS5hdHRyaWJ1dGVzLmFjdGl2ZSgpKSB7XG5cdFx0XHRpdGVtLmF0dHJpYnV0ZXMuYWN0aXZlKGZhbHNlKTtcblx0XHRcdHNlbGVjdFByb2plY3QuY291bnQoc2VsZWN0UHJvamVjdC5jb3VudCgpIC0gMSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGl0ZW0uYXR0cmlidXRlcy5hY3RpdmUodHJ1ZSk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmNvdW50KHNlbGVjdFByb2plY3QuY291bnQoKSArIDEpO1xuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3QudG9nZ2xlQWRkTW9kZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChzZWxlY3RQcm9qZWN0LmlzQWRkTW9kZSgpKSB7XG5cdFx0XHRhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmlzTW9kYWwoZmFsc2UpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5pc0FkZE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmlzTW9kYWwodHJ1ZSk7XG5cdFx0XHQkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS52YWwoJycpO1xuXHRcdFx0JCgnLnByb2plY3QtbmFtZS1maWVsZCcpLnZhbCgnJyk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QoW10pO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5pc0FkZE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC50b2dnbGVWaWV3ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHNlbGVjdFByb2plY3Qudmlld1R5cGUoKSA9PSAnYWxsJykge1xuXHRcdFx0c2VsZWN0UHJvamVjdC52aWV3VHlwZSgnc2VsZWN0ZWQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c2VsZWN0UHJvamVjdC52aWV3VHlwZSgnYWxsJyk7XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zZWxlY3RQcm9qZWN0VHlwZWFoZWFkID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdCQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLnZhbChpdGVtKTtcblx0XHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QoW10pO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zaG93VHlwZWFoZWFkUmVzdWx0cyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0dmFyIG5lZWRsZSA9IGV2ZW50LnRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teXFx3XFxkXS9naSwgJycpO1xuXG5cdFx0aWYgKG5lZWRsZS5sZW5ndGggPiAwKSB7XG5cdFx0XHR2YXIgZmlsdGVyZWRQcm9qZWN0cyA9IF8uZmlsdGVyKHNlbGVjdFByb2plY3QudW5pcXVlQ29tcGFueU5hbWVzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHR2YXIgaGF5c3RhY2sgPSBvYmoudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXlxcd1xcZF0vZ2ksICcnKTtcblx0XHRcdFx0cmV0dXJuIGhheXN0YWNrLmluZGV4T2YobmVlZGxlKSA+PSAwOyBcblx0XHRcdH0pO1xuXHRcdFx0dmFyIGZpZWxkUG9zaXRpb24gPSAkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS5vZmZzZXQoKTtcblx0XHRcdCQoJy5wcm9qZWN0LXR5cGVhaGVhZCcpLmNzcygnbGVmdCcsIGZpZWxkUG9zaXRpb24ubGVmdCkuY3NzKCd0b3AnLCBmaWVsZFBvc2l0aW9uLnRvcCArICQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLmhlaWdodCgpKzIwKTtcblx0XHRcdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdChmaWx0ZXJlZFByb2plY3RzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KFtdKTtcblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnNhdmVOZXdQcm9qZWN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRjb21wYW55OiAkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS52YWwoKSxcblx0XHRcdHByb2plY3Q6ICQoJy5wcm9qZWN0LW5hbWUtZmllbGQnKS52YWwoKSxcblx0XHR9XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdzYXZlUHJvamVjdCcsIGRhdGEsIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHByb2plY3QpIHtcblx0XHRcdFx0YWxlcnQoJ1wiJyArIHByb2plY3QuYXR0cmlidXRlcy5jb21wYW55ICsgJzogJyArIHByb2plY3QuYXR0cmlidXRlcy5uYW1lICsgJ1wiIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5LicpO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LnRvZ2dsZUFkZE1vZGUoKTtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC5nZXRQcm9qZWN0cygpO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdC8vIGFsZXJ0KGVycm9yKVxuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XHRcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuZHJhZ1JlZnJlc2ggPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmIChzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgc2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHR2YXIgdG9wID0gJCgnI3NlbGVjdC1wcm9qZWN0IC5hbGwtcHJvamVjdHMnKS5zY3JvbGxUb3AoKTtcblx0XHRcdHZhciBkZWx0YSA9IE1hdGguZmxvb3IoZXZlbnQuZ2VzdHVyZS5kaXN0YW5jZSk7XG5cdFx0XHRpZiAodG9wID09IDAgJiYgZGVsdGEgPiAzMCkge1xuXHRcdFx0XHRpZiAoZGVsdGEgPiAxNTApIGRlbHRhID0gMTUwO1xuXHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLmFsbC1wcm9qZWN0cycpLmNzcygnbWFyZ2luLXRvcCcsIGRlbHRhIC0gMzApO1xuXHRcdFx0XHRpZiAoZGVsdGEgPj0gMTAwKSB7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtdXBcIj48L3NwYW4+UmVsZWFzZSB0byByZWZyZXNoJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc3RhcnRSZWZyZXNoRHJhZyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKCFzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgc2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgkKCcjc2VsZWN0LXByb2plY3QgLmFsbC1wcm9qZWN0cycpLnNjcm9sbFRvcCgpKTtcblx0XHRcdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcodHJ1ZSk7XG5cdFx0XHQkKGV2ZW50Lmdlc3R1cmUudGFyZ2V0KS5vbmUoJ2RyYWdlbmQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHR2YXIgZGVsdGEgPSBwYXJzZUludCgkKCcjc2VsZWN0LXByb2plY3QgLmFsbC1wcm9qZWN0cycpLmNzcygnbWFyZ2luLXRvcCcpKTtcblxuXHRcdFx0XHRpZiAoZGVsdGEgPj0gNzApIHtcblx0XHRcdFx0XHRzZWxlY3RQcm9qZWN0LmdldFByb2plY3RzKCk7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW5cIj48L3NwYW4+UmVmcmVzaGluZy4uLicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdFx0c2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdFx0c2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoMCk7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5hbGwtcHJvamVjdHMnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LmluaXQoKTtcblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RQcm9qZWN0OyJdfQ==
