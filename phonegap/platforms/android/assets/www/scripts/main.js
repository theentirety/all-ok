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

	// initialize knockout
	self.myViewModel = {};

	self.myViewModel.activeView = ko.observable(0);
	self.myViewModel.views = [
		'auth',
		'select-project',
		'rate-week',
		'notes',
		'people',
		'people-details',
		'save'
	];

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

	var currentUser = Parse.User.current();
	if (currentUser) {
		auth.currentUser(currentUser);
	}

	auth.init = function() {
		if (auth.currentUser()) {
			app.goToView('select-project');
		} else {
			app.goToView('auth');
		}
		Parse.Cloud.run('checkAdminStatus', {}, {
			success: function(isAdmin) {
				auth.isAdmin(isAdmin);
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	auth.resetError = function() {
		auth.errorMessage('');
	}

	auth.signInUp = function(formElement) {
		// ko.postbox.publish('isLoading', true);
		auth.resetError();

		var username = $(formElement).find('input[name=auth_username]').val();
		var password = $(formElement).find('input[name=auth_password]').val();

		if (auth.signUpMode()) {
			var email = $(formElement).find('input[name=auth_email]').val().toLowerCase();
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

			if (username.length < 1) {
				auth.errorMessage('Please enter a username.');
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
			user.set('email', email);
			user.set('displayName', displayName);

			// other fields can be set just like with Parse.Object
			// user.set("phone", "415-392-0202");

			user.signUp(null, {
				success: function(user) {
					auth.currentUser(user);
					app.goToView('select-project');
					app.myViewModel.selectProject.init();
					if (user.attributes.isAdmin) {
						auth.isAdmin(true);
					}
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
					app.goToView('select-project');
					app.myViewModel.selectProject.init();
					if (user.attributes.isAdmin) {
						auth.isAdmin(true);
					}
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
		app.myViewModel.steps.currentStep(0);
		app.myViewModel.rateWeek.activeWeek(0);
		app.goToView('auth');
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

	auth.toggleForgotMode = function() {
		if (auth.forgotMode()) {
			auth.forgotMode(false);
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
},{}],3:[function(require,module,exports){
/**
 * scripts/main.js
 *
 * This is the starting point for your application.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

var App = require('./app.js');
var Auth = require('./auth.js');
var Steps = require('./steps.js');
var SelectProject = require('./select-project.js');
var Header = require('./header.js');
var RateWeek = require('./rate-week.js');
var Notes = require('./notes.js');
var People = require('./people.js');
var Save = require('./save.js');
var PeopleDetails = require('./people-details.js');

// initialize parse
Parse.initialize("JkYNfPBw2aPgcc7PeTGHMAU2XKvjzeqVIkyClVuo", "45OMU3ZS3o5c168lQxa0ilxQu4FdMVHT1NVTkORl");

// initialize typekit
try{Typekit.load();}catch(e){}

var app = new App();
var auth = new Auth(app);
var steps = new Steps(app);
var selectProject = new SelectProject(app);
var header = new Header(app);
var rateWeek = new RateWeek(app);
var notes = new Notes(app);
var people = new People(app);
var save = new Save(app);
var peopleDetails = new PeopleDetails(app);

// Custom knockout extneders

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

app.initialize();
},{"./app.js":1,"./auth.js":2,"./header.js":4,"./notes.js":5,"./people-details.js":6,"./people.js":7,"./rate-week.js":8,"./save.js":9,"./select-project.js":10,"./steps.js":11}],4:[function(require,module,exports){
/**
 * scripts/header.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Header(app) {
	var self = this;

	var header = app.myViewModel.header = {};

	header.activePage = ko.observable(0);
	header.isModal = ko.observable(false);
	header.isOpen = ko.observable(false);
	header.isDragging = ko.observable(false);
	header.dragStartY = ko.observable(0);
	header.maxHeight = 135;
	header.pages = ko.observableArray([
		{
			display: 'My Time',
			link: 'select-project',
			icon: 'fa fa-clock-o'
		},
		{
			display: 'People',
			link: 'people',
			icon: 'fa fa-users'
		}
	]);

	header.goToPage = function(index) {
		header.activePage(index);
		app.myViewModel.steps.currentStep(0);
		app.goToView(header.pages()[index].link);
		header.close();
	}

	header.close = function() {
		if (header.isOpen()) {
			header.isDragging(true);

			$('#header').animate({
				marginTop: 0
			}, 250, function() {
				header.isDragging(false);
				header.isOpen(false);
			});
		}
	}

	header.logout = function() {
		header.isOpen(false);
		header.isModal(false);
		app.myViewModel.auth.logout();
	}

	header.dragMenu = function(item, event) {
		if (header.isDragging()) {
			var delta = Math.ceil(event.gesture.deltaY);
			var change = header.dragStartY() + delta;
			
			if (change < 0) change = 0;
			if (change > header.maxHeight) change = header.maxHeight;

			if (change > 0 && change < header.maxHeight) {
				$('#header').css('margin-top', change);
			}
		}
	}

	header.dragMenuStart = function(item, event) {
		if (!header.isDragging()) {
			header.isDragging(true);
			header.dragStartY(parseInt($('#header').css('margin-top')));
			$('#header').one('dragend', function(event) {
				var endHeight = parseInt($('#header').css('margin-top'));
				if (endHeight >= header.maxHeight / 2) {
					header.isOpen(true);
				} else {
					header.isOpen(false);
				}
				$('#header').animate({
					marginTop: header.isOpen() ? header.maxHeight : 0
				}, 100, function() {
					header.isDragging(false);
				});
			});
		}
	}

	return self;
}

module.exports = Header;
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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

	selectProject.init = function() {
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
			var top = $(document).scrollTop();
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
		if (!selectProject.isRefreshDragging() && !app.myViewModel.header.isOpen() && selectProject.dragStart() == 0) {
			selectProject.dragStart($(document).scrollTop());
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
},{}],11:[function(require,module,exports){
/**
 * scripts/steps.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function Steps(app) {
	var self = this;

	var steps = app.myViewModel.steps = {};

	steps.currentStep = ko.observable(0);
	steps.changing = ko.observable(false);
	steps.steps = ko.observableArray([
		{
			stepNumber: 0,
			link: 'select-project'
		},
		{
			stepNumber: 1,
			link: 'rate-week'
		},
		{
			stepNumber: 2,
			link: 'notes'
		}
	]);

	steps.nextStep = function(direction) {
		if (!steps.changing() && app.myViewModel.selectProject.count() > 0) {
			steps.changing(true);
			app.myViewModel.header.close();
			steps.currentStep(steps.currentStep() + direction);
			app.goToView(steps.steps()[steps.currentStep()].link);
			setTimeout(function() {
				steps.changing(false);
			}, 500);
		}
	}

	return self;
}

module.exports = Steps;
},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvYXV0aC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvZmFrZV9lMWUxNjg3My5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvaGVhZGVyLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ub3Rlcy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcGVvcGxlLWRldGFpbHMuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3Blb3BsZS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcmF0ZS13ZWVrLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zYXZlLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zZWxlY3QtcHJvamVjdC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvc3RlcHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogc2NyaXB0cy9hcHAuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQXBwKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0Ly8gaW5pdGlhbGl6ZSBrbm9ja291dFxuXHRzZWxmLm15Vmlld01vZGVsID0ge307XG5cblx0c2VsZi5teVZpZXdNb2RlbC5hY3RpdmVWaWV3ID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0c2VsZi5teVZpZXdNb2RlbC52aWV3cyA9IFtcblx0XHQnYXV0aCcsXG5cdFx0J3NlbGVjdC1wcm9qZWN0Jyxcblx0XHQncmF0ZS13ZWVrJyxcblx0XHQnbm90ZXMnLFxuXHRcdCdwZW9wbGUnLFxuXHRcdCdwZW9wbGUtZGV0YWlscycsXG5cdFx0J3NhdmUnXG5cdF07XG5cblx0c2VsZi5nb1RvVmlldyA9IGZ1bmN0aW9uKHZpZXcpIHtcblx0XHR2YXIgaW5kZXggPSBzZWxmLm15Vmlld01vZGVsLnZpZXdzLmluZGV4T2Yodmlldyk7XG5cdFx0c2VsZi5teVZpZXdNb2RlbC5hY3RpdmVWaWV3KGluZGV4KTtcblx0fVxuXG5cdHNlbGYuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZXJlYWR5Jywgc2VsZi5vbkRldmljZVJlYWR5LCBmYWxzZSk7XG5cdH1cblxuXHRzZWxmLm9uRGV2aWNlUmVhZHkgPSBmdW5jdGlvbigpIHtcblx0XHRrby5hcHBseUJpbmRpbmdzKHNlbGYubXlWaWV3TW9kZWwpO1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAobmF2aWdhdG9yLnNwbGFzaHNjcmVlbikge1xuXHRcdFx0XHRuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuLmhpZGUoKTtcblx0XHRcdH1cblx0XHR9LCAyMDAwKTtcblx0XHRcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDsiLCIvKipcbiAqIHNjcmlwdHMvYXV0aC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBdXRoKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGF1dGggPSBhcHAubXlWaWV3TW9kZWwuYXV0aCA9IHt9O1xuXG5cdGF1dGguY3VycmVudFVzZXIgPSBrby5vYnNlcnZhYmxlKCk7XG5cdGF1dGguZXJyb3JNZXNzYWdlID0ga28ub2JzZXJ2YWJsZSgnJyk7XG5cdGF1dGguc2lnblVwTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhdXRoLmlzQWRtaW4gPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0YXV0aC5mb3Jnb3RNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0dmFyIGN1cnJlbnRVc2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cdGlmIChjdXJyZW50VXNlcikge1xuXHRcdGF1dGguY3VycmVudFVzZXIoY3VycmVudFVzZXIpO1xuXHR9XG5cblx0YXV0aC5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGF1dGguY3VycmVudFVzZXIoKSkge1xuXHRcdFx0YXBwLmdvVG9WaWV3KCdzZWxlY3QtcHJvamVjdCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhcHAuZ29Ub1ZpZXcoJ2F1dGgnKTtcblx0XHR9XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdjaGVja0FkbWluU3RhdHVzJywge30sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGlzQWRtaW4pIHtcblx0XHRcdFx0YXV0aC5pc0FkbWluKGlzQWRtaW4pO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGF1dGgucmVzZXRFcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGguZXJyb3JNZXNzYWdlKCcnKTtcblx0fVxuXG5cdGF1dGguc2lnbkluVXAgPSBmdW5jdGlvbihmb3JtRWxlbWVudCkge1xuXHRcdC8vIGtvLnBvc3Rib3gucHVibGlzaCgnaXNMb2FkaW5nJywgdHJ1ZSk7XG5cdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cblx0XHR2YXIgdXNlcm5hbWUgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfdXNlcm5hbWVdJykudmFsKCk7XG5cdFx0dmFyIHBhc3N3b3JkID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX3Bhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHR2YXIgZW1haWwgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZW1haWxdJykudmFsKCkudG9Mb3dlckNhc2UoKTtcblx0XHRcdHZhciBkaXNwbGF5TmFtZSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9kaXNwbGF5TmFtZV0nKS52YWwoKTtcblx0XHRcdHZhciBwYXNzd29yZENvbmZpcm0gPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfY29uZmlybVBhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0XHQvLyB2YWxpZGF0aW9uXG5cdFx0XHRpZiAoZW1haWwubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZW1haWwgYWRkcmVzcy4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZGlzcGxheU5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZmlyc3QgYW5kIGxhc3QgbmFtZS4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodXNlcm5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIGEgdXNlcm5hbWUuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHBhc3N3b3JkLmxlbmd0aCA8IDEgfHwgcGFzc3dvcmRDb25maXJtIDwgMSB8fCBwYXNzd29yZCAhPSBwYXNzd29yZENvbmZpcm0pIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciBhbmQgY29uZmlybSBhIHBhc3N3b3JkLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHZhciB1c2VyID0gbmV3IFBhcnNlLlVzZXIoKTtcblx0XHRcdHZhciBzY3J1YmJlZFVzZXJuYW1lID0gdXNlcm5hbWUucmVwbGFjZSgvXFxzKy9nLFwiXCIpOyAvL3JlbW92ZSB3aGl0ZSBzcGFjZVxuXHRcdFx0c2NydWJiZWRVc2VybmFtZSA9IHNjcnViYmVkVXNlcm5hbWUudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0dXNlci5zZXQoJ3VzZXJuYW1lJywgc2NydWJiZWRVc2VybmFtZSk7XG5cdFx0XHR1c2VyLnNldCgncGFzc3dvcmQnLCBwYXNzd29yZCk7XG5cdFx0XHR1c2VyLnNldCgnZW1haWwnLCBlbWFpbCk7XG5cdFx0XHR1c2VyLnNldCgnZGlzcGxheU5hbWUnLCBkaXNwbGF5TmFtZSk7XG5cblx0XHRcdC8vIG90aGVyIGZpZWxkcyBjYW4gYmUgc2V0IGp1c3QgbGlrZSB3aXRoIFBhcnNlLk9iamVjdFxuXHRcdFx0Ly8gdXNlci5zZXQoXCJwaG9uZVwiLCBcIjQxNS0zOTItMDIwMlwiKTtcblxuXHRcdFx0dXNlci5zaWduVXAobnVsbCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0XHRhcHAuZ29Ub1ZpZXcoJ3NlbGVjdC1wcm9qZWN0Jyk7XG5cdFx0XHRcdFx0YXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuaW5pdCgpO1xuXHRcdFx0XHRcdGlmICh1c2VyLmF0dHJpYnV0ZXMuaXNBZG1pbikge1xuXHRcdFx0XHRcdFx0YXV0aC5pc0FkbWluKHRydWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0UGFyc2UuVXNlci5sb2dJbih1c2VybmFtZSwgcGFzc3dvcmQsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRcdGF1dGguY3VycmVudFVzZXIodXNlcik7XG5cdFx0XHRcdFx0YXBwLmdvVG9WaWV3KCdzZWxlY3QtcHJvamVjdCcpO1xuXHRcdFx0XHRcdGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmluaXQoKTtcblx0XHRcdFx0XHRpZiAodXNlci5hdHRyaWJ1dGVzLmlzQWRtaW4pIHtcblx0XHRcdFx0XHRcdGF1dGguaXNBZG1pbih0cnVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuXHRcdFx0XHRcdC8vIFRoZSBsb2dpbiBmYWlsZWQuIENoZWNrIGVycm9yIHRvIHNlZSB3aHkuXG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5mb3Jnb3QgPSBmdW5jdGlvbihmb3JtRWxlbWVudCkge1xuXHRcdHZhciBlbWFpbCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9mb3Jnb3RdJykudmFsKCk7XG5cblx0XHRQYXJzZS5Vc2VyLnJlcXVlc3RQYXNzd29yZFJlc2V0KGVtYWlsLCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0XHRcdFx0JChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2ZvcmdvdF0nKS52YWwoJycpO1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGNoZWNrIHlvdXIgZW1haWwgZm9yIGluc3RydWN0aW9ucyBvbiByZXNldHRpbmcgeW91ciBwYXNzd29yZC4nKTtcblx0XHRcdH0sXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0YXV0aC5sb2dvdXQgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAubXlWaWV3TW9kZWwuc3RlcHMuY3VycmVudFN0ZXAoMCk7XG5cdFx0YXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLmFjdGl2ZVdlZWsoMCk7XG5cdFx0YXBwLmdvVG9WaWV3KCdhdXRoJyk7XG5cdFx0UGFyc2UuVXNlci5sb2dPdXQoKTtcblx0XHRhdXRoLmN1cnJlbnRVc2VyKG51bGwpO1xuXHR9XG5cblx0YXV0aC5zaG93U2lnblVwID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5lcnJvck1lc3NhZ2UoJycpO1xuXHRcdGlmIChhdXRoLnNpZ25VcE1vZGUoKSkge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGgudG9nZ2xlRm9yZ290TW9kZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChhdXRoLmZvcmdvdE1vZGUoKSkge1xuXHRcdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXV0aC5mb3Jnb3RNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguc2FuaXRpemVFcnJvcnMgPSBmdW5jdGlvbihlcnJvcikge1xuXHRcdHN3aXRjaChlcnJvci5jb2RlKVxuXHRcdHtcblx0XHRcdGNhc2UgMTAxOlxuXHRcdFx0XHRyZXR1cm4gJ1BsZWFzZSBlbnRlciBhIHZhbGlkIHVzZXJuYW1lIGFuZCBwYXNzd29yZC4nO1xuXHRcdFx0Y2FzZSAxMjQ6XG5cdFx0XHRcdHJldHVybiAnT29wcyEgV2UgbWVzc2VkIHVwLiBQbGVhc2UgdHJ5IGFnYWluLic7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gZXJyb3IubWVzc2FnZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGVycm9yLm1lc3NhZ2Uuc2xpY2UoMSkgKyAnLic7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0aDsiLCIvKipcbiAqIHNjcmlwdHMvbWFpbi5qc1xuICpcbiAqIFRoaXMgaXMgdGhlIHN0YXJ0aW5nIHBvaW50IGZvciB5b3VyIGFwcGxpY2F0aW9uLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXBwID0gcmVxdWlyZSgnLi9hcHAuanMnKTtcbnZhciBBdXRoID0gcmVxdWlyZSgnLi9hdXRoLmpzJyk7XG52YXIgU3RlcHMgPSByZXF1aXJlKCcuL3N0ZXBzLmpzJyk7XG52YXIgU2VsZWN0UHJvamVjdCA9IHJlcXVpcmUoJy4vc2VsZWN0LXByb2plY3QuanMnKTtcbnZhciBIZWFkZXIgPSByZXF1aXJlKCcuL2hlYWRlci5qcycpO1xudmFyIFJhdGVXZWVrID0gcmVxdWlyZSgnLi9yYXRlLXdlZWsuanMnKTtcbnZhciBOb3RlcyA9IHJlcXVpcmUoJy4vbm90ZXMuanMnKTtcbnZhciBQZW9wbGUgPSByZXF1aXJlKCcuL3Blb3BsZS5qcycpO1xudmFyIFNhdmUgPSByZXF1aXJlKCcuL3NhdmUuanMnKTtcbnZhciBQZW9wbGVEZXRhaWxzID0gcmVxdWlyZSgnLi9wZW9wbGUtZGV0YWlscy5qcycpO1xuXG4vLyBpbml0aWFsaXplIHBhcnNlXG5QYXJzZS5pbml0aWFsaXplKFwiSmtZTmZQQncyYVBnY2M3UGVUR0hNQVUyWEt2anplcVZJa3lDbFZ1b1wiLCBcIjQ1T01VM1pTM281YzE2OGxReGEwaWx4UXU0RmRNVkhUMU5WVGtPUmxcIik7XG5cbi8vIGluaXRpYWxpemUgdHlwZWtpdFxudHJ5e1R5cGVraXQubG9hZCgpO31jYXRjaChlKXt9XG5cbnZhciBhcHAgPSBuZXcgQXBwKCk7XG52YXIgYXV0aCA9IG5ldyBBdXRoKGFwcCk7XG52YXIgc3RlcHMgPSBuZXcgU3RlcHMoYXBwKTtcbnZhciBzZWxlY3RQcm9qZWN0ID0gbmV3IFNlbGVjdFByb2plY3QoYXBwKTtcbnZhciBoZWFkZXIgPSBuZXcgSGVhZGVyKGFwcCk7XG52YXIgcmF0ZVdlZWsgPSBuZXcgUmF0ZVdlZWsoYXBwKTtcbnZhciBub3RlcyA9IG5ldyBOb3RlcyhhcHApO1xudmFyIHBlb3BsZSA9IG5ldyBQZW9wbGUoYXBwKTtcbnZhciBzYXZlID0gbmV3IFNhdmUoYXBwKTtcbnZhciBwZW9wbGVEZXRhaWxzID0gbmV3IFBlb3BsZURldGFpbHMoYXBwKTtcblxuLy8gQ3VzdG9tIGtub2Nrb3V0IGV4dG5lZGVyc1xuXG4vLyBIZXJlJ3MgYSBjdXN0b20gS25vY2tvdXQgYmluZGluZyB0aGF0IG1ha2VzIGVsZW1lbnRzIHNob3duL2hpZGRlbiB2aWEgalF1ZXJ5J3MgZmFkZUluKCkvZmFkZU91dCgpIG1ldGhvZHNcbi8vIENvdWxkIGJlIHN0b3JlZCBpbiBhIHNlcGFyYXRlIHV0aWxpdHkgbGlicmFyeVxua28uYmluZGluZ0hhbmRsZXJzLmZhZGVWaXNpYmxlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gSW5pdGlhbGx5IHNldCB0aGUgZWxlbWVudCB0byBiZSBpbnN0YW50bHkgdmlzaWJsZS9oaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZVxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICBrby51bndyYXAodmFsdWUpID8gJChlbGVtZW50KS5mYWRlSW4oKSA6ICQoZWxlbWVudCkuZmFkZU91dCgpO1xuICAgIH1cbn1cblxuYXBwLmluaXRpYWxpemUoKTsiLCIvKipcbiAqIHNjcmlwdHMvaGVhZGVyLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEhlYWRlcihhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBoZWFkZXIgPSBhcHAubXlWaWV3TW9kZWwuaGVhZGVyID0ge307XG5cblx0aGVhZGVyLmFjdGl2ZVBhZ2UgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRoZWFkZXIuaXNNb2RhbCA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRoZWFkZXIuaXNPcGVuID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGhlYWRlci5pc0RyYWdnaW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGhlYWRlci5kcmFnU3RhcnRZID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0aGVhZGVyLm1heEhlaWdodCA9IDEzNTtcblx0aGVhZGVyLnBhZ2VzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtcblx0XHR7XG5cdFx0XHRkaXNwbGF5OiAnTXkgVGltZScsXG5cdFx0XHRsaW5rOiAnc2VsZWN0LXByb2plY3QnLFxuXHRcdFx0aWNvbjogJ2ZhIGZhLWNsb2NrLW8nXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRkaXNwbGF5OiAnUGVvcGxlJyxcblx0XHRcdGxpbms6ICdwZW9wbGUnLFxuXHRcdFx0aWNvbjogJ2ZhIGZhLXVzZXJzJ1xuXHRcdH1cblx0XSk7XG5cblx0aGVhZGVyLmdvVG9QYWdlID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRoZWFkZXIuYWN0aXZlUGFnZShpbmRleCk7XG5cdFx0YXBwLm15Vmlld01vZGVsLnN0ZXBzLmN1cnJlbnRTdGVwKDApO1xuXHRcdGFwcC5nb1RvVmlldyhoZWFkZXIucGFnZXMoKVtpbmRleF0ubGluayk7XG5cdFx0aGVhZGVyLmNsb3NlKCk7XG5cdH1cblxuXHRoZWFkZXIuY2xvc2UgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoaGVhZGVyLmlzT3BlbigpKSB7XG5cdFx0XHRoZWFkZXIuaXNEcmFnZ2luZyh0cnVlKTtcblxuXHRcdFx0JCgnI2hlYWRlcicpLmFuaW1hdGUoe1xuXHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdH0sIDI1MCwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGhlYWRlci5pc0RyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0aGVhZGVyLmlzT3BlbihmYWxzZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRoZWFkZXIubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aGVhZGVyLmlzT3BlbihmYWxzZSk7XG5cdFx0aGVhZGVyLmlzTW9kYWwoZmFsc2UpO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5hdXRoLmxvZ291dCgpO1xuXHR9XG5cblx0aGVhZGVyLmRyYWdNZW51ID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoaGVhZGVyLmlzRHJhZ2dpbmcoKSkge1xuXHRcdFx0dmFyIGRlbHRhID0gTWF0aC5jZWlsKGV2ZW50Lmdlc3R1cmUuZGVsdGFZKTtcblx0XHRcdHZhciBjaGFuZ2UgPSBoZWFkZXIuZHJhZ1N0YXJ0WSgpICsgZGVsdGE7XG5cdFx0XHRcblx0XHRcdGlmIChjaGFuZ2UgPCAwKSBjaGFuZ2UgPSAwO1xuXHRcdFx0aWYgKGNoYW5nZSA+IGhlYWRlci5tYXhIZWlnaHQpIGNoYW5nZSA9IGhlYWRlci5tYXhIZWlnaHQ7XG5cblx0XHRcdGlmIChjaGFuZ2UgPiAwICYmIGNoYW5nZSA8IGhlYWRlci5tYXhIZWlnaHQpIHtcblx0XHRcdFx0JCgnI2hlYWRlcicpLmNzcygnbWFyZ2luLXRvcCcsIGNoYW5nZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aGVhZGVyLmRyYWdNZW51U3RhcnQgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmICghaGVhZGVyLmlzRHJhZ2dpbmcoKSkge1xuXHRcdFx0aGVhZGVyLmlzRHJhZ2dpbmcodHJ1ZSk7XG5cdFx0XHRoZWFkZXIuZHJhZ1N0YXJ0WShwYXJzZUludCgkKCcjaGVhZGVyJykuY3NzKCdtYXJnaW4tdG9wJykpKTtcblx0XHRcdCQoJyNoZWFkZXInKS5vbmUoJ2RyYWdlbmQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHR2YXIgZW5kSGVpZ2h0ID0gcGFyc2VJbnQoJCgnI2hlYWRlcicpLmNzcygnbWFyZ2luLXRvcCcpKTtcblx0XHRcdFx0aWYgKGVuZEhlaWdodCA+PSBoZWFkZXIubWF4SGVpZ2h0IC8gMikge1xuXHRcdFx0XHRcdGhlYWRlci5pc09wZW4odHJ1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aGVhZGVyLmlzT3BlbihmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0JCgnI2hlYWRlcicpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdG1hcmdpblRvcDogaGVhZGVyLmlzT3BlbigpID8gaGVhZGVyLm1heEhlaWdodCA6IDBcblx0XHRcdFx0fSwgMTAwLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRoZWFkZXIuaXNEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyOyIsIi8qKlxuICogc2NyaXB0cy9ub3Rlcy5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBOb3RlcyhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBub3RlcyA9IGFwcC5teVZpZXdNb2RlbC5ub3RlcyA9IHt9O1xuXHRub3Rlcy5zdGF0dXNPcHRpb25zID0ga28ub2JzZXJ2YWJsZUFycmF5KFtcblx0XHR7XG5cdFx0XHRsYWJlbDogJ0JyaW5nIG9uIHRoZSB3b3JrJyxcblx0XHRcdHZhbHVlOiAwLFxuXHRcdFx0aWNvbjogJ2Vtb2ppLTEuc3ZnJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bGFiZWw6ICdJXFwnbSBhIGxpdHRsZSBsaWdodCcsXG5cdFx0XHR2YWx1ZTogMSxcblx0XHRcdGljb246ICdlbW9qaS0yLnN2Zydcblx0XHR9LFxuXHRcdHtcblx0XHRcdGxhYmVsOiAnTGlmZSBpcyBnb29kJyxcblx0XHRcdHZhbHVlOiAyLFxuXHRcdFx0aWNvbjogJ2Vtb2ppLTMuc3ZnJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bGFiZWw6ICdJXFwnbSBhIGJpdCBvdmVyd2hlbG1lZCcsXG5cdFx0XHR2YWx1ZTogMyxcblx0XHRcdGljb246ICdlbW9qaS00LnN2Zydcblx0XHR9LFxuXHRcdHtcblx0XHRcdGxhYmVsOiAnU3RvcCB0aGUgbWFkbmVzcyEnLFxuXHRcdFx0dmFsdWU6IDQsXG5cdFx0XHRpY29uOiAnZW1vamktNS5zdmcnXG5cdFx0fVxuXHRdKTtcblxuXHRub3Rlcy5zZWxlY3RTdGF0dXMgPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0YXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLndlZWtzKClbYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLmFjdGl2ZVdlZWsoKV0ucmF0aW5nKGl0ZW0udmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBOb3RlczsiLCIvKipcbiAqIHNjcmlwdHMvcGVvcGxlLWRldGFpbHMuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUGVvcGxlRGV0YWlscyhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBwZW9wbGVEZXRhaWxzID0gYXBwLm15Vmlld01vZGVsLnBlb3BsZURldGFpbHMgPSB7fTtcblxuXHRwZW9wbGVEZXRhaWxzLnBlcnNvbiA9IGtvLm9ic2VydmFibGUobnVsbCk7XG5cdHBlb3BsZURldGFpbHMud2Vla3MgPSBrby5vYnNlcnZhYmxlQXJyYXkoW10pO1xuXHRwZW9wbGVEZXRhaWxzLnRvdGFscyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG5cblx0cGVvcGxlRGV0YWlscy5nZXRQZXJzb24gPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0cGVvcGxlRGV0YWlscy50b3RhbHMoW10pO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXBwLm15Vmlld01vZGVsLnBlb3BsZS5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHR2YXIgcGVyc29uID0gXy5maW5kKGFwcC5teVZpZXdNb2RlbC5wZW9wbGUudGltZXMoKVtpXSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRcdHJldHVybiBvYmouYXR0cmlidXRlcy51c2VyLmlkID09IGl0ZW0uYXR0cmlidXRlcy51c2VyLmlkO1xuXHRcdFx0fSk7XG5cdFx0XHRwZW9wbGVEZXRhaWxzLnRvdGFscy5wdXNoKHBlcnNvbik7XG5cdFx0fVxuXG5cdFx0cGVvcGxlRGV0YWlscy5wZXJzb24oaXRlbSk7XG5cdH1cblxuXHRwZW9wbGVEZXRhaWxzLmdvQmFjayA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5nb1RvVmlldygncGVvcGxlJyk7XG5cdH1cblxuXHRwZW9wbGVEZXRhaWxzLmdldENvbXBhbnlOYW1lID0gZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgbmFtZSA9ICcnO1xuXHRcdHZhciBwcm9qZWN0ID0gXy5maW5kKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0cmV0dXJuIG9iai5pZCA9PSBpZDtcblx0XHR9KTtcblxuXHRcdGlmICh0eXBlb2YgcHJvamVjdCA9PT0gJ29iamVjdCcpIHtcblx0XHRcdG5hbWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMuY29tcGFueTtcblx0XHR9XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH1cblxuXHRwZW9wbGVEZXRhaWxzLmdldFByb2plY3ROYW1lID0gZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgbmFtZSA9ICcnO1xuXHRcdHZhciBwcm9qZWN0ID0gXy5maW5kKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0cmV0dXJuIG9iai5pZCA9PSBpZDtcblx0XHR9KTtcblxuXHRcdGlmICh0eXBlb2YgcHJvamVjdCA9PT0gJ29iamVjdCcpIHtcblx0XHRcdG5hbWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMubmFtZTtcblx0XHR9XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQZW9wbGVEZXRhaWxzOyIsIi8qKlxuICogc2NyaXB0cy9wZW9wbGUuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUGVvcGxlKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHBlb3BsZSA9IGFwcC5teVZpZXdNb2RlbC5wZW9wbGUgPSB7fTtcblxuXHRwZW9wbGUubnVtV2Vla3MgPSAzO1xuXHRwZW9wbGUudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRwZW9wbGUuYWN0aXZlV2VlayA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHBlb3BsZS5hY3RpdmVQZXJzb24gPSBrby5vYnNlcnZhYmxlKCk7XG5cdHBlb3BsZS52aWV3VHlwZSA9IGtvLm9ic2VydmFibGUoJ2hvdXJzJyk7XG5cdHBlb3BsZS50aW1lcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRwZW9wbGUud2Vla3MgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0cGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHBlb3BsZS5kcmFnU3RhcnQgPSBrby5vYnNlcnZhYmxlKDApO1xuXG5cdHBlb3BsZS5nZXRUaW1lcyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkYXRlcyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGVvcGxlLm51bVdlZWtzOyBpKyspIHtcblx0XHRcdGRhdGVzLnB1c2gobW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJykpO1xuXHRcdFx0cGVvcGxlLndlZWtzKClbaV0uZGF0ZShtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ01NTSBEJykpO1xuXHRcdH1cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFRpbWVzJywge1xuXHRcdFx0ZGF0ZXM6IGRhdGVzXG5cdFx0fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24odGltZXMpIHtcblx0XHRcdFx0cGVvcGxlLnRpbWVzKFtdKTtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB0aW1lcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YSA9ICQucGFyc2VKU09OKHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YSk7XG5cdFx0XHRcdFx0dmFyIHRvdGFsID0gXyh0aW1lc1tqXS5hdHRyaWJ1dGVzLmRhdGEucHJvamVjdHMpLnJlZHVjZShmdW5jdGlvbihhY2MsIG9iaikge1xuXHRcdFx0XHRcdFx0XyhvYmopLmVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkgeyBhY2Nba2V5XSA9IChhY2Nba2V5XSA/IGFjY1trZXldIDogMCkgKyB2YWx1ZSB9KTtcblx0XHRcdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHRcdFx0fSwge30pO1xuXG5cdFx0XHRcdFx0dGltZXNbal0uYXR0cmlidXRlcy50b3RhbCA9IGtvLm9ic2VydmFibGUodG90YWwucGVyY2VudGFnZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0XHRcdHZhciB3ZWVrRGF0ZSA9IG1vbWVudChwZW9wbGUudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpO1xuXHRcdFx0XHRcdHZhciB3ZWVrID0gXy5maWx0ZXIodGltZXMsIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9iai5hdHRyaWJ1dGVzLmRhdGEuZGF0ZSA9PSB3ZWVrRGF0ZTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHZhciBzb3J0ZWQgPSBfLnNvcnRCeSh3ZWVrLCBmdW5jdGlvbihvYmopeyBcblx0XHRcdFx0XHRcdHJldHVybiAtb2JqLmF0dHJpYnV0ZXMudG90YWwoKTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHBlb3BsZS50aW1lcy5wdXNoKHNvcnRlZCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdHBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdHBlb3BsZS5kcmFnU3RhcnQoMCk7XG5cdFx0XHRcdCQoJyNwZW9wbGUgLnBlb3BsZScpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHBlb3BsZS5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0dmFyIHdlZWsgPSB7XG5cdFx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdNTU0gRCcpKVxuXHRcdFx0fVxuXHRcdFx0cGVvcGxlLndlZWtzLnB1c2god2Vlayk7XG5cdFx0fVxuXHRcdHBlb3BsZS5nZXRUaW1lcygpO1xuXHR9XG5cblx0cGVvcGxlLnNlbGVjdFdlZWsgPSBmdW5jdGlvbihpbmRleCkge1xuXHRcdHBlb3BsZS5hY3RpdmVXZWVrKGluZGV4KTtcblx0XHQvLyBnbyBnZXQgdGhlIGRhdGEgZm9yIHRoaXMgd2Vla1xuXHR9XG5cblx0cGVvcGxlLnRvZ2dsZVZpZXcgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAocGVvcGxlLnZpZXdUeXBlKCkgPT0gJ2hvdXJzJykge1xuXHRcdFx0cGVvcGxlLnZpZXdUeXBlKCdwZXJjZW50Jyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBlb3BsZS52aWV3VHlwZSgnaG91cnMnKTtcblx0XHR9XG5cdH1cblxuXHRwZW9wbGUuZ29Ub1BlcnNvbiA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRhcHAubXlWaWV3TW9kZWwucGVvcGxlRGV0YWlscy5nZXRQZXJzb24oaXRlbSk7XG5cdFx0YXBwLmdvVG9WaWV3KCdwZW9wbGUtZGV0YWlscycpO1xuXHR9XG5cblx0cGVvcGxlLmRyYWdSZWZyZXNoID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAocGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgcGVvcGxlLmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHZhciB0b3AgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKTtcblx0XHRcdHZhciBkZWx0YSA9IE1hdGguZmxvb3IoZXZlbnQuZ2VzdHVyZS5kaXN0YW5jZSk7XG5cdFx0XHRpZiAodG9wID09IDAgJiYgZGVsdGEgPiAzMCkge1xuXHRcdFx0XHRpZiAoZGVsdGEgPiAxNTApIGRlbHRhID0gMTUwO1xuXHRcdFx0XHQkKCcjcGVvcGxlIC5wZW9wbGUnKS5jc3MoJ21hcmdpbi10b3AnLCBkZWx0YSAtIDMwKTtcblx0XHRcdFx0aWYgKGRlbHRhID49IDEwMCkge1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS11cFwiPjwvc3Bhbj5SZWxlYXNlIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHBlb3BsZS5zdGFydFJlZnJlc2hEcmFnID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoIXBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZygpICYmICFhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmlzT3BlbigpICYmIHBlb3BsZS5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHRwZW9wbGUuZHJhZ1N0YXJ0KCQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpKTtcblx0XHRcdHBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZyh0cnVlKTtcblx0XHRcdCQoZXZlbnQuZ2VzdHVyZS50YXJnZXQpLm9uZSgnZHJhZ2VuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdHZhciBkZWx0YSA9IHBhcnNlSW50KCQoJyNwZW9wbGUgLnBlb3BsZScpLmNzcygnbWFyZ2luLXRvcCcpKTtcblx0XHRcdFx0aWYgKGRlbHRhID49IDcwKSB7XG5cdFx0XHRcdFx0cGVvcGxlLmdldFRpbWVzKCk7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluXCI+PC9zcGFuPlJlZnJlc2hpbmcuLi4nKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5wZW9wbGUnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXG5cdH1cblxuXHRwZW9wbGUuaW5pdCgpO1xuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBlb3BsZTsiLCIvKipcbiAqIHNjcmlwdHMvcmF0ZS13ZWVrLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFJhdGVXZWVrKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHJhdGVXZWVrID0gYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrID0ge307XG5cblx0cmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVggPSBrby5vYnNlcnZhYmxlKCk7XG5cdHJhdGVXZWVrLnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cmF0ZVdlZWsudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRyYXRlV2Vlay5yZWdpc3RlclJhdGlvID0ga28ub2JzZXJ2YWJsZSgkKGRvY3VtZW50KS53aWR0aCgpIC0gMjApO1xuXHRyYXRlV2Vlay5hY3RpdmVXZWVrID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cmF0ZVdlZWsudmlld1R5cGUgPSBrby5vYnNlcnZhYmxlKCdob3VycycpO1xuXG5cdHJhdGVXZWVrLndlZWtzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtcblx0XHR7XG5cdFx0XHRkYXRlOiBrby5vYnNlcnZhYmxlKG1vbWVudChyYXRlV2Vlay50b2RheSkuZm9ybWF0KCdNTU0gRCcpKSxcblx0XHRcdHRvdGFsOiBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN1bSA9IF8ucmVkdWNlKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG1lbW8sIHByb2plY3QpIHtcblx0XHRcdFx0XHR2YXIgY29sVmFsdWUgPSAwO1xuXHRcdFx0XHRcdGlmIChwcm9qZWN0LmF0dHJpYnV0ZXMuYWN0aXZlKCkpIHtcblx0XHRcdFx0XHRcdGNvbFZhbHVlID0gcHJvamVjdC5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVswXS52YWx1ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gbWVtbyArIGNvbFZhbHVlOyBcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdHJldHVybiBzdW07XG5cdFx0XHR9KSxcblx0XHRcdHJhdGluZzoga28ub2JzZXJ2YWJsZSgyKSxcblx0XHRcdG5vdGVzOiBrby5vYnNlcnZhYmxlKG51bGwpXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRkYXRlOiBrby5vYnNlcnZhYmxlKG1vbWVudChyYXRlV2Vlay50b2RheSkuYWRkKCdkYXlzJywgNykuZm9ybWF0KCdNTU0gRCcpKSxcblx0XHRcdHRvdGFsOiBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN1bSA9IF8ucmVkdWNlKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG1lbW8sIHByb2plY3QpIHtcblx0XHRcdFx0XHR2YXIgY29sVmFsdWUgPSAwO1xuXHRcdFx0XHRcdGlmIChwcm9qZWN0LmF0dHJpYnV0ZXMuYWN0aXZlKCkpIHtcblx0XHRcdFx0XHRcdGNvbFZhbHVlID0gcHJvamVjdC5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVsxXS52YWx1ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gbWVtbyArIGNvbFZhbHVlOyBcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdHJldHVybiBzdW07XG5cdFx0XHR9KSxcblx0XHRcdHJhdGluZzoga28ub2JzZXJ2YWJsZSgyKSxcblx0XHRcdG5vdGVzOiBrby5vYnNlcnZhYmxlKG51bGwpXG5cdFx0fSxcblx0XHR7ICBcblx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHJhdGVXZWVrLnRvZGF5KS5hZGQoJ2RheXMnLCAxNCkuZm9ybWF0KCdNTU0gRCcpKSxcblx0XHRcdHRvdGFsOiBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN1bSA9IF8ucmVkdWNlKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG1lbW8sIHByb2plY3QpIHtcblx0XHRcdFx0XHR2YXIgY29sVmFsdWUgPSAwO1xuXHRcdFx0XHRcdGlmIChwcm9qZWN0LmF0dHJpYnV0ZXMuYWN0aXZlKCkpIHtcblx0XHRcdFx0XHRcdGNvbFZhbHVlID0gcHJvamVjdC5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVsyXS52YWx1ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gbWVtbyArIGNvbFZhbHVlOyBcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdHJldHVybiBzdW07XG5cdFx0XHR9KSxcblx0XHRcdHJhdGluZzoga28ub2JzZXJ2YWJsZSgyKSxcblx0XHRcdG5vdGVzOiBrby5vYnNlcnZhYmxlKG51bGwpXG5cdFx0fVxuXHRdKTtcblxuXHRyYXRlV2Vlay5kcmFnID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHR2YXIgZGlyZWN0aW9uID0gZXZlbnQuZ2VzdHVyZS5kaXJlY3Rpb247XG5cdFx0aWYgKGRpcmVjdGlvbiA9PSAnbGVmdCcgfHwgZGlyZWN0aW9uID09ICdyaWdodCcpIHtcblx0XHRcdHZhciBzdGFydFggPSBldmVudC5nZXN0dXJlLnN0YXJ0RXZlbnQuY2VudGVyLnBhZ2VYO1xuXHRcdFx0aWYgKHJhdGVXZWVrLnJlZ2lzdGVyTW91c2VYKCkgIT0gc3RhcnRYKSB7XG5cdFx0XHRcdHJhdGVXZWVrLnJlZ2lzdGVyTW91c2VYKHN0YXJ0WCk7XG5cdFx0XHRcdHJhdGVXZWVrLnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlKGl0ZW0uYXR0cmlidXRlcy5wZXJjZW50YWdlKClbcmF0ZVdlZWsuYWN0aXZlV2VlaygpXS52YWx1ZSgpKTtcblx0XHRcdH1cblx0XHRcdHZhciBkaWZmID0gKGV2ZW50Lmdlc3R1cmUuZGVsdGFYIC8gcmF0ZVdlZWsucmVnaXN0ZXJSYXRpbygpKSAqIDE1MDtcblx0XHRcdHZhciBuZXdQZXJjZW50YWdlID0gTWF0aC5mbG9vcigoZGlmZiArIHJhdGVXZWVrLnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlKCkpIC8gNSkgKiA1O1xuXG5cdFx0XHRpZiAobmV3UGVyY2VudGFnZSA+IDAgJiYgbmV3UGVyY2VudGFnZSA8PSAxNTApIHtcblx0XHRcdFx0aXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVtyYXRlV2Vlay5hY3RpdmVXZWVrKCldLnZhbHVlKG5ld1BlcmNlbnRhZ2UpO1xuXHRcdFx0fSBlbHNlIGlmIChuZXdQZXJjZW50YWdlID4gMTUwKSB7XG5cdFx0XHRcdGl0ZW0uYXR0cmlidXRlcy5wZXJjZW50YWdlKClbcmF0ZVdlZWsuYWN0aXZlV2VlaygpXS52YWx1ZSgxNTApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVtyYXRlV2Vlay5hY3RpdmVXZWVrKCldLnZhbHVlKDApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJhdGVXZWVrLnNlbGVjdFdlZWsgPSBmdW5jdGlvbihpbmRleCkge1xuXHRcdHJhdGVXZWVrLmFjdGl2ZVdlZWsoaW5kZXgpO1xuXHR9XG5cblx0cmF0ZVdlZWsudGFrZVBpY3R1cmUgPSBmdW5jdGlvbigpIHtcblx0XHRuYXZpZ2F0b3IuY2FtZXJhLmdldFBpY3R1cmUocmF0ZVdlZWsuc2V0UGljdHVyZSwgZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBmYWlsXG5cdFx0XHRhbGVydCgnT29wcy4gV2UgY291bGRuXFwndCBhY2Nlc3MgeW91ciBjYW1lcmEuJyk7XG5cdFx0fSwgeyBcblx0XHRcdHF1YWxpdHk6IDEwMCwgXG5cdFx0XHRhbGxvd0VkaXQ6IHRydWUsIFxuXHRcdFx0ZGVzdGluYXRpb25UeXBlOiBuYXZpZ2F0b3IuY2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5EQVRBX1VSTCxcblx0XHRcdGVuY29kaW5nVHlwZTogQ2FtZXJhLkVuY29kaW5nVHlwZS5QTkcsXG5cdFx0XHR0YXJnZXRXaWR0aDogMTAwLFxuXHRcdFx0dGFyZ2V0SGVpZ2h0OiAxMDAsXG5cdFx0XHRjb3JyZWN0T3JpZW50YXRpb246IHRydWUsXG5cdFx0XHRjYW1lcmFEaXJlY3Rpb246IENhbWVyYS5EaXJlY3Rpb24uRlJPTlRcblx0XHR9KTtcblx0fVxuXG5cdHJhdGVXZWVrLnNldFBpY3R1cmUgPSBmdW5jdGlvbihpbWFnZURhdGEpIHtcblx0XHQkKCcuYXZhdGFyJykucmVtb3ZlQ2xhc3MoJ2ZhLWNhbWVyYScpLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcgKyBpbWFnZURhdGEgKyAnKScpO1xuXHRcdFBhcnNlLkNsb3VkLnJ1bigndXBkYXRlQXZhdGFyJywge1xuXHRcdFx0YXZhdGFyOiBpbWFnZURhdGFcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdGFsZXJ0KCdBdmF0YXIgc3VjY2Vzc2Z1bGx5IHNhdmVkLicpXG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0JCgnLmF2YXRhcicpLmFkZENsYXNzKCdmYS1jYW1lcmEnKTtcblx0XHRcdFx0Y29uc29sZS5sb2coJ09vcHMuIFdlIG1lc3NlZCB1cC4gUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHJhdGVXZWVrLnRvZ2dsZVZpZXcgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAocmF0ZVdlZWsudmlld1R5cGUoKSA9PSAnaG91cnMnKSB7XG5cdFx0XHRyYXRlV2Vlay52aWV3VHlwZSgncGVyY2VudCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyYXRlV2Vlay52aWV3VHlwZSgnaG91cnMnKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSYXRlV2VlazsiLCIvKipcbiAqIHNjcmlwdHMvc2F2ZS5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTYXZlKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHNhdmUgPSBhcHAubXlWaWV3TW9kZWwuc2F2ZSA9IHt9O1xuXG5cdHNhdmUuc2F2ZU1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2F2ZS5zdWNjZXNzID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNhdmUuZXJyb3IgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2F2ZS5zYXZpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXHRzYXZlLnJlc3VsdCA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRzYXZlLmRvbmUgPSBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHR2YXIgZG9uZSA9IGZhbHNlO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2F2ZS5yZXN1bHQubGVuZ3RoOyBpKyspIHtcblx0XHRcdGRvbmUgPSBkb25lIHx8IHNhdmUucmVzdWx0W2ldO1xuXHRcdH1cblx0XHRyZXR1cm4gZG9uZTtcblx0fSk7XG5cblx0c2F2ZS5zdWJtaXQgPSBmdW5jdGlvbigpIHtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3NhdmUnKTtcblx0XHRzYXZlLnNhdmVNb2RlKHRydWUpO1xuXHRcdHNhdmUuc2F2aW5nKHRydWUpO1xuXHRcdHZhciB0ZW1wID0ge307XG5cdFx0dmFyIGN1cldlZWs7XG5cdFx0dmFyIG51bVdlZWtzID0gYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLndlZWtzKCkubGVuZ3RoO1xuXHRcdHZhciBwcm9qZWN0cyA9IF8uZmlsdGVyKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0cmV0dXJuIG9iai5hdHRyaWJ1dGVzLmFjdGl2ZSgpO1xuXHRcdH0pO1xuXHRcdHZhciBudW1Qcm9qZWN0cyA9IHByb2plY3RzLmxlbmd0aDtcblx0XHR2YXIgdG9kYXkgPSBhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsudG9kYXk7XG5cdFx0dmFyIHRlbXBQcm9qZWN0ID0ge307XG5cdFx0dmFyIGRvbmUgPSAwO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBudW1XZWVrczsgaSsrKSB7XG5cdFx0XHRjdXJXZWVrID0gYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLndlZWtzKClbaV07XG5cdFx0XHR0ZW1wID0ge1xuXHRcdFx0XHRkYXRlOiBtb21lbnQodG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpLFxuXHRcdFx0XHRyYXRpbmc6IGN1cldlZWsucmF0aW5nKCksXG5cdFx0XHRcdG5vdGVzOiBjdXJXZWVrLm5vdGVzKClcblx0XHRcdH07XG5cblx0XHRcdHZhciB0ZW1wUHJvamVjdHMgPSBbXTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgbnVtUHJvamVjdHM7IGorKykge1xuXHRcdFx0XHR0ZW1wUHJvamVjdCA9IHtcblx0XHRcdFx0XHRpZDogcHJvamVjdHNbal0uaWQsXG5cdFx0XHRcdFx0cGVyY2VudGFnZTogcHJvamVjdHNbal0uYXR0cmlidXRlcy5wZXJjZW50YWdlKClbaV0udmFsdWUoKVxuXHRcdFx0XHR9XG5cdFx0XHRcdHRlbXBQcm9qZWN0cy5wdXNoKHRlbXBQcm9qZWN0KTtcblx0XHRcdH1cblx0XHRcdHRlbXAucHJvamVjdHMgPSB0ZW1wUHJvamVjdHM7XG5cblx0XHRcdFBhcnNlLkNsb3VkLnJ1bignc2F2ZVRpbWUnLCB7XG5cdFx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KHRlbXApLFxuXHRcdFx0XHRkYXRlOiB0ZW1wLmRhdGVcblx0XHRcdH0sIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdGRvbmUgPSBkb25lKzE7XG5cdFx0XHRcdFx0aWYgKGRvbmUgPj0gbnVtV2Vla3MgJiYgc2F2ZS5zYXZpbmcoKSkge1xuXHRcdFx0XHRcdFx0c2F2ZS5zdWNjZXNzKHRydWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHRcdHNhdmUuZXJyb3IodHJ1ZSk7XG5cdFx0XHRcdFx0c2F2ZS5yZXNldCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRzYXZlLnRyeUFnYWluID0gZnVuY3Rpb24oKSB7XG5cdFx0c2F2ZS5lcnJvcihmYWxzZSk7XG5cdFx0c2F2ZS5zdWNjZXNzKGZhbHNlKTtcblx0XHRzYXZlLnN1Ym1pdCgpO1xuXHR9XG5cblx0c2F2ZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHRcdHNhdmUuc2F2aW5nKGZhbHNlKTtcblx0XHRzYXZlLnNhdmVNb2RlKGZhbHNlKTtcblx0XHRzYXZlLmVycm9yKGZhbHNlKTtcblx0XHRzYXZlLnN1Y2Nlc3MoZmFsc2UpO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5zdGVwcy5jdXJyZW50U3RlcCgwKTtcblx0XHRhcHAuZ29Ub1ZpZXcoJ3NlbGVjdC1wcm9qZWN0Jyk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTYXZlOyIsIi8qKlxuICogc2NyaXB0cy9zZWxlY3QtcHJvamVjdC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTZWxlY3RQcm9qZWN0KGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHNlbGVjdFByb2plY3QgPSBhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdCA9IHt9O1xuXG5cdHNlbGVjdFByb2plY3Qudmlld1R5cGUgPSBrby5vYnNlcnZhYmxlKCdhbGwnKTtcblx0c2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRzZWxlY3RQcm9qZWN0LmlzQWRkTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzZWxlY3RQcm9qZWN0LnVuaXF1ZUNvbXBhbnlOYW1lcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHNlbGVjdFByb2plY3QuY291bnQgPSBrby5vYnNlcnZhYmxlKDApO1xuXG5cdHNlbGVjdFByb2plY3QuZ2V0UHJvamVjdHMgPSBmdW5jdGlvbigpIHtcblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFByb2plY3RzJywge30sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHByb2plY3RzKSB7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoW10pO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHByb2plY3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0cHJvamVjdHNbaV0uYXR0cmlidXRlcy5hY3RpdmUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0XHRcdFx0XHRwcm9qZWN0c1tpXS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UgPSBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKTtcblx0XHRcdFx0XHRzZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzLnB1c2gocHJvamVjdHNbaV0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QuZHJhZ1N0YXJ0KDApO1xuXHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLmFsbC1wcm9qZWN0cycpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0VW5pcXVlQ29tcGFueU5hbWVzJywge30sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHByb2plY3RzKSB7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QudW5pcXVlQ29tcGFueU5hbWVzKHByb2plY3RzKTtcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRzZWxlY3RQcm9qZWN0LmdldFByb2plY3RzKCk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnRvZ2dsZVByb2plY3QgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmIChpdGVtLmF0dHJpYnV0ZXMuYWN0aXZlKCkpIHtcblx0XHRcdGl0ZW0uYXR0cmlidXRlcy5hY3RpdmUoZmFsc2UpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5jb3VudChzZWxlY3RQcm9qZWN0LmNvdW50KCkgLSAxKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aXRlbS5hdHRyaWJ1dGVzLmFjdGl2ZSh0cnVlKTtcblx0XHRcdHNlbGVjdFByb2plY3QuY291bnQoc2VsZWN0UHJvamVjdC5jb3VudCgpICsgMSk7XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC50b2dnbGVBZGRNb2RlID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHNlbGVjdFByb2plY3QuaXNBZGRNb2RlKCkpIHtcblx0XHRcdGFwcC5teVZpZXdNb2RlbC5oZWFkZXIuaXNNb2RhbChmYWxzZSk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmlzQWRkTW9kZShmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFwcC5teVZpZXdNb2RlbC5oZWFkZXIuaXNNb2RhbCh0cnVlKTtcblx0XHRcdCQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLnZhbCgnJyk7XG5cdFx0XHQkKCcucHJvamVjdC1uYW1lLWZpZWxkJykudmFsKCcnKTtcblx0XHRcdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdChbXSk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmlzQWRkTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnRvZ2dsZVZpZXcgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoc2VsZWN0UHJvamVjdC52aWV3VHlwZSgpID09ICdhbGwnKSB7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LnZpZXdUeXBlKCdzZWxlY3RlZCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LnZpZXdUeXBlKCdhbGwnKTtcblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnNlbGVjdFByb2plY3RUeXBlYWhlYWQgPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0JCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykudmFsKGl0ZW0pO1xuXHRcdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdChbXSk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnNob3dUeXBlYWhlYWRSZXN1bHRzID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHR2YXIgbmVlZGxlID0gZXZlbnQudGFyZ2V0LnZhbHVlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15cXHdcXGRdL2dpLCAnJyk7XG5cblx0XHRpZiAobmVlZGxlLmxlbmd0aCA+IDApIHtcblx0XHRcdHZhciBmaWx0ZXJlZFByb2plY3RzID0gXy5maWx0ZXIoc2VsZWN0UHJvamVjdC51bmlxdWVDb21wYW55TmFtZXMoKSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRcdHZhciBoYXlzdGFjayA9IG9iai50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teXFx3XFxkXS9naSwgJycpO1xuXHRcdFx0XHRyZXR1cm4gaGF5c3RhY2suaW5kZXhPZihuZWVkbGUpID49IDA7IFxuXHRcdFx0fSk7XG5cdFx0XHR2YXIgZmllbGRQb3NpdGlvbiA9ICQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLm9mZnNldCgpO1xuXHRcdFx0JCgnLnByb2plY3QtdHlwZWFoZWFkJykuY3NzKCdsZWZ0JywgZmllbGRQb3NpdGlvbi5sZWZ0KS5jc3MoJ3RvcCcsIGZpZWxkUG9zaXRpb24udG9wICsgJCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykuaGVpZ2h0KCkrMjApO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KGZpbHRlcmVkUHJvamVjdHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QoW10pO1xuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc2F2ZU5ld1Byb2plY3QgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdGNvbXBhbnk6ICQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLnZhbCgpLFxuXHRcdFx0cHJvamVjdDogJCgnLnByb2plY3QtbmFtZS1maWVsZCcpLnZhbCgpLFxuXHRcdH1cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ3NhdmVQcm9qZWN0JywgZGF0YSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0XHRhbGVydCgnXCInICsgcHJvamVjdC5hdHRyaWJ1dGVzLmNvbXBhbnkgKyAnOiAnICsgcHJvamVjdC5hdHRyaWJ1dGVzLm5hbWUgKyAnXCIgY3JlYXRlZCBzdWNjZXNzZnVsbHkuJyk7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QudG9nZ2xlQWRkTW9kZSgpO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LmdldFByb2plY3RzKCk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Ly8gYWxlcnQoZXJyb3IpXG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcdFxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5kcmFnUmVmcmVzaCA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiBzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHZhciB0b3AgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKTtcblx0XHRcdHZhciBkZWx0YSA9IE1hdGguZmxvb3IoZXZlbnQuZ2VzdHVyZS5kaXN0YW5jZSk7XG5cdFx0XHRpZiAodG9wID09IDAgJiYgZGVsdGEgPiAzMCkge1xuXHRcdFx0XHRpZiAoZGVsdGEgPiAxNTApIGRlbHRhID0gMTUwO1xuXHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLmFsbC1wcm9qZWN0cycpLmNzcygnbWFyZ2luLXRvcCcsIGRlbHRhIC0gMzApO1xuXHRcdFx0XHRpZiAoZGVsdGEgPj0gMTAwKSB7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtdXBcIj48L3NwYW4+UmVsZWFzZSB0byByZWZyZXNoJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc3RhcnRSZWZyZXNoRHJhZyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKCFzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgIWFwcC5teVZpZXdNb2RlbC5oZWFkZXIuaXNPcGVuKCkgJiYgc2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nKHRydWUpO1xuXHRcdFx0JChldmVudC5nZXN0dXJlLnRhcmdldCkub25lKCdkcmFnZW5kJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0dmFyIGRlbHRhID0gcGFyc2VJbnQoJCgnI3NlbGVjdC1wcm9qZWN0IC5hbGwtcHJvamVjdHMnKS5jc3MoJ21hcmdpbi10b3AnKSk7XG5cblx0XHRcdFx0aWYgKGRlbHRhID49IDcwKSB7XG5cdFx0XHRcdFx0c2VsZWN0UHJvamVjdC5nZXRQcm9qZWN0cygpO1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluXCI+PC9zcGFuPlJlZnJlc2hpbmcuLi4nKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHRcdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHRcdHNlbGVjdFByb2plY3QuZHJhZ1N0YXJ0KDApO1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAuYWxsLXByb2plY3RzJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0UHJvamVjdDsiLCIvKipcbiAqIHNjcmlwdHMvc3RlcHMuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gU3RlcHMoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgc3RlcHMgPSBhcHAubXlWaWV3TW9kZWwuc3RlcHMgPSB7fTtcblxuXHRzdGVwcy5jdXJyZW50U3RlcCA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHN0ZXBzLmNoYW5naW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHN0ZXBzLnN0ZXBzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtcblx0XHR7XG5cdFx0XHRzdGVwTnVtYmVyOiAwLFxuXHRcdFx0bGluazogJ3NlbGVjdC1wcm9qZWN0J1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0c3RlcE51bWJlcjogMSxcblx0XHRcdGxpbms6ICdyYXRlLXdlZWsnXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRzdGVwTnVtYmVyOiAyLFxuXHRcdFx0bGluazogJ25vdGVzJ1xuXHRcdH1cblx0XSk7XG5cblx0c3RlcHMubmV4dFN0ZXAgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcblx0XHRpZiAoIXN0ZXBzLmNoYW5naW5nKCkgJiYgYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuY291bnQoKSA+IDApIHtcblx0XHRcdHN0ZXBzLmNoYW5naW5nKHRydWUpO1xuXHRcdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5jbG9zZSgpO1xuXHRcdFx0c3RlcHMuY3VycmVudFN0ZXAoc3RlcHMuY3VycmVudFN0ZXAoKSArIGRpcmVjdGlvbik7XG5cdFx0XHRhcHAuZ29Ub1ZpZXcoc3RlcHMuc3RlcHMoKVtzdGVwcy5jdXJyZW50U3RlcCgpXS5saW5rKTtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHN0ZXBzLmNoYW5naW5nKGZhbHNlKTtcblx0XHRcdH0sIDUwMCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RlcHM7Il19
