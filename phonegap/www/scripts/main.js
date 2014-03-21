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
		} else {
			item.attributes.active(true);
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
		if (!steps.changing()) {
			steps.changing(true);
			app.myViewModel.header.close();
			steps.currentStep(item.stepNumber);
			setTimeout(function() {
				steps.changing(false);
			}, 500);
		}
	}

	steps.nextStep = function(direction) {
		if (!steps.changing()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvYXV0aC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvZmFrZV83NGNjMjc5MS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvaGVhZGVyLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ub3Rlcy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcGVvcGxlLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9yYXRlLXdlZWsuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3NhdmUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3NlbGVjdC1wcm9qZWN0LmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zdGVwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogc2NyaXB0cy9hcHAuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQXBwKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0Ly8gaW5pdGlhbGl6ZSBrbm9ja291dFxuXHRzZWxmLm15Vmlld01vZGVsID0ge307XG5cblx0c2VsZi5teVZpZXdNb2RlbC5jdXJyZW50VXNlciA9IGtvLm9ic2VydmFibGUobnVsbCk7XG5cblx0c2VsZi5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZGV2aWNlcmVhZHknLCBzZWxmLm9uRGV2aWNlUmVhZHksIGZhbHNlKTtcblx0fVxuXG5cdHNlbGYub25EZXZpY2VSZWFkeSA9IGZ1bmN0aW9uKCkge1xuXHRcdGtvLmFwcGx5QmluZGluZ3Moc2VsZi5teVZpZXdNb2RlbCk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdGlmIChuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuKSB7XG5cdFx0XHRcdG5hdmlnYXRvci5zcGxhc2hzY3JlZW4uaGlkZSgpO1xuXHRcdFx0fVxuXHRcdH0sIDIwMDApO1xuXHRcdFxuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwOyIsIi8qKlxuICogc2NyaXB0cy9hdXRoLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEF1dGgoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgYXV0aCA9IGFwcC5teVZpZXdNb2RlbC5hdXRoID0ge307XG5cblx0YXV0aC5jdXJyZW50VXNlciA9IGtvLm9ic2VydmFibGUoKTtcblx0YXV0aC5lcnJvck1lc3NhZ2UgPSBrby5vYnNlcnZhYmxlKCcnKTtcblx0YXV0aC5zaWduVXBNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGF1dGguaXNBZG1pbiA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhdXRoLmZvcmdvdE1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXHR2YXIgY3VycmVudFVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcblx0aWYgKGN1cnJlbnRVc2VyKSB7XG5cdFx0YXV0aC5jdXJyZW50VXNlcihjdXJyZW50VXNlcik7XG5cdH1cblxuXHRhdXRoLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2NoZWNrQWRtaW5TdGF0dXMnLCB7fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oaXNBZG1pbikge1xuXHRcdFx0XHRhdXRoLmlzQWRtaW4oaXNBZG1pbik7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0YXV0aC5yZXNldEVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5lcnJvck1lc3NhZ2UoJycpO1xuXHR9XG5cblx0YXV0aC5zaWduSW5VcCA9IGZ1bmN0aW9uKGZvcm1FbGVtZW50KSB7XG5cdFx0Ly8ga28ucG9zdGJveC5wdWJsaXNoKCdpc0xvYWRpbmcnLCB0cnVlKTtcblx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblxuXHRcdHZhciB1c2VybmFtZSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF91c2VybmFtZV0nKS52YWwoKTtcblx0XHR2YXIgcGFzc3dvcmQgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfcGFzc3dvcmRdJykudmFsKCk7XG5cblx0XHRpZiAoYXV0aC5zaWduVXBNb2RlKCkpIHtcblx0XHRcdHZhciBlbWFpbCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9lbWFpbF0nKS52YWwoKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0dmFyIGRpc3BsYXlOYW1lID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2Rpc3BsYXlOYW1lXScpLnZhbCgpO1xuXHRcdFx0dmFyIHBhc3N3b3JkQ29uZmlybSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9jb25maXJtUGFzc3dvcmRdJykudmFsKCk7XG5cblx0XHRcdC8vIHZhbGlkYXRpb25cblx0XHRcdGlmIChlbWFpbC5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgeW91ciBlbWFpbCBhZGRyZXNzLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChkaXNwbGF5TmFtZS5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgeW91ciBmaXJzdCBhbmQgbGFzdCBuYW1lLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh1c2VybmFtZS5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgYSB1c2VybmFtZS4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocGFzc3dvcmQubGVuZ3RoIDwgMSB8fCBwYXNzd29yZENvbmZpcm0gPCAxIHx8IHBhc3N3b3JkICE9IHBhc3N3b3JkQ29uZmlybSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIGFuZCBjb25maXJtIGEgcGFzc3dvcmQuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHVzZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuXHRcdFx0dmFyIHNjcnViYmVkVXNlcm5hbWUgPSB1c2VybmFtZS5yZXBsYWNlKC9cXHMrL2csXCJcIik7IC8vcmVtb3ZlIHdoaXRlIHNwYWNlXG5cdFx0XHRzY3J1YmJlZFVzZXJuYW1lID0gc2NydWJiZWRVc2VybmFtZS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHR1c2VyLnNldCgndXNlcm5hbWUnLCBzY3J1YmJlZFVzZXJuYW1lKTtcblx0XHRcdHVzZXIuc2V0KCdwYXNzd29yZCcsIHBhc3N3b3JkKTtcblx0XHRcdHVzZXIuc2V0KCdlbWFpbCcsIGVtYWlsKTtcblx0XHRcdHVzZXIuc2V0KCdkaXNwbGF5TmFtZScsIGRpc3BsYXlOYW1lKTtcblxuXHRcdFx0Ly8gb3RoZXIgZmllbGRzIGNhbiBiZSBzZXQganVzdCBsaWtlIHdpdGggUGFyc2UuT2JqZWN0XG5cdFx0XHQvLyB1c2VyLnNldChcInBob25lXCIsIFwiNDE1LTM5Mi0wMjAyXCIpO1xuXG5cdFx0XHR1c2VyLnNpZ25VcChudWxsLCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0XHRhdXRoLmN1cnJlbnRVc2VyKHVzZXIpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCBwYXNzd29yZCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0XHRhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5pbml0KCk7XG5cdFx0XHRcdFx0aWYgKHVzZXIuYXR0cmlidXRlcy5pc0FkbWluKSB7XG5cdFx0XHRcdFx0XHRhdXRoLmlzQWRtaW4odHJ1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHQvLyBUaGUgbG9naW4gZmFpbGVkLiBDaGVjayBlcnJvciB0byBzZWUgd2h5LlxuXHRcdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguZm9yZ290ID0gZnVuY3Rpb24oZm9ybUVsZW1lbnQpIHtcblx0XHR2YXIgZW1haWwgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZm9yZ290XScpLnZhbCgpO1xuXG5cdFx0UGFyc2UuVXNlci5yZXF1ZXN0UGFzc3dvcmRSZXNldChlbWFpbCwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGF1dGguZm9yZ290TW9kZShmYWxzZSk7XG5cdFx0XHRcdCQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9mb3Jnb3RdJykudmFsKCcnKTtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBjaGVjayB5b3VyIGVtYWlsIGZvciBpbnN0cnVjdGlvbnMgb24gcmVzZXR0aW5nIHlvdXIgcGFzc3dvcmQuJyk7XG5cdFx0XHR9LFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGF1dGgubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0UGFyc2UuVXNlci5sb2dPdXQoKTtcblx0XHRhdXRoLmN1cnJlbnRVc2VyKG51bGwpO1xuXHR9XG5cblx0YXV0aC5zaG93U2lnblVwID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5lcnJvck1lc3NhZ2UoJycpO1xuXHRcdGlmIChhdXRoLnNpZ25VcE1vZGUoKSkge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGgudG9nZ2xlRm9yZ290TW9kZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChhdXRoLmZvcmdvdE1vZGUoKSkge1xuXHRcdFx0YXV0aC5mb3Jnb3RNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXV0aC5mb3Jnb3RNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguc2FuaXRpemVFcnJvcnMgPSBmdW5jdGlvbihlcnJvcikge1xuXHRcdHN3aXRjaChlcnJvci5jb2RlKVxuXHRcdHtcblx0XHRcdGNhc2UgMTAxOlxuXHRcdFx0XHRyZXR1cm4gJ1BsZWFzZSBlbnRlciBhIHZhbGlkIHVzZXJuYW1lIGFuZCBwYXNzd29yZC4nO1xuXHRcdFx0Y2FzZSAxMjQ6XG5cdFx0XHRcdHJldHVybiAnT29wcyEgV2UgbWVzc2VkIHVwLiBQbGVhc2UgdHJ5IGFnYWluLic7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gZXJyb3IubWVzc2FnZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGVycm9yLm1lc3NhZ2Uuc2xpY2UoMSkgKyAnLic7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0aDsiLCIvKipcbiAqIHNjcmlwdHMvbWFpbi5qc1xuICpcbiAqIFRoaXMgaXMgdGhlIHN0YXJ0aW5nIHBvaW50IGZvciB5b3VyIGFwcGxpY2F0aW9uLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXBwID0gcmVxdWlyZSgnLi9hcHAuanMnKTtcbnZhciBBdXRoID0gcmVxdWlyZSgnLi9hdXRoLmpzJyk7XG52YXIgU3RlcHMgPSByZXF1aXJlKCcuL3N0ZXBzLmpzJyk7XG52YXIgU2VsZWN0UHJvamVjdCA9IHJlcXVpcmUoJy4vc2VsZWN0LXByb2plY3QuanMnKTtcbnZhciBIZWFkZXIgPSByZXF1aXJlKCcuL2hlYWRlci5qcycpO1xudmFyIFJhdGVXZWVrID0gcmVxdWlyZSgnLi9yYXRlLXdlZWsuanMnKTtcbnZhciBOb3RlcyA9IHJlcXVpcmUoJy4vbm90ZXMuanMnKTtcbnZhciBQZW9wbGUgPSByZXF1aXJlKCcuL3Blb3BsZS5qcycpO1xudmFyIFNhdmUgPSByZXF1aXJlKCcuL3NhdmUuanMnKTtcblxuLy8gaW5pdGlhbGl6ZSBwYXJzZVxuUGFyc2UuaW5pdGlhbGl6ZShcIkprWU5mUEJ3MmFQZ2NjN1BlVEdITUFVMlhLdmp6ZXFWSWt5Q2xWdW9cIiwgXCI0NU9NVTNaUzNvNWMxNjhsUXhhMGlseFF1NEZkTVZIVDFOVlRrT1JsXCIpO1xuXG4vLyBpbml0aWFsaXplIHR5cGVraXRcbnRyeXtUeXBla2l0LmxvYWQoKTt9Y2F0Y2goZSl7fVxuXG52YXIgYXBwID0gbmV3IEFwcCgpO1xudmFyIGF1dGggPSBuZXcgQXV0aChhcHApO1xudmFyIHN0ZXBzID0gbmV3IFN0ZXBzKGFwcCk7XG52YXIgc2VsZWN0UHJvamVjdCA9IG5ldyBTZWxlY3RQcm9qZWN0KGFwcCk7XG52YXIgaGVhZGVyID0gbmV3IEhlYWRlcihhcHApO1xudmFyIHJhdGVXZWVrID0gbmV3IFJhdGVXZWVrKGFwcCk7XG52YXIgbm90ZXMgPSBuZXcgTm90ZXMoYXBwKTtcbnZhciBwZW9wbGUgPSBuZXcgUGVvcGxlKGFwcCk7XG52YXIgc2F2ZSA9IG5ldyBTYXZlKGFwcCk7XG5cblxuLy8gQ3VzdG9tIGtub2Nrb3V0IGV4dG5lZGVyc1xuXG4vLyBIZXJlJ3MgYSBjdXN0b20gS25vY2tvdXQgYmluZGluZyB0aGF0IG1ha2VzIGVsZW1lbnRzIHNob3duL2hpZGRlbiB2aWEgalF1ZXJ5J3MgZmFkZUluKCkvZmFkZU91dCgpIG1ldGhvZHNcbi8vIENvdWxkIGJlIHN0b3JlZCBpbiBhIHNlcGFyYXRlIHV0aWxpdHkgbGlicmFyeVxua28uYmluZGluZ0hhbmRsZXJzLmZhZGVWaXNpYmxlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gSW5pdGlhbGx5IHNldCB0aGUgZWxlbWVudCB0byBiZSBpbnN0YW50bHkgdmlzaWJsZS9oaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZVxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICBrby51bndyYXAodmFsdWUpID8gJChlbGVtZW50KS5mYWRlSW4oKSA6ICQoZWxlbWVudCkuZmFkZU91dCgpO1xuICAgIH1cbn1cblxuYXBwLmluaXRpYWxpemUoKTsiLCIvKipcbiAqIHNjcmlwdHMvaGVhZGVyLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEhlYWRlcihhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBoZWFkZXIgPSBhcHAubXlWaWV3TW9kZWwuaGVhZGVyID0ge307XG5cblx0aGVhZGVyLmFjdGl2ZVBhZ2UgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRoZWFkZXIuaXNNb2RhbCA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRoZWFkZXIuaXNPcGVuID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGhlYWRlci5pc0RyYWdnaW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGhlYWRlci5kcmFnU3RhcnRZID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0aGVhZGVyLm1heEhlaWdodCA9IDEzNTtcblx0aGVhZGVyLnBhZ2VzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtcblx0XHR7XG5cdFx0XHRkaXNwbGF5OiAnTXkgVGltZScsXG5cdFx0XHRsaW5rOiAnbXl0aW1lJyxcblx0XHRcdGljb246ICdmYSBmYS1jbG9jay1vJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0ZGlzcGxheTogJ1Blb3BsZScsXG5cdFx0XHRsaW5rOiAncGVvcGxlJyxcblx0XHRcdGljb246ICdmYSBmYS11c2Vycydcblx0XHR9XG5cdF0pO1xuXG5cdGhlYWRlci5nb1RvUGFnZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0aGVhZGVyLmFjdGl2ZVBhZ2UoaW5kZXgpO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5zdGVwcy5jdXJyZW50U3RlcCgwKTtcblx0XHRpZiAoaW5kZXggIT0gMSkge1xuXHRcdFx0YXBwLm15Vmlld01vZGVsLnBlb3BsZS5zaG93RGV0YWlscyhmYWxzZSk7XG5cdFx0fVxuXHRcdGhlYWRlci5jbG9zZSgpO1xuXHR9XG5cblx0aGVhZGVyLmNsb3NlID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGhlYWRlci5pc09wZW4oKSkge1xuXHRcdFx0aGVhZGVyLmlzRHJhZ2dpbmcodHJ1ZSk7XG5cblx0XHRcdCQoJyNoZWFkZXInKS5hbmltYXRlKHtcblx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHR9LCAyNTAsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRoZWFkZXIuaXNEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdGhlYWRlci5pc09wZW4oZmFsc2UpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0aGVhZGVyLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuXHRcdGhlYWRlci5pc09wZW4oZmFsc2UpO1xuXHRcdGhlYWRlci5pc01vZGFsKGZhbHNlKTtcblx0XHRhcHAubXlWaWV3TW9kZWwuYXV0aC5sb2dvdXQoKTtcblx0fVxuXG5cdGhlYWRlci5kcmFnTWVudSA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKGhlYWRlci5pc0RyYWdnaW5nKCkpIHtcblx0XHRcdHZhciBkZWx0YSA9IE1hdGguY2VpbChldmVudC5nZXN0dXJlLmRlbHRhWSk7XG5cdFx0XHR2YXIgY2hhbmdlID0gaGVhZGVyLmRyYWdTdGFydFkoKSArIGRlbHRhO1xuXHRcdFx0XG5cdFx0XHRpZiAoY2hhbmdlIDwgMCkgY2hhbmdlID0gMDtcblx0XHRcdGlmIChjaGFuZ2UgPiBoZWFkZXIubWF4SGVpZ2h0KSBjaGFuZ2UgPSBoZWFkZXIubWF4SGVpZ2h0O1xuXG5cdFx0XHRpZiAoY2hhbmdlID4gMCAmJiBjaGFuZ2UgPCBoZWFkZXIubWF4SGVpZ2h0KSB7XG5cdFx0XHRcdCQoJyNoZWFkZXInKS5jc3MoJ21hcmdpbi10b3AnLCBjaGFuZ2UpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGhlYWRlci5kcmFnTWVudVN0YXJ0ID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoIWhlYWRlci5pc0RyYWdnaW5nKCkpIHtcblx0XHRcdGhlYWRlci5pc0RyYWdnaW5nKHRydWUpO1xuXHRcdFx0aGVhZGVyLmRyYWdTdGFydFkocGFyc2VJbnQoJCgnI2hlYWRlcicpLmNzcygnbWFyZ2luLXRvcCcpKSk7XG5cdFx0XHQkKCcjaGVhZGVyJykub25lKCdkcmFnZW5kJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0dmFyIGVuZEhlaWdodCA9IHBhcnNlSW50KCQoJyNoZWFkZXInKS5jc3MoJ21hcmdpbi10b3AnKSk7XG5cdFx0XHRcdGlmIChlbmRIZWlnaHQgPj0gaGVhZGVyLm1heEhlaWdodCAvIDIpIHtcblx0XHRcdFx0XHRoZWFkZXIuaXNPcGVuKHRydWUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGhlYWRlci5pc09wZW4oZmFsc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCQoJyNoZWFkZXInKS5hbmltYXRlKHtcblx0XHRcdFx0XHRtYXJnaW5Ub3A6IGhlYWRlci5pc09wZW4oKSA/IGhlYWRlci5tYXhIZWlnaHQgOiAwXG5cdFx0XHRcdH0sIDEwMCwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aGVhZGVyLmlzRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlcjsiLCIvKipcbiAqIHNjcmlwdHMvbm90ZXMuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTm90ZXMoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgbm90ZXMgPSBhcHAubXlWaWV3TW9kZWwubm90ZXMgPSB7fTtcblx0bm90ZXMuc3RhdHVzT3B0aW9ucyA9IGtvLm9ic2VydmFibGVBcnJheShbXG5cdFx0e1xuXHRcdFx0bGFiZWw6ICdCcmluZyBvbiB0aGUgd29yaycsXG5cdFx0XHR2YWx1ZTogMCxcblx0XHRcdGljb246ICdmYSBmYS1hcnJvdy1kb3duJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bGFiZWw6ICdJXFwnbSBhIGxpdHRsZSBsaWdodCcsXG5cdFx0XHR2YWx1ZTogMSxcblx0XHRcdGljb246ICdmYSBmYS1taW51cydcblx0XHR9LFxuXHRcdHtcblx0XHRcdGxhYmVsOiAnSVxcJ20gZ29vZCcsXG5cdFx0XHR2YWx1ZTogMixcblx0XHRcdGljb246ICdmYSBmYS1hcnJvdy1yaWdodCdcblx0XHR9LFxuXHRcdHtcblx0XHRcdGxhYmVsOiAnSVxcJ20gYSBiaXQgb3ZlcndoZWxtZWQnLFxuXHRcdFx0dmFsdWU6IDMsXG5cdFx0XHRpY29uOiAnZmEgZmEtbWludXMnXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRsYWJlbDogJ1N0b3AgdGhlIG1hZG5lc3MhJyxcblx0XHRcdHZhbHVlOiA0LFxuXHRcdFx0aWNvbjogJ2ZhIGZhLWFycm93LXVwJ1xuXHRcdH1cblx0XSk7XG5cblx0bm90ZXMuc2VsZWN0U3RhdHVzID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5yYXRlV2Vlay53ZWVrcygpW2FwcC5teVZpZXdNb2RlbC5yYXRlV2Vlay5hY3RpdmVXZWVrKCldLnJhdGluZyhpdGVtLnZhbHVlKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTm90ZXM7IiwiLyoqXG4gKiBzY3JpcHRzL3Blb3BsZS5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQZW9wbGUoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcGVvcGxlID0gYXBwLm15Vmlld01vZGVsLnBlb3BsZSA9IHt9O1xuXG5cdHBlb3BsZS5udW1XZWVrcyA9IDM7XG5cdHBlb3BsZS50b2RheSA9IG1vbWVudChuZXcgRGF0ZSgpKS5zdGFydE9mKCdpc293ZWVrJyk7XG5cdHBlb3BsZS5hY3RpdmVXZWVrID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cGVvcGxlLmFjdGl2ZVBlcnNvbiA9IGtvLm9ic2VydmFibGUoKTtcblx0cGVvcGxlLnZpZXdUeXBlID0ga28ub2JzZXJ2YWJsZSgnaG91cnMnKTtcblx0cGVvcGxlLnNob3dEZXRhaWxzID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHBlb3BsZS50aW1lcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRwZW9wbGUud2Vla3MgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0cGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHBlb3BsZS5kcmFnU3RhcnQgPSBrby5vYnNlcnZhYmxlKDApO1xuXG5cdHBlb3BsZS5nZXRUaW1lcyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkYXRlcyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGVvcGxlLm51bVdlZWtzOyBpKyspIHtcblx0XHRcdGRhdGVzLnB1c2gobW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJykpO1xuXHRcdFx0cGVvcGxlLndlZWtzKClbaV0uZGF0ZShtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ01NTSBEJykpO1xuXHRcdH1cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFRpbWVzJywge1xuXHRcdFx0ZGF0ZXM6IGRhdGVzXG5cdFx0fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24odGltZXMpIHtcblx0XHRcdFx0cGVvcGxlLnRpbWVzKFtdKTtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB0aW1lcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YSA9ICQucGFyc2VKU09OKHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YSk7XG5cdFx0XHRcdFx0dmFyIHRvdGFsID0gXyh0aW1lc1tqXS5hdHRyaWJ1dGVzLmRhdGEucHJvamVjdHMpLnJlZHVjZShmdW5jdGlvbihhY2MsIG9iaikge1xuXHRcdFx0XHRcdFx0XyhvYmopLmVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkgeyBhY2Nba2V5XSA9IChhY2Nba2V5XSA/IGFjY1trZXldIDogMCkgKyB2YWx1ZSB9KTtcblx0XHRcdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHRcdFx0fSwge30pO1xuXHRcdFx0XHRcdHRpbWVzW2pdLmF0dHJpYnV0ZXMudG90YWwgPSBrby5vYnNlcnZhYmxlKHRvdGFsLnBlcmNlbnRhZ2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGVvcGxlLm51bVdlZWtzOyBpKyspIHtcblx0XHRcdFx0XHR2YXIgd2Vla0RhdGUgPSBtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ1lZWVksIE0sIEQnKTtcblx0XHRcdFx0XHR2YXIgd2VlayA9IF8uZmlsdGVyKHRpbWVzLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdFx0XHRcdHJldHVybiBvYmouYXR0cmlidXRlcy5kYXRhLmRhdGUgPT0gd2Vla0RhdGU7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRfLnNvcnRCeSh3ZWVrLCBmdW5jdGlvbihvYmopeyByZXR1cm4gb2JqLmF0dHJpYnV0ZXMudG90YWw7IH0pO1xuXG5cdFx0XHRcdFx0cGVvcGxlLnRpbWVzLnB1c2god2Vlayk7XG5cdFx0XHRcdH1cblx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdHBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdHBlb3BsZS5kcmFnU3RhcnQoMCk7XG5cdFx0XHRcdCQoJyNwZW9wbGUgLnBlb3BsZScpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHBlb3BsZS5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0dmFyIHdlZWsgPSB7XG5cdFx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdNTU0gRCcpKVxuXHRcdFx0fVxuXHRcdFx0cGVvcGxlLndlZWtzLnB1c2god2Vlayk7XG5cdFx0fVxuXHRcdHBlb3BsZS5nZXRUaW1lcygpO1xuXHR9XG5cblx0cGVvcGxlLnNlbGVjdFdlZWsgPSBmdW5jdGlvbihpbmRleCkge1xuXHRcdHBlb3BsZS5hY3RpdmVXZWVrKGluZGV4KTtcblx0XHQvLyBnbyBnZXQgdGhlIGRhdGEgZm9yIHRoaXMgd2Vla1xuXHR9XG5cblx0cGVvcGxlLnRvZ2dsZVZpZXcgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAocGVvcGxlLnZpZXdUeXBlKCkgPT0gJ2hvdXJzJykge1xuXHRcdFx0cGVvcGxlLnZpZXdUeXBlKCdwZXJjZW50Jyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBlb3BsZS52aWV3VHlwZSgnaG91cnMnKTtcblx0XHR9XG5cdH1cblxuXHRwZW9wbGUuZ29Ub1BlcnNvbiA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRwZW9wbGUuYWN0aXZlUGVyc29uKGl0ZW0pO1xuXHRcdHBlb3BsZS5zaG93RGV0YWlscyh0cnVlKTtcblx0fVxuXG5cdHBlb3BsZS5kcmFnUmVmcmVzaCA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKHBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZygpICYmIHBlb3BsZS5kcmFnU3RhcnQoKSA9PSAwKSB7XG5cdFx0XHR2YXIgdG9wID0gJChkb2N1bWVudCkuc2Nyb2xsVG9wKCk7XG5cdFx0XHR2YXIgZGVsdGEgPSBNYXRoLmZsb29yKGV2ZW50Lmdlc3R1cmUuZGlzdGFuY2UpO1xuXHRcdFx0aWYgKHRvcCA9PSAwICYmIGRlbHRhID4gMzApIHtcblx0XHRcdFx0aWYgKGRlbHRhID4gMTUwKSBkZWx0YSA9IDE1MDtcblx0XHRcdFx0JCgnI3Blb3BsZSAucGVvcGxlJykuY3NzKCdtYXJnaW4tdG9wJywgZGVsdGEgLSAzMCk7XG5cdFx0XHRcdGlmIChkZWx0YSA+PSAxMDApIHtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtdXBcIj48L3NwYW4+UmVsZWFzZSB0byByZWZyZXNoJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwZW9wbGUuc3RhcnRSZWZyZXNoRHJhZyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKCFwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiAhYXBwLm15Vmlld01vZGVsLmhlYWRlci5pc09wZW4oKSAmJiBwZW9wbGUuZHJhZ1N0YXJ0KCkgPT0gMCkge1xuXHRcdFx0cGVvcGxlLmRyYWdTdGFydCgkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSk7XG5cdFx0XHRwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcodHJ1ZSk7XG5cdFx0XHQkKGV2ZW50Lmdlc3R1cmUudGFyZ2V0KS5vbmUoJ2RyYWdlbmQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHR2YXIgZGVsdGEgPSBwYXJzZUludCgkKCcjcGVvcGxlIC5wZW9wbGUnKS5jc3MoJ21hcmdpbi10b3AnKSk7XG5cdFx0XHRcdGlmIChkZWx0YSA+PSA3MCkge1xuXHRcdFx0XHRcdHBlb3BsZS5nZXRUaW1lcygpO1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpblwiPjwvc3Bhbj5SZWZyZXNoaW5nLi4uJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucGVvcGxlJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblxuXHR9XG5cblx0cGVvcGxlLmluaXQoKTtcblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQZW9wbGU7IiwiLyoqXG4gKiBzY3JpcHRzL3JhdGUtd2Vlay5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBSYXRlV2VlayhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciByYXRlV2VlayA9IGFwcC5teVZpZXdNb2RlbC5yYXRlV2VlayA9IHt9O1xuXG5cdHJhdGVXZWVrLnJlZ2lzdGVyTW91c2VYID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRyYXRlV2Vlay5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZSA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHJhdGVXZWVrLnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0cmF0ZVdlZWsucmVnaXN0ZXJSYXRpbyA9IGtvLm9ic2VydmFibGUoJChkb2N1bWVudCkud2lkdGgoKSAtIDIwKTtcblx0cmF0ZVdlZWsuYWN0aXZlV2VlayA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHJhdGVXZWVrLnZpZXdUeXBlID0ga28ub2JzZXJ2YWJsZSgnaG91cnMnKTtcblxuXHRyYXRlV2Vlay53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheShbXG5cdFx0e1xuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocmF0ZVdlZWsudG9kYXkpLmZvcm1hdCgnTU1NIEQnKSksXG5cdFx0XHR0b3RhbDoga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdW0gPSBfLnJlZHVjZShhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihtZW1vLCBwcm9qZWN0KSB7XG5cdFx0XHRcdFx0dmFyIGNvbFZhbHVlID0gMDtcblx0XHRcdFx0XHRpZiAocHJvamVjdC5hdHRyaWJ1dGVzLmFjdGl2ZSgpKSB7XG5cdFx0XHRcdFx0XHRjb2xWYWx1ZSA9IHByb2plY3QuYXR0cmlidXRlcy5wZXJjZW50YWdlKClbMF0udmFsdWUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG1lbW8gKyBjb2xWYWx1ZTsgXG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRyZXR1cm4gc3VtO1xuXHRcdFx0fSksXG5cdFx0XHRyYXRpbmc6IGtvLm9ic2VydmFibGUoMiksXG5cdFx0XHRub3Rlczoga28ub2JzZXJ2YWJsZShudWxsKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocmF0ZVdlZWsudG9kYXkpLmFkZCgnZGF5cycsIDcpLmZvcm1hdCgnTU1NIEQnKSksXG5cdFx0XHR0b3RhbDoga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdW0gPSBfLnJlZHVjZShhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihtZW1vLCBwcm9qZWN0KSB7XG5cdFx0XHRcdFx0dmFyIGNvbFZhbHVlID0gMDtcblx0XHRcdFx0XHRpZiAocHJvamVjdC5hdHRyaWJ1dGVzLmFjdGl2ZSgpKSB7XG5cdFx0XHRcdFx0XHRjb2xWYWx1ZSA9IHByb2plY3QuYXR0cmlidXRlcy5wZXJjZW50YWdlKClbMV0udmFsdWUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG1lbW8gKyBjb2xWYWx1ZTsgXG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRyZXR1cm4gc3VtO1xuXHRcdFx0fSksXG5cdFx0XHRyYXRpbmc6IGtvLm9ic2VydmFibGUoMiksXG5cdFx0XHRub3Rlczoga28ub2JzZXJ2YWJsZShudWxsKVxuXHRcdH0sXG5cdFx0eyAgXG5cdFx0XHRkYXRlOiBrby5vYnNlcnZhYmxlKG1vbWVudChyYXRlV2Vlay50b2RheSkuYWRkKCdkYXlzJywgMTQpLmZvcm1hdCgnTU1NIEQnKSksXG5cdFx0XHR0b3RhbDoga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdW0gPSBfLnJlZHVjZShhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihtZW1vLCBwcm9qZWN0KSB7XG5cdFx0XHRcdFx0dmFyIGNvbFZhbHVlID0gMDtcblx0XHRcdFx0XHRpZiAocHJvamVjdC5hdHRyaWJ1dGVzLmFjdGl2ZSgpKSB7XG5cdFx0XHRcdFx0XHRjb2xWYWx1ZSA9IHByb2plY3QuYXR0cmlidXRlcy5wZXJjZW50YWdlKClbMl0udmFsdWUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG1lbW8gKyBjb2xWYWx1ZTsgXG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRyZXR1cm4gc3VtO1xuXHRcdFx0fSksXG5cdFx0XHRyYXRpbmc6IGtvLm9ic2VydmFibGUoMiksXG5cdFx0XHRub3Rlczoga28ub2JzZXJ2YWJsZShudWxsKVxuXHRcdH1cblx0XSk7XG5cblx0cmF0ZVdlZWsuZHJhZyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0dmFyIGRpcmVjdGlvbiA9IGV2ZW50Lmdlc3R1cmUuZGlyZWN0aW9uO1xuXHRcdGlmICghYXBwLm15Vmlld01vZGVsLnBlb3BsZS5zaG93RGV0YWlscygpICYmIChkaXJlY3Rpb24gPT0gJ2xlZnQnIHx8IGRpcmVjdGlvbiA9PSAncmlnaHQnKSkge1xuXHRcdFx0dmFyIHN0YXJ0WCA9IGV2ZW50Lmdlc3R1cmUuc3RhcnRFdmVudC5jZW50ZXIucGFnZVg7XG5cdFx0XHRpZiAocmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVgoKSAhPSBzdGFydFgpIHtcblx0XHRcdFx0cmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVgoc3RhcnRYKTtcblx0XHRcdFx0cmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoaXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVtyYXRlV2Vlay5hY3RpdmVXZWVrKCldLnZhbHVlKCkpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGRpZmYgPSAoZXZlbnQuZ2VzdHVyZS5kZWx0YVggLyByYXRlV2Vlay5yZWdpc3RlclJhdGlvKCkpICogMTUwO1xuXHRcdFx0dmFyIG5ld1BlcmNlbnRhZ2UgPSBNYXRoLmZsb29yKChkaWZmICsgcmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoKSkgLyA1KSAqIDU7XG5cblx0XHRcdGlmIChuZXdQZXJjZW50YWdlID4gMCAmJiBuZXdQZXJjZW50YWdlIDw9IDE1MCkge1xuXHRcdFx0XHRpdGVtLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpW3JhdGVXZWVrLmFjdGl2ZVdlZWsoKV0udmFsdWUobmV3UGVyY2VudGFnZSk7XG5cdFx0XHR9IGVsc2UgaWYgKG5ld1BlcmNlbnRhZ2UgPiAxNTApIHtcblx0XHRcdFx0aXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVtyYXRlV2Vlay5hY3RpdmVXZWVrKCldLnZhbHVlKDE1MCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpdGVtLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpW3JhdGVXZWVrLmFjdGl2ZVdlZWsoKV0udmFsdWUoMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmF0ZVdlZWsuc2VsZWN0V2VlayA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0cmF0ZVdlZWsuYWN0aXZlV2VlayhpbmRleCk7XG5cdH1cblxuXHRyYXRlV2Vlay50YWtlUGljdHVyZSA9IGZ1bmN0aW9uKCkge1xuXHRcdG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZShyYXRlV2Vlay5zZXRQaWN0dXJlLCBmdW5jdGlvbigpIHtcblx0XHRcdC8vIGZhaWxcblx0XHRcdGFsZXJ0KCdPb3BzLiBXZSBjb3VsZG5cXCd0IGFjY2VzcyB5b3VyIGNhbWVyYS4nKTtcblx0XHR9LCB7IFxuXHRcdFx0cXVhbGl0eTogMTAwLCBcblx0XHRcdGFsbG93RWRpdDogdHJ1ZSwgXG5cdFx0XHRkZXN0aW5hdGlvblR5cGU6IG5hdmlnYXRvci5jYW1lcmEuRGVzdGluYXRpb25UeXBlLkRBVEFfVVJMLFxuXHRcdFx0ZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcblx0XHRcdHRhcmdldFdpZHRoOiAxMDAsXG5cdFx0XHR0YXJnZXRIZWlnaHQ6IDEwMCxcblx0XHRcdGNvcnJlY3RPcmllbnRhdGlvbjogdHJ1ZSxcblx0XHRcdGNhbWVyYURpcmVjdGlvbjogQ2FtZXJhLkRpcmVjdGlvbi5GUk9OVFxuXHRcdH0pO1xuXHR9XG5cblx0cmF0ZVdlZWsuc2V0UGljdHVyZSA9IGZ1bmN0aW9uKGltYWdlRGF0YSkge1xuXHRcdCQoJy5hdmF0YXInKS5yZW1vdmVDbGFzcygnZmEtY2FtZXJhJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybChkYXRhOmltYWdlL3BuZztiYXNlNjQsJyArIGltYWdlRGF0YSArICcpJyk7XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCd1cGRhdGVBdmF0YXInLCB7XG5cdFx0XHRhdmF0YXI6IGltYWdlRGF0YVxuXHRcdH0sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0YWxlcnQoJ0F2YXRhciBzdWNjZXNzZnVsbHkgc2F2ZWQuJylcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHQkKCcuYXZhdGFyJykuYWRkQ2xhc3MoJ2ZhLWNhbWVyYScpO1xuXHRcdFx0XHRjb25zb2xlLmxvZygnT29wcy4gV2UgbWVzc2VkIHVwLiBQbGVhc2UgdHJ5IGFnYWluLicpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmF0ZVdlZWsudG9nZ2xlVmlldyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChyYXRlV2Vlay52aWV3VHlwZSgpID09ICdob3VycycpIHtcblx0XHRcdHJhdGVXZWVrLnZpZXdUeXBlKCdwZXJjZW50Jyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJhdGVXZWVrLnZpZXdUeXBlKCdob3VycycpO1xuXHRcdH1cblx0fVxuXG5cdHJhdGVXZWVrLmdvQmFjayA9IGZ1bmN0aW9uKCkge1xuXHRcdGNvbnNvbGUubG9nKCdnbyBiYWNrJylcblx0XHRhcHAubXlWaWV3TW9kZWwucGVvcGxlLnNob3dEZXRhaWxzKGZhbHNlKTtcblx0XHRhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmdvVG9QYWdlKDEpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmF0ZVdlZWs7IiwiLyoqXG4gKiBzY3JpcHRzL3NhdmUuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gU2F2ZShhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBzYXZlID0gYXBwLm15Vmlld01vZGVsLnNhdmUgPSB7fTtcblxuXHRzYXZlLnNhdmVNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNhdmUuc3VjY2VzcyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzYXZlLmVycm9yID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNhdmUuc2F2aW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0c2F2ZS5yZXN1bHQgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2F2ZS5kb25lID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRvbmUgPSBmYWxzZTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNhdmUucmVzdWx0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRkb25lID0gZG9uZSB8fCBzYXZlLnJlc3VsdFtpXTtcblx0XHR9XG5cdFx0cmV0dXJuIGRvbmU7XG5cdH0pO1xuXG5cdHNhdmUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG5cdFx0c2F2ZS5zYXZlTW9kZSh0cnVlKTtcblx0XHRzYXZlLnNhdmluZyh0cnVlKTtcblx0XHR2YXIgdGVtcCA9IHt9O1xuXHRcdHZhciBjdXJXZWVrO1xuXHRcdHZhciBudW1XZWVrcyA9IGFwcC5teVZpZXdNb2RlbC5yYXRlV2Vlay53ZWVrcygpLmxlbmd0aDtcblx0XHR2YXIgcHJvamVjdHMgPSBfLmZpbHRlcihhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdHJldHVybiBvYmouYXR0cmlidXRlcy5hY3RpdmUoKTtcblx0XHR9KTtcblx0XHR2YXIgbnVtUHJvamVjdHMgPSBwcm9qZWN0cy5sZW5ndGg7XG5cdFx0dmFyIHRvZGF5ID0gYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLnRvZGF5O1xuXHRcdHZhciB0ZW1wUHJvamVjdCA9IHt9O1xuXHRcdHZhciBkb25lID0gMDtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbnVtV2Vla3M7IGkrKykge1xuXHRcdFx0Y3VyV2VlayA9IGFwcC5teVZpZXdNb2RlbC5yYXRlV2Vlay53ZWVrcygpW2ldO1xuXHRcdFx0dGVtcCA9IHtcblx0XHRcdFx0ZGF0ZTogbW9tZW50KHRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ1lZWVksIE0sIEQnKSxcblx0XHRcdFx0cmF0aW5nOiBjdXJXZWVrLnJhdGluZygpLFxuXHRcdFx0XHRub3RlczogY3VyV2Vlay5ub3RlcygpXG5cdFx0XHR9O1xuXG5cdFx0XHR2YXIgdGVtcFByb2plY3RzID0gW107XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IG51bVByb2plY3RzOyBqKyspIHtcblx0XHRcdFx0dGVtcFByb2plY3QgPSB7XG5cdFx0XHRcdFx0aWQ6IHByb2plY3RzW2pdLmlkLFxuXHRcdFx0XHRcdHBlcmNlbnRhZ2U6IHByb2plY3RzW2pdLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpW2ldLnZhbHVlKClcblx0XHRcdFx0fVxuXHRcdFx0XHR0ZW1wUHJvamVjdHMucHVzaCh0ZW1wUHJvamVjdCk7XG5cdFx0XHR9XG5cdFx0XHR0ZW1wLnByb2plY3RzID0gdGVtcFByb2plY3RzO1xuXG5cdFx0XHRQYXJzZS5DbG91ZC5ydW4oJ3NhdmVUaW1lJywge1xuXHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeSh0ZW1wKSxcblx0XHRcdFx0ZGF0ZTogdGVtcC5kYXRlXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0XHRkb25lID0gZG9uZSsxO1xuXHRcdFx0XHRcdGlmIChkb25lID49IG51bVdlZWtzICYmIHNhdmUuc2F2aW5nKCkpIHtcblx0XHRcdFx0XHRcdHNhdmUuc3VjY2Vzcyh0cnVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0XHRzYXZlLmVycm9yKHRydWUpO1xuXHRcdFx0XHRcdHNhdmUucmVzZXQoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0c2F2ZS50cnlBZ2FpbiA9IGZ1bmN0aW9uKCkge1xuXHRcdHNhdmUuZXJyb3IoZmFsc2UpO1xuXHRcdHNhdmUuc3VjY2VzcyhmYWxzZSk7XG5cdFx0c2F2ZS5zdWJtaXQoKTtcblx0fVxuXG5cdHNhdmUucmVzZXQgPSBmdW5jdGlvbigpIHtcblx0XHRzYXZlLnNhdmluZyhmYWxzZSk7XG5cdFx0c2F2ZS5zYXZlTW9kZShmYWxzZSk7XG5cdFx0c2F2ZS5lcnJvcihmYWxzZSk7XG5cdFx0c2F2ZS5zdWNjZXNzKGZhbHNlKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNhdmU7IiwiLyoqXG4gKiBzY3JpcHRzL3NlbGVjdC1wcm9qZWN0LmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFNlbGVjdFByb2plY3QoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgc2VsZWN0UHJvamVjdCA9IGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0ID0ge307XG5cblx0c2VsZWN0UHJvamVjdC52aWV3VHlwZSA9IGtvLm9ic2VydmFibGUoJ2FsbCcpO1xuXHRzZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHNlbGVjdFByb2plY3QuaXNBZGRNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNlbGVjdFByb2plY3QudW5pcXVlQ29tcGFueU5hbWVzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdCA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRzZWxlY3RQcm9qZWN0LmlzUmVmcmVzaERyYWdnaW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNlbGVjdFByb2plY3QuZHJhZ1N0YXJ0ID0ga28ub2JzZXJ2YWJsZSgwKTtcblxuXHRzZWxlY3RQcm9qZWN0LmdldFByb2plY3RzID0gZnVuY3Rpb24oKSB7XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRQcm9qZWN0cycsIHt9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0cykge1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKFtdKTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9qZWN0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHByb2plY3RzW2ldLmF0dHJpYnV0ZXMuYWN0aXZlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdFx0XHRcdFx0cHJvamVjdHNbaV0uYXR0cmlidXRlcy5wZXJjZW50YWdlID0ga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSk7XG5cdFx0XHRcdFx0c2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cy5wdXNoKHByb2plY3RzW2ldKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgwKTtcblx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5hbGwtcHJvamVjdHMnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0fSwgMTAwKTtcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFVuaXF1ZUNvbXBhbnlOYW1lcycsIHt9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0cykge1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LnVuaXF1ZUNvbXBhbnlOYW1lcyhwcm9qZWN0cyk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0c2VsZWN0UHJvamVjdC5nZXRQcm9qZWN0cygpO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC50b2dnbGVQcm9qZWN0ID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoaXRlbS5hdHRyaWJ1dGVzLmFjdGl2ZSgpKSB7XG5cdFx0XHRpdGVtLmF0dHJpYnV0ZXMuYWN0aXZlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aXRlbS5hdHRyaWJ1dGVzLmFjdGl2ZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnRvZ2dsZUFkZE1vZGUgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoc2VsZWN0UHJvamVjdC5pc0FkZE1vZGUoKSkge1xuXHRcdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5pc01vZGFsKGZhbHNlKTtcblx0XHRcdHNlbGVjdFByb2plY3QuaXNBZGRNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5pc01vZGFsKHRydWUpO1xuXHRcdFx0JCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykudmFsKCcnKTtcblx0XHRcdCQoJy5wcm9qZWN0LW5hbWUtZmllbGQnKS52YWwoJycpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KFtdKTtcblx0XHRcdHNlbGVjdFByb2plY3QuaXNBZGRNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3QudG9nZ2xlVmlldyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChzZWxlY3RQcm9qZWN0LnZpZXdUeXBlKCkgPT0gJ2FsbCcpIHtcblx0XHRcdHNlbGVjdFByb2plY3Qudmlld1R5cGUoJ3NlbGVjdGVkJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGVjdFByb2plY3Qudmlld1R5cGUoJ2FsbCcpO1xuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc2VsZWN0UHJvamVjdFR5cGVhaGVhZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHQkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS52YWwoaXRlbSk7XG5cdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KFtdKTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc2hvd1R5cGVhaGVhZFJlc3VsdHMgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdHZhciBuZWVkbGUgPSBldmVudC50YXJnZXQudmFsdWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXlxcd1xcZF0vZ2ksICcnKTtcblxuXHRcdGlmIChuZWVkbGUubGVuZ3RoID4gMCkge1xuXHRcdFx0dmFyIGZpbHRlcmVkUHJvamVjdHMgPSBfLmZpbHRlcihzZWxlY3RQcm9qZWN0LnVuaXF1ZUNvbXBhbnlOYW1lcygpLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdFx0dmFyIGhheXN0YWNrID0gb2JqLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15cXHdcXGRdL2dpLCAnJyk7XG5cdFx0XHRcdHJldHVybiBoYXlzdGFjay5pbmRleE9mKG5lZWRsZSkgPj0gMDsgXG5cdFx0XHR9KTtcblx0XHRcdHZhciBmaWVsZFBvc2l0aW9uID0gJCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykub2Zmc2V0KCk7XG5cdFx0XHQkKCcucHJvamVjdC10eXBlYWhlYWQnKS5jc3MoJ2xlZnQnLCBmaWVsZFBvc2l0aW9uLmxlZnQpLmNzcygndG9wJywgZmllbGRQb3NpdGlvbi50b3AgKyAkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS5oZWlnaHQoKSsyMCk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QoZmlsdGVyZWRQcm9qZWN0cyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdChbXSk7XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zYXZlTmV3UHJvamVjdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0Y29tcGFueTogJCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykudmFsKCksXG5cdFx0XHRwcm9qZWN0OiAkKCcucHJvamVjdC1uYW1lLWZpZWxkJykudmFsKCksXG5cdFx0fVxuXHRcdFBhcnNlLkNsb3VkLnJ1bignc2F2ZVByb2plY3QnLCBkYXRhLCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0KSB7XG5cdFx0XHRcdGFsZXJ0KCdcIicgKyBwcm9qZWN0LmF0dHJpYnV0ZXMuY29tcGFueSArICc6ICcgKyBwcm9qZWN0LmF0dHJpYnV0ZXMubmFtZSArICdcIiBjcmVhdGVkIHN1Y2Nlc3NmdWxseS4nKTtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC50b2dnbGVBZGRNb2RlKCk7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QuZ2V0UHJvamVjdHMoKTtcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHQvLyBhbGVydChlcnJvcilcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1x0XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LmRyYWdSZWZyZXNoID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoc2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZygpICYmIHNlbGVjdFByb2plY3QuZHJhZ1N0YXJ0KCkgPT0gMCkge1xuXHRcdFx0dmFyIHRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpO1xuXHRcdFx0dmFyIGRlbHRhID0gTWF0aC5mbG9vcihldmVudC5nZXN0dXJlLmRpc3RhbmNlKTtcblx0XHRcdGlmICh0b3AgPT0gMCAmJiBkZWx0YSA+IDMwKSB7XG5cdFx0XHRcdGlmIChkZWx0YSA+IDE1MCkgZGVsdGEgPSAxNTA7XG5cdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAuYWxsLXByb2plY3RzJykuY3NzKCdtYXJnaW4tdG9wJywgZGVsdGEgLSAzMCk7XG5cdFx0XHRcdGlmIChkZWx0YSA+PSAxMDApIHtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS11cFwiPjwvc3Bhbj5SZWxlYXNlIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zdGFydFJlZnJlc2hEcmFnID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoIXNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiAhYXBwLm15Vmlld01vZGVsLmhlYWRlci5pc09wZW4oKSAmJiBzZWxlY3RQcm9qZWN0LmRyYWdTdGFydCgpID09IDApIHtcblx0XHRcdHNlbGVjdFByb2plY3QuZHJhZ1N0YXJ0KCQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpKTtcblx0XHRcdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcodHJ1ZSk7XG5cdFx0XHQkKGV2ZW50Lmdlc3R1cmUudGFyZ2V0KS5vbmUoJ2RyYWdlbmQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHR2YXIgZGVsdGEgPSBwYXJzZUludCgkKCcjc2VsZWN0LXByb2plY3QgLmFsbC1wcm9qZWN0cycpLmNzcygnbWFyZ2luLXRvcCcpKTtcblxuXHRcdFx0XHRpZiAoZGVsdGEgPj0gNzApIHtcblx0XHRcdFx0XHRzZWxlY3RQcm9qZWN0LmdldFByb2plY3RzKCk7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW5cIj48L3NwYW4+UmVmcmVzaGluZy4uLicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdFx0c2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdFx0c2VsZWN0UHJvamVjdC5kcmFnU3RhcnQoMCk7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5hbGwtcHJvamVjdHMnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LmluaXQoKTtcblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RQcm9qZWN0OyIsIi8qKlxuICogc2NyaXB0cy9zdGVwcy5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTdGVwcyhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBzdGVwcyA9IGFwcC5teVZpZXdNb2RlbC5zdGVwcyA9IHt9O1xuXG5cdHN0ZXBzLmN1cnJlbnRTdGVwID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0c3RlcHMuY2hhbmdpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c3RlcHMuc3RlcHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuXHRcdHtcblx0XHRcdHN0ZXBOdW1iZXI6IDAsXG5cdFx0XHRzdGVwTmFtZTogJ3NlbGVjdFByb2plY3QnXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRzdGVwTnVtYmVyOiAxLFxuXHRcdFx0c3RlcE5hbWU6ICdyYXRlV2Vlaydcblx0XHR9LFxuXHRcdHtcblx0XHRcdHN0ZXBOdW1iZXI6IDIsXG5cdFx0XHRzdGVwTmFtZTogJ25vdGVzJ1xuXHRcdH1cblx0XSk7XG5cblx0c3RlcHMuY2hhbmdlU3RlcCA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRpZiAoIXN0ZXBzLmNoYW5naW5nKCkpIHtcblx0XHRcdHN0ZXBzLmNoYW5naW5nKHRydWUpO1xuXHRcdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5jbG9zZSgpO1xuXHRcdFx0c3RlcHMuY3VycmVudFN0ZXAoaXRlbS5zdGVwTnVtYmVyKTtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHN0ZXBzLmNoYW5naW5nKGZhbHNlKTtcblx0XHRcdH0sIDUwMCk7XG5cdFx0fVxuXHR9XG5cblx0c3RlcHMubmV4dFN0ZXAgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcblx0XHRpZiAoIXN0ZXBzLmNoYW5naW5nKCkpIHtcblx0XHRcdHN0ZXBzLmNoYW5naW5nKHRydWUpO1xuXHRcdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5jbG9zZSgpO1xuXHRcdFx0c3RlcHMuY3VycmVudFN0ZXAoc3RlcHMuY3VycmVudFN0ZXAoKSArIGRpcmVjdGlvbik7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzdGVwcy5jaGFuZ2luZyhmYWxzZSk7XG5cdFx0XHR9LCA1MDApO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0ZXBzOyJdfQ==
