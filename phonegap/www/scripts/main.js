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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2FsZXJ0cy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvYXBwLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9hdXRoLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9mYWtlX2RmNmM4MGEzLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ob21lLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ub3Rlcy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcGVvcGxlLWRldGFpbHMuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3Blb3BsZS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcHJvZmlsZS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcmF0ZS13ZWVrLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zYXZlLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zZWxlY3QtcHJvamVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogc2NyaXB0cy9ub3Rlcy5qc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQWxlcnRzKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGFsZXJ0cyA9IGFwcC5teVZpZXdNb2RlbC5hbGVydHMgPSB7fTtcblxuXHRhbGVydHMubGlzdCA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRhbGVydHMuc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhbGVydHMuaW5kZXggPSBrby5vYnNlcnZhYmxlKDApO1xuXG5cdGFsZXJ0cy5ncmVldGluZ3MgPSBbXG5cdFx0J0hpIHRoZXJlIScsXG5cdFx0J0hlbGxvIScsXG5cdFx0J0hpIHlhIScsXG5cdFx0J0dyZWV0aW5ncyEnLFxuXHRcdCdXZWxsIGhlbGxvIHRoZXJlISdcblx0XTtcblxuXHRhbGVydC5BbGVydCA9IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHR2YXIgYWxlcnQgPSB7XG5cdFx0XHR0eXBlOiAnam9pbi1yZXF1ZXN0Jyxcblx0XHRcdHRpdGxlOiAnSm9pbiBSZXF1ZXN0Jyxcblx0XHRcdHBlcnNvbjogZGF0YS5wZXJzb24sXG5cdFx0XHRncm91cDogZGF0YS5ncm91cFxuXHRcdH1cblx0XHRyZXR1cm4gYWxlcnQ7XG5cdH1cblxuXHRhbGVydHMuY3VycmVudCA9IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBhbGVydHMubGlzdCgpW2FsZXJ0cy5pbmRleCgpXTtcblx0fSk7XG5cblx0YWxlcnRzLnJhbmRvbUdyZWV0aW5nID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHJhbmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhbGVydHMuZ3JlZXRpbmdzLmxlbmd0aCk7XG5cdFx0Y29uc29sZS5sb2coYWxlcnRzLmdyZWV0aW5nc1tyYW5kXSlcblx0XHRyZXR1cm4gYWxlcnRzLmdyZWV0aW5nc1tyYW5kXTtcblx0fSk7XG5cblx0YWxlcnRzLmdvTmV4dCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjdXJyZW50SW5kZXggPSBhbGVydHMuaW5kZXgoKTtcblx0XHRhbGVydHMuaW5kZXgoY3VycmVudEluZGV4ICsgMSk7XG5cdH1cblxuXHRhbGVydHMuZ29CYWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGN1cnJlbnRJbmRleCA9IGFsZXJ0cy5pbmRleCgpO1xuXHRcdGFsZXJ0cy5pbmRleChjdXJyZW50SW5kZXggLSAxKTtcblx0fVxuXG5cdGFsZXJ0cy50YWtlQWN0aW9uID0gZnVuY3Rpb24oYWN0aW9uLCBpdGVtKSB7XG5cdFx0Y29uc29sZS5sb2coYWN0aW9uKTtcblxuXHRcdGlmIChhY3Rpb24gPT0gJ2RlbnknIHx8IGFjdGlvbiA9PSAnYXBwcm92ZScpIHtcblx0XHRcdHZhciBuZXdMaXN0ID0gXy53aXRob3V0KGFsZXJ0cy5saXN0KCksIGFsZXJ0cy5saXN0KClbYWxlcnRzLmluZGV4KCldKTtcblx0XHRcdGFsZXJ0cy5saXN0KG5ld0xpc3QpO1xuXG5cdFx0XHRpZiAoYWxlcnRzLmluZGV4KCkgPj0gYWxlcnRzLmxpc3QoKS5sZW5ndGgpIHtcblx0XHRcdFx0YWxlcnRzLmdvQmFjaygpO1xuXHRcdFx0fVxuXHRcdH1cblxuXG5cdFx0Ly8gdmFyIG5ld0xpc3QgPSBfLnJlamVjdChhbGVydHMubGlzdCgpLCBmdW5jdGlvbihhbGVydCkge1xuXHRcdC8vIFx0Y29uc29sZS5sb2coKVxuXHRcdC8vIFx0cmV0dXJuIGZhbHNlO1xuXHRcdC8vIH0pO1xuXHRcdC8vIGFsZXJ0cy5saXN0LnBvcChhbGVydHMuaW5kZXgoKSk7XG5cdFx0Ly8gY29uc29sZS5sb2coYWxlcnRzLmxpc3QoKS5sZW5ndGgpXG5cblx0fVxuXG5cdGFsZXJ0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0YWxlcnRzLmxpc3QucHVzaChuZXcgYWxlcnQuQWxlcnQoeyBwZXJzb246ICdBYXJvbiBNYXJ0bGFnZScsIGdyb3VwOiAnRGVzaWduIEdyb3VwJyB9KSk7XG5cdFx0YWxlcnRzLmxpc3QucHVzaChuZXcgYWxlcnQuQWxlcnQoeyBwZXJzb246ICdLaWVyYW4gRXZhbnMnLCBncm91cDogJ0F3ZXNvbWUgR3JvdXAnIH0pKTtcblx0XHRjb25zb2xlLmxvZyhhbGVydHMubGlzdCgpKVxuXHR9XG5cblx0YWxlcnRzLmluaXQoKTtcblxuXHRyZXR1cm4gc2VsZjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXJ0czsiLCIvKipcbiAqIHNjcmlwdHMvYXBwLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEFwcCgpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdC8vIGluaXRpYWxpemUga25vY2tvdXRcblx0c2VsZi5teVZpZXdNb2RlbCA9IHt9O1xuXG5cdHNlbGYubXlWaWV3TW9kZWwuYWN0aXZlVmlldyA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHNlbGYubXlWaWV3TW9kZWwudmlld3MgPSBbXG5cdFx0J2F1dGgnLFxuXHRcdCdob21lJyxcblx0XHQnc2VsZWN0LXByb2plY3QnLFxuXHRcdCdyYXRlLXdlZWsnLFxuXHRcdCdub3RlcycsXG5cdFx0J3Blb3BsZScsXG5cdFx0J3Blb3BsZS1kZXRhaWxzJyxcblx0XHQnc2F2ZSdcblx0XTtcblxuXHRzZWxmLm15Vmlld01vZGVsLm51bVdlZWtzID0gMztcblx0c2VsZi5teVZpZXdNb2RlbC50b2RheSA9IG1vbWVudChuZXcgRGF0ZSgpKS5zdGFydE9mKCdpc293ZWVrJyk7XG5cdHNlbGYubXlWaWV3TW9kZWwud2Vla3MgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblxuXHRzZWxmLmdvVG9WaWV3ID0gZnVuY3Rpb24odmlldykge1xuXHRcdHZhciBpbmRleCA9IHNlbGYubXlWaWV3TW9kZWwudmlld3MuaW5kZXhPZih2aWV3KTtcblx0XHRzZWxmLm15Vmlld01vZGVsLmFjdGl2ZVZpZXcoaW5kZXgpO1xuXHR9XG5cblx0c2VsZi5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZGV2aWNlcmVhZHknLCBzZWxmLm9uRGV2aWNlUmVhZHksIGZhbHNlKTtcblx0fVxuXG5cdHNlbGYub25EZXZpY2VSZWFkeSA9IGZ1bmN0aW9uKCkge1xuXHRcdGtvLmFwcGx5QmluZGluZ3Moc2VsZi5teVZpZXdNb2RlbCk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdGlmIChuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuKSB7XG5cdFx0XHRcdG5hdmlnYXRvci5zcGxhc2hzY3JlZW4uaGlkZSgpO1xuXHRcdFx0fVxuXHRcdH0sIDIwMDApO1xuXHRcdFxuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwOyIsIi8qKlxuICogc2NyaXB0cy9hdXRoLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEF1dGgoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgYXV0aCA9IGFwcC5teVZpZXdNb2RlbC5hdXRoID0ge307XG5cblx0YXV0aC5jdXJyZW50VXNlciA9IGtvLm9ic2VydmFibGUoKTtcblx0YXV0aC5lcnJvck1lc3NhZ2UgPSBrby5vYnNlcnZhYmxlKCcnKTtcblx0YXV0aC5zaWduVXBNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGF1dGguc2lnbkluTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhdXRoLmZvcmdvdE1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXHR2YXIgY3VycmVudFVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcblx0aWYgKGN1cnJlbnRVc2VyKSB7XG5cdFx0YXV0aC5jdXJyZW50VXNlcihjdXJyZW50VXNlcik7XG5cdH1cblxuXHRhdXRoLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoYXV0aC5jdXJyZW50VXNlcigpKSB7XG5cdFx0XHRhcHAuZ29Ub1ZpZXcoJ2hvbWUnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXBwLmdvVG9WaWV3KCdhdXRoJyk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5yZXNldEVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5lcnJvck1lc3NhZ2UoJycpO1xuXHR9XG5cblx0YXV0aC5zaWduSW5VcCA9IGZ1bmN0aW9uKGZvcm1FbGVtZW50KSB7XG5cdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cblx0XHR2YXIgdXNlcm5hbWUgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZW1haWxdJykudmFsKCk7XG5cdFx0dmFyIHBhc3N3b3JkID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX3Bhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHR2YXIgZGlzcGxheU5hbWUgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZGlzcGxheU5hbWVdJykudmFsKCk7XG5cdFx0XHR2YXIgcGFzc3dvcmRDb25maXJtID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2NvbmZpcm1QYXNzd29yZF0nKS52YWwoKTtcblxuXHRcdFx0Ly8gdmFsaWRhdGlvblxuXHRcdFx0aWYgKHVzZXJuYW1lLmxlbmd0aCA8IDEpIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciB5b3VyIGVtYWlsIGFkZHJlc3MuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGRpc3BsYXlOYW1lLmxlbmd0aCA8IDEpIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciB5b3VyIGZpcnN0IGFuZCBsYXN0IG5hbWUuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHBhc3N3b3JkLmxlbmd0aCA8IDEgfHwgcGFzc3dvcmRDb25maXJtIDwgMSB8fCBwYXNzd29yZCAhPSBwYXNzd29yZENvbmZpcm0pIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciBhbmQgY29uZmlybSBhIHBhc3N3b3JkLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHZhciB1c2VyID0gbmV3IFBhcnNlLlVzZXIoKTtcblx0XHRcdHZhciBzY3J1YmJlZFVzZXJuYW1lID0gdXNlcm5hbWUucmVwbGFjZSgvXFxzKy9nLFwiXCIpOyAvL3JlbW92ZSB3aGl0ZSBzcGFjZVxuXHRcdFx0c2NydWJiZWRVc2VybmFtZSA9IHNjcnViYmVkVXNlcm5hbWUudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0dXNlci5zZXQoJ3VzZXJuYW1lJywgc2NydWJiZWRVc2VybmFtZSk7XG5cdFx0XHR1c2VyLnNldCgncGFzc3dvcmQnLCBwYXNzd29yZCk7XG5cdFx0XHR1c2VyLnNldCgnZW1haWwnLCBzY3J1YmJlZFVzZXJuYW1lKTtcblx0XHRcdHVzZXIuc2V0KCdkaXNwbGF5TmFtZScsIGRpc3BsYXlOYW1lKTtcblxuXHRcdFx0dXNlci5zaWduVXAobnVsbCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0XHRhcHAuZ29Ub1ZpZXcoJ2hvbWUnKTtcblx0XHRcdFx0XHRhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5pbml0KCk7XG5cdFx0XHRcdFx0YXV0aC5yZXNldFZpZXdzKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuXHRcdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdFBhcnNlLlVzZXIubG9nSW4odXNlcm5hbWUsIHBhc3N3b3JkLCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0XHRhdXRoLmN1cnJlbnRVc2VyKHVzZXIpO1xuXHRcdFx0XHRcdGFwcC5nb1RvVmlldygnaG9tZScpO1xuXHRcdFx0XHRcdGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmluaXQoKTtcblx0XHRcdFx0XHRhdXRoLnJlc2V0Vmlld3MoKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0Ly8gVGhlIGxvZ2luIGZhaWxlZC4gQ2hlY2sgZXJyb3IgdG8gc2VlIHdoeS5cblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLmZvcmdvdCA9IGZ1bmN0aW9uKGZvcm1FbGVtZW50KSB7XG5cdFx0dmFyIGVtYWlsID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2ZvcmdvdF0nKS52YWwoKTtcblxuXHRcdGlmIChlbWFpbC5sZW5ndGggPD0gMCkge1xuXHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciBhbiBlbWFpbCBhZGRyZXNzLicpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRQYXJzZS5Vc2VyLnJlcXVlc3RQYXNzd29yZFJlc2V0KGVtYWlsLCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGF1dGguZm9yZ290TW9kZShmYWxzZSk7XG5cdFx0XHRcdFx0JChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2ZvcmdvdF0nKS52YWwoJycpO1xuXHRcdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgY2hlY2sgeW91ciBlbWFpbCBmb3IgaW5zdHJ1Y3Rpb25zIG9uIHJlc2V0dGluZyB5b3VyIHBhc3N3b3JkLicpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGF1dGgucmVzZXRFcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGguZXJyb3JNZXNzYWdlKCcnKTtcblx0fVxuXG5cdGF1dGgubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLm15Vmlld01vZGVsLnByb2ZpbGUuc2hvdyhmYWxzZSk7XG5cdFx0YXBwLmdvVG9WaWV3KCdhdXRoJyk7XG5cdFx0UGFyc2UuVXNlci5sb2dPdXQoKTtcblx0XHRhdXRoLmN1cnJlbnRVc2VyKG51bGwpO1xuXHRcdGF1dGgucmVzZXRWaWV3cygpO1xuXHR9XG5cblx0YXV0aC5yZXNldFZpZXdzID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cdFx0YXV0aC5zaWduSW5Nb2RlKGZhbHNlKTtcblx0XHRhdXRoLnNpZ25VcE1vZGUoZmFsc2UpO1xuXHRcdGF1dGguZm9yZ290TW9kZShmYWxzZSk7XG5cdH1cblxuXHRhdXRoLnRvZ2dsZVNpZ25JbiA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChhdXRoLnNpZ25Jbk1vZGUoKSkge1xuXHRcdFx0YXV0aC5zaWduSW5Nb2RlKGZhbHNlKTtcblx0XHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhdXRoLnNpZ25Jbk1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC50b2dnbGVTaWduVXAgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoYXV0aC5zaWduVXBNb2RlKCkpIHtcblx0XHRcdGF1dGguc2lnblVwTW9kZShmYWxzZSk7XG5cdFx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGgudG9nZ2xlRm9yZ290ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGF1dGguZm9yZ290TW9kZSgpKSB7XG5cdFx0XHRhdXRoLmZvcmdvdE1vZGUoZmFsc2UpO1xuXHRcdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGF1dGguZm9yZ290TW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLnNhbml0aXplRXJyb3JzID0gZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRzd2l0Y2goZXJyb3IuY29kZSlcblx0XHR7XG5cdFx0XHRjYXNlIDEwMTpcblx0XHRcdFx0cmV0dXJuICdQbGVhc2UgZW50ZXIgYSB2YWxpZCB1c2VybmFtZSBhbmQgcGFzc3dvcmQuJztcblx0XHRcdGNhc2UgMTI0OlxuXHRcdFx0XHRyZXR1cm4gJ09vcHMhIFdlIG1lc3NlZCB1cC4gUGxlYXNlIHRyeSBhZ2Fpbi4nO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIGVycm9yLm1lc3NhZ2UuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBlcnJvci5tZXNzYWdlLnNsaWNlKDEpICsgJy4nO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguaW5pdCgpO1xuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF1dGg7IiwiLyoqXG4gKiBzY3JpcHRzL21haW4uanNcbiAqXG4gKiBUaGlzIGlzIHRoZSBzdGFydGluZyBwb2ludCBmb3IgeW91ciBhcHBsaWNhdGlvbi5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEFwcCA9IHJlcXVpcmUoJy4vYXBwLmpzJyk7XG52YXIgQXV0aCA9IHJlcXVpcmUoJy4vYXV0aC5qcycpO1xudmFyIFNlbGVjdFByb2plY3QgPSByZXF1aXJlKCcuL3NlbGVjdC1wcm9qZWN0LmpzJyk7XG52YXIgUmF0ZVdlZWsgPSByZXF1aXJlKCcuL3JhdGUtd2Vlay5qcycpO1xudmFyIE5vdGVzID0gcmVxdWlyZSgnLi9ub3Rlcy5qcycpO1xudmFyIFBlb3BsZSA9IHJlcXVpcmUoJy4vcGVvcGxlLmpzJyk7XG52YXIgU2F2ZSA9IHJlcXVpcmUoJy4vc2F2ZS5qcycpO1xudmFyIFBlb3BsZURldGFpbHMgPSByZXF1aXJlKCcuL3Blb3BsZS1kZXRhaWxzLmpzJyk7XG52YXIgSG9tZSA9IHJlcXVpcmUoJy4vaG9tZS5qcycpO1xudmFyIEFsZXJ0cyA9IHJlcXVpcmUoJy4vYWxlcnRzLmpzJyk7XG52YXIgUHJvZmlsZSA9IHJlcXVpcmUoJy4vcHJvZmlsZS5qcycpO1xuXG4vLyBpbml0aWFsaXplIHBhcnNlXG5QYXJzZS5pbml0aWFsaXplKFwiSmtZTmZQQncyYVBnY2M3UGVUR0hNQVUyWEt2anplcVZJa3lDbFZ1b1wiLCBcIjQ1T01VM1pTM281YzE2OGxReGEwaWx4UXU0RmRNVkhUMU5WVGtPUmxcIik7XG5cbi8vIGluaXRpYWxpemUgdHlwZWtpdFxuKGZ1bmN0aW9uKGQpIHtcbnZhciBjb25maWcgPSB7XG4gIGtpdElkOiAnYWVlNmpncScsXG4gIHNjcmlwdFRpbWVvdXQ6IDMwMDBcbn0sXG5oPWQuZG9jdW1lbnRFbGVtZW50LHQ9c2V0VGltZW91dChmdW5jdGlvbigpe2guY2xhc3NOYW1lPWguY2xhc3NOYW1lLnJlcGxhY2UoL1xcYndmLWxvYWRpbmdcXGIvZyxcIlwiKStcIiB3Zi1pbmFjdGl2ZVwiO30sY29uZmlnLnNjcmlwdFRpbWVvdXQpLHRrPWQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKSxmPWZhbHNlLHM9ZC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKVswXSxhO2guY2xhc3NOYW1lKz1cIiB3Zi1sb2FkaW5nXCI7dGsuc3JjPScvL3VzZS50eXBla2l0Lm5ldC8nK2NvbmZpZy5raXRJZCsnLmpzJzt0ay5hc3luYz10cnVlO3RrLm9ubG9hZD10ay5vbnJlYWR5c3RhdGVjaGFuZ2U9ZnVuY3Rpb24oKXthPXRoaXMucmVhZHlTdGF0ZTtpZihmfHxhJiZhIT1cImNvbXBsZXRlXCImJmEhPVwibG9hZGVkXCIpcmV0dXJuO2Y9dHJ1ZTtjbGVhclRpbWVvdXQodCk7dHJ5e1R5cGVraXQubG9hZChjb25maWcpfWNhdGNoKGUpe319O3MucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGsscylcbn0pKGRvY3VtZW50KTtcblxudmFyIGFwcCA9IG5ldyBBcHAoKTtcbnZhciBhdXRoID0gbmV3IEF1dGgoYXBwKTtcbnZhciBob21lID0gbmV3IEhvbWUoYXBwKTtcbnZhciBzZWxlY3RQcm9qZWN0ID0gbmV3IFNlbGVjdFByb2plY3QoYXBwKTtcbnZhciByYXRlV2VlayA9IG5ldyBSYXRlV2VlayhhcHApO1xudmFyIG5vdGVzID0gbmV3IE5vdGVzKGFwcCk7XG52YXIgcGVvcGxlID0gbmV3IFBlb3BsZShhcHApO1xudmFyIHNhdmUgPSBuZXcgU2F2ZShhcHApO1xudmFyIHBlb3BsZURldGFpbHMgPSBuZXcgUGVvcGxlRGV0YWlscyhhcHApO1xudmFyIGFsZXJ0cyA9IG5ldyBBbGVydHMoYXBwKTtcbnZhciBwcm9maWxlID0gbmV3IFByb2ZpbGUoYXBwKTtcblxuLy8gQ3VzdG9tIGtub2Nrb3V0IGV4dGVuZGVyc1xuXG4vLyBIZXJlJ3MgYSBjdXN0b20gS25vY2tvdXQgYmluZGluZyB0aGF0IG1ha2VzIGVsZW1lbnRzIHNob3duL2hpZGRlbiB2aWEgalF1ZXJ5J3MgZmFkZUluKCkvZmFkZU91dCgpIG1ldGhvZHNcbi8vIENvdWxkIGJlIHN0b3JlZCBpbiBhIHNlcGFyYXRlIHV0aWxpdHkgbGlicmFyeVxua28uYmluZGluZ0hhbmRsZXJzLmZhZGVWaXNpYmxlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gSW5pdGlhbGx5IHNldCB0aGUgZWxlbWVudCB0byBiZSBpbnN0YW50bHkgdmlzaWJsZS9oaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZVxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICBrby51bndyYXAodmFsdWUpID8gJChlbGVtZW50KS5mYWRlSW4oKSA6ICQoZWxlbWVudCkuZmFkZU91dCgpO1xuICAgIH1cbn1cblxua28uYmluZGluZ0hhbmRsZXJzLnNsaWRlUGFuZWxWaXNpYmxlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gSW5pdGlhbGx5IHNldCB0aGUgZWxlbWVudCB0byBiZSBpbnN0YW50bHkgdmlzaWJsZS9oaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZVxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgIC8vICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICBpZiAoa28udW53cmFwKHZhbHVlKSkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hZGRDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDAsMCwwKScpLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdmlld3BvcnRIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLnJlbW92ZUNsYXNzKCdvcGVuJykuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlM2QoMCwnICsgdmlld3BvcnRIZWlnaHQgKyAncHgsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5rby5iaW5kaW5nSGFuZGxlcnMuc2hpZnRQYW5lbFZpc2libGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBJbml0aWFsbHkgc2V0IHRoZSBlbGVtZW50IHRvIGJlIGluc3RhbnRseSB2aXNpYmxlL2hpZGRlbiBkZXBlbmRpbmcgb24gdGhlIHZhbHVlXG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgLy8gJChlbGVtZW50KS50b2dnbGUoa28udW53cmFwKHZhbHVlKSk7IC8vIFVzZSBcInVud3JhcE9ic2VydmFibGVcIiBzbyB3ZSBjYW4gaGFuZGxlIHZhbHVlcyB0aGF0IG1heSBvciBtYXkgbm90IGJlIG9ic2VydmFibGVcbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBXaGVuZXZlciB0aGUgdmFsdWUgc3Vic2VxdWVudGx5IGNoYW5nZXMsIHNsb3dseSBmYWRlIHRoZSBlbGVtZW50IGluIG9yIG91dFxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgIGlmIChrby51bndyYXAodmFsdWUpKSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLmFkZENsYXNzKCdvcGVuJykuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlM2QoMCUsMCwwKScpLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdmlld3BvcnRIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLnJlbW92ZUNsYXNzKCdvcGVuJykuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlM2QoMTAwJSwwLDApJykuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuYXBwLmluaXRpYWxpemUoKTsiLCIvKipcbiAqIHNjcmlwdHMvbm90ZXMuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gSG9tZShhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBob21lID0gYXBwLm15Vmlld01vZGVsLmhvbWUgPSB7fTtcblxuXHRob21lLnRvdGFscyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRob21lLmlzUmVmcmVzaERyYWdnaW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGhvbWUuZHJhZ1N0YXJ0ID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0aG9tZS50b2RheSA9IG1vbWVudChuZXcgRGF0ZSgpKS5zdGFydE9mKCdpc293ZWVrJyk7XG5cdGhvbWUud2Vla3MgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblxuXHRob21lLnNob3dBbGVydHMgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAubXlWaWV3TW9kZWwuYWxlcnRzLnNob3codHJ1ZSk7XG5cdH1cblxuXHRob21lLnNob3dQcm9maWxlID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLm15Vmlld01vZGVsLnByb2ZpbGUuc2hvdyh0cnVlKTtcblx0fVxuXG5cdGhvbWUuc3R5bGVXZWVrID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuXHRcdHZhciBzdHlsZWREYXRlID0gJ1dlZWsgb2YgJyArIG1vbWVudChob21lLnRvZGF5KS5hZGQoJ2RheXMnLCAoaW5kZXggKiA3KSkuZm9ybWF0KCdNTU0gRCcpO1xuXHRcdGlmIChpbmRleCA9PSAwKSB7IHN0eWxlZERhdGUgPSAnVGhpcyBXZWVrJyB9O1xuXHRcdGlmIChpbmRleCA9PSAxKSB7IHN0eWxlZERhdGUgPSAnTmV4dCBXZWVrJyB9O1xuXHRcdHJldHVybiBzdHlsZWREYXRlO1xuXHR9XG5cblx0aG9tZS5XZWVrID0gZnVuY3Rpb24obWlzc2luZ1dlZWspIHtcblx0XHR2YXIgYmxhbmtXZWVrID0ge1xuXHRcdFx0bm90ZXM6ICcnLFxuXHRcdFx0cmF0aW5nOiAtMSxcblx0XHRcdHRvdGFsOiAtMSxcblx0XHRcdHdlZWs6IG1pc3NpbmdXZWVrXG5cdFx0fTtcblx0XHRyZXR1cm4gYmxhbmtXZWVrO1xuXHR9XG5cblx0aG9tZS5nbyA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0YXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuaW5pdChpbmRleCk7XG5cdFx0YXBwLmdvVG9WaWV3KCdzZWxlY3QtcHJvamVjdCcpO1xuXHR9XG5cblx0aG9tZS5jb252ZXJ0TnVtVG9Xb3JkcyA9IGZ1bmN0aW9uKG51bWJlcikge1xuXHRcdHN3aXRjaCAobnVtYmVyKSB7XG5cdFx0XHRjYXNlIDA6XG5cdFx0XHRcdHJldHVybiAnemVybyc7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHJldHVybiAnb25lJztcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0cmV0dXJuICd0d28nO1xuXHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRyZXR1cm4gJ3RocmVlJztcblx0XHRcdGNhc2UgNDpcblx0XHRcdFx0cmV0dXJuICdmb3VyJztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiAndW5rbm93bic7XG5cdFx0fVxuXHR9XG5cblx0aG9tZS5nZXRUb3RhbHNBbmRSYXRpbmcgPSBmdW5jdGlvbigpIHtcblx0XHRob21lLndlZWtzKFtdKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFwcC5teVZpZXdNb2RlbC5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHRob21lLndlZWtzLnB1c2gobW9tZW50KGhvbWUudG9kYXkpLnN0YXJ0T2YoJ2lzb3dlZWsnKS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ1lZWVksIE0sIEQnKSk7XG5cdFx0fVxuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0VG90YWxzQW5kUmF0aW5nJywge1xuXHRcdFx0d2Vla3M6IGhvbWUud2Vla3MoKVxuXHRcdH0sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHRvdGFsc0FuZFJhdGluZykge1xuXG5cdFx0XHRcdHZhciBzZXQgPSBbXTtcblx0XHRcdFx0Xy5lYWNoKHRvdGFsc0FuZFJhdGluZywgZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdHNldFtkYXRhLndlZWtdID0gdHJ1ZTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcHAubXlWaWV3TW9kZWwubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0XHRcdHZhciBkYXRlID0gbW9tZW50KGhvbWUudG9kYXkpLnN0YXJ0T2YoJ2lzb3dlZWsnKS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ1lZWVksIE0sIEQnKTtcblx0XHRcdFx0XHRpZiAoIXNldFtkYXRlXSkge1xuXHRcdFx0XHRcdFx0dG90YWxzQW5kUmF0aW5nLnB1c2gobmV3IGhvbWUuV2VlayhkYXRlKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIHNvcnRlZCA9IF8uc29ydEJ5KHRvdGFsc0FuZFJhdGluZywgZnVuY3Rpb24oaXRlbSkge1xuXHRcdFx0XHRcdHZhciBkYXRlID0gaXRlbS53ZWVrLnNwbGl0KCcsJyk7XG5cdFx0XHRcdFx0dmFyIHRpbWUgPSBtb21lbnQobmV3IERhdGUoZGF0ZVswXSwgZGF0ZVsxXSwgZGF0ZVsyXSkpLnZhbHVlT2YoKTtcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VJbnQodGltZSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGhvbWUudG90YWxzKHNvcnRlZCk7XG5cblx0XHRcdFx0JCgnI2hvbWUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPiBQdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0aG9tZS5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdGhvbWUuZHJhZ1N0YXJ0KDApO1xuXHRcdFx0XHQkKCcjaG9tZSAucGFnZScpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHR9LCAxMDApO1xuXG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0aG9tZS5kcmFnUmVmcmVzaCA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKGhvbWUuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiBob21lLmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHZhciB0b3AgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKTtcblx0XHRcdHZhciBkZWx0YSA9IE1hdGguZmxvb3IoZXZlbnQuZ2VzdHVyZS5kaXN0YW5jZSk7XG5cdFx0XHRpZiAodG9wID09IDAgJiYgZGVsdGEgPiAzMCkge1xuXHRcdFx0XHRpZiAoZGVsdGEgPiAxNTApIGRlbHRhID0gMTUwO1xuXHRcdFx0XHQkKCcjaG9tZSAucGFnZScpLmNzcygnbWFyZ2luLXRvcCcsIGRlbHRhIC0gMzApO1xuXHRcdFx0XHRpZiAoZGVsdGEgPj0gMTAwKSB7XG5cdFx0XHRcdFx0JCgnI2hvbWUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS11cFwiPjwvc3Bhbj4gUmVsZWFzZSB0byByZWZyZXNoJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI2hvbWUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPiBQdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGhvbWUuc3RhcnRSZWZyZXNoRHJhZyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKCFob21lLmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgaG9tZS5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHRob21lLmRyYWdTdGFydCgkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSk7XG5cdFx0XHRob21lLmlzUmVmcmVzaERyYWdnaW5nKHRydWUpO1xuXHRcdFx0JChldmVudC5nZXN0dXJlLnRhcmdldCkub25lKCdkcmFnZW5kJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0dmFyIGRlbHRhID0gcGFyc2VJbnQoJCgnI2hvbWUgLnBhZ2UnKS5jc3MoJ21hcmdpbi10b3AnKSk7XG5cblx0XHRcdFx0aWYgKGRlbHRhID49IDcwKSB7XG5cdFx0XHRcdFx0aG9tZS5nZXRUb3RhbHNBbmRSYXRpbmcoKTtcblx0XHRcdFx0XHQkKCcjaG9tZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluXCI+PC9zcGFuPiBSZWZyZXNoaW5nLi4uJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI2hvbWUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPiBQdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0XHRob21lLmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0XHRob21lLmRyYWdTdGFydCgwKTtcblx0XHRcdFx0XHQkKCcjaG9tZSAucGFnZScpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdFx0fSwgMTAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXHRob21lLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRob21lLmdldFRvdGFsc0FuZFJhdGluZygpO1xuXHR9XG5cblx0aWYgKGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHRob21lLmluaXQoKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gSG9tZTsiLCIvKipcbiAqIHNjcmlwdHMvbm90ZXMuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTm90ZXMoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgbm90ZXMgPSBhcHAubXlWaWV3TW9kZWwubm90ZXMgPSB7fTtcblxuXHRub3Rlcy5zaG93ID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdG5vdGVzLnJhdGluZyA9IGtvLm9ic2VydmFibGUoMik7XG5cdG5vdGVzLmNvbnRlbnQgPSBrby5vYnNlcnZhYmxlKCk7XG5cblx0bm90ZXMuc3RhdHVzT3B0aW9ucyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXG5cdG5vdGVzLndvcmtsb2FkV2VlayA9IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdHZhciB0ZXh0ID0gYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3Qud2VlaygpO1xuXHRcdGlmIChhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC53ZWVrSW5kZXgoKSA+PSAyKSB7XG5cdFx0XHR0ZXh0ID0gJ3RoZSAnICsgdGV4dDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGV4dCA9IHRleHQudG9Mb3dlckNhc2UoKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRleHQ7XG5cdH0pO1xuXG5cdG5vdGVzLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRub3Rlcy5zdGF0dXNPcHRpb25zLnB1c2gobmV3IG5vdGVzLlN0YXR1cygnQnJpbmcgb24gdGhlIHdvcmsnLDApKTtcblx0XHRub3Rlcy5zdGF0dXNPcHRpb25zLnB1c2gobmV3IG5vdGVzLlN0YXR1cygnSVxcJ20gYSBsaXR0bGUgbGlnaHQnLDEpKTtcblx0XHRub3Rlcy5zdGF0dXNPcHRpb25zLnB1c2gobmV3IG5vdGVzLlN0YXR1cygnTGlmZSBpcyBnb29kJywyKSk7XG5cdFx0bm90ZXMuc3RhdHVzT3B0aW9ucy5wdXNoKG5ldyBub3Rlcy5TdGF0dXMoJ0lcXCdtIGEgYml0IG92ZXJ3aGVsbWVkJywzKSk7XG5cdFx0bm90ZXMuc3RhdHVzT3B0aW9ucy5wdXNoKG5ldyBub3Rlcy5TdGF0dXMoJ1N0b3AgdGhlIG1hZG5lc3MhJyw0KSk7XG5cdH1cblxuXHRub3Rlcy5TdGF0dXMgPSBmdW5jdGlvbih0ZXh0LCB2YWx1ZSkge1xuXHRcdHZhciBzdGF0dXMgPSB7XG5cdFx0XHRsYWJlbDogdGV4dCxcblx0XHRcdHZhbHVlOiB2YWx1ZVxuXHRcdH07XG5cdFx0cmV0dXJuIHN0YXR1cztcblx0fVxuXG5cdG5vdGVzLnNlbGVjdFN0YXR1cyA9IGZ1bmN0aW9uKGl0ZW0sIGUpIHtcblx0XHRub3Rlcy5yYXRpbmcoaXRlbS52YWx1ZSk7XG5cdH1cblxuXHRub3Rlcy5yZXNldCA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0aWYgKGluZGV4ICE9IG51bGwpIHtcblx0XHRcdG5vdGVzLnJhdGluZyhhcHAubXlWaWV3TW9kZWwuaG9tZS50b3RhbHMoKVtpbmRleF0ucmF0aW5nKTtcblx0XHRcdG5vdGVzLmNvbnRlbnQoYXBwLm15Vmlld01vZGVsLmhvbWUudG90YWxzKClbaW5kZXhdLm5vdGVzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bm90ZXMucmF0aW5nKDIpO1xuXHRcdFx0bm90ZXMuY29udGVudCgnJyk7XG5cdFx0fVxuXHR9XG5cblx0bm90ZXMuZ29CYWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLnNob3codHJ1ZSk7XG5cdFx0bm90ZXMuc2hvdyhmYWxzZSk7XG5cdFx0YXBwLmdvVG9WaWV3KCdyYXRlLXdlZWsnKTtcblx0fVxuXG5cdG5vdGVzLmdvTmV4dCA9IGZ1bmN0aW9uKCkge1xuXHRcdG5vdGVzLnNob3coZmFsc2UpO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5zYXZlLnNob3codHJ1ZSk7XG5cdFx0YXBwLm15Vmlld01vZGVsLnNhdmUuc3VibWl0KCk7XG5cdFx0YXBwLmdvVG9WaWV3KCdzYXZlJyk7XG5cdH1cblxuXHRub3Rlcy5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBOb3RlczsiLCIvKipcbiAqIHNjcmlwdHMvcGVvcGxlLWRldGFpbHMuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUGVvcGxlRGV0YWlscyhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBwZW9wbGVEZXRhaWxzID0gYXBwLm15Vmlld01vZGVsLnBlb3BsZURldGFpbHMgPSB7fTtcblxuXHRwZW9wbGVEZXRhaWxzLnBlcnNvbiA9IGtvLm9ic2VydmFibGUobnVsbCk7XG5cdHBlb3BsZURldGFpbHMud2Vla3MgPSBrby5vYnNlcnZhYmxlQXJyYXkoW10pO1xuXHRwZW9wbGVEZXRhaWxzLnRvdGFscyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG5cblx0cGVvcGxlRGV0YWlscy5nZXRQZXJzb24gPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0cGVvcGxlRGV0YWlscy50b3RhbHMoW10pO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXBwLm15Vmlld01vZGVsLnBlb3BsZS5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHR2YXIgcGVyc29uID0gXy5maW5kKGFwcC5teVZpZXdNb2RlbC5wZW9wbGUudGltZXMoKVtpXSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRcdHJldHVybiBvYmouYXR0cmlidXRlcy51c2VyLmlkID09IGl0ZW0uYXR0cmlidXRlcy51c2VyLmlkO1xuXHRcdFx0fSk7XG5cdFx0XHRwZW9wbGVEZXRhaWxzLnRvdGFscy5wdXNoKHBlcnNvbik7XG5cdFx0fVxuXG5cdFx0cGVvcGxlRGV0YWlscy5wZXJzb24oaXRlbSk7XG5cdH1cblxuXHRwZW9wbGVEZXRhaWxzLmdvQmFjayA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5nb1RvVmlldygncGVvcGxlJyk7XG5cdH1cblxuXHRwZW9wbGVEZXRhaWxzLmdldENvbXBhbnlOYW1lID0gZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgbmFtZSA9ICcnO1xuXHRcdHZhciBwcm9qZWN0ID0gXy5maW5kKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0cmV0dXJuIG9iai5pZCA9PSBpZDtcblx0XHR9KTtcblxuXHRcdGlmICh0eXBlb2YgcHJvamVjdCA9PT0gJ29iamVjdCcpIHtcblx0XHRcdG5hbWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMuY29tcGFueTtcblx0XHR9XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH1cblxuXHRwZW9wbGVEZXRhaWxzLmdldFByb2plY3ROYW1lID0gZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgbmFtZSA9ICcnO1xuXHRcdHZhciBwcm9qZWN0ID0gXy5maW5kKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0cmV0dXJuIG9iai5pZCA9PSBpZDtcblx0XHR9KTtcblxuXHRcdGlmICh0eXBlb2YgcHJvamVjdCA9PT0gJ29iamVjdCcpIHtcblx0XHRcdG5hbWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMubmFtZTtcblx0XHR9XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQZW9wbGVEZXRhaWxzOyIsIi8qKlxuICogc2NyaXB0cy9wZW9wbGUuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUGVvcGxlKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHBlb3BsZSA9IGFwcC5teVZpZXdNb2RlbC5wZW9wbGUgPSB7fTtcblxuXHRwZW9wbGUubnVtV2Vla3MgPSAzO1xuXHRwZW9wbGUudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRwZW9wbGUuYWN0aXZlV2VlayA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHBlb3BsZS5hY3RpdmVQZXJzb24gPSBrby5vYnNlcnZhYmxlKCk7XG5cdHBlb3BsZS52aWV3VHlwZSA9IGtvLm9ic2VydmFibGUoJ2hvdXJzJyk7XG5cdHBlb3BsZS50aW1lcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRwZW9wbGUud2Vla3MgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0cGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHBlb3BsZS5kcmFnU3RhcnQgPSBrby5vYnNlcnZhYmxlKDApO1xuXG5cdHBlb3BsZS5nZXRUaW1lcyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkYXRlcyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGVvcGxlLm51bVdlZWtzOyBpKyspIHtcblx0XHRcdGRhdGVzLnB1c2gobW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJykpO1xuXHRcdFx0cGVvcGxlLndlZWtzKClbaV0uZGF0ZShtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ01NTSBEJykpO1xuXHRcdH1cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFRpbWVzJywge1xuXHRcdFx0ZGF0ZXM6IGRhdGVzXG5cdFx0fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24odGltZXMpIHtcblx0XHRcdFx0cGVvcGxlLnRpbWVzKFtdKTtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB0aW1lcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YSA9ICQucGFyc2VKU09OKHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YSk7XG5cdFx0XHRcdFx0dmFyIHRvdGFsID0gXyh0aW1lc1tqXS5hdHRyaWJ1dGVzLmRhdGEucHJvamVjdHMpLnJlZHVjZShmdW5jdGlvbihhY2MsIG9iaikge1xuXHRcdFx0XHRcdFx0XyhvYmopLmVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkgeyBhY2Nba2V5XSA9IChhY2Nba2V5XSA/IGFjY1trZXldIDogMCkgKyB2YWx1ZSB9KTtcblx0XHRcdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHRcdFx0fSwge30pO1xuXG5cdFx0XHRcdFx0dGltZXNbal0uYXR0cmlidXRlcy50b3RhbCA9IGtvLm9ic2VydmFibGUodG90YWwucGVyY2VudGFnZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0XHRcdHZhciB3ZWVrRGF0ZSA9IG1vbWVudChwZW9wbGUudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpO1xuXHRcdFx0XHRcdHZhciB3ZWVrID0gXy5maWx0ZXIodGltZXMsIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9iai5hdHRyaWJ1dGVzLmRhdGEuZGF0ZSA9PSB3ZWVrRGF0ZTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHZhciBzb3J0ZWQgPSBfLnNvcnRCeSh3ZWVrLCBmdW5jdGlvbihvYmopeyBcblx0XHRcdFx0XHRcdHJldHVybiAtb2JqLmF0dHJpYnV0ZXMudG90YWwoKTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHBlb3BsZS50aW1lcy5wdXNoKHNvcnRlZCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdHBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdHBlb3BsZS5kcmFnU3RhcnQoMCk7XG5cdFx0XHRcdCQoJyNwZW9wbGUgLnBlb3BsZScpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHBlb3BsZS5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0dmFyIHdlZWsgPSB7XG5cdFx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdNTU0gRCcpKVxuXHRcdFx0fVxuXHRcdFx0cGVvcGxlLndlZWtzLnB1c2god2Vlayk7XG5cdFx0fVxuXHRcdHBlb3BsZS5nZXRUaW1lcygpO1xuXHR9XG5cblx0cGVvcGxlLnNlbGVjdFdlZWsgPSBmdW5jdGlvbihpbmRleCkge1xuXHRcdHBlb3BsZS5hY3RpdmVXZWVrKGluZGV4KTtcblx0XHQvLyBnbyBnZXQgdGhlIGRhdGEgZm9yIHRoaXMgd2Vla1xuXHR9XG5cblx0cGVvcGxlLnRvZ2dsZVZpZXcgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAocGVvcGxlLnZpZXdUeXBlKCkgPT0gJ2hvdXJzJykge1xuXHRcdFx0cGVvcGxlLnZpZXdUeXBlKCdwZXJjZW50Jyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBlb3BsZS52aWV3VHlwZSgnaG91cnMnKTtcblx0XHR9XG5cdH1cblxuXHRwZW9wbGUuZ29Ub1BlcnNvbiA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRhcHAubXlWaWV3TW9kZWwucGVvcGxlRGV0YWlscy5nZXRQZXJzb24oaXRlbSk7XG5cdFx0YXBwLmdvVG9WaWV3KCdwZW9wbGUtZGV0YWlscycpO1xuXHR9XG5cblx0cGVvcGxlLmRyYWdSZWZyZXNoID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAocGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgcGVvcGxlLmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHZhciB0b3AgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKTtcblx0XHRcdHZhciBkZWx0YSA9IE1hdGguZmxvb3IoZXZlbnQuZ2VzdHVyZS5kaXN0YW5jZSk7XG5cdFx0XHRpZiAodG9wID09IDAgJiYgZGVsdGEgPiAzMCkge1xuXHRcdFx0XHRpZiAoZGVsdGEgPiAxNTApIGRlbHRhID0gMTUwO1xuXHRcdFx0XHQkKCcjcGVvcGxlIC5wZW9wbGUnKS5jc3MoJ21hcmdpbi10b3AnLCBkZWx0YSAtIDMwKTtcblx0XHRcdFx0aWYgKGRlbHRhID49IDEwMCkge1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS11cFwiPjwvc3Bhbj5SZWxlYXNlIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHBlb3BsZS5zdGFydFJlZnJlc2hEcmFnID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoIXBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZygpICYmICFhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmlzT3BlbigpICYmIHBlb3BsZS5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHRwZW9wbGUuZHJhZ1N0YXJ0KCQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpKTtcblx0XHRcdHBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZyh0cnVlKTtcblx0XHRcdCQoZXZlbnQuZ2VzdHVyZS50YXJnZXQpLm9uZSgnZHJhZ2VuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdHZhciBkZWx0YSA9IHBhcnNlSW50KCQoJyNwZW9wbGUgLnBlb3BsZScpLmNzcygnbWFyZ2luLXRvcCcpKTtcblx0XHRcdFx0aWYgKGRlbHRhID49IDcwKSB7XG5cdFx0XHRcdFx0cGVvcGxlLmdldFRpbWVzKCk7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluXCI+PC9zcGFuPlJlZnJlc2hpbmcuLi4nKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5wZW9wbGUnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXG5cdH1cblxuXHRwZW9wbGUuaW5pdCgpO1xuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBlb3BsZTsiLCIvKipcbiAqIHNjcmlwdHMvcHJvZmlsZS5qc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUHJvZmlsZShhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBwcm9maWxlID0gYXBwLm15Vmlld01vZGVsLnByb2ZpbGUgPSB7fTtcblxuXHRwcm9maWxlLnNob3cgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvZmlsZTsiLCIvKipcbiAqIHNjcmlwdHMvcmF0ZS13ZWVrLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFJhdGVXZWVrKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHJhdGVXZWVrID0gYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrID0ge307XG5cblx0cmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVggPSBrby5vYnNlcnZhYmxlKCk7XG5cdHJhdGVXZWVrLnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cmF0ZVdlZWsucmVnaXN0ZXJSYXRpbyA9IGtvLm9ic2VydmFibGUoJChkb2N1bWVudCkud2lkdGgoKSAtIDIwKTtcblx0cmF0ZVdlZWsuc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cdHJhdGVXZWVrLmRyYWcgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdHZhciBkaXJlY3Rpb24gPSBldmVudC5nZXN0dXJlLmRpcmVjdGlvbjtcblx0XHRpZiAoZGlyZWN0aW9uID09ICdsZWZ0JyB8fCBkaXJlY3Rpb24gPT0gJ3JpZ2h0Jykge1xuXHRcdFx0dmFyIHN0YXJ0WCA9IGV2ZW50Lmdlc3R1cmUuc3RhcnRFdmVudC5jZW50ZXIucGFnZVg7XG5cdFx0XHRpZiAocmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVgoKSAhPSBzdGFydFgpIHtcblx0XHRcdFx0cmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVgoc3RhcnRYKTtcblx0XHRcdFx0cmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoaXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKSk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgZGlmZiA9IChldmVudC5nZXN0dXJlLmRlbHRhWCAvIHJhdGVXZWVrLnJlZ2lzdGVyUmF0aW8oKSkgKiAxNTA7XG5cdFx0XHR2YXIgbmV3UGVyY2VudGFnZSA9IE1hdGguZmxvb3IoKGRpZmYgKyByYXRlV2Vlay5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZSgpKSAvIDUpICogNTtcblxuXHRcdFx0aWYgKG5ld1BlcmNlbnRhZ2UgPiAwICYmIG5ld1BlcmNlbnRhZ2UgPD0gMTUwKSB7XG5cdFx0XHRcdGl0ZW0uYXR0cmlidXRlcy5wZXJjZW50YWdlKG5ld1BlcmNlbnRhZ2UpO1xuXHRcdFx0fSBlbHNlIGlmIChuZXdQZXJjZW50YWdlID4gMTUwKSB7XG5cdFx0XHRcdGl0ZW0uYXR0cmlidXRlcy5wZXJjZW50YWdlKDE1MCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpdGVtLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgwKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyYXRlV2Vlay5nb0JhY2sgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5zaG93KHRydWUpO1xuXHRcdHJhdGVXZWVrLnNob3coZmFsc2UpO1xuXHRcdGFwcC5nb1RvVmlldygnc2VsZWN0LXByb2plY3QnKTtcblx0fVxuXG5cdHJhdGVXZWVrLmdvTmV4dCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJhdGVXZWVrLnNob3coZmFsc2UpO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5ub3Rlcy5zaG93KHRydWUpO1xuXHRcdGFwcC5nb1RvVmlldygnbm90ZXMnKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJhdGVXZWVrOyIsIi8qKlxuICogc2NyaXB0cy9zYXZlLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFNhdmUoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgc2F2ZSA9IGFwcC5teVZpZXdNb2RlbC5zYXZlID0ge307XG5cblx0c2F2ZS5zaG93ID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNhdmUuc3VjY2VzcyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzYXZlLmVycm9yID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNhdmUuc2F2aW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0c2F2ZS5yZXN1bHQgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0Ly8gc2F2ZS5kb25lID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdC8vIFx0dmFyIGRvbmUgPSBmYWxzZTtcblx0Ly8gXHRmb3IgKHZhciBpID0gMDsgaSA8IHNhdmUucmVzdWx0Lmxlbmd0aDsgaSsrKSB7XG5cdC8vIFx0XHRkb25lID0gZG9uZSB8fCBzYXZlLnJlc3VsdFtpXTtcblx0Ly8gXHR9XG5cdC8vIFx0cmV0dXJuIGRvbmU7XG5cdC8vIH0pO1xuXG5cdHNhdmUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLmdvVG9WaWV3KCdzYXZlJyk7XG5cdFx0c2F2ZS5zaG93KHRydWUpO1xuXHRcdHNhdmUuc2F2aW5nKHRydWUpO1xuXHRcdHZhciB0ZW1wID0ge307XG5cdFx0dmFyIGN1cldlZWs7XG5cdFx0Ly8gdmFyIG51bVdlZWtzID0gYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLndlZWtzKCkubGVuZ3RoO1xuXG5cdFx0dmFyIHByb2plY3RzID0gW107XG5cdFx0Xy5lYWNoKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0Lmdyb3VwcygpLCBmdW5jdGlvbihncm91cCkge1xuXHRcdFx0Xy5lYWNoKGdyb3VwLmF0dHJpYnV0ZXMucHJvamVjdHMoKSwgZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0XHRpZiAocHJvamVjdC5hdHRyaWJ1dGVzLnNlbGVjdGVkKCkpIHtcblx0XHRcdFx0XHR2YXIgbmV3UHJvamVjdCA9IHtcblx0XHRcdFx0XHRcdGlkOiBwcm9qZWN0LmlkLFxuXHRcdFx0XHRcdFx0cGVyY2VudGFnZTogcHJvamVjdC5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRwcm9qZWN0cy5wdXNoKG5ld1Byb2plY3QpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH0pO1xuXG5cdFx0dmFyIGRhdGUgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpLmFkZCgnZGF5cycsIChhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC53ZWVrSW5kZXgoKSAqIDcpKS5mb3JtYXQoJ1lZWVksIE0sIEQnKTtcblx0XHRjb25zb2xlLmxvZyhkYXRlKVxuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRkYXRlOiBkYXRlLFxuXHRcdFx0cmF0aW5nOiBhcHAubXlWaWV3TW9kZWwubm90ZXMucmF0aW5nKCksXG5cdFx0XHRub3RlczogYXBwLm15Vmlld01vZGVsLm5vdGVzLmNvbnRlbnQoKSxcblx0XHRcdHByb2plY3RzOiBwcm9qZWN0c1xuXHRcdH1cblxuXHRcdFBhcnNlLkNsb3VkLnJ1bignc2F2ZVRpbWUnLCB7XG5cdFx0XHRkYXRlOiBkYXRlLFxuXHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSlcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdGFwcC5teVZpZXdNb2RlbC5ob21lLmdldFRvdGFsc0FuZFJhdGluZygpO1xuXHRcdFx0XHRzYXZlLnN1Y2Nlc3ModHJ1ZSk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHRzYXZlLmVycm9yKHRydWUpO1xuXHRcdFx0XHRzYXZlLnJlc2V0KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRzYXZlLnRyeUFnYWluID0gZnVuY3Rpb24oKSB7XG5cdFx0c2F2ZS5lcnJvcihmYWxzZSk7XG5cdFx0c2F2ZS5zdWNjZXNzKGZhbHNlKTtcblx0XHRzYXZlLnN1Ym1pdCgpO1xuXHR9XG5cblx0c2F2ZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHRcdHNhdmUuc2F2aW5nKGZhbHNlKTtcblx0XHRzYXZlLnNob3coZmFsc2UpO1xuXHRcdHNhdmUuZXJyb3IoZmFsc2UpO1xuXHRcdHNhdmUuc3VjY2VzcyhmYWxzZSk7XG5cdFx0YXBwLmdvVG9WaWV3KCdob21lJyk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTYXZlOyIsIi8qKlxuICogc2NyaXB0cy9zZWxlY3QtcHJvamVjdC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTZWxlY3RQcm9qZWN0KGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHNlbGVjdFByb2plY3QgPSBhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdCA9IHt9O1xuXG5cdHNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC5pc0FkZE1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2VsZWN0UHJvamVjdC51bmlxdWVDb21wYW55TmFtZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0ID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2VsZWN0UHJvamVjdC5kcmFnU3RhcnQgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRzZWxlY3RQcm9qZWN0LmNvdW50ID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0c2VsZWN0UHJvamVjdC53ZWVrID0ga28ub2JzZXJ2YWJsZSgnVGhpcyBXZWVrJyk7XG5cdHNlbGVjdFByb2plY3Quc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzZWxlY3RQcm9qZWN0LnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0c2VsZWN0UHJvamVjdC5ncm91cHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC53ZWVrSW5kZXggPSBrby5vYnNlcnZhYmxlKDApO1xuXG5cdHNlbGVjdFByb2plY3QuR3JvdXAgPSBmdW5jdGlvbih0eXBlKSB7XG5cdFx0dmFyIGdyb3VwID0ge1xuXHRcdFx0YXR0cmlidXRlczoge31cblx0XHR9XG5cdFx0Z3JvdXAuYXR0cmlidXRlcy5uYW1lID0gKHR5cGUgPT0gJ3ByaXZhdGUnID8gJ015IFByaXZhdGUgUHJvamVjdHMnIDogJ015IFNoYXJlZCBQcm9qZWN0cycpO1xuXHRcdHJldHVybiBncm91cDtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuaW5pdCA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cblx0XHRpZiAoYXBwLm15Vmlld01vZGVsLmhvbWUudG90YWxzKClbaW5kZXhdLnRvdGFsID49IDApIHtcblx0XHRcdGFwcC5teVZpZXdNb2RlbC5ub3Rlcy5yZXNldChpbmRleCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFwcC5teVZpZXdNb2RlbC5ub3Rlcy5yZXNldChudWxsKTtcblx0XHR9XG5cdFx0c2VsZWN0UHJvamVjdC5wb3B1bGF0ZVNlbGVjdGlvbnMoaW5kZXgpO1xuXG5cdFx0dmFyIHN0eWxlZERhdGUgPSAnV2VlayBvZiAnICsgbW9tZW50KHNlbGVjdFByb2plY3QudG9kYXkpLmFkZCgnZGF5cycsIChpbmRleCAqIDcpKS5mb3JtYXQoJ01NTSBEJyk7XG5cdFx0aWYgKGluZGV4ID09IDApIHN0eWxlZERhdGUgPSAnVGhpcyBXZWVrJztcblx0XHRpZiAoaW5kZXggPT0gMSkgc3R5bGVkRGF0ZSA9ICdOZXh0IFdlZWsnO1xuXHRcdHNlbGVjdFByb2plY3Qud2VlayhzdHlsZWREYXRlKTtcblx0XHRzZWxlY3RQcm9qZWN0LndlZWtJbmRleChpbmRleCk7XG5cdFx0c2VsZWN0UHJvamVjdC5zaG93KHRydWUpO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5nZXRHcm91cHMgPSBmdW5jdGlvbigpIHtcblx0XHRzZWxlY3RQcm9qZWN0Lmdyb3VwcyhbXSk7XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRHcm91cHMnLCB7fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZ3JvdXBzKSB7XG5cdFx0XHRcdC8vIGdyb3Vwcy5zcGxpY2UoMCwwLG5ldyBzZWxlY3RQcm9qZWN0Lkdyb3VwKCdwcml2YXRlJyksIG5ldyBzZWxlY3RQcm9qZWN0Lkdyb3VwKCdwdWJsaWMnKSk7XG5cdFx0XHRcdF8uZWFjaChncm91cHMsIGZ1bmN0aW9uKGdyb3VwKSB7XG5cdFx0XHRcdFx0Z3JvdXAuYXR0cmlidXRlcy5wcm9qZWN0cyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRcdFx0XHRcdGdyb3VwLmF0dHJpYnV0ZXMubm9uTWVtYmVyID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0Lmdyb3Vwcyhncm91cHMpO1xuXG5cdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgwKTtcblx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5ncm91cHMnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0fSwgMTAwKTtcblxuXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0UHJvamVjdC5ncm91cHMoKS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0UHJvamVjdHMnLCB7XG5cdFx0XHRcdFx0XHRncm91cElkOiBzZWxlY3RQcm9qZWN0Lmdyb3VwcygpW2ldLmlkXG5cdFx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzdWx0cykge1xuXHRcdFx0XHRcdFx0XHRpZiAocmVzdWx0cy5wcm9qZWN0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIGdyb3VwID0gXy5maW5kKHNlbGVjdFByb2plY3QuZ3JvdXBzKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZ3JvdXAuaWQgPT0gcmVzdWx0cy5wcm9qZWN0c1swXS5hdHRyaWJ1dGVzLmdyb3VwLmlkO1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cblx0XHRcdFx0XHRcdFx0XHRfLmVhY2gocmVzdWx0cy5wcm9qZWN0cywgZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cHJvamVjdC5hdHRyaWJ1dGVzLnNlbGVjdGVkID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRwcm9qZWN0LmF0dHJpYnV0ZXMucGVyY2VudGFnZSA9IGtvLm9ic2VydmFibGUoMCk7XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoZ3JvdXApIHtcblx0XHRcdFx0XHRcdFx0XHRcdGdyb3VwLmF0dHJpYnV0ZXMucHJvamVjdHMocmVzdWx0cy5wcm9qZWN0cyk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdC8vIGNoZWNrIG1lbWJlcnNoaXAgc3RhdHVzIGZvciB0aGUgZW1wdHkgZ3JvdXBcblx0XHRcdFx0XHRcdFx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldE1lbWJlcnNoaXBTdGF0dXMnLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRncm91cElkOiByZXN1bHRzLmdyb3VwSWRcblx0XHRcdFx0XHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXN1bHRzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICghcmVzdWx0cy5zdGF0dXMpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgZ3JvdXAgPSBfLmZpbmQoc2VsZWN0UHJvamVjdC5ncm91cHMoKSwgZnVuY3Rpb24oZ3JvdXApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBncm91cC5pZCA9PSByZXN1bHRzLmdyb3VwSWQ7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoZ3JvdXApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGdyb3VwLmF0dHJpYnV0ZXMubm9uTWVtYmVyKHRydWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyhzZWxlY3RQcm9qZWN0Lmdyb3VwcygpKVxuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuZ29Ib21lID0gZnVuY3Rpb24oKSB7XG5cdFx0c2VsZWN0UHJvamVjdC5zaG93KGZhbHNlKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ2hvbWUnKTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuZ29OZXh0ID0gZnVuY3Rpb24oKSB7XG5cdFx0c2VsZWN0UHJvamVjdC5zaG93KGZhbHNlKTtcblx0XHRhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsuc2hvdyh0cnVlKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3JhdGUtd2VlaycpO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5wb3B1bGF0ZVNlbGVjdGlvbnMgPSBmdW5jdGlvbihpbmRleCkge1xuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0dXNlcklkOiBhcHAubXlWaWV3TW9kZWwuYXV0aC5jdXJyZW50VXNlcigpLmlkLFxuXHRcdFx0ZGF0ZXM6IFthcHAubXlWaWV3TW9kZWwuaG9tZS50b3RhbHMoKVtpbmRleF0ud2Vla11cblx0XHR9O1xuXG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRUaW1lcycsIGRhdGEsIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHRpbWVzKSB7XG5cdFx0XHRcdGlmICh0aW1lcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0dmFyIGRhdGEgPSBKU09OLnBhcnNlKHRpbWVzWzBdLmF0dHJpYnV0ZXMuZGF0YSk7XG5cdFx0XHRcdFx0dmFyIHByb2plY3RzID0gZGF0YS5wcm9qZWN0cztcblx0XHRcdFx0XHR2YXIgc2V0ID0gW107XG5cdFx0XHRcdFx0Xy5lYWNoKHByb2plY3RzLCBmdW5jdGlvbihwcm9qZWN0KSB7XG5cdFx0XHRcdFx0XHRzZXRbcHJvamVjdC5pZF0gPSBwcm9qZWN0LnBlcmNlbnRhZ2U7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRfLmVhY2goYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuZ3JvdXBzKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG5cdFx0XHRcdFx0XHRfLmVhY2goZ3JvdXAuYXR0cmlidXRlcy5wcm9qZWN0cygpLCBmdW5jdGlvbihwcm9qZWN0KSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzZXRbcHJvamVjdC5pZF0pIHtcblx0XHRcdFx0XHRcdFx0XHRwcm9qZWN0LmF0dHJpYnV0ZXMuc2VsZWN0ZWQodHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdFx0cHJvamVjdC5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2Uoc2V0W3Byb2plY3QuaWRdKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRwcm9qZWN0LmF0dHJpYnV0ZXMuc2VsZWN0ZWQoZmFsc2UpO1xuXHRcdFx0XHRcdFx0XHRcdHByb2plY3QuYXR0cmlidXRlcy5wZXJjZW50YWdlKDApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QudG9nZ2xlUHJvamVjdCA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKGl0ZW0uYXR0cmlidXRlcy5zZWxlY3RlZCgpKSB7XG5cdFx0XHRpdGVtLmF0dHJpYnV0ZXMuc2VsZWN0ZWQoZmFsc2UpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5jb3VudChzZWxlY3RQcm9qZWN0LmNvdW50KCkgLSAxKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aXRlbS5hdHRyaWJ1dGVzLnNlbGVjdGVkKHRydWUpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5jb3VudChzZWxlY3RQcm9qZWN0LmNvdW50KCkgKyAxKTtcblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnRvZ2dsZUFkZE1vZGUgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoc2VsZWN0UHJvamVjdC5pc0FkZE1vZGUoKSkge1xuXHRcdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5pc01vZGFsKGZhbHNlKTtcblx0XHRcdHNlbGVjdFByb2plY3QuaXNBZGRNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5pc01vZGFsKHRydWUpO1xuXHRcdFx0JCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykudmFsKCcnKTtcblx0XHRcdCQoJy5wcm9qZWN0LW5hbWUtZmllbGQnKS52YWwoJycpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KFtdKTtcblx0XHRcdHNlbGVjdFByb2plY3QuaXNBZGRNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc2VsZWN0UHJvamVjdFR5cGVhaGVhZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHQkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS52YWwoaXRlbSk7XG5cdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KFtdKTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc2hvd1R5cGVhaGVhZFJlc3VsdHMgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdHZhciBuZWVkbGUgPSBldmVudC50YXJnZXQudmFsdWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXlxcd1xcZF0vZ2ksICcnKTtcblxuXHRcdGlmIChuZWVkbGUubGVuZ3RoID4gMCkge1xuXHRcdFx0dmFyIGZpbHRlcmVkUHJvamVjdHMgPSBfLmZpbHRlcihzZWxlY3RQcm9qZWN0LnVuaXF1ZUNvbXBhbnlOYW1lcygpLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdFx0dmFyIGhheXN0YWNrID0gb2JqLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15cXHdcXGRdL2dpLCAnJyk7XG5cdFx0XHRcdHJldHVybiBoYXlzdGFjay5pbmRleE9mKG5lZWRsZSkgPj0gMDsgXG5cdFx0XHR9KTtcblx0XHRcdHZhciBmaWVsZFBvc2l0aW9uID0gJCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykub2Zmc2V0KCk7XG5cdFx0XHQkKCcucHJvamVjdC10eXBlYWhlYWQnKS5jc3MoJ2xlZnQnLCBmaWVsZFBvc2l0aW9uLmxlZnQpLmNzcygndG9wJywgZmllbGRQb3NpdGlvbi50b3AgKyAkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS5oZWlnaHQoKSsyMCk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QoZmlsdGVyZWRQcm9qZWN0cyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdChbXSk7XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zYXZlTmV3UHJvamVjdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0Y29tcGFueTogJCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykudmFsKCksXG5cdFx0XHRwcm9qZWN0OiAkKCcucHJvamVjdC1uYW1lLWZpZWxkJykudmFsKCksXG5cdFx0fVxuXHRcdFBhcnNlLkNsb3VkLnJ1bignc2F2ZVByb2plY3QnLCBkYXRhLCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0KSB7XG5cdFx0XHRcdGFsZXJ0KCdcIicgKyBwcm9qZWN0LmF0dHJpYnV0ZXMuY29tcGFueSArICc6ICcgKyBwcm9qZWN0LmF0dHJpYnV0ZXMubmFtZSArICdcIiBjcmVhdGVkIHN1Y2Nlc3NmdWxseS4nKTtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC50b2dnbGVBZGRNb2RlKCk7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QuZ2V0R3JvdXBzKCk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Ly8gYWxlcnQoZXJyb3IpXG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcdFxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5kcmFnUmVmcmVzaCA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiBzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHZhciB0b3AgPSAkKCcjc2VsZWN0LXByb2plY3QgLmdyb3VwcycpLnNjcm9sbFRvcCgpO1xuXHRcdFx0dmFyIGRlbHRhID0gTWF0aC5mbG9vcihldmVudC5nZXN0dXJlLmRpc3RhbmNlKTtcblx0XHRcdGlmICh0b3AgPT0gMCAmJiBkZWx0YSA+IDMwKSB7XG5cdFx0XHRcdGlmIChkZWx0YSA+IDE1MCkgZGVsdGEgPSAxNTA7XG5cdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAuZ3JvdXBzJykuY3NzKCdtYXJnaW4tdG9wJywgZGVsdGEgLSAzMCk7XG5cdFx0XHRcdGlmIChkZWx0YSA+PSAxMDApIHtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS11cFwiPjwvc3Bhbj5SZWxlYXNlIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zdGFydFJlZnJlc2hEcmFnID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoIXNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiBzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHNlbGVjdFByb2plY3QuZHJhZ1N0YXJ0KCQoJyNzZWxlY3QtcHJvamVjdCAuZ3JvdXBzJykuc2Nyb2xsVG9wKCkpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZyh0cnVlKTtcblx0XHRcdCQoZXZlbnQuZ2VzdHVyZS50YXJnZXQpLm9uZSgnZHJhZ2VuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHZhciBkZWx0YSA9IHBhcnNlSW50KCQoJyNzZWxlY3QtcHJvamVjdCAuZ3JvdXBzJykuY3NzKCdtYXJnaW4tdG9wJykpO1xuXG5cdFx0XHRcdGlmIChkZWx0YSA+PSA3MCkge1xuXHRcdFx0XHRcdHNlbGVjdFByb2plY3QuZ2V0R3JvdXBzKCk7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW5cIj48L3NwYW4+UmVmcmVzaGluZy4uLicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdFx0c2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdFx0c2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoMCk7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5ncm91cHMnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0aWYgKGFwcC5teVZpZXdNb2RlbC5hdXRoLmN1cnJlbnRVc2VyKCkpIHtcblx0XHRzZWxlY3RQcm9qZWN0LmdldEdyb3VwcygpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0UHJvamVjdDsiXX0=
