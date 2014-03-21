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

	self.myViewModel.currentUser = ko.observable(null);

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
},{"./app.js":1,"./auth.js":2,"./header.js":4,"./notes.js":5,"./people.js":6,"./rate-week.js":7,"./save.js":8,"./select-project.js":9,"./steps.js":10}],4:[function(require,module,exports){
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
			link: 'mytime',
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
		if (index != 1) {
			app.myViewModel.people.showDetails(false);
		}
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
			icon: 'fa fa-arrow-down'
		},
		{
			label: 'I\'m a little light',
			value: 1,
			icon: 'fa fa-minus'
		},
		{
			label: 'I\'m good',
			value: 2,
			icon: 'fa fa-arrow-right'
		},
		{
			label: 'I\'m a bit overwhelmed',
			value: 3,
			icon: 'fa fa-minus'
		},
		{
			label: 'Stop the madness!',
			value: 4,
			icon: 'fa fa-arrow-up'
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
	people.showDetails = ko.observable(false);
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

					_.sortBy(week, function(obj){ return obj.attributes.total; });

					people.times.push(week);
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
		people.activePerson(item);
		people.showDetails(true);
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
},{}],7:[function(require,module,exports){
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
		if (!app.myViewModel.people.showDetails() && (direction == 'left' || direction == 'right')) {
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

	rateWeek.goBack = function() {
		console.log('go back')
		app.myViewModel.people.showDetails(false);
		app.myViewModel.header.goToPage(1);
	}

	return self;
}

module.exports = RateWeek;
},{}],8:[function(require,module,exports){
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
	}

	return self;
}

module.exports = Save;
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
			stepName: 'selectProject'
		},
		{
			stepNumber: 1,
			stepName: 'rateWeek'
		},
		{
			stepNumber: 2,
			stepName: 'notes'
		}
	]);

	steps.changeStep = function(item) {
		if (!steps.changing() && app.myViewModel.selectProject.count() > 0) {
			steps.changing(true);
			app.myViewModel.header.close();
			steps.currentStep(item.stepNumber);
			setTimeout(function() {
				steps.changing(false);
			}, 500);
		}
	}

	steps.nextStep = function(direction) {
		if (!steps.changing() && app.myViewModel.selectProject.count() > 0) {
			steps.changing(true);
			app.myViewModel.header.close();
			steps.currentStep(steps.currentStep() + direction);
			setTimeout(function() {
				steps.changing(false);
			}, 500);
		}
	}

	return self;
}

module.exports = Steps;
},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvYXV0aC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvZmFrZV8zMGU1ZDc5Mi5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvaGVhZGVyLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ub3Rlcy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcGVvcGxlLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9yYXRlLXdlZWsuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3NhdmUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3NlbGVjdC1wcm9qZWN0LmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zdGVwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIHNjcmlwdHMvYXBwLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEFwcCgpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdC8vIGluaXRpYWxpemUga25vY2tvdXRcblx0c2VsZi5teVZpZXdNb2RlbCA9IHt9O1xuXG5cdHNlbGYubXlWaWV3TW9kZWwuY3VycmVudFVzZXIgPSBrby5vYnNlcnZhYmxlKG51bGwpO1xuXG5cdHNlbGYuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZXJlYWR5Jywgc2VsZi5vbkRldmljZVJlYWR5LCBmYWxzZSk7XG5cdH1cblxuXHRzZWxmLm9uRGV2aWNlUmVhZHkgPSBmdW5jdGlvbigpIHtcblx0XHRrby5hcHBseUJpbmRpbmdzKHNlbGYubXlWaWV3TW9kZWwpO1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAobmF2aWdhdG9yLnNwbGFzaHNjcmVlbikge1xuXHRcdFx0XHRuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuLmhpZGUoKTtcblx0XHRcdH1cblx0XHR9LCAyMDAwKTtcblx0XHRcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDsiLCIvKipcbiAqIHNjcmlwdHMvYXV0aC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBdXRoKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGF1dGggPSBhcHAubXlWaWV3TW9kZWwuYXV0aCA9IHt9O1xuXG5cdGF1dGguY3VycmVudFVzZXIgPSBrby5vYnNlcnZhYmxlKCk7XG5cdGF1dGguZXJyb3JNZXNzYWdlID0ga28ub2JzZXJ2YWJsZSgnJyk7XG5cdGF1dGguc2lnblVwTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhdXRoLmlzQWRtaW4gPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0YXV0aC5mb3Jnb3RNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0dmFyIGN1cnJlbnRVc2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cdGlmIChjdXJyZW50VXNlcikge1xuXHRcdGF1dGguY3VycmVudFVzZXIoY3VycmVudFVzZXIpO1xuXHR9XG5cblx0YXV0aC5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdjaGVja0FkbWluU3RhdHVzJywge30sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGlzQWRtaW4pIHtcblx0XHRcdFx0YXV0aC5pc0FkbWluKGlzQWRtaW4pO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGF1dGgucmVzZXRFcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGguZXJyb3JNZXNzYWdlKCcnKTtcblx0fVxuXG5cdGF1dGguc2lnbkluVXAgPSBmdW5jdGlvbihmb3JtRWxlbWVudCkge1xuXHRcdC8vIGtvLnBvc3Rib3gucHVibGlzaCgnaXNMb2FkaW5nJywgdHJ1ZSk7XG5cdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cblx0XHR2YXIgdXNlcm5hbWUgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfdXNlcm5hbWVdJykudmFsKCk7XG5cdFx0dmFyIHBhc3N3b3JkID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX3Bhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHR2YXIgZW1haWwgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZW1haWxdJykudmFsKCkudG9Mb3dlckNhc2UoKTtcblx0XHRcdHZhciBkaXNwbGF5TmFtZSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9kaXNwbGF5TmFtZV0nKS52YWwoKTtcblx0XHRcdHZhciBwYXNzd29yZENvbmZpcm0gPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfY29uZmlybVBhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0XHQvLyB2YWxpZGF0aW9uXG5cdFx0XHRpZiAoZW1haWwubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZW1haWwgYWRkcmVzcy4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZGlzcGxheU5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZmlyc3QgYW5kIGxhc3QgbmFtZS4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodXNlcm5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIGEgdXNlcm5hbWUuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHBhc3N3b3JkLmxlbmd0aCA8IDEgfHwgcGFzc3dvcmRDb25maXJtIDwgMSB8fCBwYXNzd29yZCAhPSBwYXNzd29yZENvbmZpcm0pIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciBhbmQgY29uZmlybSBhIHBhc3N3b3JkLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHZhciB1c2VyID0gbmV3IFBhcnNlLlVzZXIoKTtcblx0XHRcdHZhciBzY3J1YmJlZFVzZXJuYW1lID0gdXNlcm5hbWUucmVwbGFjZSgvXFxzKy9nLFwiXCIpOyAvL3JlbW92ZSB3aGl0ZSBzcGFjZVxuXHRcdFx0c2NydWJiZWRVc2VybmFtZSA9IHNjcnViYmVkVXNlcm5hbWUudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0dXNlci5zZXQoJ3VzZXJuYW1lJywgc2NydWJiZWRVc2VybmFtZSk7XG5cdFx0XHR1c2VyLnNldCgncGFzc3dvcmQnLCBwYXNzd29yZCk7XG5cdFx0XHR1c2VyLnNldCgnZW1haWwnLCBlbWFpbCk7XG5cdFx0XHR1c2VyLnNldCgnZGlzcGxheU5hbWUnLCBkaXNwbGF5TmFtZSk7XG5cblx0XHRcdC8vIG90aGVyIGZpZWxkcyBjYW4gYmUgc2V0IGp1c3QgbGlrZSB3aXRoIFBhcnNlLk9iamVjdFxuXHRcdFx0Ly8gdXNlci5zZXQoXCJwaG9uZVwiLCBcIjQxNS0zOTItMDIwMlwiKTtcblxuXHRcdFx0dXNlci5zaWduVXAobnVsbCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0UGFyc2UuVXNlci5sb2dJbih1c2VybmFtZSwgcGFzc3dvcmQsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRcdGF1dGguY3VycmVudFVzZXIodXNlcik7XG5cdFx0XHRcdFx0YXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuaW5pdCgpO1xuXHRcdFx0XHRcdGlmICh1c2VyLmF0dHJpYnV0ZXMuaXNBZG1pbikge1xuXHRcdFx0XHRcdFx0YXV0aC5pc0FkbWluKHRydWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0Ly8gVGhlIGxvZ2luIGZhaWxlZC4gQ2hlY2sgZXJyb3IgdG8gc2VlIHdoeS5cblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLmZvcmdvdCA9IGZ1bmN0aW9uKGZvcm1FbGVtZW50KSB7XG5cdFx0dmFyIGVtYWlsID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2ZvcmdvdF0nKS52YWwoKTtcblxuXHRcdFBhcnNlLlVzZXIucmVxdWVzdFBhc3N3b3JkUmVzZXQoZW1haWwsIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhdXRoLmZvcmdvdE1vZGUoZmFsc2UpO1xuXHRcdFx0XHQkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZm9yZ290XScpLnZhbCgnJyk7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgY2hlY2sgeW91ciBlbWFpbCBmb3IgaW5zdHJ1Y3Rpb25zIG9uIHJlc2V0dGluZyB5b3VyIHBhc3N3b3JkLicpO1xuXHRcdFx0fSxcblx0XHRcdGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRhdXRoLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5zdGVwcy5jdXJyZW50U3RlcCgwKTtcblx0XHRhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsuYWN0aXZlV2VlaygwKTtcblx0XHRQYXJzZS5Vc2VyLmxvZ091dCgpO1xuXHRcdGF1dGguY3VycmVudFVzZXIobnVsbCk7XG5cdH1cblxuXHRhdXRoLnNob3dTaWduVXAgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLmVycm9yTWVzc2FnZSgnJyk7XG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC50b2dnbGVGb3Jnb3RNb2RlID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGF1dGguZm9yZ290TW9kZSgpKSB7XG5cdFx0XHRhdXRoLmZvcmdvdE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhdXRoLmZvcmdvdE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5zYW5pdGl6ZUVycm9ycyA9IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0c3dpdGNoKGVycm9yLmNvZGUpXG5cdFx0e1xuXHRcdFx0Y2FzZSAxMDE6XG5cdFx0XHRcdHJldHVybiAnUGxlYXNlIGVudGVyIGEgdmFsaWQgdXNlcm5hbWUgYW5kIHBhc3N3b3JkLic7XG5cdFx0XHRjYXNlIDEyNDpcblx0XHRcdFx0cmV0dXJuICdPb3BzISBXZSBtZXNzZWQgdXAuIFBsZWFzZSB0cnkgYWdhaW4uJztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBlcnJvci5tZXNzYWdlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZXJyb3IubWVzc2FnZS5zbGljZSgxKSArICcuJztcblx0XHR9XG5cdH1cblxuXHRhdXRoLmluaXQoKTtcblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdXRoOyIsIi8qKlxuICogc2NyaXB0cy9tYWluLmpzXG4gKlxuICogVGhpcyBpcyB0aGUgc3RhcnRpbmcgcG9pbnQgZm9yIHlvdXIgYXBwbGljYXRpb24uXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBcHAgPSByZXF1aXJlKCcuL2FwcC5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuL2F1dGguanMnKTtcbnZhciBTdGVwcyA9IHJlcXVpcmUoJy4vc3RlcHMuanMnKTtcbnZhciBTZWxlY3RQcm9qZWN0ID0gcmVxdWlyZSgnLi9zZWxlY3QtcHJvamVjdC5qcycpO1xudmFyIEhlYWRlciA9IHJlcXVpcmUoJy4vaGVhZGVyLmpzJyk7XG52YXIgUmF0ZVdlZWsgPSByZXF1aXJlKCcuL3JhdGUtd2Vlay5qcycpO1xudmFyIE5vdGVzID0gcmVxdWlyZSgnLi9ub3Rlcy5qcycpO1xudmFyIFBlb3BsZSA9IHJlcXVpcmUoJy4vcGVvcGxlLmpzJyk7XG52YXIgU2F2ZSA9IHJlcXVpcmUoJy4vc2F2ZS5qcycpO1xuXG4vLyBpbml0aWFsaXplIHBhcnNlXG5QYXJzZS5pbml0aWFsaXplKFwiSmtZTmZQQncyYVBnY2M3UGVUR0hNQVUyWEt2anplcVZJa3lDbFZ1b1wiLCBcIjQ1T01VM1pTM281YzE2OGxReGEwaWx4UXU0RmRNVkhUMU5WVGtPUmxcIik7XG5cbi8vIGluaXRpYWxpemUgdHlwZWtpdFxudHJ5e1R5cGVraXQubG9hZCgpO31jYXRjaChlKXt9XG5cbnZhciBhcHAgPSBuZXcgQXBwKCk7XG52YXIgYXV0aCA9IG5ldyBBdXRoKGFwcCk7XG52YXIgc3RlcHMgPSBuZXcgU3RlcHMoYXBwKTtcbnZhciBzZWxlY3RQcm9qZWN0ID0gbmV3IFNlbGVjdFByb2plY3QoYXBwKTtcbnZhciBoZWFkZXIgPSBuZXcgSGVhZGVyKGFwcCk7XG52YXIgcmF0ZVdlZWsgPSBuZXcgUmF0ZVdlZWsoYXBwKTtcbnZhciBub3RlcyA9IG5ldyBOb3RlcyhhcHApO1xudmFyIHBlb3BsZSA9IG5ldyBQZW9wbGUoYXBwKTtcbnZhciBzYXZlID0gbmV3IFNhdmUoYXBwKTtcblxuXG4vLyBDdXN0b20ga25vY2tvdXQgZXh0bmVkZXJzXG5cbi8vIEhlcmUncyBhIGN1c3RvbSBLbm9ja291dCBiaW5kaW5nIHRoYXQgbWFrZXMgZWxlbWVudHMgc2hvd24vaGlkZGVuIHZpYSBqUXVlcnkncyBmYWRlSW4oKS9mYWRlT3V0KCkgbWV0aG9kc1xuLy8gQ291bGQgYmUgc3RvcmVkIGluIGEgc2VwYXJhdGUgdXRpbGl0eSBsaWJyYXJ5XG5rby5iaW5kaW5nSGFuZGxlcnMuZmFkZVZpc2libGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBJbml0aWFsbHkgc2V0IHRoZSBlbGVtZW50IHRvIGJlIGluc3RhbnRseSB2aXNpYmxlL2hpZGRlbiBkZXBlbmRpbmcgb24gdGhlIHZhbHVlXG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgJChlbGVtZW50KS50b2dnbGUoa28udW53cmFwKHZhbHVlKSk7IC8vIFVzZSBcInVud3JhcE9ic2VydmFibGVcIiBzbyB3ZSBjYW4gaGFuZGxlIHZhbHVlcyB0aGF0IG1heSBvciBtYXkgbm90IGJlIG9ic2VydmFibGVcbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBXaGVuZXZlciB0aGUgdmFsdWUgc3Vic2VxdWVudGx5IGNoYW5nZXMsIHNsb3dseSBmYWRlIHRoZSBlbGVtZW50IGluIG9yIG91dFxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgIGtvLnVud3JhcCh2YWx1ZSkgPyAkKGVsZW1lbnQpLmZhZGVJbigpIDogJChlbGVtZW50KS5mYWRlT3V0KCk7XG4gICAgfVxufVxuXG5hcHAuaW5pdGlhbGl6ZSgpOyIsIi8qKlxuICogc2NyaXB0cy9oZWFkZXIuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gSGVhZGVyKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGhlYWRlciA9IGFwcC5teVZpZXdNb2RlbC5oZWFkZXIgPSB7fTtcblxuXHRoZWFkZXIuYWN0aXZlUGFnZSA9IGtvLm9ic2VydmFibGUoMCk7XG5cdGhlYWRlci5pc01vZGFsID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGhlYWRlci5pc09wZW4gPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0aGVhZGVyLmlzRHJhZ2dpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0aGVhZGVyLmRyYWdTdGFydFkgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRoZWFkZXIubWF4SGVpZ2h0ID0gMTM1O1xuXHRoZWFkZXIucGFnZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuXHRcdHtcblx0XHRcdGRpc3BsYXk6ICdNeSBUaW1lJyxcblx0XHRcdGxpbms6ICdteXRpbWUnLFxuXHRcdFx0aWNvbjogJ2ZhIGZhLWNsb2NrLW8nXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRkaXNwbGF5OiAnUGVvcGxlJyxcblx0XHRcdGxpbms6ICdwZW9wbGUnLFxuXHRcdFx0aWNvbjogJ2ZhIGZhLXVzZXJzJ1xuXHRcdH1cblx0XSk7XG5cblx0aGVhZGVyLmdvVG9QYWdlID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRoZWFkZXIuYWN0aXZlUGFnZShpbmRleCk7XG5cdFx0YXBwLm15Vmlld01vZGVsLnN0ZXBzLmN1cnJlbnRTdGVwKDApO1xuXHRcdGlmIChpbmRleCAhPSAxKSB7XG5cdFx0XHRhcHAubXlWaWV3TW9kZWwucGVvcGxlLnNob3dEZXRhaWxzKGZhbHNlKTtcblx0XHR9XG5cdFx0aGVhZGVyLmNsb3NlKCk7XG5cdH1cblxuXHRoZWFkZXIuY2xvc2UgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoaGVhZGVyLmlzT3BlbigpKSB7XG5cdFx0XHRoZWFkZXIuaXNEcmFnZ2luZyh0cnVlKTtcblxuXHRcdFx0JCgnI2hlYWRlcicpLmFuaW1hdGUoe1xuXHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdH0sIDI1MCwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGhlYWRlci5pc0RyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0aGVhZGVyLmlzT3BlbihmYWxzZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRoZWFkZXIubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aGVhZGVyLmlzT3BlbihmYWxzZSk7XG5cdFx0aGVhZGVyLmlzTW9kYWwoZmFsc2UpO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5hdXRoLmxvZ291dCgpO1xuXHR9XG5cblx0aGVhZGVyLmRyYWdNZW51ID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoaGVhZGVyLmlzRHJhZ2dpbmcoKSkge1xuXHRcdFx0dmFyIGRlbHRhID0gTWF0aC5jZWlsKGV2ZW50Lmdlc3R1cmUuZGVsdGFZKTtcblx0XHRcdHZhciBjaGFuZ2UgPSBoZWFkZXIuZHJhZ1N0YXJ0WSgpICsgZGVsdGE7XG5cdFx0XHRcblx0XHRcdGlmIChjaGFuZ2UgPCAwKSBjaGFuZ2UgPSAwO1xuXHRcdFx0aWYgKGNoYW5nZSA+IGhlYWRlci5tYXhIZWlnaHQpIGNoYW5nZSA9IGhlYWRlci5tYXhIZWlnaHQ7XG5cblx0XHRcdGlmIChjaGFuZ2UgPiAwICYmIGNoYW5nZSA8IGhlYWRlci5tYXhIZWlnaHQpIHtcblx0XHRcdFx0JCgnI2hlYWRlcicpLmNzcygnbWFyZ2luLXRvcCcsIGNoYW5nZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aGVhZGVyLmRyYWdNZW51U3RhcnQgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmICghaGVhZGVyLmlzRHJhZ2dpbmcoKSkge1xuXHRcdFx0aGVhZGVyLmlzRHJhZ2dpbmcodHJ1ZSk7XG5cdFx0XHRoZWFkZXIuZHJhZ1N0YXJ0WShwYXJzZUludCgkKCcjaGVhZGVyJykuY3NzKCdtYXJnaW4tdG9wJykpKTtcblx0XHRcdCQoJyNoZWFkZXInKS5vbmUoJ2RyYWdlbmQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHR2YXIgZW5kSGVpZ2h0ID0gcGFyc2VJbnQoJCgnI2hlYWRlcicpLmNzcygnbWFyZ2luLXRvcCcpKTtcblx0XHRcdFx0aWYgKGVuZEhlaWdodCA+PSBoZWFkZXIubWF4SGVpZ2h0IC8gMikge1xuXHRcdFx0XHRcdGhlYWRlci5pc09wZW4odHJ1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aGVhZGVyLmlzT3BlbihmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0JCgnI2hlYWRlcicpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdG1hcmdpblRvcDogaGVhZGVyLmlzT3BlbigpID8gaGVhZGVyLm1heEhlaWdodCA6IDBcblx0XHRcdFx0fSwgMTAwLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRoZWFkZXIuaXNEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyOyIsIi8qKlxuICogc2NyaXB0cy9ub3Rlcy5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBOb3RlcyhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBub3RlcyA9IGFwcC5teVZpZXdNb2RlbC5ub3RlcyA9IHt9O1xuXHRub3Rlcy5zdGF0dXNPcHRpb25zID0ga28ub2JzZXJ2YWJsZUFycmF5KFtcblx0XHR7XG5cdFx0XHRsYWJlbDogJ0JyaW5nIG9uIHRoZSB3b3JrJyxcblx0XHRcdHZhbHVlOiAwLFxuXHRcdFx0aWNvbjogJ2ZhIGZhLWFycm93LWRvd24nXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRsYWJlbDogJ0lcXCdtIGEgbGl0dGxlIGxpZ2h0Jyxcblx0XHRcdHZhbHVlOiAxLFxuXHRcdFx0aWNvbjogJ2ZhIGZhLW1pbnVzJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bGFiZWw6ICdJXFwnbSBnb29kJyxcblx0XHRcdHZhbHVlOiAyLFxuXHRcdFx0aWNvbjogJ2ZhIGZhLWFycm93LXJpZ2h0J1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bGFiZWw6ICdJXFwnbSBhIGJpdCBvdmVyd2hlbG1lZCcsXG5cdFx0XHR2YWx1ZTogMyxcblx0XHRcdGljb246ICdmYSBmYS1taW51cydcblx0XHR9LFxuXHRcdHtcblx0XHRcdGxhYmVsOiAnU3RvcCB0aGUgbWFkbmVzcyEnLFxuXHRcdFx0dmFsdWU6IDQsXG5cdFx0XHRpY29uOiAnZmEgZmEtYXJyb3ctdXAnXG5cdFx0fVxuXHRdKTtcblxuXHRub3Rlcy5zZWxlY3RTdGF0dXMgPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0YXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLndlZWtzKClbYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLmFjdGl2ZVdlZWsoKV0ucmF0aW5nKGl0ZW0udmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBOb3RlczsiLCIvKipcbiAqIHNjcmlwdHMvcGVvcGxlLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFBlb3BsZShhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBwZW9wbGUgPSBhcHAubXlWaWV3TW9kZWwucGVvcGxlID0ge307XG5cblx0cGVvcGxlLm51bVdlZWtzID0gMztcblx0cGVvcGxlLnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0cGVvcGxlLmFjdGl2ZVdlZWsgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRwZW9wbGUuYWN0aXZlUGVyc29uID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRwZW9wbGUudmlld1R5cGUgPSBrby5vYnNlcnZhYmxlKCdob3VycycpO1xuXHRwZW9wbGUuc2hvd0RldGFpbHMgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0cGVvcGxlLnRpbWVzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHBlb3BsZS53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0cGVvcGxlLmRyYWdTdGFydCA9IGtvLm9ic2VydmFibGUoMCk7XG5cblx0cGVvcGxlLmdldFRpbWVzID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRhdGVzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0ZGF0ZXMucHVzaChtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ1lZWVksIE0sIEQnKSk7XG5cdFx0XHRwZW9wbGUud2Vla3MoKVtpXS5kYXRlKG1vbWVudChwZW9wbGUudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnTU1NIEQnKSk7XG5cdFx0fVxuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0VGltZXMnLCB7XG5cdFx0XHRkYXRlczogZGF0ZXNcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih0aW1lcykge1xuXHRcdFx0XHRwZW9wbGUudGltZXMoW10pO1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHRpbWVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0dGltZXNbal0uYXR0cmlidXRlcy5kYXRhID0gJC5wYXJzZUpTT04odGltZXNbal0uYXR0cmlidXRlcy5kYXRhKTtcblx0XHRcdFx0XHR2YXIgdG90YWwgPSBfKHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YS5wcm9qZWN0cykucmVkdWNlKGZ1bmN0aW9uKGFjYywgb2JqKSB7XG5cdFx0XHRcdFx0XHRfKG9iaikuZWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7IGFjY1trZXldID0gKGFjY1trZXldID8gYWNjW2tleV0gOiAwKSArIHZhbHVlIH0pO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdFx0XHR9LCB7fSk7XG5cdFx0XHRcdFx0dGltZXNbal0uYXR0cmlidXRlcy50b3RhbCA9IGtvLm9ic2VydmFibGUodG90YWwucGVyY2VudGFnZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0XHRcdHZhciB3ZWVrRGF0ZSA9IG1vbWVudChwZW9wbGUudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpO1xuXHRcdFx0XHRcdHZhciB3ZWVrID0gXy5maWx0ZXIodGltZXMsIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9iai5hdHRyaWJ1dGVzLmRhdGEuZGF0ZSA9PSB3ZWVrRGF0ZTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdF8uc29ydEJ5KHdlZWssIGZ1bmN0aW9uKG9iail7IHJldHVybiBvYmouYXR0cmlidXRlcy50b3RhbDsgfSk7XG5cblx0XHRcdFx0XHRwZW9wbGUudGltZXMucHVzaCh3ZWVrKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0cGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0cGVvcGxlLmRyYWdTdGFydCgwKTtcblx0XHRcdFx0JCgnI3Blb3BsZSAucGVvcGxlJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cGVvcGxlLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBlb3BsZS5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHR2YXIgd2VlayA9IHtcblx0XHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ01NTSBEJykpXG5cdFx0XHR9XG5cdFx0XHRwZW9wbGUud2Vla3MucHVzaCh3ZWVrKTtcblx0XHR9XG5cdFx0cGVvcGxlLmdldFRpbWVzKCk7XG5cdH1cblxuXHRwZW9wbGUuc2VsZWN0V2VlayA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0cGVvcGxlLmFjdGl2ZVdlZWsoaW5kZXgpO1xuXHRcdC8vIGdvIGdldCB0aGUgZGF0YSBmb3IgdGhpcyB3ZWVrXG5cdH1cblxuXHRwZW9wbGUudG9nZ2xlVmlldyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChwZW9wbGUudmlld1R5cGUoKSA9PSAnaG91cnMnKSB7XG5cdFx0XHRwZW9wbGUudmlld1R5cGUoJ3BlcmNlbnQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGVvcGxlLnZpZXdUeXBlKCdob3VycycpO1xuXHRcdH1cblx0fVxuXG5cdHBlb3BsZS5nb1RvUGVyc29uID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdHBlb3BsZS5hY3RpdmVQZXJzb24oaXRlbSk7XG5cdFx0cGVvcGxlLnNob3dEZXRhaWxzKHRydWUpO1xuXHR9XG5cblx0cGVvcGxlLmRyYWdSZWZyZXNoID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAocGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgcGVvcGxlLmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHZhciB0b3AgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKTtcblx0XHRcdHZhciBkZWx0YSA9IE1hdGguZmxvb3IoZXZlbnQuZ2VzdHVyZS5kaXN0YW5jZSk7XG5cdFx0XHRpZiAodG9wID09IDAgJiYgZGVsdGEgPiAzMCkge1xuXHRcdFx0XHRpZiAoZGVsdGEgPiAxNTApIGRlbHRhID0gMTUwO1xuXHRcdFx0XHQkKCcjcGVvcGxlIC5wZW9wbGUnKS5jc3MoJ21hcmdpbi10b3AnLCBkZWx0YSAtIDMwKTtcblx0XHRcdFx0aWYgKGRlbHRhID49IDEwMCkge1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS11cFwiPjwvc3Bhbj5SZWxlYXNlIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHBlb3BsZS5zdGFydFJlZnJlc2hEcmFnID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoIXBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZygpICYmICFhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmlzT3BlbigpICYmIHBlb3BsZS5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHRwZW9wbGUuZHJhZ1N0YXJ0KCQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpKTtcblx0XHRcdHBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZyh0cnVlKTtcblx0XHRcdCQoZXZlbnQuZ2VzdHVyZS50YXJnZXQpLm9uZSgnZHJhZ2VuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdHZhciBkZWx0YSA9IHBhcnNlSW50KCQoJyNwZW9wbGUgLnBlb3BsZScpLmNzcygnbWFyZ2luLXRvcCcpKTtcblx0XHRcdFx0aWYgKGRlbHRhID49IDcwKSB7XG5cdFx0XHRcdFx0cGVvcGxlLmdldFRpbWVzKCk7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmYS1zcGluXCI+PC9zcGFuPlJlZnJlc2hpbmcuLi4nKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5wZW9wbGUnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXG5cdH1cblxuXHRwZW9wbGUuaW5pdCgpO1xuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBlb3BsZTsiLCIvKipcbiAqIHNjcmlwdHMvcmF0ZS13ZWVrLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFJhdGVXZWVrKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHJhdGVXZWVrID0gYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrID0ge307XG5cblx0cmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVggPSBrby5vYnNlcnZhYmxlKCk7XG5cdHJhdGVXZWVrLnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cmF0ZVdlZWsudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRyYXRlV2Vlay5yZWdpc3RlclJhdGlvID0ga28ub2JzZXJ2YWJsZSgkKGRvY3VtZW50KS53aWR0aCgpIC0gMjApO1xuXHRyYXRlV2Vlay5hY3RpdmVXZWVrID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cmF0ZVdlZWsudmlld1R5cGUgPSBrby5vYnNlcnZhYmxlKCdob3VycycpO1xuXG5cdHJhdGVXZWVrLndlZWtzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtcblx0XHR7XG5cdFx0XHRkYXRlOiBrby5vYnNlcnZhYmxlKG1vbWVudChyYXRlV2Vlay50b2RheSkuZm9ybWF0KCdNTU0gRCcpKSxcblx0XHRcdHRvdGFsOiBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN1bSA9IF8ucmVkdWNlKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG1lbW8sIHByb2plY3QpIHtcblx0XHRcdFx0XHR2YXIgY29sVmFsdWUgPSAwO1xuXHRcdFx0XHRcdGlmIChwcm9qZWN0LmF0dHJpYnV0ZXMuYWN0aXZlKCkpIHtcblx0XHRcdFx0XHRcdGNvbFZhbHVlID0gcHJvamVjdC5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVswXS52YWx1ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gbWVtbyArIGNvbFZhbHVlOyBcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdHJldHVybiBzdW07XG5cdFx0XHR9KSxcblx0XHRcdHJhdGluZzoga28ub2JzZXJ2YWJsZSgyKSxcblx0XHRcdG5vdGVzOiBrby5vYnNlcnZhYmxlKG51bGwpXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRkYXRlOiBrby5vYnNlcnZhYmxlKG1vbWVudChyYXRlV2Vlay50b2RheSkuYWRkKCdkYXlzJywgNykuZm9ybWF0KCdNTU0gRCcpKSxcblx0XHRcdHRvdGFsOiBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN1bSA9IF8ucmVkdWNlKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG1lbW8sIHByb2plY3QpIHtcblx0XHRcdFx0XHR2YXIgY29sVmFsdWUgPSAwO1xuXHRcdFx0XHRcdGlmIChwcm9qZWN0LmF0dHJpYnV0ZXMuYWN0aXZlKCkpIHtcblx0XHRcdFx0XHRcdGNvbFZhbHVlID0gcHJvamVjdC5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVsxXS52YWx1ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gbWVtbyArIGNvbFZhbHVlOyBcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdHJldHVybiBzdW07XG5cdFx0XHR9KSxcblx0XHRcdHJhdGluZzoga28ub2JzZXJ2YWJsZSgyKSxcblx0XHRcdG5vdGVzOiBrby5vYnNlcnZhYmxlKG51bGwpXG5cdFx0fSxcblx0XHR7ICBcblx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHJhdGVXZWVrLnRvZGF5KS5hZGQoJ2RheXMnLCAxNCkuZm9ybWF0KCdNTU0gRCcpKSxcblx0XHRcdHRvdGFsOiBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN1bSA9IF8ucmVkdWNlKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG1lbW8sIHByb2plY3QpIHtcblx0XHRcdFx0XHR2YXIgY29sVmFsdWUgPSAwO1xuXHRcdFx0XHRcdGlmIChwcm9qZWN0LmF0dHJpYnV0ZXMuYWN0aXZlKCkpIHtcblx0XHRcdFx0XHRcdGNvbFZhbHVlID0gcHJvamVjdC5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVsyXS52YWx1ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gbWVtbyArIGNvbFZhbHVlOyBcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdHJldHVybiBzdW07XG5cdFx0XHR9KSxcblx0XHRcdHJhdGluZzoga28ub2JzZXJ2YWJsZSgyKSxcblx0XHRcdG5vdGVzOiBrby5vYnNlcnZhYmxlKG51bGwpXG5cdFx0fVxuXHRdKTtcblxuXHRyYXRlV2Vlay5kcmFnID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHR2YXIgZGlyZWN0aW9uID0gZXZlbnQuZ2VzdHVyZS5kaXJlY3Rpb247XG5cdFx0aWYgKCFhcHAubXlWaWV3TW9kZWwucGVvcGxlLnNob3dEZXRhaWxzKCkgJiYgKGRpcmVjdGlvbiA9PSAnbGVmdCcgfHwgZGlyZWN0aW9uID09ICdyaWdodCcpKSB7XG5cdFx0XHR2YXIgc3RhcnRYID0gZXZlbnQuZ2VzdHVyZS5zdGFydEV2ZW50LmNlbnRlci5wYWdlWDtcblx0XHRcdGlmIChyYXRlV2Vlay5yZWdpc3Rlck1vdXNlWCgpICE9IHN0YXJ0WCkge1xuXHRcdFx0XHRyYXRlV2Vlay5yZWdpc3Rlck1vdXNlWChzdGFydFgpO1xuXHRcdFx0XHRyYXRlV2Vlay5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZShpdGVtLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpW3JhdGVXZWVrLmFjdGl2ZVdlZWsoKV0udmFsdWUoKSk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgZGlmZiA9IChldmVudC5nZXN0dXJlLmRlbHRhWCAvIHJhdGVXZWVrLnJlZ2lzdGVyUmF0aW8oKSkgKiAxNTA7XG5cdFx0XHR2YXIgbmV3UGVyY2VudGFnZSA9IE1hdGguZmxvb3IoKGRpZmYgKyByYXRlV2Vlay5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZSgpKSAvIDUpICogNTtcblxuXHRcdFx0aWYgKG5ld1BlcmNlbnRhZ2UgPiAwICYmIG5ld1BlcmNlbnRhZ2UgPD0gMTUwKSB7XG5cdFx0XHRcdGl0ZW0uYXR0cmlidXRlcy5wZXJjZW50YWdlKClbcmF0ZVdlZWsuYWN0aXZlV2VlaygpXS52YWx1ZShuZXdQZXJjZW50YWdlKTtcblx0XHRcdH0gZWxzZSBpZiAobmV3UGVyY2VudGFnZSA+IDE1MCkge1xuXHRcdFx0XHRpdGVtLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpW3JhdGVXZWVrLmFjdGl2ZVdlZWsoKV0udmFsdWUoMTUwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGl0ZW0uYXR0cmlidXRlcy5wZXJjZW50YWdlKClbcmF0ZVdlZWsuYWN0aXZlV2VlaygpXS52YWx1ZSgwKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyYXRlV2Vlay5zZWxlY3RXZWVrID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRyYXRlV2Vlay5hY3RpdmVXZWVrKGluZGV4KTtcblx0fVxuXG5cdHJhdGVXZWVrLnRha2VQaWN0dXJlID0gZnVuY3Rpb24oKSB7XG5cdFx0bmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKHJhdGVXZWVrLnNldFBpY3R1cmUsIGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gZmFpbFxuXHRcdFx0YWxlcnQoJ09vcHMuIFdlIGNvdWxkblxcJ3QgYWNjZXNzIHlvdXIgY2FtZXJhLicpO1xuXHRcdH0sIHsgXG5cdFx0XHRxdWFsaXR5OiAxMDAsIFxuXHRcdFx0YWxsb3dFZGl0OiB0cnVlLCBcblx0XHRcdGRlc3RpbmF0aW9uVHlwZTogbmF2aWdhdG9yLmNhbWVyYS5EZXN0aW5hdGlvblR5cGUuREFUQV9VUkwsXG5cdFx0XHRlbmNvZGluZ1R5cGU6IENhbWVyYS5FbmNvZGluZ1R5cGUuUE5HLFxuXHRcdFx0dGFyZ2V0V2lkdGg6IDEwMCxcblx0XHRcdHRhcmdldEhlaWdodDogMTAwLFxuXHRcdFx0Y29ycmVjdE9yaWVudGF0aW9uOiB0cnVlLFxuXHRcdFx0Y2FtZXJhRGlyZWN0aW9uOiBDYW1lcmEuRGlyZWN0aW9uLkZST05UXG5cdFx0fSk7XG5cdH1cblxuXHRyYXRlV2Vlay5zZXRQaWN0dXJlID0gZnVuY3Rpb24oaW1hZ2VEYXRhKSB7XG5cdFx0JCgnLmF2YXRhcicpLnJlbW92ZUNsYXNzKCdmYS1jYW1lcmEnKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwnICsgaW1hZ2VEYXRhICsgJyknKTtcblx0XHRQYXJzZS5DbG91ZC5ydW4oJ3VwZGF0ZUF2YXRhcicsIHtcblx0XHRcdGF2YXRhcjogaW1hZ2VEYXRhXG5cdFx0fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRhbGVydCgnQXZhdGFyIHN1Y2Nlc3NmdWxseSBzYXZlZC4nKVxuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdCQoJy5hdmF0YXInKS5hZGRDbGFzcygnZmEtY2FtZXJhJyk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdPb3BzLiBXZSBtZXNzZWQgdXAuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRyYXRlV2Vlay50b2dnbGVWaWV3ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHJhdGVXZWVrLnZpZXdUeXBlKCkgPT0gJ2hvdXJzJykge1xuXHRcdFx0cmF0ZVdlZWsudmlld1R5cGUoJ3BlcmNlbnQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmF0ZVdlZWsudmlld1R5cGUoJ2hvdXJzJyk7XG5cdFx0fVxuXHR9XG5cblx0cmF0ZVdlZWsuZ29CYWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ2dvIGJhY2snKVxuXHRcdGFwcC5teVZpZXdNb2RlbC5wZW9wbGUuc2hvd0RldGFpbHMoZmFsc2UpO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5oZWFkZXIuZ29Ub1BhZ2UoMSk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSYXRlV2VlazsiLCIvKipcbiAqIHNjcmlwdHMvc2F2ZS5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTYXZlKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHNhdmUgPSBhcHAubXlWaWV3TW9kZWwuc2F2ZSA9IHt9O1xuXG5cdHNhdmUuc2F2ZU1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2F2ZS5zdWNjZXNzID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNhdmUuZXJyb3IgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2F2ZS5zYXZpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXHRzYXZlLnJlc3VsdCA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRzYXZlLmRvbmUgPSBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHR2YXIgZG9uZSA9IGZhbHNlO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2F2ZS5yZXN1bHQubGVuZ3RoOyBpKyspIHtcblx0XHRcdGRvbmUgPSBkb25lIHx8IHNhdmUucmVzdWx0W2ldO1xuXHRcdH1cblx0XHRyZXR1cm4gZG9uZTtcblx0fSk7XG5cblx0c2F2ZS5zdWJtaXQgPSBmdW5jdGlvbigpIHtcblx0XHRzYXZlLnNhdmVNb2RlKHRydWUpO1xuXHRcdHNhdmUuc2F2aW5nKHRydWUpO1xuXHRcdHZhciB0ZW1wID0ge307XG5cdFx0dmFyIGN1cldlZWs7XG5cdFx0dmFyIG51bVdlZWtzID0gYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLndlZWtzKCkubGVuZ3RoO1xuXHRcdHZhciBwcm9qZWN0cyA9IF8uZmlsdGVyKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0cmV0dXJuIG9iai5hdHRyaWJ1dGVzLmFjdGl2ZSgpO1xuXHRcdH0pO1xuXHRcdHZhciBudW1Qcm9qZWN0cyA9IHByb2plY3RzLmxlbmd0aDtcblx0XHR2YXIgdG9kYXkgPSBhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsudG9kYXk7XG5cdFx0dmFyIHRlbXBQcm9qZWN0ID0ge307XG5cdFx0dmFyIGRvbmUgPSAwO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBudW1XZWVrczsgaSsrKSB7XG5cdFx0XHRjdXJXZWVrID0gYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLndlZWtzKClbaV07XG5cdFx0XHR0ZW1wID0ge1xuXHRcdFx0XHRkYXRlOiBtb21lbnQodG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpLFxuXHRcdFx0XHRyYXRpbmc6IGN1cldlZWsucmF0aW5nKCksXG5cdFx0XHRcdG5vdGVzOiBjdXJXZWVrLm5vdGVzKClcblx0XHRcdH07XG5cblx0XHRcdHZhciB0ZW1wUHJvamVjdHMgPSBbXTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgbnVtUHJvamVjdHM7IGorKykge1xuXHRcdFx0XHR0ZW1wUHJvamVjdCA9IHtcblx0XHRcdFx0XHRpZDogcHJvamVjdHNbal0uaWQsXG5cdFx0XHRcdFx0cGVyY2VudGFnZTogcHJvamVjdHNbal0uYXR0cmlidXRlcy5wZXJjZW50YWdlKClbaV0udmFsdWUoKVxuXHRcdFx0XHR9XG5cdFx0XHRcdHRlbXBQcm9qZWN0cy5wdXNoKHRlbXBQcm9qZWN0KTtcblx0XHRcdH1cblx0XHRcdHRlbXAucHJvamVjdHMgPSB0ZW1wUHJvamVjdHM7XG5cblx0XHRcdFBhcnNlLkNsb3VkLnJ1bignc2F2ZVRpbWUnLCB7XG5cdFx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KHRlbXApLFxuXHRcdFx0XHRkYXRlOiB0ZW1wLmRhdGVcblx0XHRcdH0sIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdGRvbmUgPSBkb25lKzE7XG5cdFx0XHRcdFx0aWYgKGRvbmUgPj0gbnVtV2Vla3MgJiYgc2F2ZS5zYXZpbmcoKSkge1xuXHRcdFx0XHRcdFx0c2F2ZS5zdWNjZXNzKHRydWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHRcdHNhdmUuZXJyb3IodHJ1ZSk7XG5cdFx0XHRcdFx0c2F2ZS5yZXNldCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRzYXZlLnRyeUFnYWluID0gZnVuY3Rpb24oKSB7XG5cdFx0c2F2ZS5lcnJvcihmYWxzZSk7XG5cdFx0c2F2ZS5zdWNjZXNzKGZhbHNlKTtcblx0XHRzYXZlLnN1Ym1pdCgpO1xuXHR9XG5cblx0c2F2ZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHRcdHNhdmUuc2F2aW5nKGZhbHNlKTtcblx0XHRzYXZlLnNhdmVNb2RlKGZhbHNlKTtcblx0XHRzYXZlLmVycm9yKGZhbHNlKTtcblx0XHRzYXZlLnN1Y2Nlc3MoZmFsc2UpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2F2ZTsiLCIvKipcbiAqIHNjcmlwdHMvc2VsZWN0LXByb2plY3QuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gU2VsZWN0UHJvamVjdChhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBzZWxlY3RQcm9qZWN0ID0gYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QgPSB7fTtcblxuXHRzZWxlY3RQcm9qZWN0LnZpZXdUeXBlID0ga28ub2JzZXJ2YWJsZSgnYWxsJyk7XG5cdHNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC5pc0FkZE1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2VsZWN0UHJvamVjdC51bmlxdWVDb21wYW55TmFtZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0ID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2VsZWN0UHJvamVjdC5kcmFnU3RhcnQgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRzZWxlY3RQcm9qZWN0LmNvdW50ID0ga28ub2JzZXJ2YWJsZSgwKTtcblxuXHRzZWxlY3RQcm9qZWN0LmdldFByb2plY3RzID0gZnVuY3Rpb24oKSB7XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRQcm9qZWN0cycsIHt9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0cykge1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKFtdKTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9qZWN0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHByb2plY3RzW2ldLmF0dHJpYnV0ZXMuYWN0aXZlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdFx0XHRcdFx0cHJvamVjdHNbaV0uYXR0cmlidXRlcy5wZXJjZW50YWdlID0ga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSk7XG5cdFx0XHRcdFx0c2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cy5wdXNoKHByb2plY3RzW2ldKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgwKTtcblx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5hbGwtcHJvamVjdHMnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0fSwgMTAwKTtcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFVuaXF1ZUNvbXBhbnlOYW1lcycsIHt9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0cykge1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LnVuaXF1ZUNvbXBhbnlOYW1lcyhwcm9qZWN0cyk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0c2VsZWN0UHJvamVjdC5nZXRQcm9qZWN0cygpO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC50b2dnbGVQcm9qZWN0ID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoaXRlbS5hdHRyaWJ1dGVzLmFjdGl2ZSgpKSB7XG5cdFx0XHRpdGVtLmF0dHJpYnV0ZXMuYWN0aXZlKGZhbHNlKTtcblx0XHRcdHNlbGVjdFByb2plY3QuY291bnQoc2VsZWN0UHJvamVjdC5jb3VudCgpIC0gMSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGl0ZW0uYXR0cmlidXRlcy5hY3RpdmUodHJ1ZSk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmNvdW50KHNlbGVjdFByb2plY3QuY291bnQoKSArIDEpO1xuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3QudG9nZ2xlQWRkTW9kZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChzZWxlY3RQcm9qZWN0LmlzQWRkTW9kZSgpKSB7XG5cdFx0XHRhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmlzTW9kYWwoZmFsc2UpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5pc0FkZE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmlzTW9kYWwodHJ1ZSk7XG5cdFx0XHQkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS52YWwoJycpO1xuXHRcdFx0JCgnLnByb2plY3QtbmFtZS1maWVsZCcpLnZhbCgnJyk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QoW10pO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5pc0FkZE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC50b2dnbGVWaWV3ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHNlbGVjdFByb2plY3Qudmlld1R5cGUoKSA9PSAnYWxsJykge1xuXHRcdFx0c2VsZWN0UHJvamVjdC52aWV3VHlwZSgnc2VsZWN0ZWQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c2VsZWN0UHJvamVjdC52aWV3VHlwZSgnYWxsJyk7XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zZWxlY3RQcm9qZWN0VHlwZWFoZWFkID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdCQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLnZhbChpdGVtKTtcblx0XHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QoW10pO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zaG93VHlwZWFoZWFkUmVzdWx0cyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0dmFyIG5lZWRsZSA9IGV2ZW50LnRhcmdldC52YWx1ZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teXFx3XFxkXS9naSwgJycpO1xuXG5cdFx0aWYgKG5lZWRsZS5sZW5ndGggPiAwKSB7XG5cdFx0XHR2YXIgZmlsdGVyZWRQcm9qZWN0cyA9IF8uZmlsdGVyKHNlbGVjdFByb2plY3QudW5pcXVlQ29tcGFueU5hbWVzKCksIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHR2YXIgaGF5c3RhY2sgPSBvYmoudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXlxcd1xcZF0vZ2ksICcnKTtcblx0XHRcdFx0cmV0dXJuIGhheXN0YWNrLmluZGV4T2YobmVlZGxlKSA+PSAwOyBcblx0XHRcdH0pO1xuXHRcdFx0dmFyIGZpZWxkUG9zaXRpb24gPSAkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS5vZmZzZXQoKTtcblx0XHRcdCQoJy5wcm9qZWN0LXR5cGVhaGVhZCcpLmNzcygnbGVmdCcsIGZpZWxkUG9zaXRpb24ubGVmdCkuY3NzKCd0b3AnLCBmaWVsZFBvc2l0aW9uLnRvcCArICQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLmhlaWdodCgpKzIwKTtcblx0XHRcdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdChmaWx0ZXJlZFByb2plY3RzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KFtdKTtcblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnNhdmVOZXdQcm9qZWN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRjb21wYW55OiAkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS52YWwoKSxcblx0XHRcdHByb2plY3Q6ICQoJy5wcm9qZWN0LW5hbWUtZmllbGQnKS52YWwoKSxcblx0XHR9XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdzYXZlUHJvamVjdCcsIGRhdGEsIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHByb2plY3QpIHtcblx0XHRcdFx0YWxlcnQoJ1wiJyArIHByb2plY3QuYXR0cmlidXRlcy5jb21wYW55ICsgJzogJyArIHByb2plY3QuYXR0cmlidXRlcy5uYW1lICsgJ1wiIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5LicpO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LnRvZ2dsZUFkZE1vZGUoKTtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC5nZXRQcm9qZWN0cygpO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdC8vIGFsZXJ0KGVycm9yKVxuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XHRcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuZHJhZ1JlZnJlc2ggPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmIChzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nKCkgJiYgc2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHR2YXIgdG9wID0gJChkb2N1bWVudCkuc2Nyb2xsVG9wKCk7XG5cdFx0XHR2YXIgZGVsdGEgPSBNYXRoLmZsb29yKGV2ZW50Lmdlc3R1cmUuZGlzdGFuY2UpO1xuXHRcdFx0aWYgKHRvcCA9PSAwICYmIGRlbHRhID4gMzApIHtcblx0XHRcdFx0aWYgKGRlbHRhID4gMTUwKSBkZWx0YSA9IDE1MDtcblx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5hbGwtcHJvamVjdHMnKS5jc3MoJ21hcmdpbi10b3AnLCBkZWx0YSAtIDMwKTtcblx0XHRcdFx0aWYgKGRlbHRhID49IDEwMCkge1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLXVwXCI+PC9zcGFuPlJlbGVhc2UgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnN0YXJ0UmVmcmVzaERyYWcgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmICghc2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZygpICYmICFhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmlzT3BlbigpICYmIHNlbGVjdFByb2plY3QuZHJhZ1N0YXJ0KCkgPT0gMCkge1xuXHRcdFx0c2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZyh0cnVlKTtcblx0XHRcdCQoZXZlbnQuZ2VzdHVyZS50YXJnZXQpLm9uZSgnZHJhZ2VuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHZhciBkZWx0YSA9IHBhcnNlSW50KCQoJyNzZWxlY3QtcHJvamVjdCAuYWxsLXByb2plY3RzJykuY3NzKCdtYXJnaW4tdG9wJykpO1xuXG5cdFx0XHRcdGlmIChkZWx0YSA+PSA3MCkge1xuXHRcdFx0XHRcdHNlbGVjdFByb2plY3QuZ2V0UHJvamVjdHMoKTtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpblwiPjwvc3Bhbj5SZWZyZXNoaW5nLi4uJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0XHRzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0XHRzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgwKTtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLmFsbC1wcm9qZWN0cycpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdFx0fSwgMTAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9XG5cblx0fVxuXG5cdHNlbGVjdFByb2plY3QuaW5pdCgpO1xuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdFByb2plY3Q7IiwiLyoqXG4gKiBzY3JpcHRzL3N0ZXBzLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFN0ZXBzKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHN0ZXBzID0gYXBwLm15Vmlld01vZGVsLnN0ZXBzID0ge307XG5cblx0c3RlcHMuY3VycmVudFN0ZXAgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRzdGVwcy5jaGFuZ2luZyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzdGVwcy5zdGVwcyA9IGtvLm9ic2VydmFibGVBcnJheShbXG5cdFx0e1xuXHRcdFx0c3RlcE51bWJlcjogMCxcblx0XHRcdHN0ZXBOYW1lOiAnc2VsZWN0UHJvamVjdCdcblx0XHR9LFxuXHRcdHtcblx0XHRcdHN0ZXBOdW1iZXI6IDEsXG5cdFx0XHRzdGVwTmFtZTogJ3JhdGVXZWVrJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0c3RlcE51bWJlcjogMixcblx0XHRcdHN0ZXBOYW1lOiAnbm90ZXMnXG5cdFx0fVxuXHRdKTtcblxuXHRzdGVwcy5jaGFuZ2VTdGVwID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdGlmICghc3RlcHMuY2hhbmdpbmcoKSAmJiBhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5jb3VudCgpID4gMCkge1xuXHRcdFx0c3RlcHMuY2hhbmdpbmcodHJ1ZSk7XG5cdFx0XHRhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmNsb3NlKCk7XG5cdFx0XHRzdGVwcy5jdXJyZW50U3RlcChpdGVtLnN0ZXBOdW1iZXIpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0c3RlcHMuY2hhbmdpbmcoZmFsc2UpO1xuXHRcdFx0fSwgNTAwKTtcblx0XHR9XG5cdH1cblxuXHRzdGVwcy5uZXh0U3RlcCA9IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuXHRcdGlmICghc3RlcHMuY2hhbmdpbmcoKSAmJiBhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5jb3VudCgpID4gMCkge1xuXHRcdFx0c3RlcHMuY2hhbmdpbmcodHJ1ZSk7XG5cdFx0XHRhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmNsb3NlKCk7XG5cdFx0XHRzdGVwcy5jdXJyZW50U3RlcChzdGVwcy5jdXJyZW50U3RlcCgpICsgZGlyZWN0aW9uKTtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHN0ZXBzLmNoYW5naW5nKGZhbHNlKTtcblx0XHRcdH0sIDUwMCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RlcHM7Il19
