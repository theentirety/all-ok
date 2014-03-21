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

	people.getTimes = function() {
		var dates = [];
		for (var i = 0; i < people.weeks().length; i++) {
			dates.push(moment(people.today).add('days', (i * 7)).format('YYYY, M, D'))
		}
		Parse.Cloud.run('getTimes', {
			dates: dates
		}, {
			success: function(times) {
				for (var j = 0; j < times.length; j++) {
					times[j].attributes.data = $.parseJSON(times[j].attributes.data);
					var total = _(times[j].attributes.data.projects).reduce(function(acc, obj) {
						_(obj).each(function(value, key) { acc[key] = (acc[key] ? acc[key] : 0) + value });
						return acc;
					}, {});
					times[j].attributes.total = total.percentage;
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
		if (people.isRefreshDragging()) {
			var top = $(document).scrollTop();
			var delta = Math.floor(event.gesture.distance);
			if (top == 0 && delta > 30) {
				if (delta > 100) delta = 100;
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
		if (!people.isRefreshDragging() && !app.myViewModel.header.isOpen()) {
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
					alert(done)
					done = done+1;
					if (done >= numWeeks && save.saving()) {
						save.success(true);
					}
				}, error: function(error) {
					alert(error)
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
		if (selectProject.isRefreshDragging()) {
			var top = $(document).scrollTop();
			var delta = Math.floor(event.gesture.distance);
			if (top == 0 && delta > 30) {
				if (delta > 100) delta = 100;
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
		if (!selectProject.isRefreshDragging() && !app.myViewModel.header.isOpen()) {
			selectProject.isRefreshDragging(true);
			$(event.gesture.target).one('dragend', function(event) {
				selectProject.isRefreshDragging(false);
				var delta = parseInt($('#select-project .all-projects').css('margin-top'));

				if (delta >= 70) {
					selectProject.getProjects();
					$('#select-project .refresh').html('<span class="fa fa-refresh fa-spin"></span>Refreshing...');
				} else {
					$('#select-project .refresh').html('<span class="fa fa-arrow-circle-down"></span>Pull to refresh');
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
		app.myViewModel.header.close();
		steps.currentStep(item.stepNumber);
	}

	steps.nextStep = function(direction) {
		app.myViewModel.header.close();
		steps.currentStep(steps.currentStep() + direction);
	}

	return self;
}

module.exports = Steps;
},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvYXV0aC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvZmFrZV8zOTczYTAzOS5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvaGVhZGVyLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ub3Rlcy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcGVvcGxlLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9yYXRlLXdlZWsuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3NhdmUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3NlbGVjdC1wcm9qZWN0LmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zdGVwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIHNjcmlwdHMvYXBwLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEFwcCgpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdC8vIGluaXRpYWxpemUga25vY2tvdXRcblx0c2VsZi5teVZpZXdNb2RlbCA9IHt9O1xuXG5cdHNlbGYubXlWaWV3TW9kZWwuY3VycmVudFVzZXIgPSBrby5vYnNlcnZhYmxlKG51bGwpO1xuXG5cdHNlbGYuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZXJlYWR5Jywgc2VsZi5vbkRldmljZVJlYWR5LCBmYWxzZSk7XG5cdH1cblxuXHRzZWxmLm9uRGV2aWNlUmVhZHkgPSBmdW5jdGlvbigpIHtcblx0XHRrby5hcHBseUJpbmRpbmdzKHNlbGYubXlWaWV3TW9kZWwpO1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAobmF2aWdhdG9yLnNwbGFzaHNjcmVlbikge1xuXHRcdFx0XHRuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuLmhpZGUoKTtcblx0XHRcdH1cblx0XHR9LCAyMDAwKTtcblx0XHRcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDsiLCIvKipcbiAqIHNjcmlwdHMvYXV0aC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBdXRoKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGF1dGggPSBhcHAubXlWaWV3TW9kZWwuYXV0aCA9IHt9O1xuXG5cdGF1dGguY3VycmVudFVzZXIgPSBrby5vYnNlcnZhYmxlKCk7XG5cdGF1dGguZXJyb3JNZXNzYWdlID0ga28ub2JzZXJ2YWJsZSgnJyk7XG5cdGF1dGguc2lnblVwTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhdXRoLmlzQWRtaW4gPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0YXV0aC5mb3Jnb3RNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0dmFyIGN1cnJlbnRVc2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cdGlmIChjdXJyZW50VXNlcikge1xuXHRcdGF1dGguY3VycmVudFVzZXIoY3VycmVudFVzZXIpO1xuXHR9XG5cblx0YXV0aC5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdjaGVja0FkbWluU3RhdHVzJywge30sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGlzQWRtaW4pIHtcblx0XHRcdFx0YXV0aC5pc0FkbWluKGlzQWRtaW4pO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGF1dGgucmVzZXRFcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGguZXJyb3JNZXNzYWdlKCcnKTtcblx0fVxuXG5cdGF1dGguc2lnbkluVXAgPSBmdW5jdGlvbihmb3JtRWxlbWVudCkge1xuXHRcdC8vIGtvLnBvc3Rib3gucHVibGlzaCgnaXNMb2FkaW5nJywgdHJ1ZSk7XG5cdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cblx0XHR2YXIgdXNlcm5hbWUgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfdXNlcm5hbWVdJykudmFsKCk7XG5cdFx0dmFyIHBhc3N3b3JkID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX3Bhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHR2YXIgZW1haWwgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZW1haWxdJykudmFsKCkudG9Mb3dlckNhc2UoKTtcblx0XHRcdHZhciBkaXNwbGF5TmFtZSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9kaXNwbGF5TmFtZV0nKS52YWwoKTtcblx0XHRcdHZhciBwYXNzd29yZENvbmZpcm0gPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfY29uZmlybVBhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0XHQvLyB2YWxpZGF0aW9uXG5cdFx0XHRpZiAoZW1haWwubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZW1haWwgYWRkcmVzcy4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZGlzcGxheU5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZmlyc3QgYW5kIGxhc3QgbmFtZS4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodXNlcm5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIGEgdXNlcm5hbWUuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHBhc3N3b3JkLmxlbmd0aCA8IDEgfHwgcGFzc3dvcmRDb25maXJtIDwgMSB8fCBwYXNzd29yZCAhPSBwYXNzd29yZENvbmZpcm0pIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciBhbmQgY29uZmlybSBhIHBhc3N3b3JkLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHZhciB1c2VyID0gbmV3IFBhcnNlLlVzZXIoKTtcblx0XHRcdHZhciBzY3J1YmJlZFVzZXJuYW1lID0gdXNlcm5hbWUucmVwbGFjZSgvXFxzKy9nLFwiXCIpOyAvL3JlbW92ZSB3aGl0ZSBzcGFjZVxuXHRcdFx0c2NydWJiZWRVc2VybmFtZSA9IHNjcnViYmVkVXNlcm5hbWUudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0dXNlci5zZXQoJ3VzZXJuYW1lJywgc2NydWJiZWRVc2VybmFtZSk7XG5cdFx0XHR1c2VyLnNldCgncGFzc3dvcmQnLCBwYXNzd29yZCk7XG5cdFx0XHR1c2VyLnNldCgnZW1haWwnLCBlbWFpbCk7XG5cdFx0XHR1c2VyLnNldCgnZGlzcGxheU5hbWUnLCBkaXNwbGF5TmFtZSk7XG5cblx0XHRcdC8vIG90aGVyIGZpZWxkcyBjYW4gYmUgc2V0IGp1c3QgbGlrZSB3aXRoIFBhcnNlLk9iamVjdFxuXHRcdFx0Ly8gdXNlci5zZXQoXCJwaG9uZVwiLCBcIjQxNS0zOTItMDIwMlwiKTtcblxuXHRcdFx0dXNlci5zaWduVXAobnVsbCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0UGFyc2UuVXNlci5sb2dJbih1c2VybmFtZSwgcGFzc3dvcmQsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRcdGF1dGguY3VycmVudFVzZXIodXNlcik7XG5cdFx0XHRcdFx0YXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuaW5pdCgpO1xuXHRcdFx0XHRcdGlmICh1c2VyLmF0dHJpYnV0ZXMuaXNBZG1pbikge1xuXHRcdFx0XHRcdFx0YXV0aC5pc0FkbWluKHRydWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0Ly8gVGhlIGxvZ2luIGZhaWxlZC4gQ2hlY2sgZXJyb3IgdG8gc2VlIHdoeS5cblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLmZvcmdvdCA9IGZ1bmN0aW9uKGZvcm1FbGVtZW50KSB7XG5cdFx0dmFyIGVtYWlsID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2ZvcmdvdF0nKS52YWwoKTtcblxuXHRcdFBhcnNlLlVzZXIucmVxdWVzdFBhc3N3b3JkUmVzZXQoZW1haWwsIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhdXRoLmZvcmdvdE1vZGUoZmFsc2UpO1xuXHRcdFx0XHQkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZm9yZ290XScpLnZhbCgnJyk7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgY2hlY2sgeW91ciBlbWFpbCBmb3IgaW5zdHJ1Y3Rpb25zIG9uIHJlc2V0dGluZyB5b3VyIHBhc3N3b3JkLicpO1xuXHRcdFx0fSxcblx0XHRcdGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRhdXRoLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuXHRcdFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cdFx0YXV0aC5jdXJyZW50VXNlcihudWxsKTtcblx0fVxuXG5cdGF1dGguc2hvd1NpZ25VcCA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGguZXJyb3JNZXNzYWdlKCcnKTtcblx0XHRpZiAoYXV0aC5zaWduVXBNb2RlKCkpIHtcblx0XHRcdGF1dGguc2lnblVwTW9kZShmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGF1dGguc2lnblVwTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLnRvZ2dsZUZvcmdvdE1vZGUgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoYXV0aC5mb3Jnb3RNb2RlKCkpIHtcblx0XHRcdGF1dGguZm9yZ290TW9kZShmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGF1dGguZm9yZ290TW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLnNhbml0aXplRXJyb3JzID0gZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRzd2l0Y2goZXJyb3IuY29kZSlcblx0XHR7XG5cdFx0XHRjYXNlIDEwMTpcblx0XHRcdFx0cmV0dXJuICdQbGVhc2UgZW50ZXIgYSB2YWxpZCB1c2VybmFtZSBhbmQgcGFzc3dvcmQuJztcblx0XHRcdGNhc2UgMTI0OlxuXHRcdFx0XHRyZXR1cm4gJ09vcHMhIFdlIG1lc3NlZCB1cC4gUGxlYXNlIHRyeSBhZ2Fpbi4nO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIGVycm9yLm1lc3NhZ2UuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBlcnJvci5tZXNzYWdlLnNsaWNlKDEpICsgJy4nO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguaW5pdCgpO1xuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF1dGg7IiwiLyoqXG4gKiBzY3JpcHRzL21haW4uanNcbiAqXG4gKiBUaGlzIGlzIHRoZSBzdGFydGluZyBwb2ludCBmb3IgeW91ciBhcHBsaWNhdGlvbi5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEFwcCA9IHJlcXVpcmUoJy4vYXBwLmpzJyk7XG52YXIgQXV0aCA9IHJlcXVpcmUoJy4vYXV0aC5qcycpO1xudmFyIFN0ZXBzID0gcmVxdWlyZSgnLi9zdGVwcy5qcycpO1xudmFyIFNlbGVjdFByb2plY3QgPSByZXF1aXJlKCcuL3NlbGVjdC1wcm9qZWN0LmpzJyk7XG52YXIgSGVhZGVyID0gcmVxdWlyZSgnLi9oZWFkZXIuanMnKTtcbnZhciBSYXRlV2VlayA9IHJlcXVpcmUoJy4vcmF0ZS13ZWVrLmpzJyk7XG52YXIgTm90ZXMgPSByZXF1aXJlKCcuL25vdGVzLmpzJyk7XG52YXIgUGVvcGxlID0gcmVxdWlyZSgnLi9wZW9wbGUuanMnKTtcbnZhciBTYXZlID0gcmVxdWlyZSgnLi9zYXZlLmpzJyk7XG5cbi8vIGluaXRpYWxpemUgcGFyc2VcblBhcnNlLmluaXRpYWxpemUoXCJKa1lOZlBCdzJhUGdjYzdQZVRHSE1BVTJYS3ZqemVxVklreUNsVnVvXCIsIFwiNDVPTVUzWlMzbzVjMTY4bFF4YTBpbHhRdTRGZE1WSFQxTlZUa09SbFwiKTtcblxuLy8gaW5pdGlhbGl6ZSB0eXBla2l0XG50cnl7VHlwZWtpdC5sb2FkKCk7fWNhdGNoKGUpe31cblxudmFyIGFwcCA9IG5ldyBBcHAoKTtcbnZhciBhdXRoID0gbmV3IEF1dGgoYXBwKTtcbnZhciBzdGVwcyA9IG5ldyBTdGVwcyhhcHApO1xudmFyIHNlbGVjdFByb2plY3QgPSBuZXcgU2VsZWN0UHJvamVjdChhcHApO1xudmFyIGhlYWRlciA9IG5ldyBIZWFkZXIoYXBwKTtcbnZhciByYXRlV2VlayA9IG5ldyBSYXRlV2VlayhhcHApO1xudmFyIG5vdGVzID0gbmV3IE5vdGVzKGFwcCk7XG52YXIgcGVvcGxlID0gbmV3IFBlb3BsZShhcHApO1xudmFyIHNhdmUgPSBuZXcgU2F2ZShhcHApO1xuXG5cbi8vIEN1c3RvbSBrbm9ja291dCBleHRuZWRlcnNcblxuLy8gSGVyZSdzIGEgY3VzdG9tIEtub2Nrb3V0IGJpbmRpbmcgdGhhdCBtYWtlcyBlbGVtZW50cyBzaG93bi9oaWRkZW4gdmlhIGpRdWVyeSdzIGZhZGVJbigpL2ZhZGVPdXQoKSBtZXRob2RzXG4vLyBDb3VsZCBiZSBzdG9yZWQgaW4gYSBzZXBhcmF0ZSB1dGlsaXR5IGxpYnJhcnlcbmtvLmJpbmRpbmdIYW5kbGVycy5mYWRlVmlzaWJsZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAkKGVsZW1lbnQpLnRvZ2dsZShrby51bndyYXAodmFsdWUpKTsgLy8gVXNlIFwidW53cmFwT2JzZXJ2YWJsZVwiIHNvIHdlIGNhbiBoYW5kbGUgdmFsdWVzIHRoYXQgbWF5IG9yIG1heSBub3QgYmUgb2JzZXJ2YWJsZVxuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIFdoZW5ldmVyIHRoZSB2YWx1ZSBzdWJzZXF1ZW50bHkgY2hhbmdlcywgc2xvd2x5IGZhZGUgdGhlIGVsZW1lbnQgaW4gb3Igb3V0XG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAga28udW53cmFwKHZhbHVlKSA/ICQoZWxlbWVudCkuZmFkZUluKCkgOiAkKGVsZW1lbnQpLmZhZGVPdXQoKTtcbiAgICB9XG59XG5cbmFwcC5pbml0aWFsaXplKCk7IiwiLyoqXG4gKiBzY3JpcHRzL2hlYWRlci5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBIZWFkZXIoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgaGVhZGVyID0gYXBwLm15Vmlld01vZGVsLmhlYWRlciA9IHt9O1xuXG5cdGhlYWRlci5hY3RpdmVQYWdlID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0aGVhZGVyLmlzTW9kYWwgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0aGVhZGVyLmlzT3BlbiA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRoZWFkZXIuaXNEcmFnZ2luZyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRoZWFkZXIuZHJhZ1N0YXJ0WSA9IGtvLm9ic2VydmFibGUoMCk7XG5cdGhlYWRlci5tYXhIZWlnaHQgPSAxMzU7XG5cdGhlYWRlci5wYWdlcyA9IGtvLm9ic2VydmFibGVBcnJheShbXG5cdFx0e1xuXHRcdFx0ZGlzcGxheTogJ015IFRpbWUnLFxuXHRcdFx0bGluazogJ215dGltZScsXG5cdFx0XHRpY29uOiAnZmEgZmEtY2xvY2stbydcblx0XHR9LFxuXHRcdHtcblx0XHRcdGRpc3BsYXk6ICdQZW9wbGUnLFxuXHRcdFx0bGluazogJ3Blb3BsZScsXG5cdFx0XHRpY29uOiAnZmEgZmEtdXNlcnMnXG5cdFx0fVxuXHRdKTtcblxuXHRoZWFkZXIuZ29Ub1BhZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuXHRcdGhlYWRlci5hY3RpdmVQYWdlKGluZGV4KTtcblx0XHRhcHAubXlWaWV3TW9kZWwuc3RlcHMuY3VycmVudFN0ZXAoMCk7XG5cdFx0aWYgKGluZGV4ICE9IDEpIHtcblx0XHRcdGFwcC5teVZpZXdNb2RlbC5wZW9wbGUuc2hvd0RldGFpbHMoZmFsc2UpO1xuXHRcdH1cblx0XHRoZWFkZXIuY2xvc2UoKTtcblx0fVxuXG5cdGhlYWRlci5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChoZWFkZXIuaXNPcGVuKCkpIHtcblx0XHRcdGhlYWRlci5pc0RyYWdnaW5nKHRydWUpO1xuXG5cdFx0XHQkKCcjaGVhZGVyJykuYW5pbWF0ZSh7XG5cdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0fSwgMjUwLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aGVhZGVyLmlzRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHRoZWFkZXIuaXNPcGVuKGZhbHNlKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGhlYWRlci5sb2dvdXQgPSBmdW5jdGlvbigpIHtcblx0XHRoZWFkZXIuaXNPcGVuKGZhbHNlKTtcblx0XHRoZWFkZXIuaXNNb2RhbChmYWxzZSk7XG5cdFx0YXBwLm15Vmlld01vZGVsLmF1dGgubG9nb3V0KCk7XG5cdH1cblxuXHRoZWFkZXIuZHJhZ01lbnUgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmIChoZWFkZXIuaXNEcmFnZ2luZygpKSB7XG5cdFx0XHR2YXIgZGVsdGEgPSBNYXRoLmNlaWwoZXZlbnQuZ2VzdHVyZS5kZWx0YVkpO1xuXHRcdFx0dmFyIGNoYW5nZSA9IGhlYWRlci5kcmFnU3RhcnRZKCkgKyBkZWx0YTtcblx0XHRcdFxuXHRcdFx0aWYgKGNoYW5nZSA8IDApIGNoYW5nZSA9IDA7XG5cdFx0XHRpZiAoY2hhbmdlID4gaGVhZGVyLm1heEhlaWdodCkgY2hhbmdlID0gaGVhZGVyLm1heEhlaWdodDtcblxuXHRcdFx0aWYgKGNoYW5nZSA+IDAgJiYgY2hhbmdlIDwgaGVhZGVyLm1heEhlaWdodCkge1xuXHRcdFx0XHQkKCcjaGVhZGVyJykuY3NzKCdtYXJnaW4tdG9wJywgY2hhbmdlKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRoZWFkZXIuZHJhZ01lbnVTdGFydCA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKCFoZWFkZXIuaXNEcmFnZ2luZygpKSB7XG5cdFx0XHRoZWFkZXIuaXNEcmFnZ2luZyh0cnVlKTtcblx0XHRcdGhlYWRlci5kcmFnU3RhcnRZKHBhcnNlSW50KCQoJyNoZWFkZXInKS5jc3MoJ21hcmdpbi10b3AnKSkpO1xuXHRcdFx0JCgnI2hlYWRlcicpLm9uZSgnZHJhZ2VuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHZhciBlbmRIZWlnaHQgPSBwYXJzZUludCgkKCcjaGVhZGVyJykuY3NzKCdtYXJnaW4tdG9wJykpO1xuXHRcdFx0XHRpZiAoZW5kSGVpZ2h0ID49IGhlYWRlci5tYXhIZWlnaHQgLyAyKSB7XG5cdFx0XHRcdFx0aGVhZGVyLmlzT3Blbih0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRoZWFkZXIuaXNPcGVuKGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQkKCcjaGVhZGVyJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0bWFyZ2luVG9wOiBoZWFkZXIuaXNPcGVuKCkgPyBoZWFkZXIubWF4SGVpZ2h0IDogMFxuXHRcdFx0XHR9LCAxMDAsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGhlYWRlci5pc0RyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXI7IiwiLyoqXG4gKiBzY3JpcHRzL25vdGVzLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIE5vdGVzKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIG5vdGVzID0gYXBwLm15Vmlld01vZGVsLm5vdGVzID0ge307XG5cdG5vdGVzLnN0YXR1c09wdGlvbnMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuXHRcdHtcblx0XHRcdGxhYmVsOiAnQnJpbmcgb24gdGhlIHdvcmsnLFxuXHRcdFx0dmFsdWU6IDAsXG5cdFx0XHRpY29uOiAnZmEgZmEtYXJyb3ctZG93bidcblx0XHR9LFxuXHRcdHtcblx0XHRcdGxhYmVsOiAnSVxcJ20gYSBsaXR0bGUgbGlnaHQnLFxuXHRcdFx0dmFsdWU6IDEsXG5cdFx0XHRpY29uOiAnZmEgZmEtbWludXMnXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRsYWJlbDogJ0lcXCdtIGdvb2QnLFxuXHRcdFx0dmFsdWU6IDIsXG5cdFx0XHRpY29uOiAnZmEgZmEtYXJyb3ctcmlnaHQnXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRsYWJlbDogJ0lcXCdtIGEgYml0IG92ZXJ3aGVsbWVkJyxcblx0XHRcdHZhbHVlOiAzLFxuXHRcdFx0aWNvbjogJ2ZhIGZhLW1pbnVzJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bGFiZWw6ICdTdG9wIHRoZSBtYWRuZXNzIScsXG5cdFx0XHR2YWx1ZTogNCxcblx0XHRcdGljb246ICdmYSBmYS1hcnJvdy11cCdcblx0XHR9XG5cdF0pO1xuXG5cdG5vdGVzLnNlbGVjdFN0YXR1cyA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsud2Vla3MoKVthcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsuYWN0aXZlV2VlaygpXS5yYXRpbmcoaXRlbS52YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGVzOyIsIi8qKlxuICogc2NyaXB0cy9wZW9wbGUuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUGVvcGxlKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHBlb3BsZSA9IGFwcC5teVZpZXdNb2RlbC5wZW9wbGUgPSB7fTtcblxuXHRwZW9wbGUubnVtV2Vla3MgPSAzO1xuXHRwZW9wbGUudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRwZW9wbGUuYWN0aXZlV2VlayA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHBlb3BsZS5hY3RpdmVQZXJzb24gPSBrby5vYnNlcnZhYmxlKCk7XG5cdHBlb3BsZS52aWV3VHlwZSA9IGtvLm9ic2VydmFibGUoJ2hvdXJzJyk7XG5cdHBlb3BsZS5zaG93RGV0YWlscyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRwZW9wbGUudGltZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0cGVvcGxlLndlZWtzID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cdHBlb3BsZS5nZXRUaW1lcyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkYXRlcyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGVvcGxlLndlZWtzKCkubGVuZ3RoOyBpKyspIHtcblx0XHRcdGRhdGVzLnB1c2gobW9tZW50KHBlb3BsZS50b2RheSkuYWRkKCdkYXlzJywgKGkgKiA3KSkuZm9ybWF0KCdZWVlZLCBNLCBEJykpXG5cdFx0fVxuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0VGltZXMnLCB7XG5cdFx0XHRkYXRlczogZGF0ZXNcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih0aW1lcykge1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHRpbWVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0dGltZXNbal0uYXR0cmlidXRlcy5kYXRhID0gJC5wYXJzZUpTT04odGltZXNbal0uYXR0cmlidXRlcy5kYXRhKTtcblx0XHRcdFx0XHR2YXIgdG90YWwgPSBfKHRpbWVzW2pdLmF0dHJpYnV0ZXMuZGF0YS5wcm9qZWN0cykucmVkdWNlKGZ1bmN0aW9uKGFjYywgb2JqKSB7XG5cdFx0XHRcdFx0XHRfKG9iaikuZWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7IGFjY1trZXldID0gKGFjY1trZXldID8gYWNjW2tleV0gOiAwKSArIHZhbHVlIH0pO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdFx0XHR9LCB7fSk7XG5cdFx0XHRcdFx0dGltZXNbal0uYXR0cmlidXRlcy50b3RhbCA9IHRvdGFsLnBlcmNlbnRhZ2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGUubnVtV2Vla3M7IGkrKykge1xuXHRcdFx0XHRcdHZhciB3ZWVrRGF0ZSA9IG1vbWVudChwZW9wbGUudG9kYXkpLmFkZCgnZGF5cycsIChpICogNykpLmZvcm1hdCgnWVlZWSwgTSwgRCcpO1xuXHRcdFx0XHRcdHZhciB3ZWVrID0gXy5maWx0ZXIodGltZXMsIGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9iai5hdHRyaWJ1dGVzLmRhdGEuZGF0ZSA9PSB3ZWVrRGF0ZTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdF8uc29ydEJ5KHdlZWssIGZ1bmN0aW9uKG9iail7IHJldHVybiBvYmouYXR0cmlidXRlcy50b3RhbDsgfSk7XG5cblx0XHRcdFx0XHRwZW9wbGUudGltZXMucHVzaCh3ZWVrKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0JCgnI3Blb3BsZSAucGVvcGxlJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cGVvcGxlLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBlb3BsZS5udW1XZWVrczsgaSsrKSB7XG5cdFx0XHR2YXIgd2VlayA9IHtcblx0XHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ01NTSBEJykpXG5cdFx0XHR9XG5cdFx0XHRwZW9wbGUud2Vla3MucHVzaCh3ZWVrKTtcblx0XHR9XG5cdFx0cGVvcGxlLmdldFRpbWVzKCk7XG5cdH1cblxuXHRwZW9wbGUuc2VsZWN0V2VlayA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0cGVvcGxlLmFjdGl2ZVdlZWsoaW5kZXgpO1xuXHRcdC8vIGdvIGdldCB0aGUgZGF0YSBmb3IgdGhpcyB3ZWVrXG5cdH1cblxuXHRwZW9wbGUudG9nZ2xlVmlldyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChwZW9wbGUudmlld1R5cGUoKSA9PSAnaG91cnMnKSB7XG5cdFx0XHRwZW9wbGUudmlld1R5cGUoJ3BlcmNlbnQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGVvcGxlLnZpZXdUeXBlKCdob3VycycpO1xuXHRcdH1cblx0fVxuXG5cdHBlb3BsZS5nb1RvUGVyc29uID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdHBlb3BsZS5hY3RpdmVQZXJzb24oaXRlbSk7XG5cdFx0cGVvcGxlLnNob3dEZXRhaWxzKHRydWUpO1xuXHR9XG5cblx0cGVvcGxlLmRyYWdSZWZyZXNoID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAocGVvcGxlLmlzUmVmcmVzaERyYWdnaW5nKCkpIHtcblx0XHRcdHZhciB0b3AgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKTtcblx0XHRcdHZhciBkZWx0YSA9IE1hdGguZmxvb3IoZXZlbnQuZ2VzdHVyZS5kaXN0YW5jZSk7XG5cdFx0XHRpZiAodG9wID09IDAgJiYgZGVsdGEgPiAzMCkge1xuXHRcdFx0XHRpZiAoZGVsdGEgPiAxMDApIGRlbHRhID0gMTAwO1xuXHRcdFx0XHQkKCcjcGVvcGxlIC5wZW9wbGUnKS5jc3MoJ21hcmdpbi10b3AnLCBkZWx0YSAtIDMwKTtcblx0XHRcdFx0aWYgKGRlbHRhID49IDEwMCkge1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS11cFwiPjwvc3Bhbj5SZWxlYXNlIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjcGVvcGxlIC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHBlb3BsZS5zdGFydFJlZnJlc2hEcmFnID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoIXBlb3BsZS5pc1JlZnJlc2hEcmFnZ2luZygpICYmICFhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmlzT3BlbigpKSB7XG5cdFx0XHRwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcodHJ1ZSk7XG5cdFx0XHQkKGV2ZW50Lmdlc3R1cmUudGFyZ2V0KS5vbmUoJ2RyYWdlbmQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRwZW9wbGUuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHR2YXIgZGVsdGEgPSBwYXJzZUludCgkKCcjcGVvcGxlIC5wZW9wbGUnKS5jc3MoJ21hcmdpbi10b3AnKSk7XG5cdFx0XHRcdGlmIChkZWx0YSA+PSA3MCkge1xuXHRcdFx0XHRcdHBlb3BsZS5nZXRUaW1lcygpO1xuXHRcdFx0XHRcdCQoJyNwZW9wbGUgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmEtc3BpblwiPjwvc3Bhbj5SZWZyZXNoaW5nLi4uJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdFx0JCgnI3Blb3BsZSAucGVvcGxlJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblxuXHR9XG5cblx0cGVvcGxlLmluaXQoKTtcblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQZW9wbGU7IiwiLyoqXG4gKiBzY3JpcHRzL3JhdGUtd2Vlay5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBSYXRlV2VlayhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciByYXRlV2VlayA9IGFwcC5teVZpZXdNb2RlbC5yYXRlV2VlayA9IHt9O1xuXG5cdHJhdGVXZWVrLnJlZ2lzdGVyTW91c2VYID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRyYXRlV2Vlay5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZSA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHJhdGVXZWVrLnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0cmF0ZVdlZWsucmVnaXN0ZXJSYXRpbyA9IGtvLm9ic2VydmFibGUoJChkb2N1bWVudCkud2lkdGgoKSAtIDIwKTtcblx0cmF0ZVdlZWsuYWN0aXZlV2VlayA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHJhdGVXZWVrLnZpZXdUeXBlID0ga28ub2JzZXJ2YWJsZSgnaG91cnMnKTtcblxuXHRyYXRlV2Vlay53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheShbXG5cdFx0e1xuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocmF0ZVdlZWsudG9kYXkpLmZvcm1hdCgnTU1NIEQnKSksXG5cdFx0XHR0b3RhbDoga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdW0gPSBfLnJlZHVjZShhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihtZW1vLCBwcm9qZWN0KSB7XG5cdFx0XHRcdFx0dmFyIGNvbFZhbHVlID0gMDtcblx0XHRcdFx0XHRpZiAocHJvamVjdC5hdHRyaWJ1dGVzLmFjdGl2ZSgpKSB7XG5cdFx0XHRcdFx0XHRjb2xWYWx1ZSA9IHByb2plY3QuYXR0cmlidXRlcy5wZXJjZW50YWdlKClbMF0udmFsdWUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG1lbW8gKyBjb2xWYWx1ZTsgXG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRyZXR1cm4gc3VtO1xuXHRcdFx0fSksXG5cdFx0XHRyYXRpbmc6IGtvLm9ic2VydmFibGUoMiksXG5cdFx0XHRub3Rlczoga28ub2JzZXJ2YWJsZShudWxsKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocmF0ZVdlZWsudG9kYXkpLmFkZCgnZGF5cycsIDcpLmZvcm1hdCgnTU1NIEQnKSksXG5cdFx0XHR0b3RhbDoga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdW0gPSBfLnJlZHVjZShhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihtZW1vLCBwcm9qZWN0KSB7XG5cdFx0XHRcdFx0dmFyIGNvbFZhbHVlID0gMDtcblx0XHRcdFx0XHRpZiAocHJvamVjdC5hdHRyaWJ1dGVzLmFjdGl2ZSgpKSB7XG5cdFx0XHRcdFx0XHRjb2xWYWx1ZSA9IHByb2plY3QuYXR0cmlidXRlcy5wZXJjZW50YWdlKClbMV0udmFsdWUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG1lbW8gKyBjb2xWYWx1ZTsgXG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRyZXR1cm4gc3VtO1xuXHRcdFx0fSksXG5cdFx0XHRyYXRpbmc6IGtvLm9ic2VydmFibGUoMiksXG5cdFx0XHRub3Rlczoga28ub2JzZXJ2YWJsZShudWxsKVxuXHRcdH0sXG5cdFx0eyAgXG5cdFx0XHRkYXRlOiBrby5vYnNlcnZhYmxlKG1vbWVudChyYXRlV2Vlay50b2RheSkuYWRkKCdkYXlzJywgMTQpLmZvcm1hdCgnTU1NIEQnKSksXG5cdFx0XHR0b3RhbDoga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdW0gPSBfLnJlZHVjZShhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihtZW1vLCBwcm9qZWN0KSB7XG5cdFx0XHRcdFx0dmFyIGNvbFZhbHVlID0gMDtcblx0XHRcdFx0XHRpZiAocHJvamVjdC5hdHRyaWJ1dGVzLmFjdGl2ZSgpKSB7XG5cdFx0XHRcdFx0XHRjb2xWYWx1ZSA9IHByb2plY3QuYXR0cmlidXRlcy5wZXJjZW50YWdlKClbMl0udmFsdWUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG1lbW8gKyBjb2xWYWx1ZTsgXG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRyZXR1cm4gc3VtO1xuXHRcdFx0fSksXG5cdFx0XHRyYXRpbmc6IGtvLm9ic2VydmFibGUoMiksXG5cdFx0XHRub3Rlczoga28ub2JzZXJ2YWJsZShudWxsKVxuXHRcdH1cblx0XSk7XG5cblx0cmF0ZVdlZWsuZHJhZyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0dmFyIGRpcmVjdGlvbiA9IGV2ZW50Lmdlc3R1cmUuZGlyZWN0aW9uO1xuXHRcdGlmICghYXBwLm15Vmlld01vZGVsLnBlb3BsZS5zaG93RGV0YWlscygpICYmIChkaXJlY3Rpb24gPT0gJ2xlZnQnIHx8IGRpcmVjdGlvbiA9PSAncmlnaHQnKSkge1xuXHRcdFx0dmFyIHN0YXJ0WCA9IGV2ZW50Lmdlc3R1cmUuc3RhcnRFdmVudC5jZW50ZXIucGFnZVg7XG5cdFx0XHRpZiAocmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVgoKSAhPSBzdGFydFgpIHtcblx0XHRcdFx0cmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVgoc3RhcnRYKTtcblx0XHRcdFx0cmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoaXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVtyYXRlV2Vlay5hY3RpdmVXZWVrKCldLnZhbHVlKCkpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGRpZmYgPSAoZXZlbnQuZ2VzdHVyZS5kZWx0YVggLyByYXRlV2Vlay5yZWdpc3RlclJhdGlvKCkpICogMTUwO1xuXHRcdFx0dmFyIG5ld1BlcmNlbnRhZ2UgPSBNYXRoLmZsb29yKChkaWZmICsgcmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoKSkgLyA1KSAqIDU7XG5cblx0XHRcdGlmIChuZXdQZXJjZW50YWdlID4gMCAmJiBuZXdQZXJjZW50YWdlIDw9IDE1MCkge1xuXHRcdFx0XHRpdGVtLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpW3JhdGVXZWVrLmFjdGl2ZVdlZWsoKV0udmFsdWUobmV3UGVyY2VudGFnZSk7XG5cdFx0XHR9IGVsc2UgaWYgKG5ld1BlcmNlbnRhZ2UgPiAxNTApIHtcblx0XHRcdFx0aXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVtyYXRlV2Vlay5hY3RpdmVXZWVrKCldLnZhbHVlKDE1MCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpdGVtLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpW3JhdGVXZWVrLmFjdGl2ZVdlZWsoKV0udmFsdWUoMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmF0ZVdlZWsuc2VsZWN0V2VlayA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0cmF0ZVdlZWsuYWN0aXZlV2VlayhpbmRleCk7XG5cdH1cblxuXHRyYXRlV2Vlay50YWtlUGljdHVyZSA9IGZ1bmN0aW9uKCkge1xuXHRcdG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZShyYXRlV2Vlay5zZXRQaWN0dXJlLCBmdW5jdGlvbigpIHtcblx0XHRcdC8vIGZhaWxcblx0XHRcdGFsZXJ0KCdPb3BzLiBXZSBjb3VsZG5cXCd0IGFjY2VzcyB5b3VyIGNhbWVyYS4nKTtcblx0XHR9LCB7IFxuXHRcdFx0cXVhbGl0eTogMTAwLCBcblx0XHRcdGFsbG93RWRpdDogdHJ1ZSwgXG5cdFx0XHRkZXN0aW5hdGlvblR5cGU6IG5hdmlnYXRvci5jYW1lcmEuRGVzdGluYXRpb25UeXBlLkRBVEFfVVJMLFxuXHRcdFx0ZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcblx0XHRcdHRhcmdldFdpZHRoOiAxMDAsXG5cdFx0XHR0YXJnZXRIZWlnaHQ6IDEwMCxcblx0XHRcdGNvcnJlY3RPcmllbnRhdGlvbjogdHJ1ZSxcblx0XHRcdGNhbWVyYURpcmVjdGlvbjogQ2FtZXJhLkRpcmVjdGlvbi5GUk9OVFxuXHRcdH0pO1xuXHR9XG5cblx0cmF0ZVdlZWsuc2V0UGljdHVyZSA9IGZ1bmN0aW9uKGltYWdlRGF0YSkge1xuXHRcdCQoJy5hdmF0YXInKS5yZW1vdmVDbGFzcygnZmEtY2FtZXJhJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybChkYXRhOmltYWdlL3BuZztiYXNlNjQsJyArIGltYWdlRGF0YSArICcpJyk7XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCd1cGRhdGVBdmF0YXInLCB7XG5cdFx0XHRhdmF0YXI6IGltYWdlRGF0YVxuXHRcdH0sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0YWxlcnQoJ0F2YXRhciBzdWNjZXNzZnVsbHkgc2F2ZWQuJylcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHQkKCcuYXZhdGFyJykuYWRkQ2xhc3MoJ2ZhLWNhbWVyYScpO1xuXHRcdFx0XHRjb25zb2xlLmxvZygnT29wcy4gV2UgbWVzc2VkIHVwLiBQbGVhc2UgdHJ5IGFnYWluLicpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmF0ZVdlZWsudG9nZ2xlVmlldyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChyYXRlV2Vlay52aWV3VHlwZSgpID09ICdob3VycycpIHtcblx0XHRcdHJhdGVXZWVrLnZpZXdUeXBlKCdwZXJjZW50Jyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJhdGVXZWVrLnZpZXdUeXBlKCdob3VycycpO1xuXHRcdH1cblx0fVxuXG5cdHJhdGVXZWVrLmdvQmFjayA9IGZ1bmN0aW9uKCkge1xuXHRcdGNvbnNvbGUubG9nKCdnbyBiYWNrJylcblx0XHRhcHAubXlWaWV3TW9kZWwucGVvcGxlLnNob3dEZXRhaWxzKGZhbHNlKTtcblx0XHRhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmdvVG9QYWdlKDEpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmF0ZVdlZWs7IiwiLyoqXG4gKiBzY3JpcHRzL3NhdmUuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gU2F2ZShhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBzYXZlID0gYXBwLm15Vmlld01vZGVsLnNhdmUgPSB7fTtcblxuXHRzYXZlLnNhdmVNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNhdmUuc3VjY2VzcyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzYXZlLmVycm9yID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdHNhdmUuc2F2aW5nID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0c2F2ZS5yZXN1bHQgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2F2ZS5kb25lID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRvbmUgPSBmYWxzZTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNhdmUucmVzdWx0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRkb25lID0gZG9uZSB8fCBzYXZlLnJlc3VsdFtpXTtcblx0XHR9XG5cdFx0cmV0dXJuIGRvbmU7XG5cdH0pO1xuXG5cdHNhdmUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG5cdFx0c2F2ZS5zYXZlTW9kZSh0cnVlKTtcblx0XHRzYXZlLnNhdmluZyh0cnVlKTtcblx0XHR2YXIgdGVtcCA9IHt9O1xuXHRcdHZhciBjdXJXZWVrO1xuXHRcdHZhciBudW1XZWVrcyA9IGFwcC5teVZpZXdNb2RlbC5yYXRlV2Vlay53ZWVrcygpLmxlbmd0aDtcblx0XHR2YXIgcHJvamVjdHMgPSBfLmZpbHRlcihhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdHJldHVybiBvYmouYXR0cmlidXRlcy5hY3RpdmUoKTtcblx0XHR9KTtcblx0XHR2YXIgbnVtUHJvamVjdHMgPSBwcm9qZWN0cy5sZW5ndGg7XG5cdFx0dmFyIHRvZGF5ID0gYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLnRvZGF5O1xuXHRcdHZhciB0ZW1wUHJvamVjdCA9IHt9O1xuXHRcdHZhciBkb25lID0gMDtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbnVtV2Vla3M7IGkrKykge1xuXHRcdFx0Y3VyV2VlayA9IGFwcC5teVZpZXdNb2RlbC5yYXRlV2Vlay53ZWVrcygpW2ldO1xuXHRcdFx0dGVtcCA9IHtcblx0XHRcdFx0ZGF0ZTogbW9tZW50KHRvZGF5KS5hZGQoJ2RheXMnLCAoaSAqIDcpKS5mb3JtYXQoJ1lZWVksIE0sIEQnKSxcblx0XHRcdFx0cmF0aW5nOiBjdXJXZWVrLnJhdGluZygpLFxuXHRcdFx0XHRub3RlczogY3VyV2Vlay5ub3RlcygpXG5cdFx0XHR9O1xuXG5cdFx0XHR2YXIgdGVtcFByb2plY3RzID0gW107XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IG51bVByb2plY3RzOyBqKyspIHtcblx0XHRcdFx0dGVtcFByb2plY3QgPSB7XG5cdFx0XHRcdFx0aWQ6IHByb2plY3RzW2pdLmlkLFxuXHRcdFx0XHRcdHBlcmNlbnRhZ2U6IHByb2plY3RzW2pdLmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpW2ldLnZhbHVlKClcblx0XHRcdFx0fVxuXHRcdFx0XHR0ZW1wUHJvamVjdHMucHVzaCh0ZW1wUHJvamVjdCk7XG5cdFx0XHR9XG5cdFx0XHR0ZW1wLnByb2plY3RzID0gdGVtcFByb2plY3RzO1xuXG5cdFx0XHRQYXJzZS5DbG91ZC5ydW4oJ3NhdmVUaW1lJywge1xuXHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeSh0ZW1wKSxcblx0XHRcdFx0ZGF0ZTogdGVtcC5kYXRlXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0XHRhbGVydChkb25lKVxuXHRcdFx0XHRcdGRvbmUgPSBkb25lKzE7XG5cdFx0XHRcdFx0aWYgKGRvbmUgPj0gbnVtV2Vla3MgJiYgc2F2ZS5zYXZpbmcoKSkge1xuXHRcdFx0XHRcdFx0c2F2ZS5zdWNjZXNzKHRydWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdFx0YWxlcnQoZXJyb3IpXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHRcdHNhdmUuZXJyb3IodHJ1ZSk7XG5cdFx0XHRcdFx0c2F2ZS5yZXNldCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRzYXZlLnRyeUFnYWluID0gZnVuY3Rpb24oKSB7XG5cdFx0c2F2ZS5lcnJvcihmYWxzZSk7XG5cdFx0c2F2ZS5zdWNjZXNzKGZhbHNlKTtcblx0XHRzYXZlLnN1Ym1pdCgpO1xuXHR9XG5cblx0c2F2ZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHRcdHNhdmUuc2F2aW5nKGZhbHNlKTtcblx0XHRzYXZlLnNhdmVNb2RlKGZhbHNlKTtcblx0XHRzYXZlLmVycm9yKGZhbHNlKTtcblx0XHRzYXZlLnN1Y2Nlc3MoZmFsc2UpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2F2ZTsiLCIvKipcbiAqIHNjcmlwdHMvc2VsZWN0LXByb2plY3QuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gU2VsZWN0UHJvamVjdChhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBzZWxlY3RQcm9qZWN0ID0gYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QgPSB7fTtcblxuXHRzZWxlY3RQcm9qZWN0LnZpZXdUeXBlID0ga28ub2JzZXJ2YWJsZSgnYWxsJyk7XG5cdHNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC5pc0FkZE1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0c2VsZWN0UHJvamVjdC51bmlxdWVDb21wYW55TmFtZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0ID0ga28ub2JzZXJ2YWJsZUFycmF5KCk7XG5cdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXHRzZWxlY3RQcm9qZWN0LmdldFByb2plY3RzID0gZnVuY3Rpb24oKSB7XG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRQcm9qZWN0cycsIHt9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0cykge1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKFtdKTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9qZWN0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHByb2plY3RzW2ldLmF0dHJpYnV0ZXMuYWN0aXZlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdFx0XHRcdFx0cHJvamVjdHNbaV0uYXR0cmlidXRlcy5wZXJjZW50YWdlID0ga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSk7XG5cdFx0XHRcdFx0c2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cy5wdXNoKHByb2plY3RzW2ldKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAuYWxsLXByb2plY3RzJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0bWFyZ2luVG9wOiAwXG5cdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0UGFyc2UuQ2xvdWQucnVuKCdnZXRVbmlxdWVDb21wYW55TmFtZXMnLCB7fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocHJvamVjdHMpIHtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC51bmlxdWVDb21wYW55TmFtZXMocHJvamVjdHMpO1xuXHRcdFx0fSwgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHNlbGVjdFByb2plY3QuZ2V0UHJvamVjdHMoKTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QudG9nZ2xlUHJvamVjdCA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKGl0ZW0uYXR0cmlidXRlcy5hY3RpdmUoKSkge1xuXHRcdFx0aXRlbS5hdHRyaWJ1dGVzLmFjdGl2ZShmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGl0ZW0uYXR0cmlidXRlcy5hY3RpdmUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC50b2dnbGVBZGRNb2RlID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHNlbGVjdFByb2plY3QuaXNBZGRNb2RlKCkpIHtcblx0XHRcdGFwcC5teVZpZXdNb2RlbC5oZWFkZXIuaXNNb2RhbChmYWxzZSk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmlzQWRkTW9kZShmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFwcC5teVZpZXdNb2RlbC5oZWFkZXIuaXNNb2RhbCh0cnVlKTtcblx0XHRcdCQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLnZhbCgnJyk7XG5cdFx0XHQkKCcucHJvamVjdC1uYW1lLWZpZWxkJykudmFsKCcnKTtcblx0XHRcdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdChbXSk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmlzQWRkTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnRvZ2dsZVZpZXcgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoc2VsZWN0UHJvamVjdC52aWV3VHlwZSgpID09ICdhbGwnKSB7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LnZpZXdUeXBlKCdzZWxlY3RlZCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LnZpZXdUeXBlKCdhbGwnKTtcblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnNlbGVjdFByb2plY3RUeXBlYWhlYWQgPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0JCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykudmFsKGl0ZW0pO1xuXHRcdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdChbXSk7XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnNob3dUeXBlYWhlYWRSZXN1bHRzID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHR2YXIgbmVlZGxlID0gZXZlbnQudGFyZ2V0LnZhbHVlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15cXHdcXGRdL2dpLCAnJyk7XG5cblx0XHRpZiAobmVlZGxlLmxlbmd0aCA+IDApIHtcblx0XHRcdHZhciBmaWx0ZXJlZFByb2plY3RzID0gXy5maWx0ZXIoc2VsZWN0UHJvamVjdC51bmlxdWVDb21wYW55TmFtZXMoKSwgZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRcdHZhciBoYXlzdGFjayA9IG9iai50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teXFx3XFxkXS9naSwgJycpO1xuXHRcdFx0XHRyZXR1cm4gaGF5c3RhY2suaW5kZXhPZihuZWVkbGUpID49IDA7IFxuXHRcdFx0fSk7XG5cdFx0XHR2YXIgZmllbGRQb3NpdGlvbiA9ICQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLm9mZnNldCgpO1xuXHRcdFx0JCgnLnByb2plY3QtdHlwZWFoZWFkJykuY3NzKCdsZWZ0JywgZmllbGRQb3NpdGlvbi5sZWZ0KS5jc3MoJ3RvcCcsIGZpZWxkUG9zaXRpb24udG9wICsgJCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykuaGVpZ2h0KCkrMjApO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KGZpbHRlcmVkUHJvamVjdHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QoW10pO1xuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc2F2ZU5ld1Byb2plY3QgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdGNvbXBhbnk6ICQoJy5wcm9qZWN0LXR5cGVhaGVhZC1maWVsZCcpLnZhbCgpLFxuXHRcdFx0cHJvamVjdDogJCgnLnByb2plY3QtbmFtZS1maWVsZCcpLnZhbCgpLFxuXHRcdH1cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ3NhdmVQcm9qZWN0JywgZGF0YSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocHJvamVjdCkge1xuXHRcdFx0XHRhbGVydCgnXCInICsgcHJvamVjdC5hdHRyaWJ1dGVzLmNvbXBhbnkgKyAnOiAnICsgcHJvamVjdC5hdHRyaWJ1dGVzLm5hbWUgKyAnXCIgY3JlYXRlZCBzdWNjZXNzZnVsbHkuJyk7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QudG9nZ2xlQWRkTW9kZSgpO1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LmdldFByb2plY3RzKCk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Ly8gYWxlcnQoZXJyb3IpXG5cdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcdFxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5kcmFnUmVmcmVzaCA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoKSkge1xuXHRcdFx0dmFyIHRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpO1xuXHRcdFx0dmFyIGRlbHRhID0gTWF0aC5mbG9vcihldmVudC5nZXN0dXJlLmRpc3RhbmNlKTtcblx0XHRcdGlmICh0b3AgPT0gMCAmJiBkZWx0YSA+IDMwKSB7XG5cdFx0XHRcdGlmIChkZWx0YSA+IDEwMCkgZGVsdGEgPSAxMDA7XG5cdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAuYWxsLXByb2plY3RzJykuY3NzKCdtYXJnaW4tdG9wJywgZGVsdGEgLSAzMCk7XG5cdFx0XHRcdGlmIChkZWx0YSA+PSAxMDApIHtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS11cFwiPjwvc3Bhbj5SZWxlYXNlIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCcjc2VsZWN0LXByb2plY3QgLnJlZnJlc2gnKS5odG1sKCc8c3BhbiBjbGFzcz1cImZhIGZhLWFycm93LWNpcmNsZS1kb3duXCI+PC9zcGFuPlB1bGwgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zdGFydFJlZnJlc2hEcmFnID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoIXNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiAhYXBwLm15Vmlld01vZGVsLmhlYWRlci5pc09wZW4oKSkge1xuXHRcdFx0c2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZyh0cnVlKTtcblx0XHRcdCQoZXZlbnQuZ2VzdHVyZS50YXJnZXQpLm9uZSgnZHJhZ2VuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHR2YXIgZGVsdGEgPSBwYXJzZUludCgkKCcjc2VsZWN0LXByb2plY3QgLmFsbC1wcm9qZWN0cycpLmNzcygnbWFyZ2luLXRvcCcpKTtcblxuXHRcdFx0XHRpZiAoZGVsdGEgPj0gNzApIHtcblx0XHRcdFx0XHRzZWxlY3RQcm9qZWN0LmdldFByb2plY3RzKCk7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW5cIj48L3NwYW4+UmVmcmVzaGluZy4uLicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLWRvd25cIj48L3NwYW4+UHVsbCB0byByZWZyZXNoJyk7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5hbGwtcHJvamVjdHMnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRcdG1hcmdpblRvcDogMFxuXHRcdFx0XHRcdH0sIDEwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LmluaXQoKTtcblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RQcm9qZWN0OyIsIi8qKlxuICogc2NyaXB0cy9zdGVwcy5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTdGVwcyhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBzdGVwcyA9IGFwcC5teVZpZXdNb2RlbC5zdGVwcyA9IHt9O1xuXG5cdHN0ZXBzLmN1cnJlbnRTdGVwID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0c3RlcHMuc3RlcHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuXHRcdHtcblx0XHRcdHN0ZXBOdW1iZXI6IDAsXG5cdFx0XHRzdGVwTmFtZTogJ3NlbGVjdFByb2plY3QnXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRzdGVwTnVtYmVyOiAxLFxuXHRcdFx0c3RlcE5hbWU6ICdyYXRlV2Vlaydcblx0XHR9LFxuXHRcdHtcblx0XHRcdHN0ZXBOdW1iZXI6IDIsXG5cdFx0XHRzdGVwTmFtZTogJ25vdGVzJ1xuXHRcdH1cblx0XSk7XG5cblx0c3RlcHMuY2hhbmdlU3RlcCA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRhcHAubXlWaWV3TW9kZWwuaGVhZGVyLmNsb3NlKCk7XG5cdFx0c3RlcHMuY3VycmVudFN0ZXAoaXRlbS5zdGVwTnVtYmVyKTtcblx0fVxuXG5cdHN0ZXBzLm5leHRTdGVwID0gZnVuY3Rpb24oZGlyZWN0aW9uKSB7XG5cdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5jbG9zZSgpO1xuXHRcdHN0ZXBzLmN1cnJlbnRTdGVwKHN0ZXBzLmN1cnJlbnRTdGVwKCkgKyBkaXJlY3Rpb24pO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RlcHM7Il19
