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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2FsZXJ0cy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvYXBwLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9hdXRoLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9mYWtlXzZiYzEwNGQ3LmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ob21lLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ub3Rlcy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcGVvcGxlLWRldGFpbHMuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3Blb3BsZS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcHJvZmlsZS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcmF0ZS13ZWVrLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zYXZlLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zZWxlY3QtcHJvamVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBzY3JpcHRzL25vdGVzLmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBbGVydHMoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgYWxlcnRzID0gYXBwLm15Vmlld01vZGVsLmFsZXJ0cyA9IHt9O1xuXG5cdGFsZXJ0cy5saXN0ID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdGFsZXJ0cy5saXN0LnB1c2goJ2FzZGYnKVxuXHRhbGVydHMuc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cblx0cmV0dXJuIHNlbGY7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBBbGVydHM7IiwiLyoqXG4gKiBzY3JpcHRzL2FwcC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBcHAoKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHQvLyBpbml0aWFsaXplIGtub2Nrb3V0XG5cdHNlbGYubXlWaWV3TW9kZWwgPSB7fTtcblxuXHRzZWxmLm15Vmlld01vZGVsLmFjdGl2ZVZpZXcgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRzZWxmLm15Vmlld01vZGVsLnZpZXdzID0gW1xuXHRcdCdhdXRoJyxcblx0XHQnaG9tZScsXG5cdFx0J3NlbGVjdC1wcm9qZWN0Jyxcblx0XHQncmF0ZS13ZWVrJyxcblx0XHQnbm90ZXMnLFxuXHRcdCdwZW9wbGUnLFxuXHRcdCdwZW9wbGUtZGV0YWlscycsXG5cdFx0J3NhdmUnXG5cdF07XG5cblx0c2VsZi5teVZpZXdNb2RlbC5udW1XZWVrcyA9IDM7XG5cdHNlbGYubXlWaWV3TW9kZWwudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRzZWxmLm15Vmlld01vZGVsLndlZWtzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cblx0c2VsZi5nb1RvVmlldyA9IGZ1bmN0aW9uKHZpZXcpIHtcblx0XHR2YXIgaW5kZXggPSBzZWxmLm15Vmlld01vZGVsLnZpZXdzLmluZGV4T2Yodmlldyk7XG5cdFx0c2VsZi5teVZpZXdNb2RlbC5hY3RpdmVWaWV3KGluZGV4KTtcblx0fVxuXG5cdHNlbGYuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZXJlYWR5Jywgc2VsZi5vbkRldmljZVJlYWR5LCBmYWxzZSk7XG5cdH1cblxuXHRzZWxmLm9uRGV2aWNlUmVhZHkgPSBmdW5jdGlvbigpIHtcblx0XHRrby5hcHBseUJpbmRpbmdzKHNlbGYubXlWaWV3TW9kZWwpO1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAobmF2aWdhdG9yLnNwbGFzaHNjcmVlbikge1xuXHRcdFx0XHRuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuLmhpZGUoKTtcblx0XHRcdH1cblx0XHR9LCAyMDAwKTtcblx0XHRcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDsiLCIvKipcbiAqIHNjcmlwdHMvYXV0aC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBdXRoKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGF1dGggPSBhcHAubXlWaWV3TW9kZWwuYXV0aCA9IHt9O1xuXG5cdGF1dGguY3VycmVudFVzZXIgPSBrby5vYnNlcnZhYmxlKCk7XG5cdGF1dGguZXJyb3JNZXNzYWdlID0ga28ub2JzZXJ2YWJsZSgnJyk7XG5cdGF1dGguc2lnblVwTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhdXRoLnNpZ25Jbk1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0YXV0aC5mb3Jnb3RNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0dmFyIGN1cnJlbnRVc2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cdGlmIChjdXJyZW50VXNlcikge1xuXHRcdGF1dGguY3VycmVudFVzZXIoY3VycmVudFVzZXIpO1xuXHR9XG5cblx0YXV0aC5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGF1dGguY3VycmVudFVzZXIoKSkge1xuXHRcdFx0YXBwLmdvVG9WaWV3KCdob21lJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFwcC5nb1RvVmlldygnYXV0aCcpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGgucmVzZXRFcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGguZXJyb3JNZXNzYWdlKCcnKTtcblx0fVxuXG5cdGF1dGguc2lnbkluVXAgPSBmdW5jdGlvbihmb3JtRWxlbWVudCkge1xuXHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXG5cdFx0dmFyIHVzZXJuYW1lID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2VtYWlsXScpLnZhbCgpO1xuXHRcdHZhciBwYXNzd29yZCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9wYXNzd29yZF0nKS52YWwoKTtcblxuXHRcdGlmIChhdXRoLnNpZ25VcE1vZGUoKSkge1xuXHRcdFx0dmFyIGRpc3BsYXlOYW1lID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2Rpc3BsYXlOYW1lXScpLnZhbCgpO1xuXHRcdFx0dmFyIHBhc3N3b3JkQ29uZmlybSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9jb25maXJtUGFzc3dvcmRdJykudmFsKCk7XG5cblx0XHRcdC8vIHZhbGlkYXRpb25cblx0XHRcdGlmICh1c2VybmFtZS5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgeW91ciBlbWFpbCBhZGRyZXNzLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChkaXNwbGF5TmFtZS5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgeW91ciBmaXJzdCBhbmQgbGFzdCBuYW1lLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwYXNzd29yZC5sZW5ndGggPCAxIHx8IHBhc3N3b3JkQ29uZmlybSA8IDEgfHwgcGFzc3dvcmQgIT0gcGFzc3dvcmRDb25maXJtKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgYW5kIGNvbmZpcm0gYSBwYXNzd29yZC4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgdXNlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG5cdFx0XHR2YXIgc2NydWJiZWRVc2VybmFtZSA9IHVzZXJuYW1lLnJlcGxhY2UoL1xccysvZyxcIlwiKTsgLy9yZW1vdmUgd2hpdGUgc3BhY2Vcblx0XHRcdHNjcnViYmVkVXNlcm5hbWUgPSBzY3J1YmJlZFVzZXJuYW1lLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRcdHVzZXIuc2V0KCd1c2VybmFtZScsIHNjcnViYmVkVXNlcm5hbWUpO1xuXHRcdFx0dXNlci5zZXQoJ3Bhc3N3b3JkJywgcGFzc3dvcmQpO1xuXHRcdFx0dXNlci5zZXQoJ2VtYWlsJywgc2NydWJiZWRVc2VybmFtZSk7XG5cdFx0XHR1c2VyLnNldCgnZGlzcGxheU5hbWUnLCBkaXNwbGF5TmFtZSk7XG5cblx0XHRcdHVzZXIuc2lnblVwKG51bGwsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRcdGF1dGguY3VycmVudFVzZXIodXNlcik7XG5cdFx0XHRcdFx0YXBwLmdvVG9WaWV3KCdob21lJyk7XG5cdFx0XHRcdFx0YXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuaW5pdCgpO1xuXHRcdFx0XHRcdGF1dGgucmVzZXRWaWV3cygpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCBwYXNzd29yZCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0XHRhcHAuZ29Ub1ZpZXcoJ2hvbWUnKTtcblx0XHRcdFx0XHRhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5pbml0KCk7XG5cdFx0XHRcdFx0YXV0aC5yZXNldFZpZXdzKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuXHRcdFx0XHRcdC8vIFRoZSBsb2dpbiBmYWlsZWQuIENoZWNrIGVycm9yIHRvIHNlZSB3aHkuXG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5mb3Jnb3QgPSBmdW5jdGlvbihmb3JtRWxlbWVudCkge1xuXHRcdHZhciBlbWFpbCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9mb3Jnb3RdJykudmFsKCk7XG5cblx0XHRpZiAoZW1haWwubGVuZ3RoIDw9IDApIHtcblx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgYW4gZW1haWwgYWRkcmVzcy4nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0UGFyc2UuVXNlci5yZXF1ZXN0UGFzc3dvcmRSZXNldChlbWFpbCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRhdXRoLmZvcmdvdE1vZGUoZmFsc2UpO1xuXHRcdFx0XHRcdCQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9mb3Jnb3RdJykudmFsKCcnKTtcblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGNoZWNrIHlvdXIgZW1haWwgZm9yIGluc3RydWN0aW9ucyBvbiByZXNldHRpbmcgeW91ciBwYXNzd29yZC4nKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLnJlc2V0RXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLmVycm9yTWVzc2FnZSgnJyk7XG5cdH1cblxuXHRhdXRoLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5wcm9maWxlLnNob3coZmFsc2UpO1xuXHRcdGFwcC5nb1RvVmlldygnYXV0aCcpO1xuXHRcdFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cdFx0YXV0aC5jdXJyZW50VXNlcihudWxsKTtcblx0XHRhdXRoLnJlc2V0Vmlld3MoKTtcblx0fVxuXG5cdGF1dGgucmVzZXRWaWV3cyA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXHRcdGF1dGguc2lnbkluTW9kZShmYWxzZSk7XG5cdFx0YXV0aC5zaWduVXBNb2RlKGZhbHNlKTtcblx0XHRhdXRoLmZvcmdvdE1vZGUoZmFsc2UpO1xuXHR9XG5cblx0YXV0aC50b2dnbGVTaWduSW4gPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoYXV0aC5zaWduSW5Nb2RlKCkpIHtcblx0XHRcdGF1dGguc2lnbkluTW9kZShmYWxzZSk7XG5cdFx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXV0aC5zaWduSW5Nb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGgudG9nZ2xlU2lnblVwID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUoZmFsc2UpO1xuXHRcdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGF1dGguc2lnblVwTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLnRvZ2dsZUZvcmdvdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChhdXRoLmZvcmdvdE1vZGUoKSkge1xuXHRcdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0XHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhdXRoLmZvcmdvdE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5zYW5pdGl6ZUVycm9ycyA9IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0c3dpdGNoKGVycm9yLmNvZGUpXG5cdFx0e1xuXHRcdFx0Y2FzZSAxMDE6XG5cdFx0XHRcdHJldHVybiAnUGxlYXNlIGVudGVyIGEgdmFsaWQgdXNlcm5hbWUgYW5kIHBhc3N3b3JkLic7XG5cdFx0XHRjYXNlIDEyNDpcblx0XHRcdFx0cmV0dXJuICdPb3BzISBXZSBtZXNzZWQgdXAuIFBsZWFzZSB0cnkgYWdhaW4uJztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBlcnJvci5tZXNzYWdlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZXJyb3IubWVzc2FnZS5zbGljZSgxKSArICcuJztcblx0XHR9XG5cdH1cblxuXHRhdXRoLmluaXQoKTtcblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdXRoOyIsIi8qKlxuICogc2NyaXB0cy9tYWluLmpzXG4gKlxuICogVGhpcyBpcyB0aGUgc3RhcnRpbmcgcG9pbnQgZm9yIHlvdXIgYXBwbGljYXRpb24uXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBcHAgPSByZXF1aXJlKCcuL2FwcC5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuL2F1dGguanMnKTtcbnZhciBTZWxlY3RQcm9qZWN0ID0gcmVxdWlyZSgnLi9zZWxlY3QtcHJvamVjdC5qcycpO1xudmFyIFJhdGVXZWVrID0gcmVxdWlyZSgnLi9yYXRlLXdlZWsuanMnKTtcbnZhciBOb3RlcyA9IHJlcXVpcmUoJy4vbm90ZXMuanMnKTtcbnZhciBQZW9wbGUgPSByZXF1aXJlKCcuL3Blb3BsZS5qcycpO1xudmFyIFNhdmUgPSByZXF1aXJlKCcuL3NhdmUuanMnKTtcbnZhciBQZW9wbGVEZXRhaWxzID0gcmVxdWlyZSgnLi9wZW9wbGUtZGV0YWlscy5qcycpO1xudmFyIEhvbWUgPSByZXF1aXJlKCcuL2hvbWUuanMnKTtcbnZhciBBbGVydHMgPSByZXF1aXJlKCcuL2FsZXJ0cy5qcycpO1xudmFyIFByb2ZpbGUgPSByZXF1aXJlKCcuL3Byb2ZpbGUuanMnKTtcblxuLy8gaW5pdGlhbGl6ZSBwYXJzZVxuUGFyc2UuaW5pdGlhbGl6ZShcIkprWU5mUEJ3MmFQZ2NjN1BlVEdITUFVMlhLdmp6ZXFWSWt5Q2xWdW9cIiwgXCI0NU9NVTNaUzNvNWMxNjhsUXhhMGlseFF1NEZkTVZIVDFOVlRrT1JsXCIpO1xuXG4vLyBpbml0aWFsaXplIHR5cGVraXRcbihmdW5jdGlvbihkKSB7XG52YXIgY29uZmlnID0ge1xuICBraXRJZDogJ2FlZTZqZ3EnLFxuICBzY3JpcHRUaW1lb3V0OiAzMDAwXG59LFxuaD1kLmRvY3VtZW50RWxlbWVudCx0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXtoLmNsYXNzTmFtZT1oLmNsYXNzTmFtZS5yZXBsYWNlKC9cXGJ3Zi1sb2FkaW5nXFxiL2csXCJcIikrXCIgd2YtaW5hY3RpdmVcIjt9LGNvbmZpZy5zY3JpcHRUaW1lb3V0KSx0az1kLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIiksZj1mYWxzZSxzPWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIilbMF0sYTtoLmNsYXNzTmFtZSs9XCIgd2YtbG9hZGluZ1wiO3RrLnNyYz0nLy91c2UudHlwZWtpdC5uZXQvJytjb25maWcua2l0SWQrJy5qcyc7dGsuYXN5bmM9dHJ1ZTt0ay5vbmxvYWQ9dGsub25yZWFkeXN0YXRlY2hhbmdlPWZ1bmN0aW9uKCl7YT10aGlzLnJlYWR5U3RhdGU7aWYoZnx8YSYmYSE9XCJjb21wbGV0ZVwiJiZhIT1cImxvYWRlZFwiKXJldHVybjtmPXRydWU7Y2xlYXJUaW1lb3V0KHQpO3RyeXtUeXBla2l0LmxvYWQoY29uZmlnKX1jYXRjaChlKXt9fTtzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRrLHMpXG59KShkb2N1bWVudCk7XG5cbnZhciBhcHAgPSBuZXcgQXBwKCk7XG52YXIgYXV0aCA9IG5ldyBBdXRoKGFwcCk7XG52YXIgaG9tZSA9IG5ldyBIb21lKGFwcCk7XG52YXIgc2VsZWN0UHJvamVjdCA9IG5ldyBTZWxlY3RQcm9qZWN0KGFwcCk7XG52YXIgcmF0ZVdlZWsgPSBuZXcgUmF0ZVdlZWsoYXBwKTtcbnZhciBub3RlcyA9IG5ldyBOb3RlcyhhcHApO1xudmFyIHBlb3BsZSA9IG5ldyBQZW9wbGUoYXBwKTtcbnZhciBzYXZlID0gbmV3IFNhdmUoYXBwKTtcbnZhciBwZW9wbGVEZXRhaWxzID0gbmV3IFBlb3BsZURldGFpbHMoYXBwKTtcbnZhciBhbGVydHMgPSBuZXcgQWxlcnRzKGFwcCk7XG52YXIgcHJvZmlsZSA9IG5ldyBQcm9maWxlKGFwcCk7XG5cbi8vIEN1c3RvbSBrbm9ja291dCBleHRlbmRlcnNcblxuLy8gSGVyZSdzIGEgY3VzdG9tIEtub2Nrb3V0IGJpbmRpbmcgdGhhdCBtYWtlcyBlbGVtZW50cyBzaG93bi9oaWRkZW4gdmlhIGpRdWVyeSdzIGZhZGVJbigpL2ZhZGVPdXQoKSBtZXRob2RzXG4vLyBDb3VsZCBiZSBzdG9yZWQgaW4gYSBzZXBhcmF0ZSB1dGlsaXR5IGxpYnJhcnlcbmtvLmJpbmRpbmdIYW5kbGVycy5mYWRlVmlzaWJsZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAkKGVsZW1lbnQpLnRvZ2dsZShrby51bndyYXAodmFsdWUpKTsgLy8gVXNlIFwidW53cmFwT2JzZXJ2YWJsZVwiIHNvIHdlIGNhbiBoYW5kbGUgdmFsdWVzIHRoYXQgbWF5IG9yIG1heSBub3QgYmUgb2JzZXJ2YWJsZVxuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIFdoZW5ldmVyIHRoZSB2YWx1ZSBzdWJzZXF1ZW50bHkgY2hhbmdlcywgc2xvd2x5IGZhZGUgdGhlIGVsZW1lbnQgaW4gb3Igb3V0XG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAga28udW53cmFwKHZhbHVlKSA/ICQoZWxlbWVudCkuZmFkZUluKCkgOiAkKGVsZW1lbnQpLmZhZGVPdXQoKTtcbiAgICB9XG59XG5cbmtvLmJpbmRpbmdIYW5kbGVycy5zbGlkZVBhbmVsVmlzaWJsZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAvLyAkKGVsZW1lbnQpLnRvZ2dsZShrby51bndyYXAodmFsdWUpKTsgLy8gVXNlIFwidW53cmFwT2JzZXJ2YWJsZVwiIHNvIHdlIGNhbiBoYW5kbGUgdmFsdWVzIHRoYXQgbWF5IG9yIG1heSBub3QgYmUgb2JzZXJ2YWJsZVxuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIFdoZW5ldmVyIHRoZSB2YWx1ZSBzdWJzZXF1ZW50bHkgY2hhbmdlcywgc2xvd2x5IGZhZGUgdGhlIGVsZW1lbnQgaW4gb3Igb3V0XG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgaWYgKGtvLnVud3JhcCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3MoJ29wZW4nKS5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgwLDAsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHZpZXdwb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgJChlbGVtZW50KS5yZW1vdmVDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDAsJyArIHZpZXdwb3J0SGVpZ2h0ICsgJ3B4LDApJykuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxua28uYmluZGluZ0hhbmRsZXJzLnNoaWZ0UGFuZWxWaXNpYmxlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gSW5pdGlhbGx5IHNldCB0aGUgZWxlbWVudCB0byBiZSBpbnN0YW50bHkgdmlzaWJsZS9oaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZVxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgIC8vICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICBpZiAoa28udW53cmFwKHZhbHVlKSkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hZGRDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDAlLDAsMCknKS5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHZpZXdwb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgJChlbGVtZW50KS5yZW1vdmVDbGFzcygnb3BlbicpLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDEwMCUsMCwwKScpLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmFwcC5pbml0aWFsaXplKCk7IiwiLyoqXG4gKiBzY3JpcHRzL25vdGVzLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEhvbWUoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgaG9tZSA9IGFwcC5teVZpZXdNb2RlbC5ob21lID0ge307XG5cblx0aG9tZS50b3RhbHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0aG9tZS5pc1JlZnJlc2hEcmFnZ2luZyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRob21lLmRyYWdTdGFydCA9IGtvLm9ic2VydmFibGUoMCk7XG5cdGhvbWUudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRob21lLndlZWtzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cblx0aG9tZS5zaG93QWxlcnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLm15Vmlld01vZGVsLmFsZXJ0cy5zaG93KHRydWUpO1xuXHR9XG5cblx0aG9tZS5zaG93UHJvZmlsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5wcm9maWxlLnNob3codHJ1ZSk7XG5cdH1cblxuXHRob21lLnN0eWxlV2VlayA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cblx0XHR2YXIgc3R5bGVkRGF0ZSA9ICdXZWVrIG9mICcgKyBtb21lbnQoaG9tZS50b2RheSkuYWRkKCdkYXlzJywgKGluZGV4ICogNykpLmZvcm1hdCgnTU1NIEQnKTtcblx0XHRpZiAoaW5kZXggPT0gMCkgeyBzdHlsZWREYXRlID0gJ1RoaXMgV2VlaycgfTtcblx0XHRpZiAoaW5kZXggPT0gMSkgeyBzdHlsZWREYXRlID0gJ05leHQgV2VlaycgfTtcblx0XHRyZXR1cm4gc3R5bGVkRGF0ZTtcblx0fVxuXG5cdGhvbWUuV2VlayA9IGZ1bmN0aW9uKG1pc3NpbmdXZWVrKSB7XG5cdFx0dmFyIGJsYW5rV2VlayA9IHtcblx0XHRcdG5vdGVzOiAnJyxcblx0XHRcdHJhdGluZzogLTEsXG5cdFx0XHR0b3RhbDogLTEsXG5cdFx0XHR3ZWVrOiBtaXNzaW5nV2Vla1xuXHRcdH07XG5cdFx0cmV0dXJuIGJsYW5rV2Vlaztcblx0fVxuXG5cdGhvbWUuZ28gPSBmdW5jdGlvbihpbmRleCkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmluaXQoaW5kZXgpO1xuXHRcdGFwcC5nb1RvVmlldygnc2VsZWN0LXByb2plY3QnKTtcblx0fVxuXG5cdGhvbWUuY29udmVydE51bVRvV29yZHMgPSBmdW5jdGlvbihudW1iZXIpIHtcblx0XHRzd2l0Y2ggKG51bWJlcikge1xuXHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRyZXR1cm4gJ3plcm8nO1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRyZXR1cm4gJ29uZSc7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHJldHVybiAndHdvJztcblx0XHRcdGNhc2UgMzpcblx0XHRcdFx0cmV0dXJuICd0aHJlZSc7XG5cdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdHJldHVybiAnZm91cic7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gJ3Vua25vd24nO1xuXHRcdH1cblx0fVxuXG5cdGhvbWUuZ2V0VG90YWxzQW5kUmF0aW5nID0gZnVuY3Rpb24oKSB7XG5cdFx0aG9tZS53ZWVrcyhbXSk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcHAubXlWaWV3TW9kZWwubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0aG9tZS53ZWVrcy5wdXNoKG1vbWVudChob21lLnRvZGF5KS5zdGFydE9mKCdpc293ZWVrJykuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJykpO1xuXHRcdH1cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFRvdGFsc0FuZFJhdGluZycsIHtcblx0XHRcdHdlZWtzOiBob21lLndlZWtzKClcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih0b3RhbHNBbmRSYXRpbmcpIHtcblxuXHRcdFx0XHR2YXIgc2V0ID0gW107XG5cdFx0XHRcdF8uZWFjaCh0b3RhbHNBbmRSYXRpbmcsIGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0XHRzZXRbZGF0YS53ZWVrXSA9IHRydWU7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXBwLm15Vmlld01vZGVsLm51bVdlZWtzOyBpKyspIHtcblx0XHRcdFx0XHR2YXIgZGF0ZSA9IG1vbWVudChob21lLnRvZGF5KS5zdGFydE9mKCdpc293ZWVrJykuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJyk7XG5cdFx0XHRcdFx0aWYgKCFzZXRbZGF0ZV0pIHtcblx0XHRcdFx0XHRcdHRvdGFsc0FuZFJhdGluZy5wdXNoKG5ldyBob21lLldlZWsoZGF0ZSkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciBzb3J0ZWQgPSBfLnNvcnRCeSh0b3RhbHNBbmRSYXRpbmcsIGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRcdFx0XHR2YXIgZGF0ZSA9IGl0ZW0ud2Vlay5zcGxpdCgnLCcpO1xuXHRcdFx0XHRcdHZhciB0aW1lID0gbW9tZW50KG5ldyBEYXRlKGRhdGVbMF0sIGRhdGVbMV0sIGRhdGVbMl0pKS52YWx1ZU9mKCk7XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlSW50KHRpbWUpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRob21lLnRvdGFscyhzb3J0ZWQpO1xuXG5cdFx0XHRcdCQoJyNob21lIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj4gUHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdGhvbWUuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHRob21lLmRyYWdTdGFydCgwKTtcblx0XHRcdFx0JCgnI2hvbWUgLnBhZ2UnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0fSwgMTAwKTtcblxuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGhvbWUuZHJhZ1JlZnJlc2ggPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmIChob21lLmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgaG9tZS5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHR2YXIgdG9wID0gJChkb2N1bWVudCkuc2Nyb2xsVG9wKCk7XG5cdFx0XHR2YXIgZGVsdGEgPSBNYXRoLmZsb29yKGV2ZW50Lmdlc3R1cmUuZGlzdGFuY2UpO1xuXHRcdFx0aWYgKHRvcCA9PSAwICYmIGRlbHRhID4gMzApIHtcblx0XHRcdFx0aWYgKGRlbHRhID4gMTUwKSBkZWx0YSA9IDE1MDtcblx0XHRcdFx0JCgnI2hvbWUgLnBhZ2UnKS5jc3MoJ21hcmdpbi10b3AnLCBkZWx0YSAtIDMwKTtcblx0XHRcdFx0aWYgKGRlbHRhID49IDEwMCkge1xuXHRcdFx0XHRcdCQoJyNob21lIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtdXBcIj48L3NwYW4+IFJlbGVhc2UgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNob21lIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj4gUHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRob21lLnN0YXJ0UmVmcmVzaERyYWcgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmICghaG9tZS5pc1JlZnJlc2hEcmFnZ2luZygpICYmIGhvbWUuZHJhZ1N0YXJ0KCkgPT0gMCkge1xuXHRcdFx0aG9tZS5kcmFnU3RhcnQoJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO1xuXHRcdFx0aG9tZS5pc1JlZnJlc2hEcmFnZ2luZyh0cnVlKTtcblx0XHRcdCQoZXZlbnQuZ2VzdHVyZS50YXJnZXQpLm9uZSgnZHJhZ2VuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHZhciBkZWx0YSA9IHBhcnNlSW50KCQoJyNob21lIC5wYWdlJykuY3NzKCdtYXJnaW4tdG9wJykpO1xuXG5cdFx0XHRcdGlmIChkZWx0YSA+PSA3MCkge1xuXHRcdFx0XHRcdGhvbWUuZ2V0VG90YWxzQW5kUmF0aW5nKCk7XG5cdFx0XHRcdFx0JCgnI2hvbWUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpblwiPjwvc3Bhbj4gUmVmcmVzaGluZy4uLicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNob21lIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj4gUHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdFx0aG9tZS5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdFx0aG9tZS5kcmFnU3RhcnQoMCk7XG5cdFx0XHRcdFx0JCgnI2hvbWUgLnBhZ2UnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0aG9tZS5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aG9tZS5nZXRUb3RhbHNBbmRSYXRpbmcoKTtcblx0fVxuXG5cdGlmIChhcHAubXlWaWV3TW9kZWwuYXV0aC5jdXJyZW50VXNlcigpKSB7XG5cdFx0aG9tZS5pbml0KCk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEhvbWU7IiwiLyoqXG4gKiBzY3JpcHRzL25vdGVzLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIE5vdGVzKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIG5vdGVzID0gYXBwLm15Vmlld01vZGVsLm5vdGVzID0ge307XG5cblx0bm90ZXMuc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRub3Rlcy5yYXRpbmcgPSBrby5vYnNlcnZhYmxlKDIpO1xuXHRub3Rlcy5jb250ZW50ID0ga28ub2JzZXJ2YWJsZSgpO1xuXG5cdG5vdGVzLnN0YXR1c09wdGlvbnMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblxuXHRub3Rlcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0bm90ZXMuc3RhdHVzT3B0aW9ucy5wdXNoKG5ldyBub3Rlcy5TdGF0dXMoJ0JyaW5nIG9uIHRoZSB3b3JrJywwKSk7XG5cdFx0bm90ZXMuc3RhdHVzT3B0aW9ucy5wdXNoKG5ldyBub3Rlcy5TdGF0dXMoJ0lcXCdtIGEgbGl0dGxlIGxpZ2h0JywxKSk7XG5cdFx0bm90ZXMuc3RhdHVzT3B0aW9ucy5wdXNoKG5ldyBub3Rlcy5TdGF0dXMoJ0xpZmUgaXMgZ29vZCcsMikpO1xuXHRcdG5vdGVzLnN0YXR1c09wdGlvbnMucHVzaChuZXcgbm90ZXMuU3RhdHVzKCdJXFwnbSBhIGJpdCBvdmVyd2hlbG1lZCcsMykpO1xuXHRcdG5vdGVzLnN0YXR1c09wdGlvbnMucHVzaChuZXcgbm90ZXMuU3RhdHVzKCdTdG9wIHRoZSBtYWRuZXNzIScsNCkpO1xuXHR9XG5cblx0bm90ZXMuU3RhdHVzID0gZnVuY3Rpb24odGV4dCwgdmFsdWUpIHtcblx0XHR2YXIgc3RhdHVzID0ge1xuXHRcdFx0bGFiZWw6IHRleHQsXG5cdFx0XHR2YWx1ZTogdmFsdWVcblx0XHR9O1xuXHRcdHJldHVybiBzdGF0dXM7XG5cdH1cblxuXHRub3Rlcy5zZWxlY3RTdGF0dXMgPSBmdW5jdGlvbihpdGVtLCBlKSB7XG5cdFx0bm90ZXMucmF0aW5nKGl0ZW0udmFsdWUpO1xuXHR9XG5cblx0bm90ZXMucmVzZXQgPSBmdW5jdGlvbihpbmRleCkge1xuXHRcdGlmIChpbmRleCAhPSBudWxsKSB7XG5cdFx0XHRub3Rlcy5yYXRpbmcoYXBwLm15Vmlld01vZGVsLmhvbWUudG90YWxzKClbaW5kZXhdLnJhdGluZyk7XG5cdFx0XHRub3Rlcy5jb250ZW50KGFwcC5teVZpZXdNb2RlbC5ob21lLnRvdGFscygpW2luZGV4XS5ub3Rlcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vdGVzLnJhdGluZygyKTtcblx0XHRcdG5vdGVzLmNvbnRlbnQoJycpO1xuXHRcdH1cblx0fVxuXG5cdG5vdGVzLmdvQmFjayA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5yYXRlV2Vlay5zaG93KHRydWUpO1xuXHRcdG5vdGVzLnNob3coZmFsc2UpO1xuXHRcdGFwcC5nb1RvVmlldygncmF0ZS13ZWVrJyk7XG5cdH1cblxuXHRub3Rlcy5nb05leHQgPSBmdW5jdGlvbigpIHtcblx0XHRub3Rlcy5zaG93KGZhbHNlKTtcblx0XHRhcHAubXlWaWV3TW9kZWwuc2F2ZS5zaG93KHRydWUpO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5zYXZlLnN1Ym1pdCgpO1xuXHRcdGFwcC5nb1RvVmlldygnc2F2ZScpO1xuXHR9XG5cblx0bm90ZXMuaW5pdCgpO1xuXG5cdHJldHVybiBzZWxmO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTm90ZXM7IiwiLyoqXG4gKiBzY3JpcHRzL3Blb3BsZS1kZXRhaWxzLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFBlb3BsZURldGFpbHMoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcGVvcGxlRGV0YWlscyA9IGFwcC5teVZpZXdNb2RlbC5wZW9wbGVEZXRhaWxzID0ge307XG5cblx0cGVvcGxlRGV0YWlscy5wZXJzb24gPSBrby5vYnNlcnZhYmxlKG51bGwpO1xuXHRwZW9wbGVEZXRhaWxzLndlZWtzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKTtcblx0cGVvcGxlRGV0YWlscy50b3RhbHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW10pO1xuXG5cdHBlb3BsZURldGFpbHMuZ2V0UGVyc29uID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdHBlb3BsZURldGFpbHMudG90YWxzKFtdKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFwcC5teVZpZXdNb2RlbC5wZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0dmFyIHBlcnNvbiA9IF8uZmluZChhcHAubXlWaWV3TW9kZWwucGVvcGxlLnRpbWVzKClbaV0sIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHRyZXR1cm4gb2JqLmF0dHJpYnV0ZXMudXNlci5pZCA9PSBpdGVtLmF0dHJpYnV0ZXMudXNlci5pZDtcblx0XHRcdH0pO1xuXHRcdFx0cGVvcGxlRGV0YWlscy50b3RhbHMucHVzaChwZXJzb24pO1xuXHRcdH1cblxuXHRcdHBlb3BsZURldGFpbHMucGVyc29uKGl0ZW0pO1xuXHR9XG5cblx0cGVvcGxlRGV0YWlscy5nb0JhY2sgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3Blb3BsZScpO1xuXHR9XG5cblx0cGVvcGxlRGV0YWlscy5nZXRDb21wYW55TmFtZSA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIG5hbWUgPSAnJztcblx0XHR2YXIgcHJvamVjdCA9IF8uZmluZChhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdHJldHVybiBvYmouaWQgPT0gaWQ7XG5cdFx0fSk7XG5cblx0XHRpZiAodHlwZW9mIHByb2plY3QgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRuYW1lID0gcHJvamVjdC5hdHRyaWJ1dGVzLmNvbXBhbnk7XG5cdFx0fVxuXHRcdHJldHVybiBuYW1lO1xuXHR9XG5cblx0cGVvcGxlRGV0YWlscy5nZXRQcm9qZWN0TmFtZSA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIG5hbWUgPSAnJztcblx0XHR2YXIgcHJvamVjdCA9IF8uZmluZChhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdHJldHVybiBvYmouaWQgPT0gaWQ7XG5cdFx0fSk7XG5cblx0XHRpZiAodHlwZW9mIHByb2plY3QgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRuYW1lID0gcHJvamVjdC5hdHRyaWJ1dGVzLm5hbWU7XG5cdFx0fVxuXHRcdHJldHVybiBuYW1lO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGVvcGxlRGV0YWlsczsiLCIvKipcbiAqIHNjcmlwdHMvcGVvcGxlLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFBlb3BsZShhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBwZW9wbGUgPSBhcHAubXlWaWV3TW9kZWwucGVvcGxlID0ge307XG5cblx0cGVvcGxlLm51bVdlZWtzID0gMztcblx0cGVvcGxlLnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0cGVvcGxlLmFjdGl2ZVdlZWsgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRwZW9wbGUuYWN0aXZlUGVyc29uID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRwZW9wbGUudmlld1R5cGUgPSBrby5vYnNlcnZhYmxlKCdob3VycycpO1xuXHRwZW9wbGUudGltZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0cGVvcGxlLndlZWtzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRwZW9wbGUuZHJhZ1N0YXJ0ID0ga28ub2JzZXJ2YWJsZSgwKTtcblxuXHRwZW9wbGUuZ2V0VGltZXMgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgZGF0ZXMgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBlb3BsZS5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHRkYXRlcy5wdXNoKG1vbWVudChwZW9wbGUudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpKTtcblx0XHRcdHBlb3BsZS53ZWVrcygpW2ldLmRhdGUobW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdNTU0gRCcpKTtcblx0XHR9XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRUaW1lcycsIHtcblx0XHRcdGRhdGVzOiBkYXRlc1xuXHRcdH0sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHRpbWVzKSB7XG5cdFx0XHRcdHBlb3BsZS50aW1lcyhbXSk7XG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgdGltZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHR0aW1lc1tqXS5hdHRyaWJ1dGVzLmRhdGEgPSAkLnBhcnNlSlNPTih0aW1lc1tqXS5hdHRyaWJ1dGVzLmRhdGEpO1xuXHRcdFx0XHRcdHZhciB0b3RhbCA9IF8odGltZXNbal0uYXR0cmlidXRlcy5kYXRhLnByb2plY3RzKS5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBvYmopIHtcblx0XHRcdFx0XHRcdF8ob2JqKS5lYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHsgYWNjW2tleV0gPSAoYWNjW2tleV0gPyBhY2Nba2V5XSA6IDApICsgdmFsdWUgfSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0XHRcdH0sIHt9KTtcblxuXHRcdFx0XHRcdHRpbWVzW2pdLmF0dHJpYnV0ZXMudG90YWwgPSBrby5vYnNlcnZhYmxlKHRvdGFsLnBlcmNlbnRhZ2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGVvcGxlLm51bVdlZWtzOyBpKyspIHtcblx0XHRcdFx0XHR2YXIgd2Vla0RhdGUgPSBtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ1lZWVksIE0sIEQnKTtcblx0XHRcdFx0XHR2YXIgd2VlayA9IF8uZmlsdGVyKHRpbWVzLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdFx0XHRcdHJldHVybiBvYmouYXR0cmlidXRlcy5kYXRhLmRhdGUgPT0gd2Vla0RhdGU7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHR2YXIgc29ydGVkID0gXy5zb3J0Qnkod2VlaywgZnVuY3Rpb24ob2JqKXsgXG5cdFx0XHRcdFx0XHRyZXR1cm4gLW9iai5hdHRyaWJ1dGVzLnRvdGFsKCk7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRwZW9wbGUudGltZXMucHVzaChzb3J0ZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHRwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHRwZW9wbGUuZHJhZ1N0YXJ0KDApO1xuXHRcdFx0XHQkKCcjcGVvcGxlIC5wZW9wbGUnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0fSwgMTAwKTtcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRwZW9wbGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGVvcGxlLm51bVdlZWtzOyBpKyspIHtcblx0XHRcdHZhciB3ZWVrID0ge1xuXHRcdFx0XHRkYXRlOiBrby5vYnNlcnZhYmxlKG1vbWVudChwZW9wbGUudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnTU1NIEQnKSlcblx0XHRcdH1cblx0XHRcdHBlb3BsZS53ZWVrcy5wdXNoKHdlZWspO1xuXHRcdH1cblx0XHRwZW9wbGUuZ2V0VGltZXMoKTtcblx0fVxuXG5cdHBlb3BsZS5zZWxlY3RXZWVrID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRwZW9wbGUuYWN0aXZlV2VlayhpbmRleCk7XG5cdFx0Ly8gZ28gZ2V0IHRoZSBkYXRhIGZvciB0aGlzIHdlZWtcblx0fVxuXG5cdHBlb3BsZS50b2dnbGVWaWV3ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHBlb3BsZS52aWV3VHlwZSgpID09ICdob3VycycpIHtcblx0XHRcdHBlb3BsZS52aWV3VHlwZSgncGVyY2VudCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwZW9wbGUudmlld1R5cGUoJ2hvdXJzJyk7XG5cdFx0fVxuXHR9XG5cblx0cGVvcGxlLmdvVG9QZXJzb24gPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0YXBwLm15Vmlld01vZGVsLnBlb3BsZURldGFpbHMuZ2V0UGVyc29uKGl0ZW0pO1xuXHRcdGFwcC5nb1RvVmlldygncGVvcGxlLWRldGFpbHMnKTtcblx0fVxuXG5cdHBlb3BsZS5kcmFnUmVmcmVzaCA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKHBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZygpICYmIHBlb3BsZS5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHR2YXIgdG9wID0gJChkb2N1bWVudCkuc2Nyb2xsVG9wKCk7XG5cdFx0XHR2YXIgZGVsdGEgPSBNYXRoLmZsb29yKGV2ZW50Lmdlc3R1cmUuZGlzdGFuY2UpO1xuXHRcdFx0aWYgKHRvcCA9PSAwICYmIGRlbHRhID4gMzApIHtcblx0XHRcdFx0aWYgKGRlbHRhID4gMTUwKSBkZWx0YSA9IDE1MDtcblx0XHRcdFx0JCgnI3Blb3BsZSAucGVvcGxlJykuY3NzKCdtYXJnaW4tdG9wJywgZGVsdGEgLSAzMCk7XG5cdFx0XHRcdGlmIChkZWx0YSA+PSAxMDApIHtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtdXBcIj48L3NwYW4+UmVsZWFzZSB0byByZWZyZXNoJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwZW9wbGUuc3RhcnRSZWZyZXNoRHJhZyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKCFwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiAhYXBwLm15Vmlld01vZGVsLmhlYWRlci5pc09wZW4oKSAmJiBwZW9wbGUuZHJhZ1N0YXJ0KCkgPT0gMCkge1xuXHRcdFx0cGVvcGxlLmRyYWdTdGFydCgkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSk7XG5cdFx0XHRwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcodHJ1ZSk7XG5cdFx0XHQkKGV2ZW50Lmdlc3R1cmUudGFyZ2V0KS5vbmUoJ2RyYWdlbmQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHR2YXIgZGVsdGEgPSBwYXJzZUludCgkKCcjcGVvcGxlIC5wZW9wbGUnKS5jc3MoJ21hcmdpbi10b3AnKSk7XG5cdFx0XHRcdGlmIChkZWx0YSA+PSA3MCkge1xuXHRcdFx0XHRcdHBlb3BsZS5nZXRUaW1lcygpO1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpblwiPjwvc3Bhbj5SZWZyZXNoaW5nLi4uJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucGVvcGxlJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblxuXHR9XG5cblx0cGVvcGxlLmluaXQoKTtcblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQZW9wbGU7IiwiLyoqXG4gKiBzY3JpcHRzL3Byb2ZpbGUuanNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFByb2ZpbGUoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcHJvZmlsZSA9IGFwcC5teVZpZXdNb2RlbC5wcm9maWxlID0ge307XG5cblx0cHJvZmlsZS5zaG93ID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2ZpbGU7IiwiLyoqXG4gKiBzY3JpcHRzL3JhdGUtd2Vlay5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBSYXRlV2VlayhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciByYXRlV2VlayA9IGFwcC5teVZpZXdNb2RlbC5yYXRlV2VlayA9IHt9O1xuXG5cdHJhdGVXZWVrLnJlZ2lzdGVyTW91c2VYID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRyYXRlV2Vlay5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZSA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHJhdGVXZWVrLnJlZ2lzdGVyUmF0aW8gPSBrby5vYnNlcnZhYmxlKCQoZG9jdW1lbnQpLndpZHRoKCkgLSAyMCk7XG5cdHJhdGVXZWVrLnNob3cgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXHRyYXRlV2Vlay5kcmFnID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHR2YXIgZGlyZWN0aW9uID0gZXZlbnQuZ2VzdHVyZS5kaXJlY3Rpb247XG5cdFx0aWYgKGRpcmVjdGlvbiA9PSAnbGVmdCcgfHwgZGlyZWN0aW9uID09ICdyaWdodCcpIHtcblx0XHRcdHZhciBzdGFydFggPSBldmVudC5nZXN0dXJlLnN0YXJ0RXZlbnQuY2VudGVyLnBhZ2VYO1xuXHRcdFx0aWYgKHJhdGVXZWVrLnJlZ2lzdGVyTW91c2VYKCkgIT0gc3RhcnRYKSB7XG5cdFx0XHRcdHJhdGVXZWVrLnJlZ2lzdGVyTW91c2VYKHN0YXJ0WCk7XG5cdFx0XHRcdHJhdGVXZWVrLnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlKGl0ZW0uYXR0cmlidXRlcy5wZXJjZW50YWdlKCkpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGRpZmYgPSAoZXZlbnQuZ2VzdHVyZS5kZWx0YVggLyByYXRlV2Vlay5yZWdpc3RlclJhdGlvKCkpICogMTUwO1xuXHRcdFx0dmFyIG5ld1BlcmNlbnRhZ2UgPSBNYXRoLmZsb29yKChkaWZmICsgcmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoKSkgLyA1KSAqIDU7XG5cblx0XHRcdGlmIChuZXdQZXJjZW50YWdlID4gMCAmJiBuZXdQZXJjZW50YWdlIDw9IDE1MCkge1xuXHRcdFx0XHRpdGVtLmF0dHJpYnV0ZXMucGVyY2VudGFnZShuZXdQZXJjZW50YWdlKTtcblx0XHRcdH0gZWxzZSBpZiAobmV3UGVyY2VudGFnZSA+IDE1MCkge1xuXHRcdFx0XHRpdGVtLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgxNTApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmF0ZVdlZWsuZ29CYWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3Quc2hvdyh0cnVlKTtcblx0XHRyYXRlV2Vlay5zaG93KGZhbHNlKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3NlbGVjdC1wcm9qZWN0Jyk7XG5cdH1cblxuXHRyYXRlV2Vlay5nb05leHQgPSBmdW5jdGlvbigpIHtcblx0XHRyYXRlV2Vlay5zaG93KGZhbHNlKTtcblx0XHRhcHAubXlWaWV3TW9kZWwubm90ZXMuc2hvdyh0cnVlKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ25vdGVzJyk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSYXRlV2VlazsiLCIvKipcbiAqIHNjcmlwdHMvc2F2ZS5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTYXZlKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHNhdmUgPSBhcHAubXlWaWV3TW9kZWwuc2F2ZSA9IHt9O1xuXG5cdHNhdmUuc2hvdyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzYXZlLnN1Y2Nlc3MgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2F2ZS5lcnJvciA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzYXZlLnNhdmluZyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cdHNhdmUucmVzdWx0ID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdC8vIHNhdmUuZG9uZSA9IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHQvLyBcdHZhciBkb25lID0gZmFsc2U7XG5cdC8vIFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzYXZlLnJlc3VsdC5sZW5ndGg7IGkrKykge1xuXHQvLyBcdFx0ZG9uZSA9IGRvbmUgfHwgc2F2ZS5yZXN1bHRbaV07XG5cdC8vIFx0fVxuXHQvLyBcdHJldHVybiBkb25lO1xuXHQvLyB9KTtcblxuXHRzYXZlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5nb1RvVmlldygnc2F2ZScpO1xuXHRcdHNhdmUuc2hvdyh0cnVlKTtcblx0XHRzYXZlLnNhdmluZyh0cnVlKTtcblx0XHR2YXIgdGVtcCA9IHt9O1xuXHRcdHZhciBjdXJXZWVrO1xuXHRcdC8vIHZhciBudW1XZWVrcyA9IGFwcC5teVZpZXdNb2RlbC5yYXRlV2Vlay53ZWVrcygpLmxlbmd0aDtcblxuXHRcdHZhciBwcm9qZWN0cyA9IFtdO1xuXHRcdF8uZWFjaChhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5ncm91cHMoKSwgZnVuY3Rpb24oZ3JvdXApIHtcblx0XHRcdF8uZWFjaChncm91cC5hdHRyaWJ1dGVzLnByb2plY3RzKCksIGZ1bmN0aW9uKHByb2plY3QpIHtcblx0XHRcdFx0aWYgKHByb2plY3QuYXR0cmlidXRlcy5zZWxlY3RlZCgpKSB7XG5cdFx0XHRcdFx0dmFyIG5ld1Byb2plY3QgPSB7XG5cdFx0XHRcdFx0XHRpZDogcHJvamVjdC5pZCxcblx0XHRcdFx0XHRcdHBlcmNlbnRhZ2U6IHByb2plY3QuYXR0cmlidXRlcy5wZXJjZW50YWdlKClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cHJvamVjdHMucHVzaChuZXdQcm9qZWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9KTtcblxuXHRcdHZhciBkYXRlID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKS5hZGQoJ2RheXMnLCAoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3Qud2Vla0luZGV4KCkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJyk7XG5cdFx0Y29uc29sZS5sb2coZGF0ZSlcblxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0ZGF0ZTogZGF0ZSxcblx0XHRcdHJhdGluZzogYXBwLm15Vmlld01vZGVsLm5vdGVzLnJhdGluZygpLFxuXHRcdFx0bm90ZXM6IGFwcC5teVZpZXdNb2RlbC5ub3Rlcy5jb250ZW50KCksXG5cdFx0XHRwcm9qZWN0czogcHJvamVjdHNcblx0XHR9XG5cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ3NhdmVUaW1lJywge1xuXHRcdFx0ZGF0ZTogZGF0ZSxcblx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KGRhdGEpXG5cdFx0fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRhcHAubXlWaWV3TW9kZWwuaG9tZS5nZXRUb3RhbHNBbmRSYXRpbmcoKTtcblx0XHRcdFx0c2F2ZS5zdWNjZXNzKHRydWUpO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0c2F2ZS5lcnJvcih0cnVlKTtcblx0XHRcdFx0c2F2ZS5yZXNldCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0c2F2ZS50cnlBZ2FpbiA9IGZ1bmN0aW9uKCkge1xuXHRcdHNhdmUuZXJyb3IoZmFsc2UpO1xuXHRcdHNhdmUuc3VjY2VzcyhmYWxzZSk7XG5cdFx0c2F2ZS5zdWJtaXQoKTtcblx0fVxuXG5cdHNhdmUucmVzZXQgPSBmdW5jdGlvbigpIHtcblx0XHRzYXZlLnNhdmluZyhmYWxzZSk7XG5cdFx0c2F2ZS5zaG93KGZhbHNlKTtcblx0XHRzYXZlLmVycm9yKGZhbHNlKTtcblx0XHRzYXZlLnN1Y2Nlc3MoZmFsc2UpO1xuXHRcdGFwcC5nb1RvVmlldygnaG9tZScpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2F2ZTsiLCIvKipcbiAqIHNjcmlwdHMvc2VsZWN0LXByb2plY3QuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gU2VsZWN0UHJvamVjdChhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBzZWxlY3RQcm9qZWN0ID0gYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QgPSB7fTtcblxuXHRzZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHNlbGVjdFByb2plY3QuaXNBZGRNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNlbGVjdFByb2plY3QudW5pcXVlQ29tcGFueU5hbWVzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdCA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNlbGVjdFByb2plY3QuZHJhZ1N0YXJ0ID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0c2VsZWN0UHJvamVjdC5jb3VudCA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHNlbGVjdFByb2plY3Qud2VlayA9IGtvLm9ic2VydmFibGUoJ1RoaXMgV2VlaycpO1xuXHRzZWxlY3RQcm9qZWN0LnNob3cgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2VsZWN0UHJvamVjdC50b2RheSA9IG1vbWVudChuZXcgRGF0ZSgpKS5zdGFydE9mKCdpc293ZWVrJyk7XG5cdHNlbGVjdFByb2plY3QuZ3JvdXBzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHNlbGVjdFByb2plY3Qud2Vla0luZGV4ID0ga28ub2JzZXJ2YWJsZSgwKTtcblxuXHRzZWxlY3RQcm9qZWN0Lkdyb3VwID0gZnVuY3Rpb24odHlwZSkge1xuXHRcdHZhciBncm91cCA9IHtcblx0XHRcdGF0dHJpYnV0ZXM6IHt9XG5cdFx0fVxuXHRcdGdyb3VwLmF0dHJpYnV0ZXMubmFtZSA9ICh0eXBlID09ICdwcml2YXRlJyA/ICdNeSBQcml2YXRlIFByb2plY3RzJyA6ICdNeSBTaGFyZWQgUHJvamVjdHMnKTtcblx0XHRyZXR1cm4gZ3JvdXA7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LmluaXQgPSBmdW5jdGlvbihpbmRleCkge1xuXG5cdFx0aWYgKGFwcC5teVZpZXdNb2RlbC5ob21lLnRvdGFscygpW2luZGV4XS50b3RhbCA+PSAwKSB7XG5cdFx0XHRhcHAubXlWaWV3TW9kZWwubm90ZXMucmVzZXQoaW5kZXgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhcHAubXlWaWV3TW9kZWwubm90ZXMucmVzZXQobnVsbCk7XG5cdFx0fVxuXHRcdHNlbGVjdFByb2plY3QucG9wdWxhdGVTZWxlY3Rpb25zKGluZGV4KTtcblxuXHRcdHZhciBzdHlsZWREYXRlID0gJ1dlZWsgb2YgJyArIG1vbWVudChzZWxlY3RQcm9qZWN0LnRvZGF5KS5hZGQoJ2RheXMnLCAoaW5kZXggKiA3KSkuZm9ybWF0KCdNTU0gRCcpO1xuXHRcdGlmIChpbmRleCA9PSAwKSBzdHlsZWREYXRlID0gJ1RoaXMgV2Vlayc7XG5cdFx0aWYgKGluZGV4ID09IDEpIHN0eWxlZERhdGUgPSAnTmV4dCBXZWVrJztcblx0XHRzZWxlY3RQcm9qZWN0LndlZWsoc3R5bGVkRGF0ZSk7XG5cdFx0c2VsZWN0UHJvamVjdC53ZWVrSW5kZXgoaW5kZXgpO1xuXHRcdHNlbGVjdFByb2plY3Quc2hvdyh0cnVlKTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuZ2V0R3JvdXBzID0gZnVuY3Rpb24oKSB7XG5cdFx0c2VsZWN0UHJvamVjdC5ncm91cHMoW10pO1xuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0R3JvdXBzJywge30sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGdyb3Vwcykge1xuXHRcdFx0XHQvLyBncm91cHMuc3BsaWNlKDAsMCxuZXcgc2VsZWN0UHJvamVjdC5Hcm91cCgncHJpdmF0ZScpLCBuZXcgc2VsZWN0UHJvamVjdC5Hcm91cCgncHVibGljJykpO1xuXHRcdFx0XHRfLmVhY2goZ3JvdXBzLCBmdW5jdGlvbihncm91cCkge1xuXHRcdFx0XHRcdGdyb3VwLmF0dHJpYnV0ZXMucHJvamVjdHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0XHRcdFx0XHRncm91cC5hdHRyaWJ1dGVzLm5vbk1lbWJlciA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC5ncm91cHMoZ3JvdXBzKTtcblxuXHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoMCk7XG5cdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAuZ3JvdXBzJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdH0sIDEwMCk7XG5cblxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdFByb2plY3QuZ3JvdXBzKCkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFByb2plY3RzJywge1xuXHRcdFx0XHRcdFx0Z3JvdXBJZDogc2VsZWN0UHJvamVjdC5ncm91cHMoKVtpXS5pZFxuXHRcdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3VsdHMpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHJlc3VsdHMucHJvamVjdHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRcdHZhciBncm91cCA9IF8uZmluZChzZWxlY3RQcm9qZWN0Lmdyb3VwcygpLCBmdW5jdGlvbihncm91cCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGdyb3VwLmlkID09IHJlc3VsdHMucHJvamVjdHNbMF0uYXR0cmlidXRlcy5ncm91cC5pZDtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXG5cdFx0XHRcdFx0XHRcdFx0Xy5lYWNoKHJlc3VsdHMucHJvamVjdHMsIGZ1bmN0aW9uKHByb2plY3QpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHByb2plY3QuYXR0cmlidXRlcy5zZWxlY3RlZCA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRcdFx0XHRcdFx0XHRcdFx0cHJvamVjdC5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGdyb3VwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRncm91cC5hdHRyaWJ1dGVzLnByb2plY3RzKHJlc3VsdHMucHJvamVjdHMpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBjaGVjayBtZW1iZXJzaGlwIHN0YXR1cyBmb3IgdGhlIGVtcHR5IGdyb3VwXG5cdFx0XHRcdFx0XHRcdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRNZW1iZXJzaGlwU3RhdHVzJywge1xuXHRcdFx0XHRcdFx0XHRcdFx0Z3JvdXBJZDogcmVzdWx0cy5ncm91cElkXG5cdFx0XHRcdFx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdFx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzdWx0cykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoIXJlc3VsdHMuc3RhdHVzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIGdyb3VwID0gXy5maW5kKHNlbGVjdFByb2plY3QuZ3JvdXBzKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZ3JvdXAuaWQgPT0gcmVzdWx0cy5ncm91cElkO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGdyb3VwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRncm91cC5hdHRyaWJ1dGVzLm5vbk1lbWJlcih0cnVlKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gY29uc29sZS5sb2coc2VsZWN0UHJvamVjdC5ncm91cHMoKSlcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LmdvSG9tZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHNlbGVjdFByb2plY3Quc2hvdyhmYWxzZSk7XG5cdFx0YXBwLmdvVG9WaWV3KCdob21lJyk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LmdvTmV4dCA9IGZ1bmN0aW9uKCkge1xuXHRcdHNlbGVjdFByb2plY3Quc2hvdyhmYWxzZSk7XG5cdFx0YXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLnNob3codHJ1ZSk7XG5cdFx0YXBwLmdvVG9WaWV3KCdyYXRlLXdlZWsnKTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QucG9wdWxhdGVTZWxlY3Rpb25zID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdHVzZXJJZDogYXBwLm15Vmlld01vZGVsLmF1dGguY3VycmVudFVzZXIoKS5pZCxcblx0XHRcdGRhdGVzOiBbYXBwLm15Vmlld01vZGVsLmhvbWUudG90YWxzKClbaW5kZXhdLndlZWtdXG5cdFx0fTtcblxuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0VGltZXMnLCBkYXRhLCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih0aW1lcykge1xuXHRcdFx0XHRpZiAodGltZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdHZhciBkYXRhID0gSlNPTi5wYXJzZSh0aW1lc1swXS5hdHRyaWJ1dGVzLmRhdGEpO1xuXHRcdFx0XHRcdHZhciBwcm9qZWN0cyA9IGRhdGEucHJvamVjdHM7XG5cdFx0XHRcdFx0dmFyIHNldCA9IFtdO1xuXHRcdFx0XHRcdF8uZWFjaChwcm9qZWN0cywgZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0XHRcdFx0c2V0W3Byb2plY3QuaWRdID0gcHJvamVjdC5wZXJjZW50YWdlO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0Xy5lYWNoKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0Lmdyb3VwcygpLCBmdW5jdGlvbihncm91cCkge1xuXHRcdFx0XHRcdFx0Xy5lYWNoKGdyb3VwLmF0dHJpYnV0ZXMucHJvamVjdHMoKSwgZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0XHRcdFx0XHRpZiAoc2V0W3Byb2plY3QuaWRdKSB7XG5cdFx0XHRcdFx0XHRcdFx0cHJvamVjdC5hdHRyaWJ1dGVzLnNlbGVjdGVkKHRydWUpO1xuXHRcdFx0XHRcdFx0XHRcdHByb2plY3QuYXR0cmlidXRlcy5wZXJjZW50YWdlKHNldFtwcm9qZWN0LmlkXSk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0cHJvamVjdC5hdHRyaWJ1dGVzLnNlbGVjdGVkKGZhbHNlKTtcblx0XHRcdFx0XHRcdFx0XHRwcm9qZWN0LmF0dHJpYnV0ZXMucGVyY2VudGFnZSgwKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnRvZ2dsZVByb2plY3QgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmIChpdGVtLmF0dHJpYnV0ZXMuc2VsZWN0ZWQoKSkge1xuXHRcdFx0aXRlbS5hdHRyaWJ1dGVzLnNlbGVjdGVkKGZhbHNlKTtcblx0XHRcdHNlbGVjdFByb2plY3QuY291bnQoc2VsZWN0UHJvamVjdC5jb3VudCgpIC0gMSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGl0ZW0uYXR0cmlidXRlcy5zZWxlY3RlZCh0cnVlKTtcblx0XHRcdHNlbGVjdFByb2plY3QuY291bnQoc2VsZWN0UHJvamVjdC5jb3VudCgpICsgMSk7XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC50b2dnbGVBZGRNb2RlID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHNlbGVjdFByb2plY3QuaXNBZGRNb2RlKCkpIHtcblx0XHRcdGFwcC5teVZpZXdNb2RlbC5oZWFkZXIuaXNNb2RhbChmYWxzZSk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmlzQWRkTW9kZShmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFwcC5teVZpZXdNb2RlbC5oZWFkZXIuaXNNb2RhbCh0cnVlKTtcblx0XHRcdCQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLnZhbCgnJyk7XG5cdFx0XHQkKCcucHJvamVjdC1uYW1lLWZpZWxkJykudmFsKCcnKTtcblx0XHRcdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdChbXSk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmlzQWRkTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnNlbGVjdFByb2plY3RUeXBlYWhlYWQgPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0JCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykudmFsKGl0ZW0pO1xuXHRcdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdChbXSk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnNob3dUeXBlYWhlYWRSZXN1bHRzID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHR2YXIgbmVlZGxlID0gZXZlbnQudGFyZ2V0LnZhbHVlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15cXHdcXGRdL2dpLCAnJyk7XG5cblx0XHRpZiAobmVlZGxlLmxlbmd0aCA+IDApIHtcblx0XHRcdHZhciBmaWx0ZXJlZFByb2plY3RzID0gXy5maWx0ZXIoc2VsZWN0UHJvamVjdC51bmlxdWVDb21wYW55TmFtZXMoKSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRcdHZhciBoYXlzdGFjayA9IG9iai50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teXFx3XFxkXS9naSwgJycpO1xuXHRcdFx0XHRyZXR1cm4gaGF5c3RhY2suaW5kZXhPZihuZWVkbGUpID49IDA7IFxuXHRcdFx0fSk7XG5cdFx0XHR2YXIgZmllbGRQb3NpdGlvbiA9ICQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLm9mZnNldCgpO1xuXHRcdFx0JCgnLnByb2plY3QtdHlwZWFoZWFkJykuY3NzKCdsZWZ0JywgZmllbGRQb3NpdGlvbi5sZWZ0KS5jc3MoJ3RvcCcsIGZpZWxkUG9zaXRpb24udG9wICsgJCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykuaGVpZ2h0KCkrMjApO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KGZpbHRlcmVkUHJvamVjdHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QoW10pO1xuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc2F2ZU5ld1Byb2plY3QgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdGNvbXBhbnk6ICQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLnZhbCgpLFxuXHRcdFx0cHJvamVjdDogJCgnLnByb2plY3QtbmFtZS1maWVsZCcpLnZhbCgpLFxuXHRcdH1cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ3NhdmVQcm9qZWN0JywgZGF0YSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0XHRhbGVydCgnXCInICsgcHJvamVjdC5hdHRyaWJ1dGVzLmNvbXBhbnkgKyAnOiAnICsgcHJvamVjdC5hdHRyaWJ1dGVzLm5hbWUgKyAnXCIgY3JlYXRlZCBzdWNjZXNzZnVsbHkuJyk7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QudG9nZ2xlQWRkTW9kZSgpO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LmdldEdyb3VwcygpO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdC8vIGFsZXJ0KGVycm9yKVxuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XHRcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuZHJhZ1JlZnJlc2ggPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmIChzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgc2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHR2YXIgdG9wID0gJCgnI3NlbGVjdC1wcm9qZWN0IC5ncm91cHMnKS5zY3JvbGxUb3AoKTtcblx0XHRcdHZhciBkZWx0YSA9IE1hdGguZmxvb3IoZXZlbnQuZ2VzdHVyZS5kaXN0YW5jZSk7XG5cdFx0XHRpZiAodG9wID09IDAgJiYgZGVsdGEgPiAzMCkge1xuXHRcdFx0XHRpZiAoZGVsdGEgPiAxNTApIGRlbHRhID0gMTUwO1xuXHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLmdyb3VwcycpLmNzcygnbWFyZ2luLXRvcCcsIGRlbHRhIC0gMzApO1xuXHRcdFx0XHRpZiAoZGVsdGEgPj0gMTAwKSB7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtdXBcIj48L3NwYW4+UmVsZWFzZSB0byByZWZyZXNoJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc3RhcnRSZWZyZXNoRHJhZyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKCFzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgc2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgkKCcjc2VsZWN0LXByb2plY3QgLmdyb3VwcycpLnNjcm9sbFRvcCgpKTtcblx0XHRcdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcodHJ1ZSk7XG5cdFx0XHQkKGV2ZW50Lmdlc3R1cmUudGFyZ2V0KS5vbmUoJ2RyYWdlbmQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHR2YXIgZGVsdGEgPSBwYXJzZUludCgkKCcjc2VsZWN0LXByb2plY3QgLmdyb3VwcycpLmNzcygnbWFyZ2luLXRvcCcpKTtcblxuXHRcdFx0XHRpZiAoZGVsdGEgPj0gNzApIHtcblx0XHRcdFx0XHRzZWxlY3RQcm9qZWN0LmdldEdyb3VwcygpO1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluXCI+PC9zcGFuPlJlZnJlc2hpbmcuLi4nKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHRcdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHRcdHNlbGVjdFByb2plY3QuZHJhZ1N0YXJ0KDApO1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAuZ3JvdXBzJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdGlmIChhcHAubXlWaWV3TW9kZWwuYXV0aC5jdXJyZW50VXNlcigpKSB7XG5cdFx0c2VsZWN0UHJvamVjdC5nZXRHcm91cHMoKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdFByb2plY3Q7Il19
