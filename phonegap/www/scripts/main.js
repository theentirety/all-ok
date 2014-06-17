(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * scripts/notes.js
 */

'use strict';

function Alerts(app) {
	var self = this;

	var alerts = app.myViewModel.alerts = {};

	alerts.list = ko.observableArray();
	alerts.show = ko.observable(false);
	alerts.index = ko.observable(0);

	alerts.greetings = [
		'Hi there!',
		'Hello!',
		'Hi ya!',
		'Greetings!',
		'Well hello there!'
	];

	alert.Alert = function(data) {
		var alert = {
			type: 'join-request',
			title: 'Join Request',
			person: data.person,
			group: data.group
		}
		return alert;
	}

	alerts.current = ko.computed(function() {
		return alerts.list()[alerts.index()];
	});

	alerts.randomGreeting = ko.computed(function() {
		var rand = Math.floor(Math.random() * alerts.greetings.length);
		console.log(alerts.greetings[rand])
		return alerts.greetings[rand];
	});

	alerts.goNext = function() {
		var currentIndex = alerts.index();
		alerts.index(currentIndex + 1);
	}

	alerts.goBack = function() {
		var currentIndex = alerts.index();
		alerts.index(currentIndex - 1);
	}

	alerts.takeAction = function(action, item) {
		console.log(action);

		if (action == 'deny' || action == 'approve') {
			var newList = _.without(alerts.list(), alerts.list()[alerts.index()]);
			alerts.list(newList);

			if (alerts.index() >= alerts.list().length) {
				alerts.goBack();
			}
		}


		// var newList = _.reject(alerts.list(), function(alert) {
		// 	console.log()
		// 	return false;
		// });
		// alerts.list.pop(alerts.index());
		// console.log(alerts.list().length)

	}

	alerts.init = function() {
		alerts.list.push(new alert.Alert({ person: 'Aaron Martlage', group: 'Design Group' }));
		alerts.list.push(new alert.Alert({ person: 'Kieran Evans', group: 'Awesome Group' }));
		console.log(alerts.list())
	}

	alerts.init();

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

		var styledDate = 'Week of ' + moment(home.today).add('days', (index * 7)).format('MMM D');
		if (index == 0) { styledDate = 'This Week' };
		if (index == 1) { styledDate = 'Next Week' };
		return styledDate;
	}

	home.Week = function(missingWeek) {
		var blankWeek = {
			notes: '',
			rating: -1,
			total: -1,
			week: missingWeek
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

				var set = [];
				_.each(totalsAndRating, function(data) {
					set[data.week] = true;
				});

				for (var i = 0; i < app.myViewModel.numWeeks; i++) {
					var date = moment(home.today).startOf('isoweek').add('days', (i * 7)).format('YYYY, M, D');
					if (!set[date]) {
						totalsAndRating.push(new home.Week(date));
					}
				}

				var sorted = _.sortBy(totalsAndRating, function(item) {
					var date = item.week.split(',');
					var time = moment(new Date(date[0], date[1], date[2])).valueOf();
					return parseInt(time);
				});

				home.totals(sorted);

				$('#home .refresh').html('<span class="fa fa-arrow-circle-down"></span> Pull to refresh');
				home.isRefreshDragging(false);
				home.dragStart(0);
				$('#home .page').animate({
					marginTop: 0
				}, 100);

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

	notes.workloadWeek = ko.computed(function() {
		var text = app.myViewModel.selectProject.week();
		if (app.myViewModel.selectProject.weekIndex() >= 2) {
			text = 'the ' + text;
		} else {
			text = text.toLowerCase();
		}
		return text;
	});

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

	notes.reset = function(index) {
		if (index != null) {
			notes.rating(app.myViewModel.home.totals()[index].rating);
			notes.content(app.myViewModel.home.totals()[index].notes);
		} else {
			notes.rating(2);
			notes.content('');
		}
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

	rateWeek.totals = ko.computed(function() {
		var total = 0;
		_.each(app.myViewModel.selectProject.groups(), function(group) {
			_.each(group.attributes.projects(), function(project) {
				total = total + project.attributes.percentage();
			});
		});
		return total;
	});

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
		console.log(date)

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

	selectProject.init = function(index) {

		if (app.myViewModel.home.totals()[index].total >= 0) {
			app.myViewModel.notes.reset(index);
		} else {
			app.myViewModel.notes.reset(null);
		}
		selectProject.populateSelections(index);

		var styledDate = 'Week of ' + moment(selectProject.today).add('days', (index * 7)).format('MMM D');
		if (index == 0) styledDate = 'This Week';
		if (index == 1) styledDate = 'Next Week';
		selectProject.week(styledDate);
		selectProject.weekIndex(index);
		selectProject.show(true);
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

	selectProject.populateSelections = function(index) {
		var data = {
			userId: app.myViewModel.auth.currentUser().id,
			dates: [app.myViewModel.home.totals()[index].week]
		};

		Parse.Cloud.run('getTimes', data, {
			success: function(times) {
				if (times.length > 0) {
					var data = JSON.parse(times[0].attributes.data);
					var projects = data.projects;
					var set = [];
					_.each(projects, function(project) {
						set[project.id] = project.percentage;
					});

					_.each(app.myViewModel.selectProject.groups(), function(group) {
						_.each(group.attributes.projects(), function(project) {
							if (set[project.id]) {
								project.attributes.selected(true);
								project.attributes.percentage(set[project.id]);
							} else {
								project.attributes.selected(false);
								project.attributes.percentage(0);
							}
						});
					});
				}
			}, error: function(error) {
				console.log(error);
			}
		});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2FsZXJ0cy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvYXBwLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9hdXRoLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9mYWtlXzZhYzFmMWFmLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ob21lLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ub3Rlcy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcGVvcGxlLWRldGFpbHMuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3Blb3BsZS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcHJvZmlsZS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcmF0ZS13ZWVrLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zYXZlLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zZWxlY3QtcHJvamVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBzY3JpcHRzL25vdGVzLmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBbGVydHMoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgYWxlcnRzID0gYXBwLm15Vmlld01vZGVsLmFsZXJ0cyA9IHt9O1xuXG5cdGFsZXJ0cy5saXN0ID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdGFsZXJ0cy5zaG93ID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGFsZXJ0cy5pbmRleCA9IGtvLm9ic2VydmFibGUoMCk7XG5cblx0YWxlcnRzLmdyZWV0aW5ncyA9IFtcblx0XHQnSGkgdGhlcmUhJyxcblx0XHQnSGVsbG8hJyxcblx0XHQnSGkgeWEhJyxcblx0XHQnR3JlZXRpbmdzIScsXG5cdFx0J1dlbGwgaGVsbG8gdGhlcmUhJ1xuXHRdO1xuXG5cdGFsZXJ0LkFsZXJ0ID0gZnVuY3Rpb24oZGF0YSkge1xuXHRcdHZhciBhbGVydCA9IHtcblx0XHRcdHR5cGU6ICdqb2luLXJlcXVlc3QnLFxuXHRcdFx0dGl0bGU6ICdKb2luIFJlcXVlc3QnLFxuXHRcdFx0cGVyc29uOiBkYXRhLnBlcnNvbixcblx0XHRcdGdyb3VwOiBkYXRhLmdyb3VwXG5cdFx0fVxuXHRcdHJldHVybiBhbGVydDtcblx0fVxuXG5cdGFsZXJ0cy5jdXJyZW50ID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGFsZXJ0cy5saXN0KClbYWxlcnRzLmluZGV4KCldO1xuXHR9KTtcblxuXHRhbGVydHMucmFuZG9tR3JlZXRpbmcgPSBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHR2YXIgcmFuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFsZXJ0cy5ncmVldGluZ3MubGVuZ3RoKTtcblx0XHRjb25zb2xlLmxvZyhhbGVydHMuZ3JlZXRpbmdzW3JhbmRdKVxuXHRcdHJldHVybiBhbGVydHMuZ3JlZXRpbmdzW3JhbmRdO1xuXHR9KTtcblxuXHRhbGVydHMuZ29OZXh0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGN1cnJlbnRJbmRleCA9IGFsZXJ0cy5pbmRleCgpO1xuXHRcdGFsZXJ0cy5pbmRleChjdXJyZW50SW5kZXggKyAxKTtcblx0fVxuXG5cdGFsZXJ0cy5nb0JhY2sgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgY3VycmVudEluZGV4ID0gYWxlcnRzLmluZGV4KCk7XG5cdFx0YWxlcnRzLmluZGV4KGN1cnJlbnRJbmRleCAtIDEpO1xuXHR9XG5cblx0YWxlcnRzLnRha2VBY3Rpb24gPSBmdW5jdGlvbihhY3Rpb24sIGl0ZW0pIHtcblx0XHRjb25zb2xlLmxvZyhhY3Rpb24pO1xuXG5cdFx0aWYgKGFjdGlvbiA9PSAnZGVueScgfHwgYWN0aW9uID09ICdhcHByb3ZlJykge1xuXHRcdFx0dmFyIG5ld0xpc3QgPSBfLndpdGhvdXQoYWxlcnRzLmxpc3QoKSwgYWxlcnRzLmxpc3QoKVthbGVydHMuaW5kZXgoKV0pO1xuXHRcdFx0YWxlcnRzLmxpc3QobmV3TGlzdCk7XG5cblx0XHRcdGlmIChhbGVydHMuaW5kZXgoKSA+PSBhbGVydHMubGlzdCgpLmxlbmd0aCkge1xuXHRcdFx0XHRhbGVydHMuZ29CYWNrKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cblx0XHQvLyB2YXIgbmV3TGlzdCA9IF8ucmVqZWN0KGFsZXJ0cy5saXN0KCksIGZ1bmN0aW9uKGFsZXJ0KSB7XG5cdFx0Ly8gXHRjb25zb2xlLmxvZygpXG5cdFx0Ly8gXHRyZXR1cm4gZmFsc2U7XG5cdFx0Ly8gfSk7XG5cdFx0Ly8gYWxlcnRzLmxpc3QucG9wKGFsZXJ0cy5pbmRleCgpKTtcblx0XHQvLyBjb25zb2xlLmxvZyhhbGVydHMubGlzdCgpLmxlbmd0aClcblxuXHR9XG5cblx0YWxlcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRhbGVydHMubGlzdC5wdXNoKG5ldyBhbGVydC5BbGVydCh7IHBlcnNvbjogJ0Fhcm9uIE1hcnRsYWdlJywgZ3JvdXA6ICdEZXNpZ24gR3JvdXAnIH0pKTtcblx0XHRhbGVydHMubGlzdC5wdXNoKG5ldyBhbGVydC5BbGVydCh7IHBlcnNvbjogJ0tpZXJhbiBFdmFucycsIGdyb3VwOiAnQXdlc29tZSBHcm91cCcgfSkpO1xuXHRcdGNvbnNvbGUubG9nKGFsZXJ0cy5saXN0KCkpXG5cdH1cblxuXHRhbGVydHMuaW5pdCgpO1xuXG5cdHJldHVybiBzZWxmO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWxlcnRzOyIsIi8qKlxuICogc2NyaXB0cy9hcHAuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQXBwKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0Ly8gaW5pdGlhbGl6ZSBrbm9ja291dFxuXHRzZWxmLm15Vmlld01vZGVsID0ge307XG5cblx0c2VsZi5teVZpZXdNb2RlbC5hY3RpdmVWaWV3ID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0c2VsZi5teVZpZXdNb2RlbC52aWV3cyA9IFtcblx0XHQnYXV0aCcsXG5cdFx0J2hvbWUnLFxuXHRcdCdzZWxlY3QtcHJvamVjdCcsXG5cdFx0J3JhdGUtd2VlaycsXG5cdFx0J25vdGVzJyxcblx0XHQncGVvcGxlJyxcblx0XHQncGVvcGxlLWRldGFpbHMnLFxuXHRcdCdzYXZlJ1xuXHRdO1xuXG5cdHNlbGYubXlWaWV3TW9kZWwubnVtV2Vla3MgPSAzO1xuXHRzZWxmLm15Vmlld01vZGVsLnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0c2VsZi5teVZpZXdNb2RlbC53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXG5cdHNlbGYuZ29Ub1ZpZXcgPSBmdW5jdGlvbih2aWV3KSB7XG5cdFx0dmFyIGluZGV4ID0gc2VsZi5teVZpZXdNb2RlbC52aWV3cy5pbmRleE9mKHZpZXcpO1xuXHRcdHNlbGYubXlWaWV3TW9kZWwuYWN0aXZlVmlldyhpbmRleCk7XG5cdH1cblxuXHRzZWxmLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdkZXZpY2VyZWFkeScsIHNlbGYub25EZXZpY2VSZWFkeSwgZmFsc2UpO1xuXHR9XG5cblx0c2VsZi5vbkRldmljZVJlYWR5ID0gZnVuY3Rpb24oKSB7XG5cdFx0a28uYXBwbHlCaW5kaW5ncyhzZWxmLm15Vmlld01vZGVsKTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKG5hdmlnYXRvci5zcGxhc2hzY3JlZW4pIHtcblx0XHRcdFx0bmF2aWdhdG9yLnNwbGFzaHNjcmVlbi5oaWRlKCk7XG5cdFx0XHR9XG5cdFx0fSwgMjAwMCk7XG5cdFx0XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBcHA7IiwiLyoqXG4gKiBzY3JpcHRzL2F1dGguanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQXV0aChhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBhdXRoID0gYXBwLm15Vmlld01vZGVsLmF1dGggPSB7fTtcblxuXHRhdXRoLmN1cnJlbnRVc2VyID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRhdXRoLmVycm9yTWVzc2FnZSA9IGtvLm9ic2VydmFibGUoJycpO1xuXHRhdXRoLnNpZ25VcE1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0YXV0aC5zaWduSW5Nb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGF1dGguZm9yZ290TW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cdHZhciBjdXJyZW50VXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuXHRpZiAoY3VycmVudFVzZXIpIHtcblx0XHRhdXRoLmN1cnJlbnRVc2VyKGN1cnJlbnRVc2VyKTtcblx0fVxuXG5cdGF1dGguaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChhdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHRcdGFwcC5nb1RvVmlldygnaG9tZScpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhcHAuZ29Ub1ZpZXcoJ2F1dGgnKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLnJlc2V0RXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLmVycm9yTWVzc2FnZSgnJyk7XG5cdH1cblxuXHRhdXRoLnNpZ25JblVwID0gZnVuY3Rpb24oZm9ybUVsZW1lbnQpIHtcblx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblxuXHRcdHZhciB1c2VybmFtZSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9lbWFpbF0nKS52YWwoKTtcblx0XHR2YXIgcGFzc3dvcmQgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfcGFzc3dvcmRdJykudmFsKCk7XG5cblx0XHRpZiAoYXV0aC5zaWduVXBNb2RlKCkpIHtcblx0XHRcdHZhciBkaXNwbGF5TmFtZSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9kaXNwbGF5TmFtZV0nKS52YWwoKTtcblx0XHRcdHZhciBwYXNzd29yZENvbmZpcm0gPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfY29uZmlybVBhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0XHQvLyB2YWxpZGF0aW9uXG5cdFx0XHRpZiAodXNlcm5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZW1haWwgYWRkcmVzcy4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZGlzcGxheU5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZmlyc3QgYW5kIGxhc3QgbmFtZS4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocGFzc3dvcmQubGVuZ3RoIDwgMSB8fCBwYXNzd29yZENvbmZpcm0gPCAxIHx8IHBhc3N3b3JkICE9IHBhc3N3b3JkQ29uZmlybSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIGFuZCBjb25maXJtIGEgcGFzc3dvcmQuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHVzZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuXHRcdFx0dmFyIHNjcnViYmVkVXNlcm5hbWUgPSB1c2VybmFtZS5yZXBsYWNlKC9cXHMrL2csXCJcIik7IC8vcmVtb3ZlIHdoaXRlIHNwYWNlXG5cdFx0XHRzY3J1YmJlZFVzZXJuYW1lID0gc2NydWJiZWRVc2VybmFtZS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHR1c2VyLnNldCgndXNlcm5hbWUnLCBzY3J1YmJlZFVzZXJuYW1lKTtcblx0XHRcdHVzZXIuc2V0KCdwYXNzd29yZCcsIHBhc3N3b3JkKTtcblx0XHRcdHVzZXIuc2V0KCdlbWFpbCcsIHNjcnViYmVkVXNlcm5hbWUpO1xuXHRcdFx0dXNlci5zZXQoJ2Rpc3BsYXlOYW1lJywgZGlzcGxheU5hbWUpO1xuXG5cdFx0XHR1c2VyLnNpZ25VcChudWxsLCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0XHRhdXRoLmN1cnJlbnRVc2VyKHVzZXIpO1xuXHRcdFx0XHRcdGFwcC5nb1RvVmlldygnaG9tZScpO1xuXHRcdFx0XHRcdGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmluaXQoKTtcblx0XHRcdFx0XHRhdXRoLnJlc2V0Vmlld3MoKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0UGFyc2UuVXNlci5sb2dJbih1c2VybmFtZSwgcGFzc3dvcmQsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRcdGF1dGguY3VycmVudFVzZXIodXNlcik7XG5cdFx0XHRcdFx0YXBwLmdvVG9WaWV3KCdob21lJyk7XG5cdFx0XHRcdFx0YXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuaW5pdCgpO1xuXHRcdFx0XHRcdGF1dGgucmVzZXRWaWV3cygpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHQvLyBUaGUgbG9naW4gZmFpbGVkLiBDaGVjayBlcnJvciB0byBzZWUgd2h5LlxuXHRcdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguZm9yZ290ID0gZnVuY3Rpb24oZm9ybUVsZW1lbnQpIHtcblx0XHR2YXIgZW1haWwgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZm9yZ290XScpLnZhbCgpO1xuXG5cdFx0aWYgKGVtYWlsLmxlbmd0aCA8PSAwKSB7XG5cdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIGFuIGVtYWlsIGFkZHJlc3MuJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdFBhcnNlLlVzZXIucmVxdWVzdFBhc3N3b3JkUmVzZXQoZW1haWwsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0XHRcdFx0XHQkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZm9yZ290XScpLnZhbCgnJyk7XG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBjaGVjayB5b3VyIGVtYWlsIGZvciBpbnN0cnVjdGlvbnMgb24gcmVzZXR0aW5nIHlvdXIgcGFzc3dvcmQuJyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5yZXNldEVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5lcnJvck1lc3NhZ2UoJycpO1xuXHR9XG5cblx0YXV0aC5sb2dvdXQgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAubXlWaWV3TW9kZWwucHJvZmlsZS5zaG93KGZhbHNlKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ2F1dGgnKTtcblx0XHRQYXJzZS5Vc2VyLmxvZ091dCgpO1xuXHRcdGF1dGguY3VycmVudFVzZXIobnVsbCk7XG5cdFx0YXV0aC5yZXNldFZpZXdzKCk7XG5cdH1cblxuXHRhdXRoLnJlc2V0Vmlld3MgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblx0XHRhdXRoLnNpZ25Jbk1vZGUoZmFsc2UpO1xuXHRcdGF1dGguc2lnblVwTW9kZShmYWxzZSk7XG5cdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0fVxuXG5cdGF1dGgudG9nZ2xlU2lnbkluID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGF1dGguc2lnbkluTW9kZSgpKSB7XG5cdFx0XHRhdXRoLnNpZ25Jbk1vZGUoZmFsc2UpO1xuXHRcdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGF1dGguc2lnbkluTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLnRvZ2dsZVNpZ25VcCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChhdXRoLnNpZ25VcE1vZGUoKSkge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKGZhbHNlKTtcblx0XHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC50b2dnbGVGb3Jnb3QgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoYXV0aC5mb3Jnb3RNb2RlKCkpIHtcblx0XHRcdGF1dGguZm9yZ290TW9kZShmYWxzZSk7XG5cdFx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXV0aC5mb3Jnb3RNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguc2FuaXRpemVFcnJvcnMgPSBmdW5jdGlvbihlcnJvcikge1xuXHRcdHN3aXRjaChlcnJvci5jb2RlKVxuXHRcdHtcblx0XHRcdGNhc2UgMTAxOlxuXHRcdFx0XHRyZXR1cm4gJ1BsZWFzZSBlbnRlciBhIHZhbGlkIHVzZXJuYW1lIGFuZCBwYXNzd29yZC4nO1xuXHRcdFx0Y2FzZSAxMjQ6XG5cdFx0XHRcdHJldHVybiAnT29wcyEgV2UgbWVzc2VkIHVwLiBQbGVhc2UgdHJ5IGFnYWluLic7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gZXJyb3IubWVzc2FnZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGVycm9yLm1lc3NhZ2Uuc2xpY2UoMSkgKyAnLic7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0aDsiLCIvKipcbiAqIHNjcmlwdHMvbWFpbi5qc1xuICpcbiAqIFRoaXMgaXMgdGhlIHN0YXJ0aW5nIHBvaW50IGZvciB5b3VyIGFwcGxpY2F0aW9uLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXBwID0gcmVxdWlyZSgnLi9hcHAuanMnKTtcbnZhciBBdXRoID0gcmVxdWlyZSgnLi9hdXRoLmpzJyk7XG52YXIgU2VsZWN0UHJvamVjdCA9IHJlcXVpcmUoJy4vc2VsZWN0LXByb2plY3QuanMnKTtcbnZhciBSYXRlV2VlayA9IHJlcXVpcmUoJy4vcmF0ZS13ZWVrLmpzJyk7XG52YXIgTm90ZXMgPSByZXF1aXJlKCcuL25vdGVzLmpzJyk7XG52YXIgUGVvcGxlID0gcmVxdWlyZSgnLi9wZW9wbGUuanMnKTtcbnZhciBTYXZlID0gcmVxdWlyZSgnLi9zYXZlLmpzJyk7XG52YXIgUGVvcGxlRGV0YWlscyA9IHJlcXVpcmUoJy4vcGVvcGxlLWRldGFpbHMuanMnKTtcbnZhciBIb21lID0gcmVxdWlyZSgnLi9ob21lLmpzJyk7XG52YXIgQWxlcnRzID0gcmVxdWlyZSgnLi9hbGVydHMuanMnKTtcbnZhciBQcm9maWxlID0gcmVxdWlyZSgnLi9wcm9maWxlLmpzJyk7XG5cbi8vIGluaXRpYWxpemUgcGFyc2VcblBhcnNlLmluaXRpYWxpemUoXCJKa1lOZlBCdzJhUGdjYzdQZVRHSE1BVTJYS3ZqemVxVklreUNsVnVvXCIsIFwiNDVPTVUzWlMzbzVjMTY4bFF4YTBpbHhRdTRGZE1WSFQxTlZUa09SbFwiKTtcblxuLy8gaW5pdGlhbGl6ZSB0eXBla2l0XG4oZnVuY3Rpb24oZCkge1xudmFyIGNvbmZpZyA9IHtcbiAga2l0SWQ6ICdhZWU2amdxJyxcbiAgc2NyaXB0VGltZW91dDogMzAwMFxufSxcbmg9ZC5kb2N1bWVudEVsZW1lbnQsdD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7aC5jbGFzc05hbWU9aC5jbGFzc05hbWUucmVwbGFjZSgvXFxid2YtbG9hZGluZ1xcYi9nLFwiXCIpK1wiIHdmLWluYWN0aXZlXCI7fSxjb25maWcuc2NyaXB0VGltZW91dCksdGs9ZC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpLGY9ZmFsc2Uscz1kLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpWzBdLGE7aC5jbGFzc05hbWUrPVwiIHdmLWxvYWRpbmdcIjt0ay5zcmM9Jy8vdXNlLnR5cGVraXQubmV0LycrY29uZmlnLmtpdElkKycuanMnO3RrLmFzeW5jPXRydWU7dGsub25sb2FkPXRrLm9ucmVhZHlzdGF0ZWNoYW5nZT1mdW5jdGlvbigpe2E9dGhpcy5yZWFkeVN0YXRlO2lmKGZ8fGEmJmEhPVwiY29tcGxldGVcIiYmYSE9XCJsb2FkZWRcIilyZXR1cm47Zj10cnVlO2NsZWFyVGltZW91dCh0KTt0cnl7VHlwZWtpdC5sb2FkKGNvbmZpZyl9Y2F0Y2goZSl7fX07cy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0ayxzKVxufSkoZG9jdW1lbnQpO1xuXG52YXIgYXBwID0gbmV3IEFwcCgpO1xudmFyIGF1dGggPSBuZXcgQXV0aChhcHApO1xudmFyIGhvbWUgPSBuZXcgSG9tZShhcHApO1xudmFyIHNlbGVjdFByb2plY3QgPSBuZXcgU2VsZWN0UHJvamVjdChhcHApO1xudmFyIHJhdGVXZWVrID0gbmV3IFJhdGVXZWVrKGFwcCk7XG52YXIgbm90ZXMgPSBuZXcgTm90ZXMoYXBwKTtcbnZhciBwZW9wbGUgPSBuZXcgUGVvcGxlKGFwcCk7XG52YXIgc2F2ZSA9IG5ldyBTYXZlKGFwcCk7XG52YXIgcGVvcGxlRGV0YWlscyA9IG5ldyBQZW9wbGVEZXRhaWxzKGFwcCk7XG52YXIgYWxlcnRzID0gbmV3IEFsZXJ0cyhhcHApO1xudmFyIHByb2ZpbGUgPSBuZXcgUHJvZmlsZShhcHApO1xuXG4vLyBDdXN0b20ga25vY2tvdXQgZXh0ZW5kZXJzXG5cbi8vIEhlcmUncyBhIGN1c3RvbSBLbm9ja291dCBiaW5kaW5nIHRoYXQgbWFrZXMgZWxlbWVudHMgc2hvd24vaGlkZGVuIHZpYSBqUXVlcnkncyBmYWRlSW4oKS9mYWRlT3V0KCkgbWV0aG9kc1xuLy8gQ291bGQgYmUgc3RvcmVkIGluIGEgc2VwYXJhdGUgdXRpbGl0eSBsaWJyYXJ5XG5rby5iaW5kaW5nSGFuZGxlcnMuZmFkZVZpc2libGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBJbml0aWFsbHkgc2V0IHRoZSBlbGVtZW50IHRvIGJlIGluc3RhbnRseSB2aXNpYmxlL2hpZGRlbiBkZXBlbmRpbmcgb24gdGhlIHZhbHVlXG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgJChlbGVtZW50KS50b2dnbGUoa28udW53cmFwKHZhbHVlKSk7IC8vIFVzZSBcInVud3JhcE9ic2VydmFibGVcIiBzbyB3ZSBjYW4gaGFuZGxlIHZhbHVlcyB0aGF0IG1heSBvciBtYXkgbm90IGJlIG9ic2VydmFibGVcbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBXaGVuZXZlciB0aGUgdmFsdWUgc3Vic2VxdWVudGx5IGNoYW5nZXMsIHNsb3dseSBmYWRlIHRoZSBlbGVtZW50IGluIG9yIG91dFxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgIGtvLnVud3JhcCh2YWx1ZSkgPyAkKGVsZW1lbnQpLmZhZGVJbigpIDogJChlbGVtZW50KS5mYWRlT3V0KCk7XG4gICAgfVxufVxuXG5rby5iaW5kaW5nSGFuZGxlcnMuc2xpZGVQYW5lbFZpc2libGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBJbml0aWFsbHkgc2V0IHRoZSBlbGVtZW50IHRvIGJlIGluc3RhbnRseSB2aXNpYmxlL2hpZGRlbiBkZXBlbmRpbmcgb24gdGhlIHZhbHVlXG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgLy8gJChlbGVtZW50KS50b2dnbGUoa28udW53cmFwKHZhbHVlKSk7IC8vIFVzZSBcInVud3JhcE9ic2VydmFibGVcIiBzbyB3ZSBjYW4gaGFuZGxlIHZhbHVlcyB0aGF0IG1heSBvciBtYXkgbm90IGJlIG9ic2VydmFibGVcbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBXaGVuZXZlciB0aGUgdmFsdWUgc3Vic2VxdWVudGx5IGNoYW5nZXMsIHNsb3dseSBmYWRlIHRoZSBlbGVtZW50IGluIG9yIG91dFxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgIGlmIChrby51bndyYXAodmFsdWUpKSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLmFkZENsYXNzKCdvcGVuJykuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlM2QoMCwwLDApJykuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB2aWV3cG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcbiAgICAgICAgICAgICQoZWxlbWVudCkucmVtb3ZlQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgwLCcgKyB2aWV3cG9ydEhlaWdodCArICdweCwwKScpLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmtvLmJpbmRpbmdIYW5kbGVycy5zaGlmdFBhbmVsVmlzaWJsZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAvLyAkKGVsZW1lbnQpLnRvZ2dsZShrby51bndyYXAodmFsdWUpKTsgLy8gVXNlIFwidW53cmFwT2JzZXJ2YWJsZVwiIHNvIHdlIGNhbiBoYW5kbGUgdmFsdWVzIHRoYXQgbWF5IG9yIG1heSBub3QgYmUgb2JzZXJ2YWJsZVxuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIFdoZW5ldmVyIHRoZSB2YWx1ZSBzdWJzZXF1ZW50bHkgY2hhbmdlcywgc2xvd2x5IGZhZGUgdGhlIGVsZW1lbnQgaW4gb3Igb3V0XG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgaWYgKGtvLnVud3JhcCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgwJSwwLDApJykuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB2aWV3cG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcbiAgICAgICAgICAgICQoZWxlbWVudCkucmVtb3ZlQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgxMDAlLDAsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5hcHAuaW5pdGlhbGl6ZSgpOyIsIi8qKlxuICogc2NyaXB0cy9ub3Rlcy5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBIb21lKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGhvbWUgPSBhcHAubXlWaWV3TW9kZWwuaG9tZSA9IHt9O1xuXG5cdGhvbWUudG90YWxzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdGhvbWUuaXNSZWZyZXNoRHJhZ2dpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0aG9tZS5kcmFnU3RhcnQgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRob21lLnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0aG9tZS53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXG5cdGhvbWUuc2hvd0FsZXJ0cyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5hbGVydHMuc2hvdyh0cnVlKTtcblx0fVxuXG5cdGhvbWUuc2hvd1Byb2ZpbGUgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAubXlWaWV3TW9kZWwucHJvZmlsZS5zaG93KHRydWUpO1xuXHR9XG5cblx0aG9tZS5zdHlsZVdlZWsgPSBmdW5jdGlvbihpbmRleCkge1xuXG5cdFx0dmFyIHN0eWxlZERhdGUgPSAnV2VlayBvZiAnICsgbW9tZW50KGhvbWUudG9kYXkpLmFkZCgnZGF5cycsIChpbmRleCAqIDcpKS5mb3JtYXQoJ01NTSBEJyk7XG5cdFx0aWYgKGluZGV4ID09IDApIHsgc3R5bGVkRGF0ZSA9ICdUaGlzIFdlZWsnIH07XG5cdFx0aWYgKGluZGV4ID09IDEpIHsgc3R5bGVkRGF0ZSA9ICdOZXh0IFdlZWsnIH07XG5cdFx0cmV0dXJuIHN0eWxlZERhdGU7XG5cdH1cblxuXHRob21lLldlZWsgPSBmdW5jdGlvbihtaXNzaW5nV2Vlaykge1xuXHRcdHZhciBibGFua1dlZWsgPSB7XG5cdFx0XHRub3RlczogJycsXG5cdFx0XHRyYXRpbmc6IC0xLFxuXHRcdFx0dG90YWw6IC0xLFxuXHRcdFx0d2VlazogbWlzc2luZ1dlZWtcblx0XHR9O1xuXHRcdHJldHVybiBibGFua1dlZWs7XG5cdH1cblxuXHRob21lLmdvID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5pbml0KGluZGV4KTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3NlbGVjdC1wcm9qZWN0Jyk7XG5cdH1cblxuXHRob21lLmNvbnZlcnROdW1Ub1dvcmRzID0gZnVuY3Rpb24obnVtYmVyKSB7XG5cdFx0c3dpdGNoIChudW1iZXIpIHtcblx0XHRcdGNhc2UgMDpcblx0XHRcdFx0cmV0dXJuICd6ZXJvJztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0cmV0dXJuICdvbmUnO1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRyZXR1cm4gJ3R3byc7XG5cdFx0XHRjYXNlIDM6XG5cdFx0XHRcdHJldHVybiAndGhyZWUnO1xuXHRcdFx0Y2FzZSA0OlxuXHRcdFx0XHRyZXR1cm4gJ2ZvdXInO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuICd1bmtub3duJztcblx0XHR9XG5cdH1cblxuXHRob21lLmdldFRvdGFsc0FuZFJhdGluZyA9IGZ1bmN0aW9uKCkge1xuXHRcdGhvbWUud2Vla3MoW10pO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXBwLm15Vmlld01vZGVsLm51bVdlZWtzOyBpKyspIHtcblx0XHRcdGhvbWUud2Vla3MucHVzaChtb21lbnQoaG9tZS50b2RheSkuc3RhcnRPZignaXNvd2VlaycpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpKTtcblx0XHR9XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRUb3RhbHNBbmRSYXRpbmcnLCB7XG5cdFx0XHR3ZWVrczogaG9tZS53ZWVrcygpXG5cdFx0fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24odG90YWxzQW5kUmF0aW5nKSB7XG5cblx0XHRcdFx0dmFyIHNldCA9IFtdO1xuXHRcdFx0XHRfLmVhY2godG90YWxzQW5kUmF0aW5nLCBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdFx0c2V0W2RhdGEud2Vla10gPSB0cnVlO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFwcC5teVZpZXdNb2RlbC5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHRcdFx0dmFyIGRhdGUgPSBtb21lbnQoaG9tZS50b2RheSkuc3RhcnRPZignaXNvd2VlaycpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpO1xuXHRcdFx0XHRcdGlmICghc2V0W2RhdGVdKSB7XG5cdFx0XHRcdFx0XHR0b3RhbHNBbmRSYXRpbmcucHVzaChuZXcgaG9tZS5XZWVrKGRhdGUpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR2YXIgc29ydGVkID0gXy5zb3J0QnkodG90YWxzQW5kUmF0aW5nLCBmdW5jdGlvbihpdGVtKSB7XG5cdFx0XHRcdFx0dmFyIGRhdGUgPSBpdGVtLndlZWsuc3BsaXQoJywnKTtcblx0XHRcdFx0XHR2YXIgdGltZSA9IG1vbWVudChuZXcgRGF0ZShkYXRlWzBdLCBkYXRlWzFdLCBkYXRlWzJdKSkudmFsdWVPZigpO1xuXHRcdFx0XHRcdHJldHVybiBwYXJzZUludCh0aW1lKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aG9tZS50b3RhbHMoc29ydGVkKTtcblxuXHRcdFx0XHQkKCcjaG9tZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+IFB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHRob21lLmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0aG9tZS5kcmFnU3RhcnQoMCk7XG5cdFx0XHRcdCQoJyNob21lIC5wYWdlJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdH0sIDEwMCk7XG5cblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRob21lLmRyYWdSZWZyZXNoID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoaG9tZS5pc1JlZnJlc2hEcmFnZ2luZygpICYmIGhvbWUuZHJhZ1N0YXJ0KCkgPT0gMCkge1xuXHRcdFx0dmFyIHRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpO1xuXHRcdFx0dmFyIGRlbHRhID0gTWF0aC5mbG9vcihldmVudC5nZXN0dXJlLmRpc3RhbmNlKTtcblx0XHRcdGlmICh0b3AgPT0gMCAmJiBkZWx0YSA+IDMwKSB7XG5cdFx0XHRcdGlmIChkZWx0YSA+IDE1MCkgZGVsdGEgPSAxNTA7XG5cdFx0XHRcdCQoJyNob21lIC5wYWdlJykuY3NzKCdtYXJnaW4tdG9wJywgZGVsdGEgLSAzMCk7XG5cdFx0XHRcdGlmIChkZWx0YSA+PSAxMDApIHtcblx0XHRcdFx0XHQkKCcjaG9tZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLXVwXCI+PC9zcGFuPiBSZWxlYXNlIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjaG9tZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+IFB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aG9tZS5zdGFydFJlZnJlc2hEcmFnID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoIWhvbWUuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiBob21lLmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdGhvbWUuZHJhZ1N0YXJ0KCQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpKTtcblx0XHRcdGhvbWUuaXNSZWZyZXNoRHJhZ2dpbmcodHJ1ZSk7XG5cdFx0XHQkKGV2ZW50Lmdlc3R1cmUudGFyZ2V0KS5vbmUoJ2RyYWdlbmQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHR2YXIgZGVsdGEgPSBwYXJzZUludCgkKCcjaG9tZSAucGFnZScpLmNzcygnbWFyZ2luLXRvcCcpKTtcblxuXHRcdFx0XHRpZiAoZGVsdGEgPj0gNzApIHtcblx0XHRcdFx0XHRob21lLmdldFRvdGFsc0FuZFJhdGluZygpO1xuXHRcdFx0XHRcdCQoJyNob21lIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW5cIj48L3NwYW4+IFJlZnJlc2hpbmcuLi4nKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjaG9tZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+IFB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHRcdGhvbWUuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHRcdGhvbWUuZHJhZ1N0YXJ0KDApO1xuXHRcdFx0XHRcdCQoJyNob21lIC5wYWdlJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdGhvbWUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGhvbWUuZ2V0VG90YWxzQW5kUmF0aW5nKCk7XG5cdH1cblxuXHRpZiAoYXBwLm15Vmlld01vZGVsLmF1dGguY3VycmVudFVzZXIoKSkge1xuXHRcdGhvbWUuaW5pdCgpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBIb21lOyIsIi8qKlxuICogc2NyaXB0cy9ub3Rlcy5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBOb3RlcyhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBub3RlcyA9IGFwcC5teVZpZXdNb2RlbC5ub3RlcyA9IHt9O1xuXG5cdG5vdGVzLnNob3cgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0bm90ZXMucmF0aW5nID0ga28ub2JzZXJ2YWJsZSgyKTtcblx0bm90ZXMuY29udGVudCA9IGtvLm9ic2VydmFibGUoKTtcblxuXHRub3Rlcy5zdGF0dXNPcHRpb25zID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cblx0bm90ZXMud29ya2xvYWRXZWVrID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHRleHQgPSBhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC53ZWVrKCk7XG5cdFx0aWYgKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LndlZWtJbmRleCgpID49IDIpIHtcblx0XHRcdHRleHQgPSAndGhlICcgKyB0ZXh0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0ZXh0ID0gdGV4dC50b0xvd2VyQ2FzZSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGV4dDtcblx0fSk7XG5cblx0bm90ZXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdG5vdGVzLnN0YXR1c09wdGlvbnMucHVzaChuZXcgbm90ZXMuU3RhdHVzKCdCcmluZyBvbiB0aGUgd29yaycsMCkpO1xuXHRcdG5vdGVzLnN0YXR1c09wdGlvbnMucHVzaChuZXcgbm90ZXMuU3RhdHVzKCdJXFwnbSBhIGxpdHRsZSBsaWdodCcsMSkpO1xuXHRcdG5vdGVzLnN0YXR1c09wdGlvbnMucHVzaChuZXcgbm90ZXMuU3RhdHVzKCdMaWZlIGlzIGdvb2QnLDIpKTtcblx0XHRub3Rlcy5zdGF0dXNPcHRpb25zLnB1c2gobmV3IG5vdGVzLlN0YXR1cygnSVxcJ20gYSBiaXQgb3ZlcndoZWxtZWQnLDMpKTtcblx0XHRub3Rlcy5zdGF0dXNPcHRpb25zLnB1c2gobmV3IG5vdGVzLlN0YXR1cygnU3RvcCB0aGUgbWFkbmVzcyEnLDQpKTtcblx0fVxuXG5cdG5vdGVzLlN0YXR1cyA9IGZ1bmN0aW9uKHRleHQsIHZhbHVlKSB7XG5cdFx0dmFyIHN0YXR1cyA9IHtcblx0XHRcdGxhYmVsOiB0ZXh0LFxuXHRcdFx0dmFsdWU6IHZhbHVlXG5cdFx0fTtcblx0XHRyZXR1cm4gc3RhdHVzO1xuXHR9XG5cblx0bm90ZXMuc2VsZWN0U3RhdHVzID0gZnVuY3Rpb24oaXRlbSwgZSkge1xuXHRcdG5vdGVzLnJhdGluZyhpdGVtLnZhbHVlKTtcblx0fVxuXG5cdG5vdGVzLnJlc2V0ID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRpZiAoaW5kZXggIT0gbnVsbCkge1xuXHRcdFx0bm90ZXMucmF0aW5nKGFwcC5teVZpZXdNb2RlbC5ob21lLnRvdGFscygpW2luZGV4XS5yYXRpbmcpO1xuXHRcdFx0bm90ZXMuY29udGVudChhcHAubXlWaWV3TW9kZWwuaG9tZS50b3RhbHMoKVtpbmRleF0ubm90ZXMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRub3Rlcy5yYXRpbmcoMik7XG5cdFx0XHRub3Rlcy5jb250ZW50KCcnKTtcblx0XHR9XG5cdH1cblxuXHRub3Rlcy5nb0JhY2sgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsuc2hvdyh0cnVlKTtcblx0XHRub3Rlcy5zaG93KGZhbHNlKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3JhdGUtd2VlaycpO1xuXHR9XG5cblx0bm90ZXMuZ29OZXh0ID0gZnVuY3Rpb24oKSB7XG5cdFx0bm90ZXMuc2hvdyhmYWxzZSk7XG5cdFx0YXBwLm15Vmlld01vZGVsLnNhdmUuc2hvdyh0cnVlKTtcblx0XHRhcHAubXlWaWV3TW9kZWwuc2F2ZS5zdWJtaXQoKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3NhdmUnKTtcblx0fVxuXG5cdG5vdGVzLmluaXQoKTtcblxuXHRyZXR1cm4gc2VsZjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGVzOyIsIi8qKlxuICogc2NyaXB0cy9wZW9wbGUtZGV0YWlscy5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQZW9wbGVEZXRhaWxzKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHBlb3BsZURldGFpbHMgPSBhcHAubXlWaWV3TW9kZWwucGVvcGxlRGV0YWlscyA9IHt9O1xuXG5cdHBlb3BsZURldGFpbHMucGVyc29uID0ga28ub2JzZXJ2YWJsZShudWxsKTtcblx0cGVvcGxlRGV0YWlscy53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG5cdHBlb3BsZURldGFpbHMudG90YWxzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKTtcblxuXHRwZW9wbGVEZXRhaWxzLmdldFBlcnNvbiA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRwZW9wbGVEZXRhaWxzLnRvdGFscyhbXSk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcHAubXlWaWV3TW9kZWwucGVvcGxlLm51bVdlZWtzOyBpKyspIHtcblx0XHRcdHZhciBwZXJzb24gPSBfLmZpbmQoYXBwLm15Vmlld01vZGVsLnBlb3BsZS50aW1lcygpW2ldLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdFx0cmV0dXJuIG9iai5hdHRyaWJ1dGVzLnVzZXIuaWQgPT0gaXRlbS5hdHRyaWJ1dGVzLnVzZXIuaWQ7XG5cdFx0XHR9KTtcblx0XHRcdHBlb3BsZURldGFpbHMudG90YWxzLnB1c2gocGVyc29uKTtcblx0XHR9XG5cblx0XHRwZW9wbGVEZXRhaWxzLnBlcnNvbihpdGVtKTtcblx0fVxuXG5cdHBlb3BsZURldGFpbHMuZ29CYWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLmdvVG9WaWV3KCdwZW9wbGUnKTtcblx0fVxuXG5cdHBlb3BsZURldGFpbHMuZ2V0Q29tcGFueU5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBuYW1lID0gJyc7XG5cdFx0dmFyIHByb2plY3QgPSBfLmZpbmQoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRyZXR1cm4gb2JqLmlkID09IGlkO1xuXHRcdH0pO1xuXG5cdFx0aWYgKHR5cGVvZiBwcm9qZWN0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0bmFtZSA9IHByb2plY3QuYXR0cmlidXRlcy5jb21wYW55O1xuXHRcdH1cblx0XHRyZXR1cm4gbmFtZTtcblx0fVxuXG5cdHBlb3BsZURldGFpbHMuZ2V0UHJvamVjdE5hbWUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBuYW1lID0gJyc7XG5cdFx0dmFyIHByb2plY3QgPSBfLmZpbmQoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRyZXR1cm4gb2JqLmlkID09IGlkO1xuXHRcdH0pO1xuXG5cdFx0aWYgKHR5cGVvZiBwcm9qZWN0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0bmFtZSA9IHByb2plY3QuYXR0cmlidXRlcy5uYW1lO1xuXHRcdH1cblx0XHRyZXR1cm4gbmFtZTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBlb3BsZURldGFpbHM7IiwiLyoqXG4gKiBzY3JpcHRzL3Blb3BsZS5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQZW9wbGUoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcGVvcGxlID0gYXBwLm15Vmlld01vZGVsLnBlb3BsZSA9IHt9O1xuXG5cdHBlb3BsZS5udW1XZWVrcyA9IDM7XG5cdHBlb3BsZS50b2RheSA9IG1vbWVudChuZXcgRGF0ZSgpKS5zdGFydE9mKCdpc293ZWVrJyk7XG5cdHBlb3BsZS5hY3RpdmVXZWVrID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cGVvcGxlLmFjdGl2ZVBlcnNvbiA9IGtvLm9ic2VydmFibGUoKTtcblx0cGVvcGxlLnZpZXdUeXBlID0ga28ub2JzZXJ2YWJsZSgnaG91cnMnKTtcblx0cGVvcGxlLnRpbWVzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHBlb3BsZS53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0cGVvcGxlLmRyYWdTdGFydCA9IGtvLm9ic2VydmFibGUoMCk7XG5cblx0cGVvcGxlLmdldFRpbWVzID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRhdGVzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0ZGF0ZXMucHVzaChtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ1lZWVksIE0sIEQnKSk7XG5cdFx0XHRwZW9wbGUud2Vla3MoKVtpXS5kYXRlKG1vbWVudChwZW9wbGUudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnTU1NIEQnKSk7XG5cdFx0fVxuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0VGltZXMnLCB7XG5cdFx0XHRkYXRlczogZGF0ZXNcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih0aW1lcykge1xuXHRcdFx0XHRwZW9wbGUudGltZXMoW10pO1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHRpbWVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0dGltZXNbal0uYXR0cmlidXRlcy5kYXRhID0gJC5wYXJzZUpTT04odGltZXNbal0uYXR0cmlidXRlcy5kYXRhKTtcblx0XHRcdFx0XHR2YXIgdG90YWwgPSBfKHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YS5wcm9qZWN0cykucmVkdWNlKGZ1bmN0aW9uKGFjYywgb2JqKSB7XG5cdFx0XHRcdFx0XHRfKG9iaikuZWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7IGFjY1trZXldID0gKGFjY1trZXldID8gYWNjW2tleV0gOiAwKSArIHZhbHVlIH0pO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdFx0XHR9LCB7fSk7XG5cblx0XHRcdFx0XHR0aW1lc1tqXS5hdHRyaWJ1dGVzLnRvdGFsID0ga28ub2JzZXJ2YWJsZSh0b3RhbC5wZXJjZW50YWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBlb3BsZS5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHRcdFx0dmFyIHdlZWtEYXRlID0gbW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJyk7XG5cdFx0XHRcdFx0dmFyIHdlZWsgPSBfLmZpbHRlcih0aW1lcywgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb2JqLmF0dHJpYnV0ZXMuZGF0YS5kYXRlID09IHdlZWtEYXRlO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0dmFyIHNvcnRlZCA9IF8uc29ydEJ5KHdlZWssIGZ1bmN0aW9uKG9iail7IFxuXHRcdFx0XHRcdFx0cmV0dXJuIC1vYmouYXR0cmlidXRlcy50b3RhbCgpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0cGVvcGxlLnRpbWVzLnB1c2goc29ydGVkKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0cGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0cGVvcGxlLmRyYWdTdGFydCgwKTtcblx0XHRcdFx0JCgnI3Blb3BsZSAucGVvcGxlJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cGVvcGxlLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBlb3BsZS5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHR2YXIgd2VlayA9IHtcblx0XHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ01NTSBEJykpXG5cdFx0XHR9XG5cdFx0XHRwZW9wbGUud2Vla3MucHVzaCh3ZWVrKTtcblx0XHR9XG5cdFx0cGVvcGxlLmdldFRpbWVzKCk7XG5cdH1cblxuXHRwZW9wbGUuc2VsZWN0V2VlayA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0cGVvcGxlLmFjdGl2ZVdlZWsoaW5kZXgpO1xuXHRcdC8vIGdvIGdldCB0aGUgZGF0YSBmb3IgdGhpcyB3ZWVrXG5cdH1cblxuXHRwZW9wbGUudG9nZ2xlVmlldyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChwZW9wbGUudmlld1R5cGUoKSA9PSAnaG91cnMnKSB7XG5cdFx0XHRwZW9wbGUudmlld1R5cGUoJ3BlcmNlbnQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGVvcGxlLnZpZXdUeXBlKCdob3VycycpO1xuXHRcdH1cblx0fVxuXG5cdHBlb3BsZS5nb1RvUGVyc29uID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5wZW9wbGVEZXRhaWxzLmdldFBlcnNvbihpdGVtKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3Blb3BsZS1kZXRhaWxzJyk7XG5cdH1cblxuXHRwZW9wbGUuZHJhZ1JlZnJlc2ggPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmIChwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiBwZW9wbGUuZHJhZ1N0YXJ0KCkgPT0gMCkge1xuXHRcdFx0dmFyIHRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpO1xuXHRcdFx0dmFyIGRlbHRhID0gTWF0aC5mbG9vcihldmVudC5nZXN0dXJlLmRpc3RhbmNlKTtcblx0XHRcdGlmICh0b3AgPT0gMCAmJiBkZWx0YSA+IDMwKSB7XG5cdFx0XHRcdGlmIChkZWx0YSA+IDE1MCkgZGVsdGEgPSAxNTA7XG5cdFx0XHRcdCQoJyNwZW9wbGUgLnBlb3BsZScpLmNzcygnbWFyZ2luLXRvcCcsIGRlbHRhIC0gMzApO1xuXHRcdFx0XHRpZiAoZGVsdGEgPj0gMTAwKSB7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLXVwXCI+PC9zcGFuPlJlbGVhc2UgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cGVvcGxlLnN0YXJ0UmVmcmVzaERyYWcgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmICghcGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgIWFwcC5teVZpZXdNb2RlbC5oZWFkZXIuaXNPcGVuKCkgJiYgcGVvcGxlLmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHBlb3BsZS5kcmFnU3RhcnQoJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO1xuXHRcdFx0cGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKHRydWUpO1xuXHRcdFx0JChldmVudC5nZXN0dXJlLnRhcmdldCkub25lKCdkcmFnZW5kJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0cGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0dmFyIGRlbHRhID0gcGFyc2VJbnQoJCgnI3Blb3BsZSAucGVvcGxlJykuY3NzKCdtYXJnaW4tdG9wJykpO1xuXHRcdFx0XHRpZiAoZGVsdGEgPj0gNzApIHtcblx0XHRcdFx0XHRwZW9wbGUuZ2V0VGltZXMoKTtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW5cIj48L3NwYW4+UmVmcmVzaGluZy4uLicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnBlb3BsZScpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdFx0fSwgMTAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9XG5cblx0fVxuXG5cdHBlb3BsZS5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGVvcGxlOyIsIi8qKlxuICogc2NyaXB0cy9wcm9maWxlLmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQcm9maWxlKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHByb2ZpbGUgPSBhcHAubXlWaWV3TW9kZWwucHJvZmlsZSA9IHt9O1xuXG5cdHByb2ZpbGUuc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cdHByb2ZpbGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBuYW1lID0gYXBwLm15Vmlld01vZGVsLmF1dGguY3VycmVudFVzZXIoKS5hdHRyaWJ1dGVzLmRpc3BsYXlOYW1lO1xuXHRcdHZhciBlbWFpbCA9IGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyKCkuYXR0cmlidXRlcy5lbWFpbDtcblx0XHRpZiAobmFtZS5sZW5ndGggPD0gMCB8fCBlbWFpbC5sZW5ndGggPD0gMCkge1xuXHRcdFx0YXBwLm15Vmlld01vZGVsLmF1dGguZXJyb3JNZXNzYWdlKCdOYW1lIGFuZCBFbWFpbCBhcmUgcmVxdWlyZWQuJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdFBhcnNlLkNsb3VkLnJ1bignc2F2ZVVzZXInLCB7XG5cdFx0XHRcdGRpc3BsYXlOYW1lOiBuYW1lLFxuXHRcdFx0XHRlbWFpbDogZW1haWxcblx0XHRcdH0sIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRcdGFwcC5teVZpZXdNb2RlbC5hdXRoLmVycm9yTWVzc2FnZSgnUHJvZmlsZSBzYXZlZCBzdWNjZXNzZnVsbHkuJyk7XG5cdFx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRcdGFwcC5teVZpZXdNb2RlbC5hdXRoLmVycm9yTWVzc2FnZShhcHAubXlWaWV3TW9kZWwuYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2ZpbGU7IiwiLyoqXG4gKiBzY3JpcHRzL3JhdGUtd2Vlay5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBSYXRlV2VlayhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciByYXRlV2VlayA9IGFwcC5teVZpZXdNb2RlbC5yYXRlV2VlayA9IHt9O1xuXG5cdHJhdGVXZWVrLnJlZ2lzdGVyTW91c2VYID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRyYXRlV2Vlay5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZSA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHJhdGVXZWVrLnJlZ2lzdGVyUmF0aW8gPSBrby5vYnNlcnZhYmxlKCQoZG9jdW1lbnQpLndpZHRoKCkgLSAyMCk7XG5cdHJhdGVXZWVrLnNob3cgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXHRyYXRlV2Vlay50b3RhbHMgPSBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHR2YXIgdG90YWwgPSAwO1xuXHRcdF8uZWFjaChhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5ncm91cHMoKSwgZnVuY3Rpb24oZ3JvdXApIHtcblx0XHRcdF8uZWFjaChncm91cC5hdHRyaWJ1dGVzLnByb2plY3RzKCksIGZ1bmN0aW9uKHByb2plY3QpIHtcblx0XHRcdFx0dG90YWwgPSB0b3RhbCArIHByb2plY3QuYXR0cmlidXRlcy5wZXJjZW50YWdlKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRyZXR1cm4gdG90YWw7XG5cdH0pO1xuXG5cdHJhdGVXZWVrLmRyYWcgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdHZhciBkaXJlY3Rpb24gPSBldmVudC5nZXN0dXJlLmRpcmVjdGlvbjtcblx0XHRpZiAoZGlyZWN0aW9uID09ICdsZWZ0JyB8fCBkaXJlY3Rpb24gPT0gJ3JpZ2h0Jykge1xuXHRcdFx0dmFyIHN0YXJ0WCA9IGV2ZW50Lmdlc3R1cmUuc3RhcnRFdmVudC5jZW50ZXIucGFnZVg7XG5cdFx0XHRpZiAocmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVgoKSAhPSBzdGFydFgpIHtcblx0XHRcdFx0cmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVgoc3RhcnRYKTtcblx0XHRcdFx0cmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoaXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKSk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgZGlmZiA9IChldmVudC5nZXN0dXJlLmRlbHRhWCAvIHJhdGVXZWVrLnJlZ2lzdGVyUmF0aW8oKSkgKiAxNTA7XG5cdFx0XHR2YXIgbmV3UGVyY2VudGFnZSA9IE1hdGguZmxvb3IoKGRpZmYgKyByYXRlV2Vlay5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZSgpKSAvIDUpICogNTtcblxuXHRcdFx0aWYgKG5ld1BlcmNlbnRhZ2UgPiAwICYmIG5ld1BlcmNlbnRhZ2UgPD0gMTUwKSB7XG5cdFx0XHRcdGl0ZW0uYXR0cmlidXRlcy5wZXJjZW50YWdlKG5ld1BlcmNlbnRhZ2UpO1xuXHRcdFx0fSBlbHNlIGlmIChuZXdQZXJjZW50YWdlID4gMTUwKSB7XG5cdFx0XHRcdGl0ZW0uYXR0cmlidXRlcy5wZXJjZW50YWdlKDE1MCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpdGVtLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgwKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyYXRlV2Vlay5nb0JhY2sgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5zaG93KHRydWUpO1xuXHRcdHJhdGVXZWVrLnNob3coZmFsc2UpO1xuXHRcdGFwcC5nb1RvVmlldygnc2VsZWN0LXByb2plY3QnKTtcblx0fVxuXG5cdHJhdGVXZWVrLmdvTmV4dCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJhdGVXZWVrLnNob3coZmFsc2UpO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5ub3Rlcy5zaG93KHRydWUpO1xuXHRcdGFwcC5nb1RvVmlldygnbm90ZXMnKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJhdGVXZWVrOyIsIi8qKlxuICogc2NyaXB0cy9zYXZlLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFNhdmUoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgc2F2ZSA9IGFwcC5teVZpZXdNb2RlbC5zYXZlID0ge307XG5cblx0c2F2ZS5zaG93ID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNhdmUuc3VjY2VzcyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzYXZlLmVycm9yID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNhdmUuc2F2aW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0c2F2ZS5yZXN1bHQgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0Ly8gc2F2ZS5kb25lID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdC8vIFx0dmFyIGRvbmUgPSBmYWxzZTtcblx0Ly8gXHRmb3IgKHZhciBpID0gMDsgaSA8IHNhdmUucmVzdWx0Lmxlbmd0aDsgaSsrKSB7XG5cdC8vIFx0XHRkb25lID0gZG9uZSB8fCBzYXZlLnJlc3VsdFtpXTtcblx0Ly8gXHR9XG5cdC8vIFx0cmV0dXJuIGRvbmU7XG5cdC8vIH0pO1xuXG5cdHNhdmUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLmdvVG9WaWV3KCdzYXZlJyk7XG5cdFx0c2F2ZS5zaG93KHRydWUpO1xuXHRcdHNhdmUuc2F2aW5nKHRydWUpO1xuXHRcdHZhciB0ZW1wID0ge307XG5cdFx0dmFyIGN1cldlZWs7XG5cdFx0Ly8gdmFyIG51bVdlZWtzID0gYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLndlZWtzKCkubGVuZ3RoO1xuXG5cdFx0dmFyIHByb2plY3RzID0gW107XG5cdFx0Xy5lYWNoKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0Lmdyb3VwcygpLCBmdW5jdGlvbihncm91cCkge1xuXHRcdFx0Xy5lYWNoKGdyb3VwLmF0dHJpYnV0ZXMucHJvamVjdHMoKSwgZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0XHRpZiAocHJvamVjdC5hdHRyaWJ1dGVzLnNlbGVjdGVkKCkpIHtcblx0XHRcdFx0XHR2YXIgbmV3UHJvamVjdCA9IHtcblx0XHRcdFx0XHRcdGlkOiBwcm9qZWN0LmlkLFxuXHRcdFx0XHRcdFx0cGVyY2VudGFnZTogcHJvamVjdC5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRwcm9qZWN0cy5wdXNoKG5ld1Byb2plY3QpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH0pO1xuXG5cdFx0dmFyIGRhdGUgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpLmFkZCgnZGF5cycsIChhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC53ZWVrSW5kZXgoKSAqIDcpKS5mb3JtYXQoJ1lZWVksIE0sIEQnKTtcblx0XHRjb25zb2xlLmxvZyhkYXRlKVxuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRkYXRlOiBkYXRlLFxuXHRcdFx0cmF0aW5nOiBhcHAubXlWaWV3TW9kZWwubm90ZXMucmF0aW5nKCksXG5cdFx0XHRub3RlczogYXBwLm15Vmlld01vZGVsLm5vdGVzLmNvbnRlbnQoKSxcblx0XHRcdHByb2plY3RzOiBwcm9qZWN0c1xuXHRcdH1cblxuXHRcdFBhcnNlLkNsb3VkLnJ1bignc2F2ZVRpbWUnLCB7XG5cdFx0XHRkYXRlOiBkYXRlLFxuXHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSlcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdGFwcC5teVZpZXdNb2RlbC5ob21lLmdldFRvdGFsc0FuZFJhdGluZygpO1xuXHRcdFx0XHRzYXZlLnN1Y2Nlc3ModHJ1ZSk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHRzYXZlLmVycm9yKHRydWUpO1xuXHRcdFx0XHRzYXZlLnJlc2V0KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRzYXZlLnRyeUFnYWluID0gZnVuY3Rpb24oKSB7XG5cdFx0c2F2ZS5lcnJvcihmYWxzZSk7XG5cdFx0c2F2ZS5zdWNjZXNzKGZhbHNlKTtcblx0XHRzYXZlLnN1Ym1pdCgpO1xuXHR9XG5cblx0c2F2ZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHRcdHNhdmUuc2F2aW5nKGZhbHNlKTtcblx0XHRzYXZlLnNob3coZmFsc2UpO1xuXHRcdHNhdmUuZXJyb3IoZmFsc2UpO1xuXHRcdHNhdmUuc3VjY2VzcyhmYWxzZSk7XG5cdFx0YXBwLmdvVG9WaWV3KCdob21lJyk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTYXZlOyIsIi8qKlxuICogc2NyaXB0cy9zZWxlY3QtcHJvamVjdC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTZWxlY3RQcm9qZWN0KGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHNlbGVjdFByb2plY3QgPSBhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdCA9IHt9O1xuXG5cdHNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC5pc0FkZE1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2VsZWN0UHJvamVjdC51bmlxdWVDb21wYW55TmFtZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0ID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2VsZWN0UHJvamVjdC5kcmFnU3RhcnQgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRzZWxlY3RQcm9qZWN0LmNvdW50ID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0c2VsZWN0UHJvamVjdC53ZWVrID0ga28ub2JzZXJ2YWJsZSgnVGhpcyBXZWVrJyk7XG5cdHNlbGVjdFByb2plY3Quc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzZWxlY3RQcm9qZWN0LnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0c2VsZWN0UHJvamVjdC5ncm91cHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC53ZWVrSW5kZXggPSBrby5vYnNlcnZhYmxlKDApO1xuXG5cdHNlbGVjdFByb2plY3QuR3JvdXAgPSBmdW5jdGlvbih0eXBlKSB7XG5cdFx0dmFyIGdyb3VwID0ge1xuXHRcdFx0YXR0cmlidXRlczoge31cblx0XHR9XG5cdFx0Z3JvdXAuYXR0cmlidXRlcy5uYW1lID0gKHR5cGUgPT0gJ3ByaXZhdGUnID8gJ015IFByaXZhdGUgUHJvamVjdHMnIDogJ015IFNoYXJlZCBQcm9qZWN0cycpO1xuXHRcdHJldHVybiBncm91cDtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuaW5pdCA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cblx0XHRpZiAoYXBwLm15Vmlld01vZGVsLmhvbWUudG90YWxzKClbaW5kZXhdLnRvdGFsID49IDApIHtcblx0XHRcdGFwcC5teVZpZXdNb2RlbC5ub3Rlcy5yZXNldChpbmRleCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFwcC5teVZpZXdNb2RlbC5ub3Rlcy5yZXNldChudWxsKTtcblx0XHR9XG5cdFx0c2VsZWN0UHJvamVjdC5wb3B1bGF0ZVNlbGVjdGlvbnMoaW5kZXgpO1xuXG5cdFx0dmFyIHN0eWxlZERhdGUgPSAnV2VlayBvZiAnICsgbW9tZW50KHNlbGVjdFByb2plY3QudG9kYXkpLmFkZCgnZGF5cycsIChpbmRleCAqIDcpKS5mb3JtYXQoJ01NTSBEJyk7XG5cdFx0aWYgKGluZGV4ID09IDApIHN0eWxlZERhdGUgPSAnVGhpcyBXZWVrJztcblx0XHRpZiAoaW5kZXggPT0gMSkgc3R5bGVkRGF0ZSA9ICdOZXh0IFdlZWsnO1xuXHRcdHNlbGVjdFByb2plY3Qud2VlayhzdHlsZWREYXRlKTtcblx0XHRzZWxlY3RQcm9qZWN0LndlZWtJbmRleChpbmRleCk7XG5cdFx0c2VsZWN0UHJvamVjdC5zaG93KHRydWUpO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5nZXRHcm91cHMgPSBmdW5jdGlvbigpIHtcblx0XHRzZWxlY3RQcm9qZWN0Lmdyb3VwcyhbXSk7XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRHcm91cHMnLCB7fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZ3JvdXBzKSB7XG5cdFx0XHRcdC8vIGdyb3Vwcy5zcGxpY2UoMCwwLG5ldyBzZWxlY3RQcm9qZWN0Lkdyb3VwKCdwcml2YXRlJyksIG5ldyBzZWxlY3RQcm9qZWN0Lkdyb3VwKCdwdWJsaWMnKSk7XG5cdFx0XHRcdF8uZWFjaChncm91cHMsIGZ1bmN0aW9uKGdyb3VwKSB7XG5cdFx0XHRcdFx0Z3JvdXAuYXR0cmlidXRlcy5wcm9qZWN0cyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRcdFx0XHRcdGdyb3VwLmF0dHJpYnV0ZXMubm9uTWVtYmVyID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0Lmdyb3Vwcyhncm91cHMpO1xuXG5cdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgwKTtcblx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5ncm91cHMnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0fSwgMTAwKTtcblxuXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0UHJvamVjdC5ncm91cHMoKS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0UHJvamVjdHMnLCB7XG5cdFx0XHRcdFx0XHRncm91cElkOiBzZWxlY3RQcm9qZWN0Lmdyb3VwcygpW2ldLmlkXG5cdFx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzdWx0cykge1xuXHRcdFx0XHRcdFx0XHRpZiAocmVzdWx0cy5wcm9qZWN0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIGdyb3VwID0gXy5maW5kKHNlbGVjdFByb2plY3QuZ3JvdXBzKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZ3JvdXAuaWQgPT0gcmVzdWx0cy5wcm9qZWN0c1swXS5hdHRyaWJ1dGVzLmdyb3VwLmlkO1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cblx0XHRcdFx0XHRcdFx0XHRfLmVhY2gocmVzdWx0cy5wcm9qZWN0cywgZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cHJvamVjdC5hdHRyaWJ1dGVzLnNlbGVjdGVkID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRwcm9qZWN0LmF0dHJpYnV0ZXMucGVyY2VudGFnZSA9IGtvLm9ic2VydmFibGUoMCk7XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoZ3JvdXApIHtcblx0XHRcdFx0XHRcdFx0XHRcdGdyb3VwLmF0dHJpYnV0ZXMucHJvamVjdHMocmVzdWx0cy5wcm9qZWN0cyk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdC8vIGNoZWNrIG1lbWJlcnNoaXAgc3RhdHVzIGZvciB0aGUgZW1wdHkgZ3JvdXBcblx0XHRcdFx0XHRcdFx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldE1lbWJlcnNoaXBTdGF0dXMnLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRncm91cElkOiByZXN1bHRzLmdyb3VwSWRcblx0XHRcdFx0XHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXN1bHRzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICghcmVzdWx0cy5zdGF0dXMpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgZ3JvdXAgPSBfLmZpbmQoc2VsZWN0UHJvamVjdC5ncm91cHMoKSwgZnVuY3Rpb24oZ3JvdXApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBncm91cC5pZCA9PSByZXN1bHRzLmdyb3VwSWQ7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoZ3JvdXApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGdyb3VwLmF0dHJpYnV0ZXMubm9uTWVtYmVyKHRydWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyhzZWxlY3RQcm9qZWN0Lmdyb3VwcygpKVxuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuZ29Ib21lID0gZnVuY3Rpb24oKSB7XG5cdFx0c2VsZWN0UHJvamVjdC5zaG93KGZhbHNlKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ2hvbWUnKTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuZ29OZXh0ID0gZnVuY3Rpb24oKSB7XG5cdFx0c2VsZWN0UHJvamVjdC5zaG93KGZhbHNlKTtcblx0XHRhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsuc2hvdyh0cnVlKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3JhdGUtd2VlaycpO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5wb3B1bGF0ZVNlbGVjdGlvbnMgPSBmdW5jdGlvbihpbmRleCkge1xuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0dXNlcklkOiBhcHAubXlWaWV3TW9kZWwuYXV0aC5jdXJyZW50VXNlcigpLmlkLFxuXHRcdFx0ZGF0ZXM6IFthcHAubXlWaWV3TW9kZWwuaG9tZS50b3RhbHMoKVtpbmRleF0ud2Vla11cblx0XHR9O1xuXG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRUaW1lcycsIGRhdGEsIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHRpbWVzKSB7XG5cdFx0XHRcdGlmICh0aW1lcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0dmFyIGRhdGEgPSBKU09OLnBhcnNlKHRpbWVzWzBdLmF0dHJpYnV0ZXMuZGF0YSk7XG5cdFx0XHRcdFx0dmFyIHByb2plY3RzID0gZGF0YS5wcm9qZWN0cztcblx0XHRcdFx0XHR2YXIgc2V0ID0gW107XG5cdFx0XHRcdFx0Xy5lYWNoKHByb2plY3RzLCBmdW5jdGlvbihwcm9qZWN0KSB7XG5cdFx0XHRcdFx0XHRzZXRbcHJvamVjdC5pZF0gPSBwcm9qZWN0LnBlcmNlbnRhZ2U7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRfLmVhY2goYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuZ3JvdXBzKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG5cdFx0XHRcdFx0XHRfLmVhY2goZ3JvdXAuYXR0cmlidXRlcy5wcm9qZWN0cygpLCBmdW5jdGlvbihwcm9qZWN0KSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzZXRbcHJvamVjdC5pZF0pIHtcblx0XHRcdFx0XHRcdFx0XHRwcm9qZWN0LmF0dHJpYnV0ZXMuc2VsZWN0ZWQodHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdFx0cHJvamVjdC5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2Uoc2V0W3Byb2plY3QuaWRdKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRwcm9qZWN0LmF0dHJpYnV0ZXMuc2VsZWN0ZWQoZmFsc2UpO1xuXHRcdFx0XHRcdFx0XHRcdHByb2plY3QuYXR0cmlidXRlcy5wZXJjZW50YWdlKDApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QudG9nZ2xlUHJvamVjdCA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKGl0ZW0uYXR0cmlidXRlcy5zZWxlY3RlZCgpKSB7XG5cdFx0XHRpdGVtLmF0dHJpYnV0ZXMuc2VsZWN0ZWQoZmFsc2UpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5jb3VudChzZWxlY3RQcm9qZWN0LmNvdW50KCkgLSAxKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aXRlbS5hdHRyaWJ1dGVzLnNlbGVjdGVkKHRydWUpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5jb3VudChzZWxlY3RQcm9qZWN0LmNvdW50KCkgKyAxKTtcblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnRvZ2dsZUFkZE1vZGUgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoc2VsZWN0UHJvamVjdC5pc0FkZE1vZGUoKSkge1xuXHRcdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5pc01vZGFsKGZhbHNlKTtcblx0XHRcdHNlbGVjdFByb2plY3QuaXNBZGRNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5pc01vZGFsKHRydWUpO1xuXHRcdFx0JCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykudmFsKCcnKTtcblx0XHRcdCQoJy5wcm9qZWN0LW5hbWUtZmllbGQnKS52YWwoJycpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KFtdKTtcblx0XHRcdHNlbGVjdFByb2plY3QuaXNBZGRNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc2VsZWN0UHJvamVjdFR5cGVhaGVhZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHQkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS52YWwoaXRlbSk7XG5cdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KFtdKTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc2hvd1R5cGVhaGVhZFJlc3VsdHMgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdHZhciBuZWVkbGUgPSBldmVudC50YXJnZXQudmFsdWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXlxcd1xcZF0vZ2ksICcnKTtcblxuXHRcdGlmIChuZWVkbGUubGVuZ3RoID4gMCkge1xuXHRcdFx0dmFyIGZpbHRlcmVkUHJvamVjdHMgPSBfLmZpbHRlcihzZWxlY3RQcm9qZWN0LnVuaXF1ZUNvbXBhbnlOYW1lcygpLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdFx0dmFyIGhheXN0YWNrID0gb2JqLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15cXHdcXGRdL2dpLCAnJyk7XG5cdFx0XHRcdHJldHVybiBoYXlzdGFjay5pbmRleE9mKG5lZWRsZSkgPj0gMDsgXG5cdFx0XHR9KTtcblx0XHRcdHZhciBmaWVsZFBvc2l0aW9uID0gJCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykub2Zmc2V0KCk7XG5cdFx0XHQkKCcucHJvamVjdC10eXBlYWhlYWQnKS5jc3MoJ2xlZnQnLCBmaWVsZFBvc2l0aW9uLmxlZnQpLmNzcygndG9wJywgZmllbGRQb3NpdGlvbi50b3AgKyAkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS5oZWlnaHQoKSsyMCk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QoZmlsdGVyZWRQcm9qZWN0cyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdChbXSk7XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zYXZlTmV3UHJvamVjdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0Y29tcGFueTogJCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykudmFsKCksXG5cdFx0XHRwcm9qZWN0OiAkKCcucHJvamVjdC1uYW1lLWZpZWxkJykudmFsKCksXG5cdFx0fVxuXHRcdFBhcnNlLkNsb3VkLnJ1bignc2F2ZVByb2plY3QnLCBkYXRhLCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0KSB7XG5cdFx0XHRcdGFsZXJ0KCdcIicgKyBwcm9qZWN0LmF0dHJpYnV0ZXMuY29tcGFueSArICc6ICcgKyBwcm9qZWN0LmF0dHJpYnV0ZXMubmFtZSArICdcIiBjcmVhdGVkIHN1Y2Nlc3NmdWxseS4nKTtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC50b2dnbGVBZGRNb2RlKCk7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QuZ2V0R3JvdXBzKCk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Ly8gYWxlcnQoZXJyb3IpXG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcdFxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5kcmFnUmVmcmVzaCA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiBzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHZhciB0b3AgPSAkKCcjc2VsZWN0LXByb2plY3QgLmdyb3VwcycpLnNjcm9sbFRvcCgpO1xuXHRcdFx0dmFyIGRlbHRhID0gTWF0aC5mbG9vcihldmVudC5nZXN0dXJlLmRpc3RhbmNlKTtcblx0XHRcdGlmICh0b3AgPT0gMCAmJiBkZWx0YSA+IDMwKSB7XG5cdFx0XHRcdGlmIChkZWx0YSA+IDE1MCkgZGVsdGEgPSAxNTA7XG5cdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAuZ3JvdXBzJykuY3NzKCdtYXJnaW4tdG9wJywgZGVsdGEgLSAzMCk7XG5cdFx0XHRcdGlmIChkZWx0YSA+PSAxMDApIHtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS11cFwiPjwvc3Bhbj5SZWxlYXNlIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zdGFydFJlZnJlc2hEcmFnID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoIXNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiBzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHNlbGVjdFByb2plY3QuZHJhZ1N0YXJ0KCQoJyNzZWxlY3QtcHJvamVjdCAuZ3JvdXBzJykuc2Nyb2xsVG9wKCkpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZyh0cnVlKTtcblx0XHRcdCQoZXZlbnQuZ2VzdHVyZS50YXJnZXQpLm9uZSgnZHJhZ2VuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHZhciBkZWx0YSA9IHBhcnNlSW50KCQoJyNzZWxlY3QtcHJvamVjdCAuZ3JvdXBzJykuY3NzKCdtYXJnaW4tdG9wJykpO1xuXG5cdFx0XHRcdGlmIChkZWx0YSA+PSA3MCkge1xuXHRcdFx0XHRcdHNlbGVjdFByb2plY3QuZ2V0R3JvdXBzKCk7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW5cIj48L3NwYW4+UmVmcmVzaGluZy4uLicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdFx0c2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdFx0c2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoMCk7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5ncm91cHMnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0aWYgKGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHRzZWxlY3RQcm9qZWN0LmdldEdyb3VwcygpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0UHJvamVjdDsiXX0=
