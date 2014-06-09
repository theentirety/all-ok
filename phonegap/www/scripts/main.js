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
		if (index == 0) { styledDate = 'This Week' };
		if (index == 1) { styledDate = 'Next Week' };
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

	notes.show = ko.observable(false);
	notes.rating = ko.observable(2);
	notes.content = ko.observable();

	notes.statusOptions = ko.observableArray();

	notes.init = function() {
		notes.statusOptions.push(new notes.Status('Bring on the work',0));
		notes.statusOptions.push(new notes.Status('I\'m a little light',1));
		notes.statusOptions.push(new notes.Status('Life is good',2));
		notes.statusOptions.push(new notes.Status('I\'m a bit overwhelmed',3));
		notes.statusOptions.push(new notes.Status('Stop the madness!',4));
	}

	notes.Status = function(text, value) {
		var status = {
			label: text,
			value: value
		};
		return status;
	}

	notes.selectStatus = function(item, e) {
		notes.rating(item.value);
	}

	notes.goBack = function() {
		app.myViewModel.rateWeek.show(true);
		notes.show(false);
		app.goToView('rate-week');
	}

	notes.goNext = function() {
		notes.show(false);
		app.myViewModel.save.show(true);
		app.myViewModel.save.submit();
		app.goToView('save');
	}

	notes.init();

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
	rateWeek.registerRatio = ko.observable($(document).width() - 20);
	rateWeek.show = ko.observable(false);

	rateWeek.drag = function(item, event) {
		var direction = event.gesture.direction;
		if (direction == 'left' || direction == 'right') {
			var startX = event.gesture.startEvent.center.pageX;
			if (rateWeek.registerMouseX() != startX) {
				rateWeek.registerMouseX(startX);
				rateWeek.registerStartPercentage(item.attributes.percentage());
			}
			var diff = (event.gesture.deltaX / rateWeek.registerRatio()) * 150;
			var newPercentage = Math.floor((diff + rateWeek.registerStartPercentage()) / 5) * 5;

			if (newPercentage > 0 && newPercentage <= 150) {
				item.attributes.percentage(newPercentage);
			} else if (newPercentage > 150) {
				item.attributes.percentage(150);
			} else {
				item.attributes.percentage(0);
			}
		}
	}

	rateWeek.goBack = function() {
		app.myViewModel.selectProject.show(true);
		rateWeek.show(false);
		app.goToView('select-project');
	}

	rateWeek.goNext = function() {
		rateWeek.show(false);
		app.myViewModel.notes.show(true);
		app.goToView('notes');
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

	save.show = ko.observable(false);
	save.success = ko.observable(false);
	save.error = ko.observable(false);
	save.saving = ko.observable(false);

	save.result = ko.observableArray();
	// save.done = ko.computed(function() {
	// 	var done = false;
	// 	for (var i = 0; i < save.result.length; i++) {
	// 		done = done || save.result[i];
	// 	}
	// 	return done;
	// });

	save.submit = function() {
		app.goToView('save');
		save.show(true);
		save.saving(true);
		var temp = {};
		var curWeek;
		// var numWeeks = app.myViewModel.rateWeek.weeks().length;

		var projects = [];
		_.each(app.myViewModel.selectProject.groups(), function(group) {
			_.each(group.attributes.projects(), function(project) {
				if (project.attributes.selected()) {
					var newProject = {
						id: project.id,
						percentage: project.attributes.percentage()
					}
					projects.push(newProject);
				}
			})
		});

		var date = moment(new Date()).startOf('isoweek').add('days', (app.myViewModel.selectProject.weekIndex() * 7)).format('YYYY, M, D');

		var data = {
			date: date,
			rating: app.myViewModel.notes.rating(),
			notes: app.myViewModel.notes.content(),
			projects: projects
		}

		Parse.Cloud.run('saveTime', {
			date: date,
			data: JSON.stringify(data)
		}, {
			success: function(data) {
				app.myViewModel.home.getTotalsAndRating();
				save.success(true);
			}, error: function(error) {
				console.log(error);
				save.error(true);
				save.reset();
			}
		});
	}

	save.tryAgain = function() {
		save.error(false);
		save.success(false);
		save.submit();
	}

	save.reset = function() {
		save.saving(false);
		save.show(false);
		save.error(false);
		save.success(false);
		app.goToView('home');
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
	selectProject.groups = ko.observableArray();
	selectProject.weekIndex = ko.observable(0);

	selectProject.Group = function(type) {
		var group = {
			attributes: {}
		}
		group.attributes.name = (type == 'private' ? 'My Private Projects' : 'My Shared Projects');
		return group;
	}

	selectProject.getGroups = function() {
		selectProject.groups([]);
		Parse.Cloud.run('getGroups', {}, {
			success: function(groups) {
				// groups.splice(0,0,new selectProject.Group('private'), new selectProject.Group('public'));
				_.each(groups, function(group) {
					group.attributes.projects = ko.observableArray();
					group.attributes.nonMember = ko.observable(false);
				});
				selectProject.groups(groups);

				$('#select-project .refresh').html('<span class="fa fa-arrow-circle-down"></span>Pull to refresh');
				selectProject.isRefreshDragging(false);
				selectProject.dragStart(0);
				$('#select-project .groups').animate({
					marginTop: 0
				}, 100);


				for (var i = 0; i < selectProject.groups().length; i++) {
					Parse.Cloud.run('getProjects', {
						groupId: selectProject.groups()[i].id
					}, {
						success: function(results) {
							if (results.projects.length > 0) {
								var group = _.find(selectProject.groups(), function(group) {
									return group.id == results.projects[0].attributes.group.id;
								})

								_.each(results.projects, function(project) {
									project.attributes.selected = ko.observable(false);
									project.attributes.percentage = ko.observable(0);
								});

								if (group) {
									group.attributes.projects(results.projects);
								}
							} else {
								// check membership status for the empty group
								Parse.Cloud.run('getMembershipStatus', {
									groupId: results.groupId
								}, {
									success: function(results) {
										if (!results.status) {
											var group = _.find(selectProject.groups(), function(group) {
												return group.id == results.groupId;
											});

											if (group) {
												group.attributes.nonMember(true);
											}
										}
									},
									error: function(error) {
										console.log(error);
									}
								});
							}

						}, error: function(error) {
							console.log(error);
						}
					});
				}
				// console.log(selectProject.groups())
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	selectProject.goHome = function() {
		selectProject.show(false);
		app.goToView('home');
	}

	selectProject.goNext = function() {
		selectProject.show(false);
		app.myViewModel.rateWeek.show(true);
		app.goToView('rate-week');
	}

	selectProject.init = function(index) {
		var styledDate = 'Week of ' + moment(selectProject.today).add('days', (index * 7)).format('MMM D');
		if (index == 0) styledDate = 'This Week';
		if (index == 1) styledDate = 'Next Week';
		selectProject.week(styledDate);
		selectProject.weekIndex(index);
		selectProject.show(true);
	}

	selectProject.toggleProject = function(item, event) {
		if (item.attributes.selected()) {
			item.attributes.selected(false);
			selectProject.count(selectProject.count() - 1);
		} else {
			item.attributes.selected(true);
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
				selectProject.getGroups();
			}, error: function(error) {
				// alert(error)
				console.log(error);
			}
		});	
	}

	selectProject.dragRefresh = function(item, event) {
		if (selectProject.isRefreshDragging() && selectProject.dragStart() == 0) {
			var top = $('#select-project .groups').scrollTop();
			var delta = Math.floor(event.gesture.distance);
			if (top == 0 && delta > 30) {
				if (delta > 150) delta = 150;
				$('#select-project .groups').css('margin-top', delta - 30);
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
			selectProject.dragStart($('#select-project .groups').scrollTop());
			selectProject.isRefreshDragging(true);
			$(event.gesture.target).one('dragend', function(event) {
				var delta = parseInt($('#select-project .groups').css('margin-top'));

				if (delta >= 70) {
					selectProject.getGroups();
					$('#select-project .refresh').html('<span class="fa fa-refresh fa-spin"></span>Refreshing...');
				} else {
					$('#select-project .refresh').html('<span class="fa fa-arrow-circle-down"></span>Pull to refresh');
					selectProject.isRefreshDragging(false);
					selectProject.dragStart(0);
					$('#select-project .groups').animate({
						marginTop: 0
					}, 100);
				}
			})
		}
	}

	if (app.myViewModel.auth.currentUser()) {
		selectProject.getGroups();
	}

	return self;
}

module.exports = SelectProject;
},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2FsZXJ0cy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvYXBwLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9hdXRoLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9mYWtlXzIxZmM2Yjc1LmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ob21lLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ub3Rlcy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcGVvcGxlLWRldGFpbHMuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3Blb3BsZS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcHJvZmlsZS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcmF0ZS13ZWVrLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zYXZlLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zZWxlY3QtcHJvamVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBzY3JpcHRzL25vdGVzLmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBbGVydHMoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgYWxlcnRzID0gYXBwLm15Vmlld01vZGVsLmFsZXJ0cyA9IHt9O1xuXG5cdGFsZXJ0cy5saXN0ID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdGFsZXJ0cy5saXN0LnB1c2goJ2FzZGYnKVxuXHRhbGVydHMuc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cblx0cmV0dXJuIHNlbGY7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBBbGVydHM7IiwiLyoqXG4gKiBzY3JpcHRzL2FwcC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBcHAoKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHQvLyBpbml0aWFsaXplIGtub2Nrb3V0XG5cdHNlbGYubXlWaWV3TW9kZWwgPSB7fTtcblxuXHRzZWxmLm15Vmlld01vZGVsLmFjdGl2ZVZpZXcgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRzZWxmLm15Vmlld01vZGVsLnZpZXdzID0gW1xuXHRcdCdhdXRoJyxcblx0XHQnaG9tZScsXG5cdFx0J3NlbGVjdC1wcm9qZWN0Jyxcblx0XHQncmF0ZS13ZWVrJyxcblx0XHQnbm90ZXMnLFxuXHRcdCdwZW9wbGUnLFxuXHRcdCdwZW9wbGUtZGV0YWlscycsXG5cdFx0J3NhdmUnXG5cdF07XG5cblx0c2VsZi5teVZpZXdNb2RlbC5udW1XZWVrcyA9IDM7XG5cdHNlbGYubXlWaWV3TW9kZWwudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRzZWxmLm15Vmlld01vZGVsLndlZWtzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cblx0c2VsZi5nb1RvVmlldyA9IGZ1bmN0aW9uKHZpZXcpIHtcblx0XHR2YXIgaW5kZXggPSBzZWxmLm15Vmlld01vZGVsLnZpZXdzLmluZGV4T2Yodmlldyk7XG5cdFx0c2VsZi5teVZpZXdNb2RlbC5hY3RpdmVWaWV3KGluZGV4KTtcblx0fVxuXG5cdHNlbGYuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZXJlYWR5Jywgc2VsZi5vbkRldmljZVJlYWR5LCBmYWxzZSk7XG5cdH1cblxuXHRzZWxmLm9uRGV2aWNlUmVhZHkgPSBmdW5jdGlvbigpIHtcblx0XHRrby5hcHBseUJpbmRpbmdzKHNlbGYubXlWaWV3TW9kZWwpO1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAobmF2aWdhdG9yLnNwbGFzaHNjcmVlbikge1xuXHRcdFx0XHRuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuLmhpZGUoKTtcblx0XHRcdH1cblx0XHR9LCAyMDAwKTtcblx0XHRcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDsiLCIvKipcbiAqIHNjcmlwdHMvYXV0aC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBdXRoKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGF1dGggPSBhcHAubXlWaWV3TW9kZWwuYXV0aCA9IHt9O1xuXG5cdGF1dGguY3VycmVudFVzZXIgPSBrby5vYnNlcnZhYmxlKCk7XG5cdGF1dGguZXJyb3JNZXNzYWdlID0ga28ub2JzZXJ2YWJsZSgnJyk7XG5cdGF1dGguc2lnblVwTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhdXRoLnNpZ25Jbk1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0YXV0aC5mb3Jnb3RNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0dmFyIGN1cnJlbnRVc2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cdGlmIChjdXJyZW50VXNlcikge1xuXHRcdGF1dGguY3VycmVudFVzZXIoY3VycmVudFVzZXIpO1xuXHR9XG5cblx0YXV0aC5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGF1dGguY3VycmVudFVzZXIoKSkge1xuXHRcdFx0YXBwLmdvVG9WaWV3KCdob21lJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFwcC5nb1RvVmlldygnYXV0aCcpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGgucmVzZXRFcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGguZXJyb3JNZXNzYWdlKCcnKTtcblx0fVxuXG5cdGF1dGguc2lnbkluVXAgPSBmdW5jdGlvbihmb3JtRWxlbWVudCkge1xuXHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXG5cdFx0dmFyIHVzZXJuYW1lID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2VtYWlsXScpLnZhbCgpO1xuXHRcdHZhciBwYXNzd29yZCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9wYXNzd29yZF0nKS52YWwoKTtcblxuXHRcdGlmIChhdXRoLnNpZ25VcE1vZGUoKSkge1xuXHRcdFx0dmFyIGRpc3BsYXlOYW1lID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2Rpc3BsYXlOYW1lXScpLnZhbCgpO1xuXHRcdFx0dmFyIHBhc3N3b3JkQ29uZmlybSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9jb25maXJtUGFzc3dvcmRdJykudmFsKCk7XG5cblx0XHRcdC8vIHZhbGlkYXRpb25cblx0XHRcdGlmICh1c2VybmFtZS5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgeW91ciBlbWFpbCBhZGRyZXNzLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChkaXNwbGF5TmFtZS5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgeW91ciBmaXJzdCBhbmQgbGFzdCBuYW1lLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwYXNzd29yZC5sZW5ndGggPCAxIHx8IHBhc3N3b3JkQ29uZmlybSA8IDEgfHwgcGFzc3dvcmQgIT0gcGFzc3dvcmRDb25maXJtKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgYW5kIGNvbmZpcm0gYSBwYXNzd29yZC4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgdXNlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG5cdFx0XHR2YXIgc2NydWJiZWRVc2VybmFtZSA9IHVzZXJuYW1lLnJlcGxhY2UoL1xccysvZyxcIlwiKTsgLy9yZW1vdmUgd2hpdGUgc3BhY2Vcblx0XHRcdHNjcnViYmVkVXNlcm5hbWUgPSBzY3J1YmJlZFVzZXJuYW1lLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRcdHVzZXIuc2V0KCd1c2VybmFtZScsIHNjcnViYmVkVXNlcm5hbWUpO1xuXHRcdFx0dXNlci5zZXQoJ3Bhc3N3b3JkJywgcGFzc3dvcmQpO1xuXHRcdFx0dXNlci5zZXQoJ2VtYWlsJywgc2NydWJiZWRVc2VybmFtZSk7XG5cdFx0XHR1c2VyLnNldCgnZGlzcGxheU5hbWUnLCBkaXNwbGF5TmFtZSk7XG5cblx0XHRcdHVzZXIuc2lnblVwKG51bGwsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRcdGF1dGguY3VycmVudFVzZXIodXNlcik7XG5cdFx0XHRcdFx0YXBwLmdvVG9WaWV3KCdob21lJyk7XG5cdFx0XHRcdFx0YXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuaW5pdCgpO1xuXHRcdFx0XHRcdGF1dGgucmVzZXRWaWV3cygpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCBwYXNzd29yZCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0XHRhcHAuZ29Ub1ZpZXcoJ2hvbWUnKTtcblx0XHRcdFx0XHRhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5pbml0KCk7XG5cdFx0XHRcdFx0YXV0aC5yZXNldFZpZXdzKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuXHRcdFx0XHRcdC8vIFRoZSBsb2dpbiBmYWlsZWQuIENoZWNrIGVycm9yIHRvIHNlZSB3aHkuXG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5mb3Jnb3QgPSBmdW5jdGlvbihmb3JtRWxlbWVudCkge1xuXHRcdHZhciBlbWFpbCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9mb3Jnb3RdJykudmFsKCk7XG5cblx0XHRpZiAoZW1haWwubGVuZ3RoIDw9IDApIHtcblx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgYW4gZW1haWwgYWRkcmVzcy4nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0UGFyc2UuVXNlci5yZXF1ZXN0UGFzc3dvcmRSZXNldChlbWFpbCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRhdXRoLmZvcmdvdE1vZGUoZmFsc2UpO1xuXHRcdFx0XHRcdCQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9mb3Jnb3RdJykudmFsKCcnKTtcblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGNoZWNrIHlvdXIgZW1haWwgZm9yIGluc3RydWN0aW9ucyBvbiByZXNldHRpbmcgeW91ciBwYXNzd29yZC4nKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLnJlc2V0RXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLmVycm9yTWVzc2FnZSgnJyk7XG5cdH1cblxuXHRhdXRoLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5yYXRlV2Vlay5hY3RpdmVXZWVrKDApO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5wcm9maWxlLnNob3coZmFsc2UpO1xuXHRcdGFwcC5nb1RvVmlldygnYXV0aCcpO1xuXHRcdFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cdFx0YXV0aC5jdXJyZW50VXNlcihudWxsKTtcblx0XHRhdXRoLnJlc2V0Vmlld3MoKTtcblx0fVxuXG5cdGF1dGgucmVzZXRWaWV3cyA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXHRcdGF1dGguc2lnbkluTW9kZShmYWxzZSk7XG5cdFx0YXV0aC5zaWduVXBNb2RlKGZhbHNlKTtcblx0XHRhdXRoLmZvcmdvdE1vZGUoZmFsc2UpO1xuXHR9XG5cblx0YXV0aC50b2dnbGVTaWduSW4gPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoYXV0aC5zaWduSW5Nb2RlKCkpIHtcblx0XHRcdGF1dGguc2lnbkluTW9kZShmYWxzZSk7XG5cdFx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXV0aC5zaWduSW5Nb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGgudG9nZ2xlU2lnblVwID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUoZmFsc2UpO1xuXHRcdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGF1dGguc2lnblVwTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLnRvZ2dsZUZvcmdvdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChhdXRoLmZvcmdvdE1vZGUoKSkge1xuXHRcdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0XHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhdXRoLmZvcmdvdE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5zYW5pdGl6ZUVycm9ycyA9IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0c3dpdGNoKGVycm9yLmNvZGUpXG5cdFx0e1xuXHRcdFx0Y2FzZSAxMDE6XG5cdFx0XHRcdHJldHVybiAnUGxlYXNlIGVudGVyIGEgdmFsaWQgdXNlcm5hbWUgYW5kIHBhc3N3b3JkLic7XG5cdFx0XHRjYXNlIDEyNDpcblx0XHRcdFx0cmV0dXJuICdPb3BzISBXZSBtZXNzZWQgdXAuIFBsZWFzZSB0cnkgYWdhaW4uJztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBlcnJvci5tZXNzYWdlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZXJyb3IubWVzc2FnZS5zbGljZSgxKSArICcuJztcblx0XHR9XG5cdH1cblxuXHRhdXRoLmluaXQoKTtcblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdXRoOyIsIi8qKlxuICogc2NyaXB0cy9tYWluLmpzXG4gKlxuICogVGhpcyBpcyB0aGUgc3RhcnRpbmcgcG9pbnQgZm9yIHlvdXIgYXBwbGljYXRpb24uXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBcHAgPSByZXF1aXJlKCcuL2FwcC5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuL2F1dGguanMnKTtcbnZhciBTZWxlY3RQcm9qZWN0ID0gcmVxdWlyZSgnLi9zZWxlY3QtcHJvamVjdC5qcycpO1xudmFyIFJhdGVXZWVrID0gcmVxdWlyZSgnLi9yYXRlLXdlZWsuanMnKTtcbnZhciBOb3RlcyA9IHJlcXVpcmUoJy4vbm90ZXMuanMnKTtcbnZhciBQZW9wbGUgPSByZXF1aXJlKCcuL3Blb3BsZS5qcycpO1xudmFyIFNhdmUgPSByZXF1aXJlKCcuL3NhdmUuanMnKTtcbnZhciBQZW9wbGVEZXRhaWxzID0gcmVxdWlyZSgnLi9wZW9wbGUtZGV0YWlscy5qcycpO1xudmFyIEhvbWUgPSByZXF1aXJlKCcuL2hvbWUuanMnKTtcbnZhciBBbGVydHMgPSByZXF1aXJlKCcuL2FsZXJ0cy5qcycpO1xudmFyIFByb2ZpbGUgPSByZXF1aXJlKCcuL3Byb2ZpbGUuanMnKTtcblxuLy8gaW5pdGlhbGl6ZSBwYXJzZVxuUGFyc2UuaW5pdGlhbGl6ZShcIkprWU5mUEJ3MmFQZ2NjN1BlVEdITUFVMlhLdmp6ZXFWSWt5Q2xWdW9cIiwgXCI0NU9NVTNaUzNvNWMxNjhsUXhhMGlseFF1NEZkTVZIVDFOVlRrT1JsXCIpO1xuXG4vLyBpbml0aWFsaXplIHR5cGVraXRcbihmdW5jdGlvbihkKSB7XG52YXIgY29uZmlnID0ge1xuICBraXRJZDogJ2FlZTZqZ3EnLFxuICBzY3JpcHRUaW1lb3V0OiAzMDAwXG59LFxuaD1kLmRvY3VtZW50RWxlbWVudCx0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXtoLmNsYXNzTmFtZT1oLmNsYXNzTmFtZS5yZXBsYWNlKC9cXGJ3Zi1sb2FkaW5nXFxiL2csXCJcIikrXCIgd2YtaW5hY3RpdmVcIjt9LGNvbmZpZy5zY3JpcHRUaW1lb3V0KSx0az1kLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIiksZj1mYWxzZSxzPWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIilbMF0sYTtoLmNsYXNzTmFtZSs9XCIgd2YtbG9hZGluZ1wiO3RrLnNyYz0nLy91c2UudHlwZWtpdC5uZXQvJytjb25maWcua2l0SWQrJy5qcyc7dGsuYXN5bmM9dHJ1ZTt0ay5vbmxvYWQ9dGsub25yZWFkeXN0YXRlY2hhbmdlPWZ1bmN0aW9uKCl7YT10aGlzLnJlYWR5U3RhdGU7aWYoZnx8YSYmYSE9XCJjb21wbGV0ZVwiJiZhIT1cImxvYWRlZFwiKXJldHVybjtmPXRydWU7Y2xlYXJUaW1lb3V0KHQpO3RyeXtUeXBla2l0LmxvYWQoY29uZmlnKX1jYXRjaChlKXt9fTtzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRrLHMpXG59KShkb2N1bWVudCk7XG5cbnZhciBhcHAgPSBuZXcgQXBwKCk7XG52YXIgYXV0aCA9IG5ldyBBdXRoKGFwcCk7XG52YXIgaG9tZSA9IG5ldyBIb21lKGFwcCk7XG52YXIgc2VsZWN0UHJvamVjdCA9IG5ldyBTZWxlY3RQcm9qZWN0KGFwcCk7XG52YXIgcmF0ZVdlZWsgPSBuZXcgUmF0ZVdlZWsoYXBwKTtcbnZhciBub3RlcyA9IG5ldyBOb3RlcyhhcHApO1xudmFyIHBlb3BsZSA9IG5ldyBQZW9wbGUoYXBwKTtcbnZhciBzYXZlID0gbmV3IFNhdmUoYXBwKTtcbnZhciBwZW9wbGVEZXRhaWxzID0gbmV3IFBlb3BsZURldGFpbHMoYXBwKTtcbnZhciBhbGVydHMgPSBuZXcgQWxlcnRzKGFwcCk7XG52YXIgcHJvZmlsZSA9IG5ldyBQcm9maWxlKGFwcCk7XG5cbi8vIEN1c3RvbSBrbm9ja291dCBleHRlbmRlcnNcblxuLy8gSGVyZSdzIGEgY3VzdG9tIEtub2Nrb3V0IGJpbmRpbmcgdGhhdCBtYWtlcyBlbGVtZW50cyBzaG93bi9oaWRkZW4gdmlhIGpRdWVyeSdzIGZhZGVJbigpL2ZhZGVPdXQoKSBtZXRob2RzXG4vLyBDb3VsZCBiZSBzdG9yZWQgaW4gYSBzZXBhcmF0ZSB1dGlsaXR5IGxpYnJhcnlcbmtvLmJpbmRpbmdIYW5kbGVycy5mYWRlVmlzaWJsZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAkKGVsZW1lbnQpLnRvZ2dsZShrby51bndyYXAodmFsdWUpKTsgLy8gVXNlIFwidW53cmFwT2JzZXJ2YWJsZVwiIHNvIHdlIGNhbiBoYW5kbGUgdmFsdWVzIHRoYXQgbWF5IG9yIG1heSBub3QgYmUgb2JzZXJ2YWJsZVxuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIFdoZW5ldmVyIHRoZSB2YWx1ZSBzdWJzZXF1ZW50bHkgY2hhbmdlcywgc2xvd2x5IGZhZGUgdGhlIGVsZW1lbnQgaW4gb3Igb3V0XG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAga28udW53cmFwKHZhbHVlKSA/ICQoZWxlbWVudCkuZmFkZUluKCkgOiAkKGVsZW1lbnQpLmZhZGVPdXQoKTtcbiAgICB9XG59XG5cbmtvLmJpbmRpbmdIYW5kbGVycy5zbGlkZVBhbmVsVmlzaWJsZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAvLyAkKGVsZW1lbnQpLnRvZ2dsZShrby51bndyYXAodmFsdWUpKTsgLy8gVXNlIFwidW53cmFwT2JzZXJ2YWJsZVwiIHNvIHdlIGNhbiBoYW5kbGUgdmFsdWVzIHRoYXQgbWF5IG9yIG1heSBub3QgYmUgb2JzZXJ2YWJsZVxuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIFdoZW5ldmVyIHRoZSB2YWx1ZSBzdWJzZXF1ZW50bHkgY2hhbmdlcywgc2xvd2x5IGZhZGUgdGhlIGVsZW1lbnQgaW4gb3Igb3V0XG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgaWYgKGtvLnVud3JhcCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgwLDAsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHZpZXdwb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgJChlbGVtZW50KS5yZW1vdmVDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDAsJyArIHZpZXdwb3J0SGVpZ2h0ICsgJ3B4LDApJykuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxua28uYmluZGluZ0hhbmRsZXJzLnNoaWZ0UGFuZWxWaXNpYmxlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gSW5pdGlhbGx5IHNldCB0aGUgZWxlbWVudCB0byBiZSBpbnN0YW50bHkgdmlzaWJsZS9oaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZVxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgIC8vICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICBpZiAoa28udW53cmFwKHZhbHVlKSkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hZGRDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDAlLDAsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHZpZXdwb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgJChlbGVtZW50KS5yZW1vdmVDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDEwMCUsMCwwKScpLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmFwcC5pbml0aWFsaXplKCk7IiwiLyoqXG4gKiBzY3JpcHRzL25vdGVzLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEhvbWUoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgaG9tZSA9IGFwcC5teVZpZXdNb2RlbC5ob21lID0ge307XG5cblx0aG9tZS50b3RhbHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0aG9tZS5pc1JlZnJlc2hEcmFnZ2luZyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRob21lLmRyYWdTdGFydCA9IGtvLm9ic2VydmFibGUoMCk7XG5cdGhvbWUudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRob21lLndlZWtzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cblx0aG9tZS5zaG93QWxlcnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLm15Vmlld01vZGVsLmFsZXJ0cy5zaG93KHRydWUpO1xuXHR9XG5cblx0aG9tZS5zaG93UHJvZmlsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5wcm9maWxlLnNob3codHJ1ZSk7XG5cdH1cblxuXHRob21lLnN0eWxlV2VlayA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cblx0XHR2YXIgc3R5bGVkRGF0ZSA9ICdXZWVrIG9mICcgKyBtb21lbnQoaG9tZS50b2RheSkuc3RhcnRPZignaXNvd2VlaycpLmFkZCgnZGF5cycsIChpbmRleCAqIDcpKS5mb3JtYXQoJ01NTSBEJyk7XG5cdFx0aWYgKGluZGV4ID09IDApIHsgc3R5bGVkRGF0ZSA9ICdUaGlzIFdlZWsnIH07XG5cdFx0aWYgKGluZGV4ID09IDEpIHsgc3R5bGVkRGF0ZSA9ICdOZXh0IFdlZWsnIH07XG5cdFx0cmV0dXJuIHN0eWxlZERhdGU7XG5cdH1cblxuXHRob21lLldlZWsgPSBmdW5jdGlvbihtaXNzaW5nV2Vlaykge1xuXHRcdHZhciBibGFua1dlZWsgPSB7XG5cdFx0XHRub3RlczogJycsXG5cdFx0XHRyYXRpbmc6IC0xLFxuXHRcdFx0dG90YWw6IC0xLFxuXHRcdFx0d2VlazogaG9tZS53ZWVrcygpW21pc3NpbmdXZWVrXVxuXHRcdH07XG5cdFx0cmV0dXJuIGJsYW5rV2Vlaztcblx0fVxuXG5cdGhvbWUuZ28gPSBmdW5jdGlvbihpbmRleCkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmluaXQoaW5kZXgpO1xuXHRcdGFwcC5nb1RvVmlldygnc2VsZWN0LXByb2plY3QnKTtcblx0fVxuXG5cdGhvbWUuY29udmVydE51bVRvV29yZHMgPSBmdW5jdGlvbihudW1iZXIpIHtcblx0XHRzd2l0Y2ggKG51bWJlcikge1xuXHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRyZXR1cm4gJ3plcm8nO1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRyZXR1cm4gJ29uZSc7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHJldHVybiAndHdvJztcblx0XHRcdGNhc2UgMzpcblx0XHRcdFx0cmV0dXJuICd0aHJlZSc7XG5cdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdHJldHVybiAnZm91cic7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gJ3Vua25vd24nO1xuXHRcdH1cblx0fVxuXG5cdGhvbWUuZ2V0VG90YWxzQW5kUmF0aW5nID0gZnVuY3Rpb24oKSB7XG5cdFx0aG9tZS53ZWVrcyhbXSk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcHAubXlWaWV3TW9kZWwubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0aG9tZS53ZWVrcy5wdXNoKG1vbWVudChob21lLnRvZGF5KS5zdGFydE9mKCdpc293ZWVrJykuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJykpO1xuXHRcdH1cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFRvdGFsc0FuZFJhdGluZycsIHtcblx0XHRcdHdlZWtzOiBob21lLndlZWtzKClcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih0b3RhbHNBbmRSYXRpbmcpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IHRvdGFsc0FuZFJhdGluZy5sZW5ndGg7IGkgPCBhcHAubXlWaWV3TW9kZWwubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0XHRcdC8vIGFkZCBibGFuayBlbnRyaWVzIHRvIHRoZSByZXN1bHRzXG5cdFx0XHRcdFx0dG90YWxzQW5kUmF0aW5nLnB1c2goaG9tZS5XZWVrKGkpKTtcblx0XHRcdFx0XHQkKCcjaG9tZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+IFB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHRcdGhvbWUuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHRcdGhvbWUuZHJhZ1N0YXJ0KDApO1xuXHRcdFx0XHRcdCQoJyNob21lIC5wYWdlJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGhvbWUudG90YWxzKHRvdGFsc0FuZFJhdGluZyk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0aG9tZS5kcmFnUmVmcmVzaCA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKGhvbWUuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiBob21lLmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHZhciB0b3AgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKTtcblx0XHRcdHZhciBkZWx0YSA9IE1hdGguZmxvb3IoZXZlbnQuZ2VzdHVyZS5kaXN0YW5jZSk7XG5cdFx0XHRpZiAodG9wID09IDAgJiYgZGVsdGEgPiAzMCkge1xuXHRcdFx0XHRpZiAoZGVsdGEgPiAxNTApIGRlbHRhID0gMTUwO1xuXHRcdFx0XHQkKCcjaG9tZSAucGFnZScpLmNzcygnbWFyZ2luLXRvcCcsIGRlbHRhIC0gMzApO1xuXHRcdFx0XHRpZiAoZGVsdGEgPj0gMTAwKSB7XG5cdFx0XHRcdFx0JCgnI2hvbWUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS11cFwiPjwvc3Bhbj4gUmVsZWFzZSB0byByZWZyZXNoJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI2hvbWUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPiBQdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGhvbWUuc3RhcnRSZWZyZXNoRHJhZyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKCFob21lLmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgaG9tZS5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHRob21lLmRyYWdTdGFydCgkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSk7XG5cdFx0XHRob21lLmlzUmVmcmVzaERyYWdnaW5nKHRydWUpO1xuXHRcdFx0JChldmVudC5nZXN0dXJlLnRhcmdldCkub25lKCdkcmFnZW5kJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0dmFyIGRlbHRhID0gcGFyc2VJbnQoJCgnI2hvbWUgLnBhZ2UnKS5jc3MoJ21hcmdpbi10b3AnKSk7XG5cblx0XHRcdFx0aWYgKGRlbHRhID49IDcwKSB7XG5cdFx0XHRcdFx0aG9tZS5nZXRUb3RhbHNBbmRSYXRpbmcoKTtcblx0XHRcdFx0XHQkKCcjaG9tZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluXCI+PC9zcGFuPiBSZWZyZXNoaW5nLi4uJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI2hvbWUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPiBQdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0XHRob21lLmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0XHRob21lLmRyYWdTdGFydCgwKTtcblx0XHRcdFx0XHQkKCcjaG9tZSAucGFnZScpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdFx0fSwgMTAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXHRob21lLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRob21lLmdldFRvdGFsc0FuZFJhdGluZygpO1xuXHR9XG5cblx0aWYgKGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHRob21lLmluaXQoKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gSG9tZTsiLCIvKipcbiAqIHNjcmlwdHMvbm90ZXMuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTm90ZXMoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgbm90ZXMgPSBhcHAubXlWaWV3TW9kZWwubm90ZXMgPSB7fTtcblxuXHRub3Rlcy5zaG93ID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdG5vdGVzLnJhdGluZyA9IGtvLm9ic2VydmFibGUoMik7XG5cdG5vdGVzLmNvbnRlbnQgPSBrby5vYnNlcnZhYmxlKCk7XG5cblx0bm90ZXMuc3RhdHVzT3B0aW9ucyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXG5cdG5vdGVzLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRub3Rlcy5zdGF0dXNPcHRpb25zLnB1c2gobmV3IG5vdGVzLlN0YXR1cygnQnJpbmcgb24gdGhlIHdvcmsnLDApKTtcblx0XHRub3Rlcy5zdGF0dXNPcHRpb25zLnB1c2gobmV3IG5vdGVzLlN0YXR1cygnSVxcJ20gYSBsaXR0bGUgbGlnaHQnLDEpKTtcblx0XHRub3Rlcy5zdGF0dXNPcHRpb25zLnB1c2gobmV3IG5vdGVzLlN0YXR1cygnTGlmZSBpcyBnb29kJywyKSk7XG5cdFx0bm90ZXMuc3RhdHVzT3B0aW9ucy5wdXNoKG5ldyBub3Rlcy5TdGF0dXMoJ0lcXCdtIGEgYml0IG92ZXJ3aGVsbWVkJywzKSk7XG5cdFx0bm90ZXMuc3RhdHVzT3B0aW9ucy5wdXNoKG5ldyBub3Rlcy5TdGF0dXMoJ1N0b3AgdGhlIG1hZG5lc3MhJyw0KSk7XG5cdH1cblxuXHRub3Rlcy5TdGF0dXMgPSBmdW5jdGlvbih0ZXh0LCB2YWx1ZSkge1xuXHRcdHZhciBzdGF0dXMgPSB7XG5cdFx0XHRsYWJlbDogdGV4dCxcblx0XHRcdHZhbHVlOiB2YWx1ZVxuXHRcdH07XG5cdFx0cmV0dXJuIHN0YXR1cztcblx0fVxuXG5cdG5vdGVzLnNlbGVjdFN0YXR1cyA9IGZ1bmN0aW9uKGl0ZW0sIGUpIHtcblx0XHRub3Rlcy5yYXRpbmcoaXRlbS52YWx1ZSk7XG5cdH1cblxuXHRub3Rlcy5nb0JhY2sgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsuc2hvdyh0cnVlKTtcblx0XHRub3Rlcy5zaG93KGZhbHNlKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3JhdGUtd2VlaycpO1xuXHR9XG5cblx0bm90ZXMuZ29OZXh0ID0gZnVuY3Rpb24oKSB7XG5cdFx0bm90ZXMuc2hvdyhmYWxzZSk7XG5cdFx0YXBwLm15Vmlld01vZGVsLnNhdmUuc2hvdyh0cnVlKTtcblx0XHRhcHAubXlWaWV3TW9kZWwuc2F2ZS5zdWJtaXQoKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3NhdmUnKTtcblx0fVxuXG5cdG5vdGVzLmluaXQoKTtcblxuXHRyZXR1cm4gc2VsZjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGVzOyIsIi8qKlxuICogc2NyaXB0cy9wZW9wbGUtZGV0YWlscy5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQZW9wbGVEZXRhaWxzKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHBlb3BsZURldGFpbHMgPSBhcHAubXlWaWV3TW9kZWwucGVvcGxlRGV0YWlscyA9IHt9O1xuXG5cdHBlb3BsZURldGFpbHMucGVyc29uID0ga28ub2JzZXJ2YWJsZShudWxsKTtcblx0cGVvcGxlRGV0YWlscy53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG5cdHBlb3BsZURldGFpbHMudG90YWxzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKTtcblxuXHRwZW9wbGVEZXRhaWxzLmdldFBlcnNvbiA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRwZW9wbGVEZXRhaWxzLnRvdGFscyhbXSk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcHAubXlWaWV3TW9kZWwucGVvcGxlLm51bVdlZWtzOyBpKyspIHtcblx0XHRcdHZhciBwZXJzb24gPSBfLmZpbmQoYXBwLm15Vmlld01vZGVsLnBlb3BsZS50aW1lcygpW2ldLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdFx0cmV0dXJuIG9iai5hdHRyaWJ1dGVzLnVzZXIuaWQgPT0gaXRlbS5hdHRyaWJ1dGVzLnVzZXIuaWQ7XG5cdFx0XHR9KTtcblx0XHRcdHBlb3BsZURldGFpbHMudG90YWxzLnB1c2gocGVyc29uKTtcblx0XHR9XG5cblx0XHRwZW9wbGVEZXRhaWxzLnBlcnNvbihpdGVtKTtcblx0fVxuXG5cdHBlb3BsZURldGFpbHMuZ29CYWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLmdvVG9WaWV3KCdwZW9wbGUnKTtcblx0fVxuXG5cdHBlb3BsZURldGFpbHMuZ2V0Q29tcGFueU5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBuYW1lID0gJyc7XG5cdFx0dmFyIHByb2plY3QgPSBfLmZpbmQoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRyZXR1cm4gb2JqLmlkID09IGlkO1xuXHRcdH0pO1xuXG5cdFx0aWYgKHR5cGVvZiBwcm9qZWN0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0bmFtZSA9IHByb2plY3QuYXR0cmlidXRlcy5jb21wYW55O1xuXHRcdH1cblx0XHRyZXR1cm4gbmFtZTtcblx0fVxuXG5cdHBlb3BsZURldGFpbHMuZ2V0UHJvamVjdE5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBuYW1lID0gJyc7XG5cdFx0dmFyIHByb2plY3QgPSBfLmZpbmQoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRyZXR1cm4gb2JqLmlkID09IGlkO1xuXHRcdH0pO1xuXG5cdFx0aWYgKHR5cGVvZiBwcm9qZWN0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0bmFtZSA9IHByb2plY3QuYXR0cmlidXRlcy5uYW1lO1xuXHRcdH1cblx0XHRyZXR1cm4gbmFtZTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBlb3BsZURldGFpbHM7IiwiLyoqXG4gKiBzY3JpcHRzL3Blb3BsZS5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQZW9wbGUoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcGVvcGxlID0gYXBwLm15Vmlld01vZGVsLnBlb3BsZSA9IHt9O1xuXG5cdHBlb3BsZS5udW1XZWVrcyA9IDM7XG5cdHBlb3BsZS50b2RheSA9IG1vbWVudChuZXcgRGF0ZSgpKS5zdGFydE9mKCdpc293ZWVrJyk7XG5cdHBlb3BsZS5hY3RpdmVXZWVrID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cGVvcGxlLmFjdGl2ZVBlcnNvbiA9IGtvLm9ic2VydmFibGUoKTtcblx0cGVvcGxlLnZpZXdUeXBlID0ga28ub2JzZXJ2YWJsZSgnaG91cnMnKTtcblx0cGVvcGxlLnRpbWVzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHBlb3BsZS53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0cGVvcGxlLmRyYWdTdGFydCA9IGtvLm9ic2VydmFibGUoMCk7XG5cblx0cGVvcGxlLmdldFRpbWVzID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRhdGVzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0ZGF0ZXMucHVzaChtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ1lZWVksIE0sIEQnKSk7XG5cdFx0XHRwZW9wbGUud2Vla3MoKVtpXS5kYXRlKG1vbWVudChwZW9wbGUudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnTU1NIEQnKSk7XG5cdFx0fVxuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0VGltZXMnLCB7XG5cdFx0XHRkYXRlczogZGF0ZXNcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih0aW1lcykge1xuXHRcdFx0XHRwZW9wbGUudGltZXMoW10pO1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHRpbWVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0dGltZXNbal0uYXR0cmlidXRlcy5kYXRhID0gJC5wYXJzZUpTT04odGltZXNbal0uYXR0cmlidXRlcy5kYXRhKTtcblx0XHRcdFx0XHR2YXIgdG90YWwgPSBfKHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YS5wcm9qZWN0cykucmVkdWNlKGZ1bmN0aW9uKGFjYywgb2JqKSB7XG5cdFx0XHRcdFx0XHRfKG9iaikuZWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7IGFjY1trZXldID0gKGFjY1trZXldID8gYWNjW2tleV0gOiAwKSArIHZhbHVlIH0pO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdFx0XHR9LCB7fSk7XG5cblx0XHRcdFx0XHR0aW1lc1tqXS5hdHRyaWJ1dGVzLnRvdGFsID0ga28ub2JzZXJ2YWJsZSh0b3RhbC5wZXJjZW50YWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBlb3BsZS5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHRcdFx0dmFyIHdlZWtEYXRlID0gbW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJyk7XG5cdFx0XHRcdFx0dmFyIHdlZWsgPSBfLmZpbHRlcih0aW1lcywgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb2JqLmF0dHJpYnV0ZXMuZGF0YS5kYXRlID09IHdlZWtEYXRlO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0dmFyIHNvcnRlZCA9IF8uc29ydEJ5KHdlZWssIGZ1bmN0aW9uKG9iail7IFxuXHRcdFx0XHRcdFx0cmV0dXJuIC1vYmouYXR0cmlidXRlcy50b3RhbCgpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0cGVvcGxlLnRpbWVzLnB1c2goc29ydGVkKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0cGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0cGVvcGxlLmRyYWdTdGFydCgwKTtcblx0XHRcdFx0JCgnI3Blb3BsZSAucGVvcGxlJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cGVvcGxlLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBlb3BsZS5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHR2YXIgd2VlayA9IHtcblx0XHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ01NTSBEJykpXG5cdFx0XHR9XG5cdFx0XHRwZW9wbGUud2Vla3MucHVzaCh3ZWVrKTtcblx0XHR9XG5cdFx0cGVvcGxlLmdldFRpbWVzKCk7XG5cdH1cblxuXHRwZW9wbGUuc2VsZWN0V2VlayA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0cGVvcGxlLmFjdGl2ZVdlZWsoaW5kZXgpO1xuXHRcdC8vIGdvIGdldCB0aGUgZGF0YSBmb3IgdGhpcyB3ZWVrXG5cdH1cblxuXHRwZW9wbGUudG9nZ2xlVmlldyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChwZW9wbGUudmlld1R5cGUoKSA9PSAnaG91cnMnKSB7XG5cdFx0XHRwZW9wbGUudmlld1R5cGUoJ3BlcmNlbnQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGVvcGxlLnZpZXdUeXBlKCdob3VycycpO1xuXHRcdH1cblx0fVxuXG5cdHBlb3BsZS5nb1RvUGVyc29uID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5wZW9wbGVEZXRhaWxzLmdldFBlcnNvbihpdGVtKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3Blb3BsZS1kZXRhaWxzJyk7XG5cdH1cblxuXHRwZW9wbGUuZHJhZ1JlZnJlc2ggPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmIChwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiBwZW9wbGUuZHJhZ1N0YXJ0KCkgPT0gMCkge1xuXHRcdFx0dmFyIHRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpO1xuXHRcdFx0dmFyIGRlbHRhID0gTWF0aC5mbG9vcihldmVudC5nZXN0dXJlLmRpc3RhbmNlKTtcblx0XHRcdGlmICh0b3AgPT0gMCAmJiBkZWx0YSA+IDMwKSB7XG5cdFx0XHRcdGlmIChkZWx0YSA+IDE1MCkgZGVsdGEgPSAxNTA7XG5cdFx0XHRcdCQoJyNwZW9wbGUgLnBlb3BsZScpLmNzcygnbWFyZ2luLXRvcCcsIGRlbHRhIC0gMzApO1xuXHRcdFx0XHRpZiAoZGVsdGEgPj0gMTAwKSB7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLXVwXCI+PC9zcGFuPlJlbGVhc2UgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cGVvcGxlLnN0YXJ0UmVmcmVzaERyYWcgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmICghcGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgIWFwcC5teVZpZXdNb2RlbC5oZWFkZXIuaXNPcGVuKCkgJiYgcGVvcGxlLmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHBlb3BsZS5kcmFnU3RhcnQoJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO1xuXHRcdFx0cGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKHRydWUpO1xuXHRcdFx0JChldmVudC5nZXN0dXJlLnRhcmdldCkub25lKCdkcmFnZW5kJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0cGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0dmFyIGRlbHRhID0gcGFyc2VJbnQoJCgnI3Blb3BsZSAucGVvcGxlJykuY3NzKCdtYXJnaW4tdG9wJykpO1xuXHRcdFx0XHRpZiAoZGVsdGEgPj0gNzApIHtcblx0XHRcdFx0XHRwZW9wbGUuZ2V0VGltZXMoKTtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW5cIj48L3NwYW4+UmVmcmVzaGluZy4uLicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnBlb3BsZScpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdFx0fSwgMTAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9XG5cblx0fVxuXG5cdHBlb3BsZS5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGVvcGxlOyIsIi8qKlxuICogc2NyaXB0cy9wcm9maWxlLmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQcm9maWxlKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHByb2ZpbGUgPSBhcHAubXlWaWV3TW9kZWwucHJvZmlsZSA9IHt9O1xuXG5cdHByb2ZpbGUuc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cblx0cmV0dXJuIHNlbGY7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9maWxlOyIsIi8qKlxuICogc2NyaXB0cy9yYXRlLXdlZWsuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUmF0ZVdlZWsoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcmF0ZVdlZWsgPSBhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsgPSB7fTtcblxuXHRyYXRlV2Vlay5yZWdpc3Rlck1vdXNlWCA9IGtvLm9ic2VydmFibGUoKTtcblx0cmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRyYXRlV2Vlay5yZWdpc3RlclJhdGlvID0ga28ub2JzZXJ2YWJsZSgkKGRvY3VtZW50KS53aWR0aCgpIC0gMjApO1xuXHRyYXRlV2Vlay5zaG93ID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0cmF0ZVdlZWsuZHJhZyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0dmFyIGRpcmVjdGlvbiA9IGV2ZW50Lmdlc3R1cmUuZGlyZWN0aW9uO1xuXHRcdGlmIChkaXJlY3Rpb24gPT0gJ2xlZnQnIHx8IGRpcmVjdGlvbiA9PSAncmlnaHQnKSB7XG5cdFx0XHR2YXIgc3RhcnRYID0gZXZlbnQuZ2VzdHVyZS5zdGFydEV2ZW50LmNlbnRlci5wYWdlWDtcblx0XHRcdGlmIChyYXRlV2Vlay5yZWdpc3Rlck1vdXNlWCgpICE9IHN0YXJ0WCkge1xuXHRcdFx0XHRyYXRlV2Vlay5yZWdpc3Rlck1vdXNlWChzdGFydFgpO1xuXHRcdFx0XHRyYXRlV2Vlay5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZShpdGVtLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpKTtcblx0XHRcdH1cblx0XHRcdHZhciBkaWZmID0gKGV2ZW50Lmdlc3R1cmUuZGVsdGFYIC8gcmF0ZVdlZWsucmVnaXN0ZXJSYXRpbygpKSAqIDE1MDtcblx0XHRcdHZhciBuZXdQZXJjZW50YWdlID0gTWF0aC5mbG9vcigoZGlmZiArIHJhdGVXZWVrLnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlKCkpIC8gNSkgKiA1O1xuXG5cdFx0XHRpZiAobmV3UGVyY2VudGFnZSA+IDAgJiYgbmV3UGVyY2VudGFnZSA8PSAxNTApIHtcblx0XHRcdFx0aXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UobmV3UGVyY2VudGFnZSk7XG5cdFx0XHR9IGVsc2UgaWYgKG5ld1BlcmNlbnRhZ2UgPiAxNTApIHtcblx0XHRcdFx0aXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoMTUwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGl0ZW0uYXR0cmlidXRlcy5wZXJjZW50YWdlKDApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJhdGVXZWVrLmdvQmFjayA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LnNob3codHJ1ZSk7XG5cdFx0cmF0ZVdlZWsuc2hvdyhmYWxzZSk7XG5cdFx0YXBwLmdvVG9WaWV3KCdzZWxlY3QtcHJvamVjdCcpO1xuXHR9XG5cblx0cmF0ZVdlZWsuZ29OZXh0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmF0ZVdlZWsuc2hvdyhmYWxzZSk7XG5cdFx0YXBwLm15Vmlld01vZGVsLm5vdGVzLnNob3codHJ1ZSk7XG5cdFx0YXBwLmdvVG9WaWV3KCdub3RlcycpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmF0ZVdlZWs7IiwiLyoqXG4gKiBzY3JpcHRzL3NhdmUuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gU2F2ZShhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBzYXZlID0gYXBwLm15Vmlld01vZGVsLnNhdmUgPSB7fTtcblxuXHRzYXZlLnNob3cgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2F2ZS5zdWNjZXNzID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNhdmUuZXJyb3IgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2F2ZS5zYXZpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXHRzYXZlLnJlc3VsdCA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHQvLyBzYXZlLmRvbmUgPSBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0Ly8gXHR2YXIgZG9uZSA9IGZhbHNlO1xuXHQvLyBcdGZvciAodmFyIGkgPSAwOyBpIDwgc2F2ZS5yZXN1bHQubGVuZ3RoOyBpKyspIHtcblx0Ly8gXHRcdGRvbmUgPSBkb25lIHx8IHNhdmUucmVzdWx0W2ldO1xuXHQvLyBcdH1cblx0Ly8gXHRyZXR1cm4gZG9uZTtcblx0Ly8gfSk7XG5cblx0c2F2ZS5zdWJtaXQgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3NhdmUnKTtcblx0XHRzYXZlLnNob3codHJ1ZSk7XG5cdFx0c2F2ZS5zYXZpbmcodHJ1ZSk7XG5cdFx0dmFyIHRlbXAgPSB7fTtcblx0XHR2YXIgY3VyV2Vlaztcblx0XHQvLyB2YXIgbnVtV2Vla3MgPSBhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsud2Vla3MoKS5sZW5ndGg7XG5cblx0XHR2YXIgcHJvamVjdHMgPSBbXTtcblx0XHRfLmVhY2goYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuZ3JvdXBzKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG5cdFx0XHRfLmVhY2goZ3JvdXAuYXR0cmlidXRlcy5wcm9qZWN0cygpLCBmdW5jdGlvbihwcm9qZWN0KSB7XG5cdFx0XHRcdGlmIChwcm9qZWN0LmF0dHJpYnV0ZXMuc2VsZWN0ZWQoKSkge1xuXHRcdFx0XHRcdHZhciBuZXdQcm9qZWN0ID0ge1xuXHRcdFx0XHRcdFx0aWQ6IHByb2plY3QuaWQsXG5cdFx0XHRcdFx0XHRwZXJjZW50YWdlOiBwcm9qZWN0LmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHByb2plY3RzLnB1c2gobmV3UHJvamVjdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fSk7XG5cblx0XHR2YXIgZGF0ZSA9IG1vbWVudChuZXcgRGF0ZSgpKS5zdGFydE9mKCdpc293ZWVrJykuYWRkKCdkYXlzJywgKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LndlZWtJbmRleCgpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpO1xuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRkYXRlOiBkYXRlLFxuXHRcdFx0cmF0aW5nOiBhcHAubXlWaWV3TW9kZWwubm90ZXMucmF0aW5nKCksXG5cdFx0XHRub3RlczogYXBwLm15Vmlld01vZGVsLm5vdGVzLmNvbnRlbnQoKSxcblx0XHRcdHByb2plY3RzOiBwcm9qZWN0c1xuXHRcdH1cblxuXHRcdFBhcnNlLkNsb3VkLnJ1bignc2F2ZVRpbWUnLCB7XG5cdFx0XHRkYXRlOiBkYXRlLFxuXHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSlcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdGFwcC5teVZpZXdNb2RlbC5ob21lLmdldFRvdGFsc0FuZFJhdGluZygpO1xuXHRcdFx0XHRzYXZlLnN1Y2Nlc3ModHJ1ZSk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHRzYXZlLmVycm9yKHRydWUpO1xuXHRcdFx0XHRzYXZlLnJlc2V0KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRzYXZlLnRyeUFnYWluID0gZnVuY3Rpb24oKSB7XG5cdFx0c2F2ZS5lcnJvcihmYWxzZSk7XG5cdFx0c2F2ZS5zdWNjZXNzKGZhbHNlKTtcblx0XHRzYXZlLnN1Ym1pdCgpO1xuXHR9XG5cblx0c2F2ZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHRcdHNhdmUuc2F2aW5nKGZhbHNlKTtcblx0XHRzYXZlLnNob3coZmFsc2UpO1xuXHRcdHNhdmUuZXJyb3IoZmFsc2UpO1xuXHRcdHNhdmUuc3VjY2VzcyhmYWxzZSk7XG5cdFx0YXBwLmdvVG9WaWV3KCdob21lJyk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTYXZlOyIsIi8qKlxuICogc2NyaXB0cy9zZWxlY3QtcHJvamVjdC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTZWxlY3RQcm9qZWN0KGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHNlbGVjdFByb2plY3QgPSBhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdCA9IHt9O1xuXG5cdHNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC5pc0FkZE1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2VsZWN0UHJvamVjdC51bmlxdWVDb21wYW55TmFtZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0ID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2VsZWN0UHJvamVjdC5kcmFnU3RhcnQgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRzZWxlY3RQcm9qZWN0LmNvdW50ID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0c2VsZWN0UHJvamVjdC53ZWVrID0ga28ub2JzZXJ2YWJsZSgnVGhpcyBXZWVrJyk7XG5cdHNlbGVjdFByb2plY3Quc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzZWxlY3RQcm9qZWN0LnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0c2VsZWN0UHJvamVjdC5ncm91cHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC53ZWVrSW5kZXggPSBrby5vYnNlcnZhYmxlKDApO1xuXG5cdHNlbGVjdFByb2plY3QuR3JvdXAgPSBmdW5jdGlvbih0eXBlKSB7XG5cdFx0dmFyIGdyb3VwID0ge1xuXHRcdFx0YXR0cmlidXRlczoge31cblx0XHR9XG5cdFx0Z3JvdXAuYXR0cmlidXRlcy5uYW1lID0gKHR5cGUgPT0gJ3ByaXZhdGUnID8gJ015IFByaXZhdGUgUHJvamVjdHMnIDogJ015IFNoYXJlZCBQcm9qZWN0cycpO1xuXHRcdHJldHVybiBncm91cDtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuZ2V0R3JvdXBzID0gZnVuY3Rpb24oKSB7XG5cdFx0c2VsZWN0UHJvamVjdC5ncm91cHMoW10pO1xuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0R3JvdXBzJywge30sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGdyb3Vwcykge1xuXHRcdFx0XHQvLyBncm91cHMuc3BsaWNlKDAsMCxuZXcgc2VsZWN0UHJvamVjdC5Hcm91cCgncHJpdmF0ZScpLCBuZXcgc2VsZWN0UHJvamVjdC5Hcm91cCgncHVibGljJykpO1xuXHRcdFx0XHRfLmVhY2goZ3JvdXBzLCBmdW5jdGlvbihncm91cCkge1xuXHRcdFx0XHRcdGdyb3VwLmF0dHJpYnV0ZXMucHJvamVjdHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0XHRcdFx0XHRncm91cC5hdHRyaWJ1dGVzLm5vbk1lbWJlciA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC5ncm91cHMoZ3JvdXBzKTtcblxuXHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoMCk7XG5cdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAuZ3JvdXBzJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdH0sIDEwMCk7XG5cblxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdFByb2plY3QuZ3JvdXBzKCkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFByb2plY3RzJywge1xuXHRcdFx0XHRcdFx0Z3JvdXBJZDogc2VsZWN0UHJvamVjdC5ncm91cHMoKVtpXS5pZFxuXHRcdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3VsdHMpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHJlc3VsdHMucHJvamVjdHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRcdHZhciBncm91cCA9IF8uZmluZChzZWxlY3RQcm9qZWN0Lmdyb3VwcygpLCBmdW5jdGlvbihncm91cCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGdyb3VwLmlkID09IHJlc3VsdHMucHJvamVjdHNbMF0uYXR0cmlidXRlcy5ncm91cC5pZDtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXG5cdFx0XHRcdFx0XHRcdFx0Xy5lYWNoKHJlc3VsdHMucHJvamVjdHMsIGZ1bmN0aW9uKHByb2plY3QpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHByb2plY3QuYXR0cmlidXRlcy5zZWxlY3RlZCA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRcdFx0XHRcdFx0XHRcdFx0cHJvamVjdC5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGdyb3VwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRncm91cC5hdHRyaWJ1dGVzLnByb2plY3RzKHJlc3VsdHMucHJvamVjdHMpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBjaGVjayBtZW1iZXJzaGlwIHN0YXR1cyBmb3IgdGhlIGVtcHR5IGdyb3VwXG5cdFx0XHRcdFx0XHRcdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRNZW1iZXJzaGlwU3RhdHVzJywge1xuXHRcdFx0XHRcdFx0XHRcdFx0Z3JvdXBJZDogcmVzdWx0cy5ncm91cElkXG5cdFx0XHRcdFx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdFx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzdWx0cykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoIXJlc3VsdHMuc3RhdHVzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIGdyb3VwID0gXy5maW5kKHNlbGVjdFByb2plY3QuZ3JvdXBzKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZ3JvdXAuaWQgPT0gcmVzdWx0cy5ncm91cElkO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGdyb3VwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRncm91cC5hdHRyaWJ1dGVzLm5vbk1lbWJlcih0cnVlKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gY29uc29sZS5sb2coc2VsZWN0UHJvamVjdC5ncm91cHMoKSlcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LmdvSG9tZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHNlbGVjdFByb2plY3Quc2hvdyhmYWxzZSk7XG5cdFx0YXBwLmdvVG9WaWV3KCdob21lJyk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LmdvTmV4dCA9IGZ1bmN0aW9uKCkge1xuXHRcdHNlbGVjdFByb2plY3Quc2hvdyhmYWxzZSk7XG5cdFx0YXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLnNob3codHJ1ZSk7XG5cdFx0YXBwLmdvVG9WaWV3KCdyYXRlLXdlZWsnKTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuaW5pdCA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0dmFyIHN0eWxlZERhdGUgPSAnV2VlayBvZiAnICsgbW9tZW50KHNlbGVjdFByb2plY3QudG9kYXkpLmFkZCgnZGF5cycsIChpbmRleCAqIDcpKS5mb3JtYXQoJ01NTSBEJyk7XG5cdFx0aWYgKGluZGV4ID09IDApIHN0eWxlZERhdGUgPSAnVGhpcyBXZWVrJztcblx0XHRpZiAoaW5kZXggPT0gMSkgc3R5bGVkRGF0ZSA9ICdOZXh0IFdlZWsnO1xuXHRcdHNlbGVjdFByb2plY3Qud2VlayhzdHlsZWREYXRlKTtcblx0XHRzZWxlY3RQcm9qZWN0LndlZWtJbmRleChpbmRleCk7XG5cdFx0c2VsZWN0UHJvamVjdC5zaG93KHRydWUpO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC50b2dnbGVQcm9qZWN0ID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoaXRlbS5hdHRyaWJ1dGVzLnNlbGVjdGVkKCkpIHtcblx0XHRcdGl0ZW0uYXR0cmlidXRlcy5zZWxlY3RlZChmYWxzZSk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmNvdW50KHNlbGVjdFByb2plY3QuY291bnQoKSAtIDEpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpdGVtLmF0dHJpYnV0ZXMuc2VsZWN0ZWQodHJ1ZSk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmNvdW50KHNlbGVjdFByb2plY3QuY291bnQoKSArIDEpO1xuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3QudG9nZ2xlQWRkTW9kZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChzZWxlY3RQcm9qZWN0LmlzQWRkTW9kZSgpKSB7XG5cdFx0XHRhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmlzTW9kYWwoZmFsc2UpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5pc0FkZE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmlzTW9kYWwodHJ1ZSk7XG5cdFx0XHQkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS52YWwoJycpO1xuXHRcdFx0JCgnLnByb2plY3QtbmFtZS1maWVsZCcpLnZhbCgnJyk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QoW10pO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5pc0FkZE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zZWxlY3RQcm9qZWN0VHlwZWFoZWFkID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdCQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLnZhbChpdGVtKTtcblx0XHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QoW10pO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zaG93VHlwZWFoZWFkUmVzdWx0cyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0dmFyIG5lZWRsZSA9IGV2ZW50LnRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teXFx3XFxkXS9naSwgJycpO1xuXG5cdFx0aWYgKG5lZWRsZS5sZW5ndGggPiAwKSB7XG5cdFx0XHR2YXIgZmlsdGVyZWRQcm9qZWN0cyA9IF8uZmlsdGVyKHNlbGVjdFByb2plY3QudW5pcXVlQ29tcGFueU5hbWVzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHR2YXIgaGF5c3RhY2sgPSBvYmoudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXlxcd1xcZF0vZ2ksICcnKTtcblx0XHRcdFx0cmV0dXJuIGhheXN0YWNrLmluZGV4T2YobmVlZGxlKSA+PSAwOyBcblx0XHRcdH0pO1xuXHRcdFx0dmFyIGZpZWxkUG9zaXRpb24gPSAkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS5vZmZzZXQoKTtcblx0XHRcdCQoJy5wcm9qZWN0LXR5cGVhaGVhZCcpLmNzcygnbGVmdCcsIGZpZWxkUG9zaXRpb24ubGVmdCkuY3NzKCd0b3AnLCBmaWVsZFBvc2l0aW9uLnRvcCArICQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLmhlaWdodCgpKzIwKTtcblx0XHRcdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdChmaWx0ZXJlZFByb2plY3RzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KFtdKTtcblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnNhdmVOZXdQcm9qZWN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRjb21wYW55OiAkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS52YWwoKSxcblx0XHRcdHByb2plY3Q6ICQoJy5wcm9qZWN0LW5hbWUtZmllbGQnKS52YWwoKSxcblx0XHR9XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdzYXZlUHJvamVjdCcsIGRhdGEsIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHByb2plY3QpIHtcblx0XHRcdFx0YWxlcnQoJ1wiJyArIHByb2plY3QuYXR0cmlidXRlcy5jb21wYW55ICsgJzogJyArIHByb2plY3QuYXR0cmlidXRlcy5uYW1lICsgJ1wiIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5LicpO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LnRvZ2dsZUFkZE1vZGUoKTtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC5nZXRHcm91cHMoKTtcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHQvLyBhbGVydChlcnJvcilcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1x0XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LmRyYWdSZWZyZXNoID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoc2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZygpICYmIHNlbGVjdFByb2plY3QuZHJhZ1N0YXJ0KCkgPT0gMCkge1xuXHRcdFx0dmFyIHRvcCA9ICQoJyNzZWxlY3QtcHJvamVjdCAuZ3JvdXBzJykuc2Nyb2xsVG9wKCk7XG5cdFx0XHR2YXIgZGVsdGEgPSBNYXRoLmZsb29yKGV2ZW50Lmdlc3R1cmUuZGlzdGFuY2UpO1xuXHRcdFx0aWYgKHRvcCA9PSAwICYmIGRlbHRhID4gMzApIHtcblx0XHRcdFx0aWYgKGRlbHRhID4gMTUwKSBkZWx0YSA9IDE1MDtcblx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5ncm91cHMnKS5jc3MoJ21hcmdpbi10b3AnLCBkZWx0YSAtIDMwKTtcblx0XHRcdFx0aWYgKGRlbHRhID49IDEwMCkge1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLXVwXCI+PC9zcGFuPlJlbGVhc2UgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnN0YXJ0UmVmcmVzaERyYWcgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmICghc2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZygpICYmIHNlbGVjdFByb2plY3QuZHJhZ1N0YXJ0KCkgPT0gMCkge1xuXHRcdFx0c2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoJCgnI3NlbGVjdC1wcm9qZWN0IC5ncm91cHMnKS5zY3JvbGxUb3AoKSk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nKHRydWUpO1xuXHRcdFx0JChldmVudC5nZXN0dXJlLnRhcmdldCkub25lKCdkcmFnZW5kJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0dmFyIGRlbHRhID0gcGFyc2VJbnQoJCgnI3NlbGVjdC1wcm9qZWN0IC5ncm91cHMnKS5jc3MoJ21hcmdpbi10b3AnKSk7XG5cblx0XHRcdFx0aWYgKGRlbHRhID49IDcwKSB7XG5cdFx0XHRcdFx0c2VsZWN0UHJvamVjdC5nZXRHcm91cHMoKTtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpblwiPjwvc3Bhbj5SZWZyZXNoaW5nLi4uJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0XHRzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0XHRzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgwKTtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLmdyb3VwcycpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdFx0fSwgMTAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXHRpZiAoYXBwLm15Vmlld01vZGVsLmF1dGguY3VycmVudFVzZXIoKSkge1xuXHRcdHNlbGVjdFByb2plY3QuZ2V0R3JvdXBzKCk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RQcm9qZWN0OyJdfQ==
