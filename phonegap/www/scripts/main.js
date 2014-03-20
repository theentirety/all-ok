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
},{"./app.js":1,"./auth.js":2,"./header.js":4,"./notes.js":5,"./people.js":6,"./rate-week.js":7,"./select-project.js":8,"./steps.js":9}],4:[function(require,module,exports){
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

	people.registerMouseX = ko.observable();
	people.registerStartPercentage = ko.observable(0);
	people.today = moment(new Date()).startOf('isoweek');
	people.registerRatio = ko.observable($(document).width() - 20);
	people.activeWeek = ko.observable(0);
	people.activePerson = ko.observable();
	people.viewType = ko.observable('hours');
	people.showDetails = ko.observable(false);
	people.allPeople = ko.observableArray();

	people.weeks = ko.observableArray([
		{
			date: ko.observable(moment(people.today).format('MMM D'))
		},
		{
			date: ko.observable(moment(people.today).add('days', 7).format('MMM D'))
		},
		{  
			date: ko.observable(moment(people.today).add('days', 14).format('MMM D'))
		}
	]);

	people.getPeople = function() {
		Parse.Cloud.run('getPeople', {}, {
			success: function(peopleList) {
				people.allPeople([]);
				var peopleLength = peopleList.length;
				for (var i = 0; i < peopleLength; i++) {
					peopleList[i].percentages = ko.observableArray();
					people.allPeople.push(peopleList[i]);
				}
			}, error: function(error) {
				console.log(error);
			}
		});
	}

	people.init = function() {
		people.getPeople();
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

	people.refresh = function() {
		people.getPeople();
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
},{}],9:[function(require,module,exports){
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
		// {
		// 	stepNumber: 3,
		// 	stepName: 'selectProject'
		// }
	]);

	// $(document).on('swipe', function() {
	// 	alert('swipe')
	// });

	steps.changeStep = function(item) {
		app.myViewModel.header.close();
		steps.currentStep(item.stepNumber);
		// app.myViewModel.rateProject.initProject();
	}

	steps.nextStep = function(direction) {
		app.myViewModel.header.close();
		steps.currentStep(steps.currentStep() + direction);
		// app.myViewModel.rateProject.initProject();
	}

	return self;
}

module.exports = Steps;
},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvYXV0aC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvZmFrZV8xMjVlMjc5Mi5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvaGVhZGVyLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ub3Rlcy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcGVvcGxlLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9yYXRlLXdlZWsuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3NlbGVjdC1wcm9qZWN0LmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zdGVwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIHNjcmlwdHMvYXBwLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEFwcCgpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdC8vIGluaXRpYWxpemUga25vY2tvdXRcblx0c2VsZi5teVZpZXdNb2RlbCA9IHt9O1xuXG5cdHNlbGYubXlWaWV3TW9kZWwuY3VycmVudFVzZXIgPSBrby5vYnNlcnZhYmxlKG51bGwpO1xuXG5cdHNlbGYuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZXJlYWR5Jywgc2VsZi5vbkRldmljZVJlYWR5LCBmYWxzZSk7XG5cdH1cblxuXHRzZWxmLm9uRGV2aWNlUmVhZHkgPSBmdW5jdGlvbigpIHtcblx0XHRrby5hcHBseUJpbmRpbmdzKHNlbGYubXlWaWV3TW9kZWwpO1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAobmF2aWdhdG9yLnNwbGFzaHNjcmVlbikge1xuXHRcdFx0XHRuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuLmhpZGUoKTtcblx0XHRcdH1cblx0XHR9LCAyMDAwKTtcblx0XHRcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDsiLCIvKipcbiAqIHNjcmlwdHMvYXV0aC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBdXRoKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGF1dGggPSBhcHAubXlWaWV3TW9kZWwuYXV0aCA9IHt9O1xuXG5cdGF1dGguY3VycmVudFVzZXIgPSBrby5vYnNlcnZhYmxlKCk7XG5cdGF1dGguZXJyb3JNZXNzYWdlID0ga28ub2JzZXJ2YWJsZSgnJyk7XG5cdGF1dGguc2lnblVwTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRhdXRoLmlzQWRtaW4gPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXHR2YXIgY3VycmVudFVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcblx0aWYgKGN1cnJlbnRVc2VyKSB7XG5cdFx0YXV0aC5jdXJyZW50VXNlcihjdXJyZW50VXNlcik7XG5cdH1cblxuXHRhdXRoLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2NoZWNrQWRtaW5TdGF0dXMnLCB7fSwge1xuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oaXNBZG1pbikge1xuXHRcdFx0XHRhdXRoLmlzQWRtaW4oaXNBZG1pbik7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0YXV0aC5yZXNldEVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5lcnJvck1lc3NhZ2UoJycpO1xuXHR9XG5cblx0YXV0aC5zaWduSW5VcCA9IGZ1bmN0aW9uKGZvcm1FbGVtZW50KSB7XG5cdFx0Ly8ga28ucG9zdGJveC5wdWJsaXNoKCdpc0xvYWRpbmcnLCB0cnVlKTtcblx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblxuXHRcdHZhciB1c2VybmFtZSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF91c2VybmFtZV0nKS52YWwoKTtcblx0XHR2YXIgcGFzc3dvcmQgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfcGFzc3dvcmRdJykudmFsKCk7XG5cblx0XHRpZiAoYXV0aC5zaWduVXBNb2RlKCkpIHtcblx0XHRcdHZhciBlbWFpbCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9lbWFpbF0nKS52YWwoKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0dmFyIGRpc3BsYXlOYW1lID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2Rpc3BsYXlOYW1lXScpLnZhbCgpO1xuXHRcdFx0dmFyIHBhc3N3b3JkQ29uZmlybSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9jb25maXJtUGFzc3dvcmRdJykudmFsKCk7XG5cblx0XHRcdC8vIHZhbGlkYXRpb25cblx0XHRcdGlmIChlbWFpbC5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgeW91ciBlbWFpbCBhZGRyZXNzLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChkaXNwbGF5TmFtZS5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgeW91ciBmaXJzdCBhbmQgbGFzdCBuYW1lLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh1c2VybmFtZS5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgYSB1c2VybmFtZS4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocGFzc3dvcmQubGVuZ3RoIDwgMSB8fCBwYXNzd29yZENvbmZpcm0gPCAxIHx8IHBhc3N3b3JkICE9IHBhc3N3b3JkQ29uZmlybSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIGFuZCBjb25maXJtIGEgcGFzc3dvcmQuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHVzZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuXHRcdFx0dmFyIHNjcnViYmVkVXNlcm5hbWUgPSB1c2VybmFtZS5yZXBsYWNlKC9cXHMrL2csXCJcIik7IC8vcmVtb3ZlIHdoaXRlIHNwYWNlXG5cdFx0XHRzY3J1YmJlZFVzZXJuYW1lID0gc2NydWJiZWRVc2VybmFtZS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHR1c2VyLnNldCgndXNlcm5hbWUnLCBzY3J1YmJlZFVzZXJuYW1lKTtcblx0XHRcdHVzZXIuc2V0KCdwYXNzd29yZCcsIHBhc3N3b3JkKTtcblx0XHRcdHVzZXIuc2V0KCdlbWFpbCcsIGVtYWlsKTtcblx0XHRcdHVzZXIuc2V0KCdkaXNwbGF5TmFtZScsIGRpc3BsYXlOYW1lKTtcblxuXHRcdFx0Ly8gb3RoZXIgZmllbGRzIGNhbiBiZSBzZXQganVzdCBsaWtlIHdpdGggUGFyc2UuT2JqZWN0XG5cdFx0XHQvLyB1c2VyLnNldChcInBob25lXCIsIFwiNDE1LTM5Mi0wMjAyXCIpO1xuXG5cdFx0XHR1c2VyLnNpZ25VcChudWxsLCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0XHRhdXRoLmN1cnJlbnRVc2VyKHVzZXIpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCBwYXNzd29yZCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0XHRhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5pbml0KCk7XG5cdFx0XHRcdFx0aWYgKHVzZXIuYXR0cmlidXRlcy5pc0FkbWluKSB7XG5cdFx0XHRcdFx0XHRhdXRoLmlzQWRtaW4odHJ1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHQvLyBUaGUgbG9naW4gZmFpbGVkLiBDaGVjayBlcnJvciB0byBzZWUgd2h5LlxuXHRcdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGF1dGgubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0UGFyc2UuVXNlci5sb2dPdXQoKTtcblx0XHRhdXRoLmN1cnJlbnRVc2VyKG51bGwpO1xuXHR9XG5cblx0YXV0aC5zaG93U2lnblVwID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5lcnJvck1lc3NhZ2UoJycpO1xuXHRcdGlmIChhdXRoLnNpZ25VcE1vZGUoKSkge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguc2FuaXRpemVFcnJvcnMgPSBmdW5jdGlvbihlcnJvcikge1xuXHRcdHN3aXRjaChlcnJvci5jb2RlKVxuXHRcdHtcblx0XHRcdGNhc2UgMTAxOlxuXHRcdFx0XHRyZXR1cm4gJ1BsZWFzZSBlbnRlciBhIHZhbGlkIHVzZXJuYW1lIGFuZCBwYXNzd29yZC4nO1xuXHRcdFx0Y2FzZSAxMjQ6XG5cdFx0XHRcdHJldHVybiAnT29wcyEgV2UgbWVzc2VkIHVwLiBQbGVhc2UgdHJ5IGFnYWluLic7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gZXJyb3IubWVzc2FnZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGVycm9yLm1lc3NhZ2Uuc2xpY2UoMSkgKyAnLic7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0aDsiLCIvKipcbiAqIHNjcmlwdHMvbWFpbi5qc1xuICpcbiAqIFRoaXMgaXMgdGhlIHN0YXJ0aW5nIHBvaW50IGZvciB5b3VyIGFwcGxpY2F0aW9uLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXBwID0gcmVxdWlyZSgnLi9hcHAuanMnKTtcbnZhciBBdXRoID0gcmVxdWlyZSgnLi9hdXRoLmpzJyk7XG52YXIgU3RlcHMgPSByZXF1aXJlKCcuL3N0ZXBzLmpzJyk7XG52YXIgU2VsZWN0UHJvamVjdCA9IHJlcXVpcmUoJy4vc2VsZWN0LXByb2plY3QuanMnKTtcbnZhciBIZWFkZXIgPSByZXF1aXJlKCcuL2hlYWRlci5qcycpO1xudmFyIFJhdGVXZWVrID0gcmVxdWlyZSgnLi9yYXRlLXdlZWsuanMnKTtcbnZhciBOb3RlcyA9IHJlcXVpcmUoJy4vbm90ZXMuanMnKTtcbnZhciBQZW9wbGUgPSByZXF1aXJlKCcuL3Blb3BsZS5qcycpO1xuXG4vLyBpbml0aWFsaXplIHBhcnNlXG5QYXJzZS5pbml0aWFsaXplKFwiSmtZTmZQQncyYVBnY2M3UGVUR0hNQVUyWEt2anplcVZJa3lDbFZ1b1wiLCBcIjQ1T01VM1pTM281YzE2OGxReGEwaWx4UXU0RmRNVkhUMU5WVGtPUmxcIik7XG5cbi8vIGluaXRpYWxpemUgdHlwZWtpdFxudHJ5e1R5cGVraXQubG9hZCgpO31jYXRjaChlKXt9XG5cbnZhciBhcHAgPSBuZXcgQXBwKCk7XG52YXIgYXV0aCA9IG5ldyBBdXRoKGFwcCk7XG52YXIgc3RlcHMgPSBuZXcgU3RlcHMoYXBwKTtcbnZhciBzZWxlY3RQcm9qZWN0ID0gbmV3IFNlbGVjdFByb2plY3QoYXBwKTtcbnZhciBoZWFkZXIgPSBuZXcgSGVhZGVyKGFwcCk7XG52YXIgcmF0ZVdlZWsgPSBuZXcgUmF0ZVdlZWsoYXBwKTtcbnZhciBub3RlcyA9IG5ldyBOb3RlcyhhcHApO1xudmFyIHBlb3BsZSA9IG5ldyBQZW9wbGUoYXBwKTtcblxuXG4vLyBDdXN0b20ga25vY2tvdXQgZXh0bmVkZXJzXG5cbi8vIEhlcmUncyBhIGN1c3RvbSBLbm9ja291dCBiaW5kaW5nIHRoYXQgbWFrZXMgZWxlbWVudHMgc2hvd24vaGlkZGVuIHZpYSBqUXVlcnkncyBmYWRlSW4oKS9mYWRlT3V0KCkgbWV0aG9kc1xuLy8gQ291bGQgYmUgc3RvcmVkIGluIGEgc2VwYXJhdGUgdXRpbGl0eSBsaWJyYXJ5XG5rby5iaW5kaW5nSGFuZGxlcnMuZmFkZVZpc2libGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBJbml0aWFsbHkgc2V0IHRoZSBlbGVtZW50IHRvIGJlIGluc3RhbnRseSB2aXNpYmxlL2hpZGRlbiBkZXBlbmRpbmcgb24gdGhlIHZhbHVlXG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgJChlbGVtZW50KS50b2dnbGUoa28udW53cmFwKHZhbHVlKSk7IC8vIFVzZSBcInVud3JhcE9ic2VydmFibGVcIiBzbyB3ZSBjYW4gaGFuZGxlIHZhbHVlcyB0aGF0IG1heSBvciBtYXkgbm90IGJlIG9ic2VydmFibGVcbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBXaGVuZXZlciB0aGUgdmFsdWUgc3Vic2VxdWVudGx5IGNoYW5nZXMsIHNsb3dseSBmYWRlIHRoZSBlbGVtZW50IGluIG9yIG91dFxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgIGtvLnVud3JhcCh2YWx1ZSkgPyAkKGVsZW1lbnQpLmZhZGVJbigpIDogJChlbGVtZW50KS5mYWRlT3V0KCk7XG4gICAgfVxufVxuXG5hcHAuaW5pdGlhbGl6ZSgpOyIsIi8qKlxuICogc2NyaXB0cy9oZWFkZXIuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gSGVhZGVyKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGhlYWRlciA9IGFwcC5teVZpZXdNb2RlbC5oZWFkZXIgPSB7fTtcblxuXHRoZWFkZXIuYWN0aXZlUGFnZSA9IGtvLm9ic2VydmFibGUoMCk7XG5cdGhlYWRlci5pc01vZGFsID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cdGhlYWRlci5pc09wZW4gPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0aGVhZGVyLmlzRHJhZ2dpbmcgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0aGVhZGVyLmRyYWdTdGFydFkgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRoZWFkZXIubWF4SGVpZ2h0ID0gMTM1O1xuXHRoZWFkZXIucGFnZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuXHRcdHtcblx0XHRcdGRpc3BsYXk6ICdNeSBUaW1lJyxcblx0XHRcdGxpbms6ICdteXRpbWUnLFxuXHRcdFx0aWNvbjogJ2ZhIGZhLWNsb2NrLW8nXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRkaXNwbGF5OiAnUGVvcGxlJyxcblx0XHRcdGxpbms6ICdwZW9wbGUnLFxuXHRcdFx0aWNvbjogJ2ZhIGZhLXVzZXJzJ1xuXHRcdH1cblx0XSk7XG5cblx0aGVhZGVyLmdvVG9QYWdlID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRoZWFkZXIuYWN0aXZlUGFnZShpbmRleCk7XG5cdFx0YXBwLm15Vmlld01vZGVsLnN0ZXBzLmN1cnJlbnRTdGVwKDApO1xuXHRcdGlmIChpbmRleCAhPSAxKSB7XG5cdFx0XHRhcHAubXlWaWV3TW9kZWwucGVvcGxlLnNob3dEZXRhaWxzKGZhbHNlKTtcblx0XHR9XG5cdFx0aGVhZGVyLmNsb3NlKCk7XG5cdH1cblxuXHRoZWFkZXIuY2xvc2UgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoaGVhZGVyLmlzT3BlbigpKSB7XG5cdFx0XHRoZWFkZXIuaXNEcmFnZ2luZyh0cnVlKTtcblxuXHRcdFx0JCgnI2hlYWRlcicpLmFuaW1hdGUoe1xuXHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdH0sIDI1MCwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGhlYWRlci5pc0RyYWdnaW5nKGZhbHNlKTtcblx0XHRcdFx0aGVhZGVyLmlzT3BlbihmYWxzZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRoZWFkZXIubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aGVhZGVyLmlzT3BlbihmYWxzZSk7XG5cdFx0aGVhZGVyLmlzTW9kYWwoZmFsc2UpO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5hdXRoLmxvZ291dCgpO1xuXHR9XG5cblx0aGVhZGVyLmRyYWdNZW51ID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoaGVhZGVyLmlzRHJhZ2dpbmcoKSkge1xuXHRcdFx0dmFyIGRlbHRhID0gTWF0aC5jZWlsKGV2ZW50Lmdlc3R1cmUuZGVsdGFZKTtcblx0XHRcdHZhciBjaGFuZ2UgPSBoZWFkZXIuZHJhZ1N0YXJ0WSgpICsgZGVsdGE7XG5cdFx0XHRcblx0XHRcdGlmIChjaGFuZ2UgPCAwKSBjaGFuZ2UgPSAwO1xuXHRcdFx0aWYgKGNoYW5nZSA+IGhlYWRlci5tYXhIZWlnaHQpIGNoYW5nZSA9IGhlYWRlci5tYXhIZWlnaHQ7XG5cblx0XHRcdGlmIChjaGFuZ2UgPiAwICYmIGNoYW5nZSA8IGhlYWRlci5tYXhIZWlnaHQpIHtcblx0XHRcdFx0JCgnI2hlYWRlcicpLmNzcygnbWFyZ2luLXRvcCcsIGNoYW5nZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aGVhZGVyLmRyYWdNZW51U3RhcnQgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmICghaGVhZGVyLmlzRHJhZ2dpbmcoKSkge1xuXHRcdFx0aGVhZGVyLmlzRHJhZ2dpbmcodHJ1ZSk7XG5cdFx0XHRoZWFkZXIuZHJhZ1N0YXJ0WShwYXJzZUludCgkKCcjaGVhZGVyJykuY3NzKCdtYXJnaW4tdG9wJykpKTtcblx0XHRcdCQoJyNoZWFkZXInKS5vbmUoJ2RyYWdlbmQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHR2YXIgZW5kSGVpZ2h0ID0gcGFyc2VJbnQoJCgnI2hlYWRlcicpLmNzcygnbWFyZ2luLXRvcCcpKTtcblx0XHRcdFx0aWYgKGVuZEhlaWdodCA+PSBoZWFkZXIubWF4SGVpZ2h0IC8gMikge1xuXHRcdFx0XHRcdGhlYWRlci5pc09wZW4odHJ1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aGVhZGVyLmlzT3BlbihmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0JCgnI2hlYWRlcicpLmFuaW1hdGUoe1xuXHRcdFx0XHRcdG1hcmdpblRvcDogaGVhZGVyLmlzT3BlbigpID8gaGVhZGVyLm1heEhlaWdodCA6IDBcblx0XHRcdFx0fSwgMTAwLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRoZWFkZXIuaXNEcmFnZ2luZyhmYWxzZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyOyIsIi8qKlxuICogc2NyaXB0cy9ub3Rlcy5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBOb3RlcyhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBub3RlcyA9IGFwcC5teVZpZXdNb2RlbC5ub3RlcyA9IHt9O1xuXHRub3Rlcy5zdGF0dXNPcHRpb25zID0ga28ub2JzZXJ2YWJsZUFycmF5KFtcblx0XHR7XG5cdFx0XHRsYWJlbDogJ0JyaW5nIG9uIHRoZSB3b3JrJyxcblx0XHRcdHZhbHVlOiAwLFxuXHRcdFx0aWNvbjogJ2ZhIGZhLWFycm93LWRvd24nXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRsYWJlbDogJ0lcXCdtIGEgbGl0dGxlIGxpZ2h0Jyxcblx0XHRcdHZhbHVlOiAxLFxuXHRcdFx0aWNvbjogJ2ZhIGZhLW1pbnVzJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bGFiZWw6ICdJXFwnbSBnb29kJyxcblx0XHRcdHZhbHVlOiAyLFxuXHRcdFx0aWNvbjogJ2ZhIGZhLWFycm93LXJpZ2h0J1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bGFiZWw6ICdJXFwnbSBhIGJpdCBvdmVyd2hlbG1lZCcsXG5cdFx0XHR2YWx1ZTogMyxcblx0XHRcdGljb246ICdmYSBmYS1taW51cydcblx0XHR9LFxuXHRcdHtcblx0XHRcdGxhYmVsOiAnU3RvcCB0aGUgbWFkbmVzcyEnLFxuXHRcdFx0dmFsdWU6IDQsXG5cdFx0XHRpY29uOiAnZmEgZmEtYXJyb3ctdXAnXG5cdFx0fVxuXHRdKTtcblxuXHRub3Rlcy5zZWxlY3RTdGF0dXMgPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0YXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLndlZWtzKClbYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrLmFjdGl2ZVdlZWsoKV0ucmF0aW5nKGl0ZW0udmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBOb3RlczsiLCIvKipcbiAqIHNjcmlwdHMvcGVvcGxlLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFBlb3BsZShhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBwZW9wbGUgPSBhcHAubXlWaWV3TW9kZWwucGVvcGxlID0ge307XG5cblx0cGVvcGxlLnJlZ2lzdGVyTW91c2VYID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRwZW9wbGUucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRwZW9wbGUudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRwZW9wbGUucmVnaXN0ZXJSYXRpbyA9IGtvLm9ic2VydmFibGUoJChkb2N1bWVudCkud2lkdGgoKSAtIDIwKTtcblx0cGVvcGxlLmFjdGl2ZVdlZWsgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRwZW9wbGUuYWN0aXZlUGVyc29uID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRwZW9wbGUudmlld1R5cGUgPSBrby5vYnNlcnZhYmxlKCdob3VycycpO1xuXHRwZW9wbGUuc2hvd0RldGFpbHMgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0cGVvcGxlLmFsbFBlb3BsZSA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXG5cdHBlb3BsZS53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheShbXG5cdFx0e1xuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocGVvcGxlLnRvZGF5KS5mb3JtYXQoJ01NTSBEJykpXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRkYXRlOiBrby5vYnNlcnZhYmxlKG1vbWVudChwZW9wbGUudG9kYXkpLmFkZCgnZGF5cycsIDcpLmZvcm1hdCgnTU1NIEQnKSlcblx0XHR9LFxuXHRcdHsgIFxuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocGVvcGxlLnRvZGF5KS5hZGQoJ2RheXMnLCAxNCkuZm9ybWF0KCdNTU0gRCcpKVxuXHRcdH1cblx0XSk7XG5cblx0cGVvcGxlLmdldFBlb3BsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFBhcnNlLkNsb3VkLnJ1bignZ2V0UGVvcGxlJywge30sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHBlb3BsZUxpc3QpIHtcblx0XHRcdFx0cGVvcGxlLmFsbFBlb3BsZShbXSk7XG5cdFx0XHRcdHZhciBwZW9wbGVMZW5ndGggPSBwZW9wbGVMaXN0Lmxlbmd0aDtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwZW9wbGVMZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHBlb3BsZUxpc3RbaV0ucGVyY2VudGFnZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0XHRcdFx0XHRwZW9wbGUuYWxsUGVvcGxlLnB1c2gocGVvcGxlTGlzdFtpXSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRwZW9wbGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHBlb3BsZS5nZXRQZW9wbGUoKTtcblx0fVxuXG5cdHBlb3BsZS5zZWxlY3RXZWVrID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRwZW9wbGUuYWN0aXZlV2VlayhpbmRleCk7XG5cdFx0Ly8gZ28gZ2V0IHRoZSBkYXRhIGZvciB0aGlzIHdlZWtcblx0fVxuXG5cdHBlb3BsZS50b2dnbGVWaWV3ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHBlb3BsZS52aWV3VHlwZSgpID09ICdob3VycycpIHtcblx0XHRcdHBlb3BsZS52aWV3VHlwZSgncGVyY2VudCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwZW9wbGUudmlld1R5cGUoJ2hvdXJzJyk7XG5cdFx0fVxuXHR9XG5cblx0cGVvcGxlLmdvVG9QZXJzb24gPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0cGVvcGxlLmFjdGl2ZVBlcnNvbihpdGVtKTtcblx0XHRwZW9wbGUuc2hvd0RldGFpbHModHJ1ZSk7XG5cdH1cblxuXHRwZW9wbGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuXHRcdHBlb3BsZS5nZXRQZW9wbGUoKTtcblx0fVxuXG5cdHBlb3BsZS5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGVvcGxlOyIsIi8qKlxuICogc2NyaXB0cy9yYXRlLXdlZWsuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUmF0ZVdlZWsoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcmF0ZVdlZWsgPSBhcHAubXlWaWV3TW9kZWwucmF0ZVdlZWsgPSB7fTtcblxuXHRyYXRlV2Vlay5yZWdpc3Rlck1vdXNlWCA9IGtvLm9ic2VydmFibGUoKTtcblx0cmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRyYXRlV2Vlay50b2RheSA9IG1vbWVudChuZXcgRGF0ZSgpKS5zdGFydE9mKCdpc293ZWVrJyk7XG5cdHJhdGVXZWVrLnJlZ2lzdGVyUmF0aW8gPSBrby5vYnNlcnZhYmxlKCQoZG9jdW1lbnQpLndpZHRoKCkgLSAyMCk7XG5cdHJhdGVXZWVrLmFjdGl2ZVdlZWsgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRyYXRlV2Vlay52aWV3VHlwZSA9IGtvLm9ic2VydmFibGUoJ2hvdXJzJyk7XG5cblx0cmF0ZVdlZWsud2Vla3MgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuXHRcdHtcblx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHJhdGVXZWVrLnRvZGF5KS5mb3JtYXQoJ01NTSBEJykpLFxuXHRcdFx0dG90YWw6IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3VtID0gXy5yZWR1Y2UoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24obWVtbywgcHJvamVjdCkge1xuXHRcdFx0XHRcdHZhciBjb2xWYWx1ZSA9IDA7XG5cdFx0XHRcdFx0aWYgKHByb2plY3QuYXR0cmlidXRlcy5hY3RpdmUoKSkge1xuXHRcdFx0XHRcdFx0Y29sVmFsdWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpWzBdLnZhbHVlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBtZW1vICsgY29sVmFsdWU7IFxuXHRcdFx0XHR9LCAwKTtcblx0XHRcdFx0cmV0dXJuIHN1bTtcblx0XHRcdH0pLFxuXHRcdFx0cmF0aW5nOiBrby5vYnNlcnZhYmxlKDIpLFxuXHRcdFx0bm90ZXM6IGtvLm9ic2VydmFibGUobnVsbClcblx0XHR9LFxuXHRcdHtcblx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHJhdGVXZWVrLnRvZGF5KS5hZGQoJ2RheXMnLCA3KS5mb3JtYXQoJ01NTSBEJykpLFxuXHRcdFx0dG90YWw6IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3VtID0gXy5yZWR1Y2UoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24obWVtbywgcHJvamVjdCkge1xuXHRcdFx0XHRcdHZhciBjb2xWYWx1ZSA9IDA7XG5cdFx0XHRcdFx0aWYgKHByb2plY3QuYXR0cmlidXRlcy5hY3RpdmUoKSkge1xuXHRcdFx0XHRcdFx0Y29sVmFsdWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpWzFdLnZhbHVlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBtZW1vICsgY29sVmFsdWU7IFxuXHRcdFx0XHR9LCAwKTtcblx0XHRcdFx0cmV0dXJuIHN1bTtcblx0XHRcdH0pLFxuXHRcdFx0cmF0aW5nOiBrby5vYnNlcnZhYmxlKDIpLFxuXHRcdFx0bm90ZXM6IGtvLm9ic2VydmFibGUobnVsbClcblx0XHR9LFxuXHRcdHsgIFxuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocmF0ZVdlZWsudG9kYXkpLmFkZCgnZGF5cycsIDE0KS5mb3JtYXQoJ01NTSBEJykpLFxuXHRcdFx0dG90YWw6IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3VtID0gXy5yZWR1Y2UoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24obWVtbywgcHJvamVjdCkge1xuXHRcdFx0XHRcdHZhciBjb2xWYWx1ZSA9IDA7XG5cdFx0XHRcdFx0aWYgKHByb2plY3QuYXR0cmlidXRlcy5hY3RpdmUoKSkge1xuXHRcdFx0XHRcdFx0Y29sVmFsdWUgPSBwcm9qZWN0LmF0dHJpYnV0ZXMucGVyY2VudGFnZSgpWzJdLnZhbHVlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBtZW1vICsgY29sVmFsdWU7IFxuXHRcdFx0XHR9LCAwKTtcblx0XHRcdFx0cmV0dXJuIHN1bTtcblx0XHRcdH0pLFxuXHRcdFx0cmF0aW5nOiBrby5vYnNlcnZhYmxlKDIpLFxuXHRcdFx0bm90ZXM6IGtvLm9ic2VydmFibGUobnVsbClcblx0XHR9XG5cdF0pO1xuXG5cdHJhdGVXZWVrLmRyYWcgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdHZhciBkaXJlY3Rpb24gPSBldmVudC5nZXN0dXJlLmRpcmVjdGlvbjtcblx0XHRpZiAoIWFwcC5teVZpZXdNb2RlbC5wZW9wbGUuc2hvd0RldGFpbHMoKSAmJiAoZGlyZWN0aW9uID09ICdsZWZ0JyB8fCBkaXJlY3Rpb24gPT0gJ3JpZ2h0JykpIHtcblx0XHRcdHZhciBzdGFydFggPSBldmVudC5nZXN0dXJlLnN0YXJ0RXZlbnQuY2VudGVyLnBhZ2VYO1xuXHRcdFx0aWYgKHJhdGVXZWVrLnJlZ2lzdGVyTW91c2VYKCkgIT0gc3RhcnRYKSB7XG5cdFx0XHRcdHJhdGVXZWVrLnJlZ2lzdGVyTW91c2VYKHN0YXJ0WCk7XG5cdFx0XHRcdHJhdGVXZWVrLnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlKGl0ZW0uYXR0cmlidXRlcy5wZXJjZW50YWdlKClbcmF0ZVdlZWsuYWN0aXZlV2VlaygpXS52YWx1ZSgpKTtcblx0XHRcdH1cblx0XHRcdHZhciBkaWZmID0gKGV2ZW50Lmdlc3R1cmUuZGVsdGFYIC8gcmF0ZVdlZWsucmVnaXN0ZXJSYXRpbygpKSAqIDE1MDtcblx0XHRcdHZhciBuZXdQZXJjZW50YWdlID0gTWF0aC5mbG9vcigoZGlmZiArIHJhdGVXZWVrLnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlKCkpIC8gNSkgKiA1O1xuXG5cdFx0XHRpZiAobmV3UGVyY2VudGFnZSA+IDAgJiYgbmV3UGVyY2VudGFnZSA8PSAxNTApIHtcblx0XHRcdFx0aXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVtyYXRlV2Vlay5hY3RpdmVXZWVrKCldLnZhbHVlKG5ld1BlcmNlbnRhZ2UpO1xuXHRcdFx0fSBlbHNlIGlmIChuZXdQZXJjZW50YWdlID4gMTUwKSB7XG5cdFx0XHRcdGl0ZW0uYXR0cmlidXRlcy5wZXJjZW50YWdlKClbcmF0ZVdlZWsuYWN0aXZlV2VlaygpXS52YWx1ZSgxNTApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aXRlbS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UoKVtyYXRlV2Vlay5hY3RpdmVXZWVrKCldLnZhbHVlKDApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJhdGVXZWVrLnNlbGVjdFdlZWsgPSBmdW5jdGlvbihpbmRleCkge1xuXHRcdHJhdGVXZWVrLmFjdGl2ZVdlZWsoaW5kZXgpO1xuXHR9XG5cblx0cmF0ZVdlZWsudGFrZVBpY3R1cmUgPSBmdW5jdGlvbigpIHtcblx0XHRuYXZpZ2F0b3IuY2FtZXJhLmdldFBpY3R1cmUocmF0ZVdlZWsuc2V0UGljdHVyZSwgZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBmYWlsXG5cdFx0XHRhbGVydCgnT29wcy4gV2UgY291bGRuXFwndCBhY2Nlc3MgeW91ciBjYW1lcmEuJyk7XG5cdFx0fSwgeyBcblx0XHRcdHF1YWxpdHk6IDEwMCwgXG5cdFx0XHRhbGxvd0VkaXQ6IHRydWUsIFxuXHRcdFx0ZGVzdGluYXRpb25UeXBlOiBuYXZpZ2F0b3IuY2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5EQVRBX1VSTCxcblx0XHRcdGVuY29kaW5nVHlwZTogQ2FtZXJhLkVuY29kaW5nVHlwZS5QTkcsXG5cdFx0XHR0YXJnZXRXaWR0aDogMTAwLFxuXHRcdFx0dGFyZ2V0SGVpZ2h0OiAxMDAsXG5cdFx0XHRjb3JyZWN0T3JpZW50YXRpb246IHRydWUsXG5cdFx0XHRjYW1lcmFEaXJlY3Rpb246IENhbWVyYS5EaXJlY3Rpb24uRlJPTlRcblx0XHR9KTtcblx0fVxuXG5cdHJhdGVXZWVrLnNldFBpY3R1cmUgPSBmdW5jdGlvbihpbWFnZURhdGEpIHtcblx0XHQkKCcuYXZhdGFyJykucmVtb3ZlQ2xhc3MoJ2ZhLWNhbWVyYScpLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcgKyBpbWFnZURhdGEgKyAnKScpO1xuXHRcdFBhcnNlLkNsb3VkLnJ1bigndXBkYXRlQXZhdGFyJywge1xuXHRcdFx0YXZhdGFyOiBpbWFnZURhdGFcblx0XHR9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdGFsZXJ0KCdBdmF0YXIgc3VjY2Vzc2Z1bGx5IHNhdmVkLicpXG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0JCgnLmF2YXRhcicpLmFkZENsYXNzKCdmYS1jYW1lcmEnKTtcblx0XHRcdFx0Y29uc29sZS5sb2coJ09vcHMuIFdlIG1lc3NlZCB1cC4gUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHJhdGVXZWVrLnRvZ2dsZVZpZXcgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAocmF0ZVdlZWsudmlld1R5cGUoKSA9PSAnaG91cnMnKSB7XG5cdFx0XHRyYXRlV2Vlay52aWV3VHlwZSgncGVyY2VudCcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyYXRlV2Vlay52aWV3VHlwZSgnaG91cnMnKTtcblx0XHR9XG5cdH1cblxuXHRyYXRlV2Vlay5nb0JhY2sgPSBmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZygnZ28gYmFjaycpXG5cdFx0YXBwLm15Vmlld01vZGVsLnBlb3BsZS5zaG93RGV0YWlscyhmYWxzZSk7XG5cdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5nb1RvUGFnZSgxKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJhdGVXZWVrOyIsIi8qKlxuICogc2NyaXB0cy9zZWxlY3QtcHJvamVjdC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTZWxlY3RQcm9qZWN0KGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHNlbGVjdFByb2plY3QgPSBhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdCA9IHt9O1xuXG5cdHNlbGVjdFByb2plY3Qudmlld1R5cGUgPSBrby5vYnNlcnZhYmxlKCdhbGwnKTtcblx0c2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRzZWxlY3RQcm9qZWN0LmlzQWRkTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXHRzZWxlY3RQcm9qZWN0LnVuaXF1ZUNvbXBhbnlOYW1lcyA9IGtvLm9ic2VydmFibGVBcnJheSgpO1xuXHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QgPSBrby5vYnNlcnZhYmxlQXJyYXkoKTtcblx0c2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cdHNlbGVjdFByb2plY3QuZ2V0UHJvamVjdHMgPSBmdW5jdGlvbigpIHtcblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFByb2plY3RzJywge30sIHtcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHByb2plY3RzKSB7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoW10pO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHByb2plY3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0cHJvamVjdHNbaV0uYXR0cmlidXRlcy5hY3RpdmUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblx0XHRcdFx0XHRwcm9qZWN0c1tpXS5hdHRyaWJ1dGVzLnBlcmNlbnRhZ2UgPSBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKTtcblx0XHRcdFx0XHRzZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzLnB1c2gocHJvamVjdHNbaV0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvdy1jaXJjbGUtZG93blwiPjwvc3Bhbj5QdWxsIHRvIHJlZnJlc2gnKTtcblx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5hbGwtcHJvamVjdHMnKS5hbmltYXRlKHtcblx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0fSwgMTAwKTtcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRQYXJzZS5DbG91ZC5ydW4oJ2dldFVuaXF1ZUNvbXBhbnlOYW1lcycsIHt9LCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0cykge1xuXHRcdFx0XHRzZWxlY3RQcm9qZWN0LnVuaXF1ZUNvbXBhbnlOYW1lcyhwcm9qZWN0cyk7XG5cdFx0XHR9LCBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0c2VsZWN0UHJvamVjdC5nZXRQcm9qZWN0cygpO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdC50b2dnbGVQcm9qZWN0ID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoaXRlbS5hdHRyaWJ1dGVzLmFjdGl2ZSgpKSB7XG5cdFx0XHRpdGVtLmF0dHJpYnV0ZXMuYWN0aXZlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aXRlbS5hdHRyaWJ1dGVzLmFjdGl2ZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LnRvZ2dsZUFkZE1vZGUgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoc2VsZWN0UHJvamVjdC5pc0FkZE1vZGUoKSkge1xuXHRcdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5pc01vZGFsKGZhbHNlKTtcblx0XHRcdHNlbGVjdFByb2plY3QuaXNBZGRNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5pc01vZGFsKHRydWUpO1xuXHRcdFx0JCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykudmFsKCcnKTtcblx0XHRcdCQoJy5wcm9qZWN0LW5hbWUtZmllbGQnKS52YWwoJycpO1xuXHRcdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KFtdKTtcblx0XHRcdHNlbGVjdFByb2plY3QuaXNBZGRNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3QudG9nZ2xlVmlldyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChzZWxlY3RQcm9qZWN0LnZpZXdUeXBlKCkgPT0gJ2FsbCcpIHtcblx0XHRcdHNlbGVjdFByb2plY3Qudmlld1R5cGUoJ3NlbGVjdGVkJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGVjdFByb2plY3Qudmlld1R5cGUoJ2FsbCcpO1xuXHRcdH1cblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc2VsZWN0UHJvamVjdFR5cGVhaGVhZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHQkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS52YWwoaXRlbSk7XG5cdFx0c2VsZWN0UHJvamVjdC5maWx0ZXJlZFByb2plY3RMaXN0KFtdKTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3Quc2hvd1R5cGVhaGVhZFJlc3VsdHMgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdHZhciBuZWVkbGUgPSBldmVudC50YXJnZXQudmFsdWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXlxcd1xcZF0vZ2ksICcnKTtcblxuXHRcdGlmIChuZWVkbGUubGVuZ3RoID4gMCkge1xuXHRcdFx0dmFyIGZpbHRlcmVkUHJvamVjdHMgPSBfLmZpbHRlcihzZWxlY3RQcm9qZWN0LnVuaXF1ZUNvbXBhbnlOYW1lcygpLCBmdW5jdGlvbihvYmopIHtcblx0XHRcdFx0dmFyIGhheXN0YWNrID0gb2JqLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15cXHdcXGRdL2dpLCAnJyk7XG5cdFx0XHRcdHJldHVybiBoYXlzdGFjay5pbmRleE9mKG5lZWRsZSkgPj0gMDsgXG5cdFx0XHR9KTtcblx0XHRcdHZhciBmaWVsZFBvc2l0aW9uID0gJCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykub2Zmc2V0KCk7XG5cdFx0XHQkKCcucHJvamVjdC10eXBlYWhlYWQnKS5jc3MoJ2xlZnQnLCBmaWVsZFBvc2l0aW9uLmxlZnQpLmNzcygndG9wJywgZmllbGRQb3NpdGlvbi50b3AgKyAkKCcucHJvamVjdC10eXBlYWhlYWQtZmllbGQnKS5oZWlnaHQoKSsyMCk7XG5cdFx0XHRzZWxlY3RQcm9qZWN0LmZpbHRlcmVkUHJvamVjdExpc3QoZmlsdGVyZWRQcm9qZWN0cyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGVjdFByb2plY3QuZmlsdGVyZWRQcm9qZWN0TGlzdChbXSk7XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zYXZlTmV3UHJvamVjdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0Y29tcGFueTogJCgnLnByb2plY3QtdHlwZWFoZWFkLWZpZWxkJykudmFsKCksXG5cdFx0XHRwcm9qZWN0OiAkKCcucHJvamVjdC1uYW1lLWZpZWxkJykudmFsKCksXG5cdFx0fVxuXHRcdFBhcnNlLkNsb3VkLnJ1bignc2F2ZVByb2plY3QnLCBkYXRhLCB7XG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihwcm9qZWN0KSB7XG5cdFx0XHRcdGFsZXJ0KCdcIicgKyBwcm9qZWN0LmF0dHJpYnV0ZXMuY29tcGFueSArICc6ICcgKyBwcm9qZWN0LmF0dHJpYnV0ZXMubmFtZSArICdcIiBjcmVhdGVkIHN1Y2Nlc3NmdWxseS4nKTtcblx0XHRcdFx0c2VsZWN0UHJvamVjdC50b2dnbGVBZGRNb2RlKCk7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QuZ2V0UHJvamVjdHMoKTtcblx0XHRcdH0sIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHQvLyBhbGVydChlcnJvcilcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1x0XG5cdH1cblxuXHRzZWxlY3RQcm9qZWN0LmRyYWdSZWZyZXNoID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoc2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZygpKSB7XG5cdFx0XHR2YXIgdG9wID0gJChkb2N1bWVudCkuc2Nyb2xsVG9wKCk7XG5cdFx0XHR2YXIgZGVsdGEgPSBNYXRoLmZsb29yKGV2ZW50Lmdlc3R1cmUuZGlzdGFuY2UpO1xuXHRcdFx0aWYgKHRvcCA9PSAwICYmIGRlbHRhID4gMzApIHtcblx0XHRcdFx0aWYgKGRlbHRhID4gMTAwKSBkZWx0YSA9IDEwMDtcblx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5hbGwtcHJvamVjdHMnKS5jc3MoJ21hcmdpbi10b3AnLCBkZWx0YSAtIDMwKTtcblx0XHRcdFx0aWYgKGRlbHRhID49IDEwMCkge1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAucmVmcmVzaCcpLmh0bWwoJzxzcGFuIGNsYXNzPVwiZmEgZmEtYXJyb3ctY2lyY2xlLXVwXCI+PC9zcGFuPlJlbGVhc2UgdG8gcmVmcmVzaCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5zdGFydFJlZnJlc2hEcmFnID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoIXNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoKSAmJiAhYXBwLm15Vmlld01vZGVsLmhlYWRlci5pc09wZW4oKSkge1xuXHRcdFx0c2VsZWN0UHJvamVjdC5pc1JlZnJlc2hEcmFnZ2luZyh0cnVlKTtcblx0XHRcdCQoZXZlbnQuZ2VzdHVyZS50YXJnZXQpLm9uZSgnZHJhZ2VuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHNlbGVjdFByb2plY3QuaXNSZWZyZXNoRHJhZ2dpbmcoZmFsc2UpO1xuXHRcdFx0XHR2YXIgZGVsdGEgPSBwYXJzZUludCgkKCcjc2VsZWN0LXByb2plY3QgLmFsbC1wcm9qZWN0cycpLmNzcygnbWFyZ2luLXRvcCcpKTtcblxuXHRcdFx0XHRpZiAoZGVsdGEgPj0gNzApIHtcblx0XHRcdFx0XHRzZWxlY3RQcm9qZWN0LmdldFByb2plY3RzKCk7XG5cdFx0XHRcdFx0JCgnI3NlbGVjdC1wcm9qZWN0IC5yZWZyZXNoJykuaHRtbCgnPHNwYW4gY2xhc3M9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW5cIj48L3NwYW4+UmVmcmVzaGluZy4uLicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoJyNzZWxlY3QtcHJvamVjdCAuYWxsLXByb2plY3RzJykuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IDBcblx0XHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblxuXHR9XG5cblx0c2VsZWN0UHJvamVjdC5pbml0KCk7XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0UHJvamVjdDsiLCIvKipcbiAqIHNjcmlwdHMvc3RlcHMuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gU3RlcHMoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgc3RlcHMgPSBhcHAubXlWaWV3TW9kZWwuc3RlcHMgPSB7fTtcblxuXHRzdGVwcy5jdXJyZW50U3RlcCA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHN0ZXBzLnN0ZXBzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtcblx0XHR7XG5cdFx0XHRzdGVwTnVtYmVyOiAwLFxuXHRcdFx0c3RlcE5hbWU6ICdzZWxlY3RQcm9qZWN0J1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0c3RlcE51bWJlcjogMSxcblx0XHRcdHN0ZXBOYW1lOiAncmF0ZVdlZWsnXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRzdGVwTnVtYmVyOiAyLFxuXHRcdFx0c3RlcE5hbWU6ICdub3Rlcydcblx0XHR9XG5cdFx0Ly8ge1xuXHRcdC8vIFx0c3RlcE51bWJlcjogMyxcblx0XHQvLyBcdHN0ZXBOYW1lOiAnc2VsZWN0UHJvamVjdCdcblx0XHQvLyB9XG5cdF0pO1xuXG5cdC8vICQoZG9jdW1lbnQpLm9uKCdzd2lwZScsIGZ1bmN0aW9uKCkge1xuXHQvLyBcdGFsZXJ0KCdzd2lwZScpXG5cdC8vIH0pO1xuXG5cdHN0ZXBzLmNoYW5nZVN0ZXAgPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0YXBwLm15Vmlld01vZGVsLmhlYWRlci5jbG9zZSgpO1xuXHRcdHN0ZXBzLmN1cnJlbnRTdGVwKGl0ZW0uc3RlcE51bWJlcik7XG5cdFx0Ly8gYXBwLm15Vmlld01vZGVsLnJhdGVQcm9qZWN0LmluaXRQcm9qZWN0KCk7XG5cdH1cblxuXHRzdGVwcy5uZXh0U3RlcCA9IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuXHRcdGFwcC5teVZpZXdNb2RlbC5oZWFkZXIuY2xvc2UoKTtcblx0XHRzdGVwcy5jdXJyZW50U3RlcChzdGVwcy5jdXJyZW50U3RlcCgpICsgZGlyZWN0aW9uKTtcblx0XHQvLyBhcHAubXlWaWV3TW9kZWwucmF0ZVByb2plY3QuaW5pdFByb2plY3QoKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0ZXBzOyJdfQ==
