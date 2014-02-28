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
			navigator.splashscreen.hide();
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

	var currentUser = Parse.User.current();
	if (currentUser) {
		auth.currentUser(currentUser);
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
		console.log('asdf')
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
var RateProject = require('./rate-project.js');
var RateWeek = require('./rate-week.js');
var Notes = require('./notes.js');

// initialize parse
Parse.initialize("JkYNfPBw2aPgcc7PeTGHMAU2XKvjzeqVIkyClVuo", "45OMU3ZS3o5c168lQxa0ilxQu4FdMVHT1NVTkORl");

// initialize typekit
try{Typekit.load();}catch(e){}

var app = new App();
var auth = new Auth(app);
var steps = new Steps(app);
var selectProject = new SelectProject(app);
var header = new Header(app);
var rateProject = new RateProject(app);
var rateWeek = new RateWeek(app);
var notes = new Notes(app);


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
},{"./app.js":1,"./auth.js":2,"./header.js":4,"./notes.js":5,"./rate-project.js":6,"./rate-week.js":7,"./select-project.js":8,"./steps.js":9}],4:[function(require,module,exports){
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


	return self;
}


module.exports = Notes;
},{}],6:[function(require,module,exports){
/**
 * scripts/rate-project.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

function RateProject(app) {
	var self = this;

	var rateProject = app.myViewModel.rateProject = {};

	rateProject.activeIndex = ko.observable(-1);
	rateProject.activeDomIndex = ko.observable(0);
	rateProject.projectDomLength = ko.observable(0);
	rateProject.registerMouseY = ko.observable();
	rateProject.registerStartPercentage = ko.observable(180);
	rateProject.workingPercentage = ko.observable(0);
	rateProject.workingColumn = ko.observable(0);
	rateProject.today = moment(new Date()).startOf('isoweek');

	rateProject.columns = ko.observableArray([
		{  
			date: ko.observable(moment(rateProject.today).format('MMM D')),
			total: ko.computed(function() {
				var sum = _.reduce(app.myViewModel.selectProject.allProjects(), function(memo, project) {
					var colValue = 0;
					if (project.active()) {
						colValue = project.percentage()[0].value();
					}
					return memo + colValue; 
				}, 0);
				return sum;
			})
		},
		{
			date: ko.observable(moment(rateProject.today).add('days', 7).format('MMM D')),
			total: ko.computed(function() {
				var sum = _.reduce(app.myViewModel.selectProject.allProjects(), function(memo, project) {
					var colValue = 0;
					if (project.active()) {
						colValue = project.percentage()[1].value();
					}
					return memo + colValue; 
				}, 0);
				return sum;
			})
		},
		{  
			date: ko.observable(moment(rateProject.today).add('days', 14).format('MMM D')),
			total: ko.computed(function() {
				var sum = _.reduce(app.myViewModel.selectProject.allProjects(), function(memo, project) {
					var colValue = 0;
					if (project.active()) {
						colValue = project.percentage()[2].value();
					}
					return memo + colValue; 
				}, 0);
				return sum;
			})
		}
	]);

	rateProject.dialSettings = ko.observable({
		interval: 5, //percent
		value: '%'
	});

	rateProject.firstIndex = ko.computed(function() {
		
		var projects = app.myViewModel.selectProject.allProjects();
		var firstProject = _.find(projects, function(obj){
			return obj.active() == true;
		});
		var firstIndex = _.indexOf(projects, firstProject);
		return firstIndex;
	});

	rateProject.activeProject = ko.computed(function() {
		var useIndex = app.myViewModel.rateProject.activeIndex()
		if (useIndex == -1) {
			useIndex = app.myViewModel.rateProject.firstIndex();
		}
		var project = app.myViewModel.selectProject.allProjects()[useIndex];
		// if (project.type == 'internal') {

		// }
		// console.log(project)
		return project;
	});

	// $('.user-projects').hammer({ drag_lock_to_axis: true }).on("swipe drag", function(event) {
	// 	event.gesture.preventDefault();
	// 	if(event.type == "swipe"){
	// 		alert('swipe');
	// 	} else {
	// 		alert('drag');
	// 	}
	// });

	rateProject.dragHandle = function(item, event) {
		if (event.type == 'mousedown') {
			rateProject.registerMouseY(event.originalEvent.clientY);
		} else {
			rateProject.registerMouseY(event.originalEvent.touches[0].clientY);
		}
		$('#rate-project .handle').addClass('dragging');
		
		$(document).on('touchmove mousemove', function(event) {
			var clientY;
			if (event.originalEvent.type == 'mousemove') {
				clientY = event.originalEvent.clientY;
			} else {
				clientY = event.originalEvent.touches[0].clientY;
			}
			var diff = rateProject.registerMouseY() - clientY;
			var degrees = rateProject.registerStartPercentage() + (diff / 1.25);
			var percentage = Math.floor(((degrees - 180) / 1.8) / rateProject.dialSettings().interval) * rateProject.dialSettings().interval;
			if (percentage < 1) {
				percentage = 0;
				degrees = 180;
			}
			if (percentage > 99) {
				percentage = 100;
				degrees = 360;
			}
			
			rateProject.workingPercentage(percentage);
			rateProject.activeProject().percentage()[rateProject.workingColumn()].value(percentage);
			rateProject.rotateDial(degrees);
		});

		$(document).one('touchend mouseup', function(event) {
			var endingPercentage = rateProject.workingPercentage() * 1.8;
			rateProject.registerStartPercentage(180 + endingPercentage);
			$('#rate-project .handle').removeClass('dragging');
			$(document).off('touchmove mousemove');
		});

	}

	rateProject.rotateDial = function(degrees) {
		$('#rate-project .dial').css({'-webkit-transform' : 'rotate('+ degrees +'deg)',
			'-moz-transform' : 'rotate('+ degrees +'deg)',
			'-ms-transform' : 'rotate('+ degrees +'deg)',
			'transform' : 'rotate('+ degrees +'deg)'});
	}

	rateProject.setColumn = function(column) {
		rateProject.workingColumn(column);
		var percentage = rateProject.activeProject().percentage()[rateProject.workingColumn()].value();

		rateProject.workingPercentage(percentage);
		var degrees = Math.floor((percentage * 1.8) - 180);

		rateProject.registerStartPercentage((percentage * 1.8) + 180);
		rateProject.rotateDial(degrees);
	}

	rateProject.goToProject = function(index, item, event) {
		rateProject.activeIndex(index);
		var top = $(event.target).position().top;
		var domIndex = _.indexOf($('#rate-project .user-projects').children(), event.target);
		if (domIndex < 0) {
			domIndex = 0;
		}
		rateProject.activeDomIndex(domIndex);
		rateProject.projectDomLength($('#rate-project .user-projects').children().length);
		$('#rate-project .user-projects').animate({ 
			scrollTop: domIndex * 46
		}, 200);
		rateProject.setColumn(0);
	}

	rateProject.initProject = function() {
		rateProject.activeDomIndex(0);
		$('#rate-project .user-projects').children().first().trigger('click');
	}

	rateProject.renderChart = function() {

	}

	return self;
}

module.exports = RateProject;
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

	rateWeek.weeks = ko.observableArray([
		{
			date: ko.observable(moment(rateWeek.today).format('MMM D')),
			total: ko.computed(function() {
				var sum = _.reduce(app.myViewModel.selectProject.allProjects(), function(memo, project) {
					var colValue = 0;
					if (project.active()) {
						colValue = project.percentage()[0].value();
					}
					return memo + colValue; 
				}, 0);
				return sum;
			})
		},
		{
			date: ko.observable(moment(rateWeek.today).add('days', 7).format('MMM D')),
			total: ko.computed(function() {
				var sum = _.reduce(app.myViewModel.selectProject.allProjects(), function(memo, project) {
					var colValue = 0;
					if (project.active()) {
						colValue = project.percentage()[1].value();
					}
					return memo + colValue; 
				}, 0);
				return sum;
			})
		},
		{  
			date: ko.observable(moment(rateWeek.today).add('days', 14).format('MMM D')),
			total: ko.computed(function() {
				var sum = _.reduce(app.myViewModel.selectProject.allProjects(), function(memo, project) {
					var colValue = 0;
					if (project.active()) {
						colValue = project.percentage()[2].value();
					}
					return memo + colValue; 
				}, 0);
				return sum;
			})
		}
	]);

	rateWeek.drag = function(item, event) {
		var startX = event.gesture.startEvent.center.pageX;
		if (rateWeek.registerMouseX() != startX) {
			rateWeek.registerMouseX(startX);
			rateWeek.registerStartPercentage(item.percentage()[rateWeek.activeWeek()].value());
			event.preventDefault();
		}
		var diff = (event.gesture.deltaX / rateWeek.registerRatio()) * 100;
		var newPercentage = Math.floor((diff + rateWeek.registerStartPercentage()) / 5) * 5;

		if (newPercentage > 0 && newPercentage <= 100) {
			item.percentage()[rateWeek.activeWeek()].value(newPercentage);
		} else if (newPercentage > 100) {
			item.percentage()[rateWeek.activeWeek()].value(100);
		} else {
			item.percentage()[rateWeek.activeWeek()].value(0);
		}

	}

	rateWeek.selectWeek = function(index) {
		rateWeek.activeWeek(index);
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

	selectProject.allProjects = ko.observableArray([
		{
			name: 'DriveScribe: Sprint',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Liason: CAS',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Internal: Allocate',
			active: ko.observable(false),
			type: 'internal',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Internal: Playbook',
			active: ko.observable(false),
			type: 'internal',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'MetTel: Retainer',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Regions: Regions.com',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'SunTrust: On-boarding',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'SunTrust: Online Banking',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'SunTrust: SunTrust.com',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Vacation/Time off',
			active: ko.observable(false),
			type: 'internal',
			increments: {
				type: 'day',
				value: 0.5
			},
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Z Client: Some project 1',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Z Client: Some project 2',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Z Client: Some project 3',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Z Client: Some project 4',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Z Client: Some project 5',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Z Client: Some project 6',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'Z Client: Some project 7',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		}
	]);

		selectProject.toggleProject = function(item, event) {
		if (item.active()) {
			item.active(false);
		} else {
			item.active(true);
		}
	}

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
			stepName: 'selectProject'
		},
		{
			stepNumber: 2,
			stepName: 'selectProject'
		},
		{
			stepNumber: 3,
			stepName: 'selectProject'
		}
	]);

	// $(document).on('swipe', function() {
	// 	alert('swipe')
	// });

	steps.changeStep = function(item) {
		steps.currentStep(item.stepNumber);
		app.myViewModel.rateProject.initProject();
	}

	steps.nextStep = function(direction) {
		steps.currentStep(steps.currentStep() + direction);
		app.myViewModel.rateProject.initProject();
	}

	return self;
}

module.exports = Steps;
},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvYXV0aC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvZmFrZV9lNDkyZWQxLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9oZWFkZXIuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL25vdGVzLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9yYXRlLXByb2plY3QuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3JhdGUtd2Vlay5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvc2VsZWN0LXByb2plY3QuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3N0ZXBzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogc2NyaXB0cy9hcHAuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQXBwKCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0Ly8gaW5pdGlhbGl6ZSBrbm9ja291dFxuXHRzZWxmLm15Vmlld01vZGVsID0ge307XG5cblx0c2VsZi5teVZpZXdNb2RlbC5jdXJyZW50VXNlciA9IGtvLm9ic2VydmFibGUobnVsbCk7XG5cblx0c2VsZi5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZGV2aWNlcmVhZHknLCBzZWxmLm9uRGV2aWNlUmVhZHksIGZhbHNlKTtcblx0fVxuXG5cdHNlbGYub25EZXZpY2VSZWFkeSA9IGZ1bmN0aW9uKCkge1xuXHRcdGtvLmFwcGx5QmluZGluZ3Moc2VsZi5teVZpZXdNb2RlbCk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdG5hdmlnYXRvci5zcGxhc2hzY3JlZW4uaGlkZSgpO1xuXHRcdH0sIDIwMDApO1xuXHRcdFxuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwOyIsIi8qKlxuICogc2NyaXB0cy9hdXRoLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEF1dGgoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgYXV0aCA9IGFwcC5teVZpZXdNb2RlbC5hdXRoID0ge307XG5cblx0YXV0aC5jdXJyZW50VXNlciA9IGtvLm9ic2VydmFibGUoKTtcblx0YXV0aC5lcnJvck1lc3NhZ2UgPSBrby5vYnNlcnZhYmxlKCcnKTtcblx0YXV0aC5zaWduVXBNb2RlID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cblx0dmFyIGN1cnJlbnRVc2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cdGlmIChjdXJyZW50VXNlcikge1xuXHRcdGF1dGguY3VycmVudFVzZXIoY3VycmVudFVzZXIpO1xuXHR9XG5cblx0YXV0aC5yZXNldEVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0YXV0aC5lcnJvck1lc3NhZ2UoJycpO1xuXHR9XG5cblx0YXV0aC5zaWduSW5VcCA9IGZ1bmN0aW9uKGZvcm1FbGVtZW50KSB7XG5cdFx0Ly8ga28ucG9zdGJveC5wdWJsaXNoKCdpc0xvYWRpbmcnLCB0cnVlKTtcblx0XHRhdXRoLnJlc2V0RXJyb3IoKTtcblxuXHRcdHZhciB1c2VybmFtZSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF91c2VybmFtZV0nKS52YWwoKTtcblx0XHR2YXIgcGFzc3dvcmQgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfcGFzc3dvcmRdJykudmFsKCk7XG5cblx0XHRpZiAoYXV0aC5zaWduVXBNb2RlKCkpIHtcblx0XHRcdHZhciBlbWFpbCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9lbWFpbF0nKS52YWwoKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0dmFyIGRpc3BsYXlOYW1lID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2Rpc3BsYXlOYW1lXScpLnZhbCgpO1xuXHRcdFx0dmFyIHBhc3N3b3JkQ29uZmlybSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9jb25maXJtUGFzc3dvcmRdJykudmFsKCk7XG5cblx0XHRcdC8vIHZhbGlkYXRpb25cblx0XHRcdGlmIChlbWFpbC5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgeW91ciBlbWFpbCBhZGRyZXNzLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChkaXNwbGF5TmFtZS5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgeW91ciBmaXJzdCBhbmQgbGFzdCBuYW1lLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh1c2VybmFtZS5sZW5ndGggPCAxKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgYSB1c2VybmFtZS4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocGFzc3dvcmQubGVuZ3RoIDwgMSB8fCBwYXNzd29yZENvbmZpcm0gPCAxIHx8IHBhc3N3b3JkICE9IHBhc3N3b3JkQ29uZmlybSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIGFuZCBjb25maXJtIGEgcGFzc3dvcmQuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHVzZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuXHRcdFx0dmFyIHNjcnViYmVkVXNlcm5hbWUgPSB1c2VybmFtZS5yZXBsYWNlKC9cXHMrL2csXCJcIik7IC8vcmVtb3ZlIHdoaXRlIHNwYWNlXG5cdFx0XHRzY3J1YmJlZFVzZXJuYW1lID0gc2NydWJiZWRVc2VybmFtZS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHR1c2VyLnNldCgndXNlcm5hbWUnLCBzY3J1YmJlZFVzZXJuYW1lKTtcblx0XHRcdHVzZXIuc2V0KCdwYXNzd29yZCcsIHBhc3N3b3JkKTtcblx0XHRcdHVzZXIuc2V0KCdlbWFpbCcsIGVtYWlsKTtcblx0XHRcdHVzZXIuc2V0KCdkaXNwbGF5TmFtZScsIGRpc3BsYXlOYW1lKTtcblxuXHRcdFx0Ly8gb3RoZXIgZmllbGRzIGNhbiBiZSBzZXQganVzdCBsaWtlIHdpdGggUGFyc2UuT2JqZWN0XG5cdFx0XHQvLyB1c2VyLnNldChcInBob25lXCIsIFwiNDE1LTM5Mi0wMjAyXCIpO1xuXG5cdFx0XHR1c2VyLnNpZ25VcChudWxsLCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0XHRhdXRoLmN1cnJlbnRVc2VyKHVzZXIpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCBwYXNzd29yZCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0Ly8gVGhlIGxvZ2luIGZhaWxlZC4gQ2hlY2sgZXJyb3IgdG8gc2VlIHdoeS5cblx0XHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZShhdXRoLnNhbml0aXplRXJyb3JzKGVycm9yKSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuXHRcdFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cdFx0YXV0aC5jdXJyZW50VXNlcihudWxsKTtcblx0fVxuXG5cdGF1dGguc2hvd1NpZ25VcCA9IGZ1bmN0aW9uKCkge1xuXHRcdGNvbnNvbGUubG9nKCdhc2RmJylcblx0XHRhdXRoLmVycm9yTWVzc2FnZSgnJyk7XG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhdXRoLnNpZ25VcE1vZGUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5zYW5pdGl6ZUVycm9ycyA9IGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0c3dpdGNoKGVycm9yLmNvZGUpXG5cdFx0e1xuXHRcdFx0Y2FzZSAxMDE6XG5cdFx0XHRcdHJldHVybiAnUGxlYXNlIGVudGVyIGEgdmFsaWQgdXNlcm5hbWUgYW5kIHBhc3N3b3JkLic7XG5cdFx0XHRjYXNlIDEyNDpcblx0XHRcdFx0cmV0dXJuICdPb3BzISBXZSBtZXNzZWQgdXAuIFBsZWFzZSB0cnkgYWdhaW4uJztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBlcnJvci5tZXNzYWdlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZXJyb3IubWVzc2FnZS5zbGljZSgxKSArICcuJztcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdXRoOyIsIi8qKlxuICogc2NyaXB0cy9tYWluLmpzXG4gKlxuICogVGhpcyBpcyB0aGUgc3RhcnRpbmcgcG9pbnQgZm9yIHlvdXIgYXBwbGljYXRpb24uXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBcHAgPSByZXF1aXJlKCcuL2FwcC5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuL2F1dGguanMnKTtcbnZhciBTdGVwcyA9IHJlcXVpcmUoJy4vc3RlcHMuanMnKTtcbnZhciBTZWxlY3RQcm9qZWN0ID0gcmVxdWlyZSgnLi9zZWxlY3QtcHJvamVjdC5qcycpO1xudmFyIEhlYWRlciA9IHJlcXVpcmUoJy4vaGVhZGVyLmpzJyk7XG52YXIgUmF0ZVByb2plY3QgPSByZXF1aXJlKCcuL3JhdGUtcHJvamVjdC5qcycpO1xudmFyIFJhdGVXZWVrID0gcmVxdWlyZSgnLi9yYXRlLXdlZWsuanMnKTtcbnZhciBOb3RlcyA9IHJlcXVpcmUoJy4vbm90ZXMuanMnKTtcblxuLy8gaW5pdGlhbGl6ZSBwYXJzZVxuUGFyc2UuaW5pdGlhbGl6ZShcIkprWU5mUEJ3MmFQZ2NjN1BlVEdITUFVMlhLdmp6ZXFWSWt5Q2xWdW9cIiwgXCI0NU9NVTNaUzNvNWMxNjhsUXhhMGlseFF1NEZkTVZIVDFOVlRrT1JsXCIpO1xuXG4vLyBpbml0aWFsaXplIHR5cGVraXRcbnRyeXtUeXBla2l0LmxvYWQoKTt9Y2F0Y2goZSl7fVxuXG52YXIgYXBwID0gbmV3IEFwcCgpO1xudmFyIGF1dGggPSBuZXcgQXV0aChhcHApO1xudmFyIHN0ZXBzID0gbmV3IFN0ZXBzKGFwcCk7XG52YXIgc2VsZWN0UHJvamVjdCA9IG5ldyBTZWxlY3RQcm9qZWN0KGFwcCk7XG52YXIgaGVhZGVyID0gbmV3IEhlYWRlcihhcHApO1xudmFyIHJhdGVQcm9qZWN0ID0gbmV3IFJhdGVQcm9qZWN0KGFwcCk7XG52YXIgcmF0ZVdlZWsgPSBuZXcgUmF0ZVdlZWsoYXBwKTtcbnZhciBub3RlcyA9IG5ldyBOb3RlcyhhcHApO1xuXG5cbi8vIEN1c3RvbSBrbm9ja291dCBleHRuZWRlcnNcblxuLy8gSGVyZSdzIGEgY3VzdG9tIEtub2Nrb3V0IGJpbmRpbmcgdGhhdCBtYWtlcyBlbGVtZW50cyBzaG93bi9oaWRkZW4gdmlhIGpRdWVyeSdzIGZhZGVJbigpL2ZhZGVPdXQoKSBtZXRob2RzXG4vLyBDb3VsZCBiZSBzdG9yZWQgaW4gYSBzZXBhcmF0ZSB1dGlsaXR5IGxpYnJhcnlcbmtvLmJpbmRpbmdIYW5kbGVycy5mYWRlVmlzaWJsZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIEluaXRpYWxseSBzZXQgdGhlIGVsZW1lbnQgdG8gYmUgaW5zdGFudGx5IHZpc2libGUvaGlkZGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAkKGVsZW1lbnQpLnRvZ2dsZShrby51bndyYXAodmFsdWUpKTsgLy8gVXNlIFwidW53cmFwT2JzZXJ2YWJsZVwiIHNvIHdlIGNhbiBoYW5kbGUgdmFsdWVzIHRoYXQgbWF5IG9yIG1heSBub3QgYmUgb2JzZXJ2YWJsZVxuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIFdoZW5ldmVyIHRoZSB2YWx1ZSBzdWJzZXF1ZW50bHkgY2hhbmdlcywgc2xvd2x5IGZhZGUgdGhlIGVsZW1lbnQgaW4gb3Igb3V0XG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAga28udW53cmFwKHZhbHVlKSA/ICQoZWxlbWVudCkuZmFkZUluKCkgOiAkKGVsZW1lbnQpLmZhZGVPdXQoKTtcbiAgICB9XG59XG5cbmFwcC5pbml0aWFsaXplKCk7IiwiLyoqXG4gKiBzY3JpcHRzL2hlYWRlci5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBIZWFkZXIoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgaGVhZGVyID0gYXBwLm15Vmlld01vZGVsLmhlYWRlciA9IHt9O1xuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlcjsiLCIvKipcbiAqIHNjcmlwdHMvbm90ZXMuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTm90ZXMoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgbm90ZXMgPSBhcHAubXlWaWV3TW9kZWwubm90ZXMgPSB7fTtcblxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTm90ZXM7IiwiLyoqXG4gKiBzY3JpcHRzL3JhdGUtcHJvamVjdC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBSYXRlUHJvamVjdChhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciByYXRlUHJvamVjdCA9IGFwcC5teVZpZXdNb2RlbC5yYXRlUHJvamVjdCA9IHt9O1xuXG5cdHJhdGVQcm9qZWN0LmFjdGl2ZUluZGV4ID0ga28ub2JzZXJ2YWJsZSgtMSk7XG5cdHJhdGVQcm9qZWN0LmFjdGl2ZURvbUluZGV4ID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cmF0ZVByb2plY3QucHJvamVjdERvbUxlbmd0aCA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHJhdGVQcm9qZWN0LnJlZ2lzdGVyTW91c2VZID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRyYXRlUHJvamVjdC5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZSA9IGtvLm9ic2VydmFibGUoMTgwKTtcblx0cmF0ZVByb2plY3Qud29ya2luZ1BlcmNlbnRhZ2UgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRyYXRlUHJvamVjdC53b3JraW5nQ29sdW1uID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cmF0ZVByb2plY3QudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXG5cdHJhdGVQcm9qZWN0LmNvbHVtbnMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuXHRcdHsgIFxuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocmF0ZVByb2plY3QudG9kYXkpLmZvcm1hdCgnTU1NIEQnKSksXG5cdFx0XHR0b3RhbDoga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdW0gPSBfLnJlZHVjZShhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihtZW1vLCBwcm9qZWN0KSB7XG5cdFx0XHRcdFx0dmFyIGNvbFZhbHVlID0gMDtcblx0XHRcdFx0XHRpZiAocHJvamVjdC5hY3RpdmUoKSkge1xuXHRcdFx0XHRcdFx0Y29sVmFsdWUgPSBwcm9qZWN0LnBlcmNlbnRhZ2UoKVswXS52YWx1ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gbWVtbyArIGNvbFZhbHVlOyBcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdHJldHVybiBzdW07XG5cdFx0XHR9KVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocmF0ZVByb2plY3QudG9kYXkpLmFkZCgnZGF5cycsIDcpLmZvcm1hdCgnTU1NIEQnKSksXG5cdFx0XHR0b3RhbDoga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdW0gPSBfLnJlZHVjZShhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihtZW1vLCBwcm9qZWN0KSB7XG5cdFx0XHRcdFx0dmFyIGNvbFZhbHVlID0gMDtcblx0XHRcdFx0XHRpZiAocHJvamVjdC5hY3RpdmUoKSkge1xuXHRcdFx0XHRcdFx0Y29sVmFsdWUgPSBwcm9qZWN0LnBlcmNlbnRhZ2UoKVsxXS52YWx1ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gbWVtbyArIGNvbFZhbHVlOyBcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdHJldHVybiBzdW07XG5cdFx0XHR9KVxuXHRcdH0sXG5cdFx0eyAgXG5cdFx0XHRkYXRlOiBrby5vYnNlcnZhYmxlKG1vbWVudChyYXRlUHJvamVjdC50b2RheSkuYWRkKCdkYXlzJywgMTQpLmZvcm1hdCgnTU1NIEQnKSksXG5cdFx0XHR0b3RhbDoga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdW0gPSBfLnJlZHVjZShhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihtZW1vLCBwcm9qZWN0KSB7XG5cdFx0XHRcdFx0dmFyIGNvbFZhbHVlID0gMDtcblx0XHRcdFx0XHRpZiAocHJvamVjdC5hY3RpdmUoKSkge1xuXHRcdFx0XHRcdFx0Y29sVmFsdWUgPSBwcm9qZWN0LnBlcmNlbnRhZ2UoKVsyXS52YWx1ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gbWVtbyArIGNvbFZhbHVlOyBcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdHJldHVybiBzdW07XG5cdFx0XHR9KVxuXHRcdH1cblx0XSk7XG5cblx0cmF0ZVByb2plY3QuZGlhbFNldHRpbmdzID0ga28ub2JzZXJ2YWJsZSh7XG5cdFx0aW50ZXJ2YWw6IDUsIC8vcGVyY2VudFxuXHRcdHZhbHVlOiAnJSdcblx0fSk7XG5cblx0cmF0ZVByb2plY3QuZmlyc3RJbmRleCA9IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHZhciBwcm9qZWN0cyA9IGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCk7XG5cdFx0dmFyIGZpcnN0UHJvamVjdCA9IF8uZmluZChwcm9qZWN0cywgZnVuY3Rpb24ob2JqKXtcblx0XHRcdHJldHVybiBvYmouYWN0aXZlKCkgPT0gdHJ1ZTtcblx0XHR9KTtcblx0XHR2YXIgZmlyc3RJbmRleCA9IF8uaW5kZXhPZihwcm9qZWN0cywgZmlyc3RQcm9qZWN0KTtcblx0XHRyZXR1cm4gZmlyc3RJbmRleDtcblx0fSk7XG5cblx0cmF0ZVByb2plY3QuYWN0aXZlUHJvamVjdCA9IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdHZhciB1c2VJbmRleCA9IGFwcC5teVZpZXdNb2RlbC5yYXRlUHJvamVjdC5hY3RpdmVJbmRleCgpXG5cdFx0aWYgKHVzZUluZGV4ID09IC0xKSB7XG5cdFx0XHR1c2VJbmRleCA9IGFwcC5teVZpZXdNb2RlbC5yYXRlUHJvamVjdC5maXJzdEluZGV4KCk7XG5cdFx0fVxuXHRcdHZhciBwcm9qZWN0ID0gYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKVt1c2VJbmRleF07XG5cdFx0Ly8gaWYgKHByb2plY3QudHlwZSA9PSAnaW50ZXJuYWwnKSB7XG5cblx0XHQvLyB9XG5cdFx0Ly8gY29uc29sZS5sb2cocHJvamVjdClcblx0XHRyZXR1cm4gcHJvamVjdDtcblx0fSk7XG5cblx0Ly8gJCgnLnVzZXItcHJvamVjdHMnKS5oYW1tZXIoeyBkcmFnX2xvY2tfdG9fYXhpczogdHJ1ZSB9KS5vbihcInN3aXBlIGRyYWdcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0Ly8gXHRldmVudC5nZXN0dXJlLnByZXZlbnREZWZhdWx0KCk7XG5cdC8vIFx0aWYoZXZlbnQudHlwZSA9PSBcInN3aXBlXCIpe1xuXHQvLyBcdFx0YWxlcnQoJ3N3aXBlJyk7XG5cdC8vIFx0fSBlbHNlIHtcblx0Ly8gXHRcdGFsZXJ0KCdkcmFnJyk7XG5cdC8vIFx0fVxuXHQvLyB9KTtcblxuXHRyYXRlUHJvamVjdC5kcmFnSGFuZGxlID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoZXZlbnQudHlwZSA9PSAnbW91c2Vkb3duJykge1xuXHRcdFx0cmF0ZVByb2plY3QucmVnaXN0ZXJNb3VzZVkoZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRZKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmF0ZVByb2plY3QucmVnaXN0ZXJNb3VzZVkoZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLmNsaWVudFkpO1xuXHRcdH1cblx0XHQkKCcjcmF0ZS1wcm9qZWN0IC5oYW5kbGUnKS5hZGRDbGFzcygnZHJhZ2dpbmcnKTtcblx0XHRcblx0XHQkKGRvY3VtZW50KS5vbigndG91Y2htb3ZlIG1vdXNlbW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR2YXIgY2xpZW50WTtcblx0XHRcdGlmIChldmVudC5vcmlnaW5hbEV2ZW50LnR5cGUgPT0gJ21vdXNlbW92ZScpIHtcblx0XHRcdFx0Y2xpZW50WSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2xpZW50WTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNsaWVudFkgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WTtcblx0XHRcdH1cblx0XHRcdHZhciBkaWZmID0gcmF0ZVByb2plY3QucmVnaXN0ZXJNb3VzZVkoKSAtIGNsaWVudFk7XG5cdFx0XHR2YXIgZGVncmVlcyA9IHJhdGVQcm9qZWN0LnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlKCkgKyAoZGlmZiAvIDEuMjUpO1xuXHRcdFx0dmFyIHBlcmNlbnRhZ2UgPSBNYXRoLmZsb29yKCgoZGVncmVlcyAtIDE4MCkgLyAxLjgpIC8gcmF0ZVByb2plY3QuZGlhbFNldHRpbmdzKCkuaW50ZXJ2YWwpICogcmF0ZVByb2plY3QuZGlhbFNldHRpbmdzKCkuaW50ZXJ2YWw7XG5cdFx0XHRpZiAocGVyY2VudGFnZSA8IDEpIHtcblx0XHRcdFx0cGVyY2VudGFnZSA9IDA7XG5cdFx0XHRcdGRlZ3JlZXMgPSAxODA7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyY2VudGFnZSA+IDk5KSB7XG5cdFx0XHRcdHBlcmNlbnRhZ2UgPSAxMDA7XG5cdFx0XHRcdGRlZ3JlZXMgPSAzNjA7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJhdGVQcm9qZWN0LndvcmtpbmdQZXJjZW50YWdlKHBlcmNlbnRhZ2UpO1xuXHRcdFx0cmF0ZVByb2plY3QuYWN0aXZlUHJvamVjdCgpLnBlcmNlbnRhZ2UoKVtyYXRlUHJvamVjdC53b3JraW5nQ29sdW1uKCldLnZhbHVlKHBlcmNlbnRhZ2UpO1xuXHRcdFx0cmF0ZVByb2plY3Qucm90YXRlRGlhbChkZWdyZWVzKTtcblx0XHR9KTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uZSgndG91Y2hlbmQgbW91c2V1cCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR2YXIgZW5kaW5nUGVyY2VudGFnZSA9IHJhdGVQcm9qZWN0LndvcmtpbmdQZXJjZW50YWdlKCkgKiAxLjg7XG5cdFx0XHRyYXRlUHJvamVjdC5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZSgxODAgKyBlbmRpbmdQZXJjZW50YWdlKTtcblx0XHRcdCQoJyNyYXRlLXByb2plY3QgLmhhbmRsZScpLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCd0b3VjaG1vdmUgbW91c2Vtb3ZlJyk7XG5cdFx0fSk7XG5cblx0fVxuXG5cdHJhdGVQcm9qZWN0LnJvdGF0ZURpYWwgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG5cdFx0JCgnI3JhdGUtcHJvamVjdCAuZGlhbCcpLmNzcyh7Jy13ZWJraXQtdHJhbnNmb3JtJyA6ICdyb3RhdGUoJysgZGVncmVlcyArJ2RlZyknLFxuXHRcdFx0Jy1tb3otdHJhbnNmb3JtJyA6ICdyb3RhdGUoJysgZGVncmVlcyArJ2RlZyknLFxuXHRcdFx0Jy1tcy10cmFuc2Zvcm0nIDogJ3JvdGF0ZSgnKyBkZWdyZWVzICsnZGVnKScsXG5cdFx0XHQndHJhbnNmb3JtJyA6ICdyb3RhdGUoJysgZGVncmVlcyArJ2RlZyknfSk7XG5cdH1cblxuXHRyYXRlUHJvamVjdC5zZXRDb2x1bW4gPSBmdW5jdGlvbihjb2x1bW4pIHtcblx0XHRyYXRlUHJvamVjdC53b3JraW5nQ29sdW1uKGNvbHVtbik7XG5cdFx0dmFyIHBlcmNlbnRhZ2UgPSByYXRlUHJvamVjdC5hY3RpdmVQcm9qZWN0KCkucGVyY2VudGFnZSgpW3JhdGVQcm9qZWN0LndvcmtpbmdDb2x1bW4oKV0udmFsdWUoKTtcblxuXHRcdHJhdGVQcm9qZWN0LndvcmtpbmdQZXJjZW50YWdlKHBlcmNlbnRhZ2UpO1xuXHRcdHZhciBkZWdyZWVzID0gTWF0aC5mbG9vcigocGVyY2VudGFnZSAqIDEuOCkgLSAxODApO1xuXG5cdFx0cmF0ZVByb2plY3QucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoKHBlcmNlbnRhZ2UgKiAxLjgpICsgMTgwKTtcblx0XHRyYXRlUHJvamVjdC5yb3RhdGVEaWFsKGRlZ3JlZXMpO1xuXHR9XG5cblx0cmF0ZVByb2plY3QuZ29Ub1Byb2plY3QgPSBmdW5jdGlvbihpbmRleCwgaXRlbSwgZXZlbnQpIHtcblx0XHRyYXRlUHJvamVjdC5hY3RpdmVJbmRleChpbmRleCk7XG5cdFx0dmFyIHRvcCA9ICQoZXZlbnQudGFyZ2V0KS5wb3NpdGlvbigpLnRvcDtcblx0XHR2YXIgZG9tSW5kZXggPSBfLmluZGV4T2YoJCgnI3JhdGUtcHJvamVjdCAudXNlci1wcm9qZWN0cycpLmNoaWxkcmVuKCksIGV2ZW50LnRhcmdldCk7XG5cdFx0aWYgKGRvbUluZGV4IDwgMCkge1xuXHRcdFx0ZG9tSW5kZXggPSAwO1xuXHRcdH1cblx0XHRyYXRlUHJvamVjdC5hY3RpdmVEb21JbmRleChkb21JbmRleCk7XG5cdFx0cmF0ZVByb2plY3QucHJvamVjdERvbUxlbmd0aCgkKCcjcmF0ZS1wcm9qZWN0IC51c2VyLXByb2plY3RzJykuY2hpbGRyZW4oKS5sZW5ndGgpO1xuXHRcdCQoJyNyYXRlLXByb2plY3QgLnVzZXItcHJvamVjdHMnKS5hbmltYXRlKHsgXG5cdFx0XHRzY3JvbGxUb3A6IGRvbUluZGV4ICogNDZcblx0XHR9LCAyMDApO1xuXHRcdHJhdGVQcm9qZWN0LnNldENvbHVtbigwKTtcblx0fVxuXG5cdHJhdGVQcm9qZWN0LmluaXRQcm9qZWN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmF0ZVByb2plY3QuYWN0aXZlRG9tSW5kZXgoMCk7XG5cdFx0JCgnI3JhdGUtcHJvamVjdCAudXNlci1wcm9qZWN0cycpLmNoaWxkcmVuKCkuZmlyc3QoKS50cmlnZ2VyKCdjbGljaycpO1xuXHR9XG5cblx0cmF0ZVByb2plY3QucmVuZGVyQ2hhcnQgPSBmdW5jdGlvbigpIHtcblxuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmF0ZVByb2plY3Q7IiwiLyoqXG4gKiBzY3JpcHRzL3JhdGUtd2Vlay5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBSYXRlV2VlayhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciByYXRlV2VlayA9IGFwcC5teVZpZXdNb2RlbC5yYXRlV2VlayA9IHt9O1xuXG5cdHJhdGVXZWVrLnJlZ2lzdGVyTW91c2VYID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRyYXRlV2Vlay5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZSA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHJhdGVXZWVrLnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblx0cmF0ZVdlZWsucmVnaXN0ZXJSYXRpbyA9IGtvLm9ic2VydmFibGUoJChkb2N1bWVudCkud2lkdGgoKSAtIDIwKTtcblx0cmF0ZVdlZWsuYWN0aXZlV2VlayA9IGtvLm9ic2VydmFibGUoMCk7XG5cblx0cmF0ZVdlZWsud2Vla3MgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuXHRcdHtcblx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHJhdGVXZWVrLnRvZGF5KS5mb3JtYXQoJ01NTSBEJykpLFxuXHRcdFx0dG90YWw6IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3VtID0gXy5yZWR1Y2UoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24obWVtbywgcHJvamVjdCkge1xuXHRcdFx0XHRcdHZhciBjb2xWYWx1ZSA9IDA7XG5cdFx0XHRcdFx0aWYgKHByb2plY3QuYWN0aXZlKCkpIHtcblx0XHRcdFx0XHRcdGNvbFZhbHVlID0gcHJvamVjdC5wZXJjZW50YWdlKClbMF0udmFsdWUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG1lbW8gKyBjb2xWYWx1ZTsgXG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRyZXR1cm4gc3VtO1xuXHRcdFx0fSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHJhdGVXZWVrLnRvZGF5KS5hZGQoJ2RheXMnLCA3KS5mb3JtYXQoJ01NTSBEJykpLFxuXHRcdFx0dG90YWw6IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3VtID0gXy5yZWR1Y2UoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24obWVtbywgcHJvamVjdCkge1xuXHRcdFx0XHRcdHZhciBjb2xWYWx1ZSA9IDA7XG5cdFx0XHRcdFx0aWYgKHByb2plY3QuYWN0aXZlKCkpIHtcblx0XHRcdFx0XHRcdGNvbFZhbHVlID0gcHJvamVjdC5wZXJjZW50YWdlKClbMV0udmFsdWUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG1lbW8gKyBjb2xWYWx1ZTsgXG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRyZXR1cm4gc3VtO1xuXHRcdFx0fSlcblx0XHR9LFxuXHRcdHsgIFxuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocmF0ZVdlZWsudG9kYXkpLmFkZCgnZGF5cycsIDE0KS5mb3JtYXQoJ01NTSBEJykpLFxuXHRcdFx0dG90YWw6IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3VtID0gXy5yZWR1Y2UoYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKSwgZnVuY3Rpb24obWVtbywgcHJvamVjdCkge1xuXHRcdFx0XHRcdHZhciBjb2xWYWx1ZSA9IDA7XG5cdFx0XHRcdFx0aWYgKHByb2plY3QuYWN0aXZlKCkpIHtcblx0XHRcdFx0XHRcdGNvbFZhbHVlID0gcHJvamVjdC5wZXJjZW50YWdlKClbMl0udmFsdWUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG1lbW8gKyBjb2xWYWx1ZTsgXG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRyZXR1cm4gc3VtO1xuXHRcdFx0fSlcblx0XHR9XG5cdF0pO1xuXG5cdHJhdGVXZWVrLmRyYWcgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdHZhciBzdGFydFggPSBldmVudC5nZXN0dXJlLnN0YXJ0RXZlbnQuY2VudGVyLnBhZ2VYO1xuXHRcdGlmIChyYXRlV2Vlay5yZWdpc3Rlck1vdXNlWCgpICE9IHN0YXJ0WCkge1xuXHRcdFx0cmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVgoc3RhcnRYKTtcblx0XHRcdHJhdGVXZWVrLnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlKGl0ZW0ucGVyY2VudGFnZSgpW3JhdGVXZWVrLmFjdGl2ZVdlZWsoKV0udmFsdWUoKSk7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0XHR2YXIgZGlmZiA9IChldmVudC5nZXN0dXJlLmRlbHRhWCAvIHJhdGVXZWVrLnJlZ2lzdGVyUmF0aW8oKSkgKiAxMDA7XG5cdFx0dmFyIG5ld1BlcmNlbnRhZ2UgPSBNYXRoLmZsb29yKChkaWZmICsgcmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoKSkgLyA1KSAqIDU7XG5cblx0XHRpZiAobmV3UGVyY2VudGFnZSA+IDAgJiYgbmV3UGVyY2VudGFnZSA8PSAxMDApIHtcblx0XHRcdGl0ZW0ucGVyY2VudGFnZSgpW3JhdGVXZWVrLmFjdGl2ZVdlZWsoKV0udmFsdWUobmV3UGVyY2VudGFnZSk7XG5cdFx0fSBlbHNlIGlmIChuZXdQZXJjZW50YWdlID4gMTAwKSB7XG5cdFx0XHRpdGVtLnBlcmNlbnRhZ2UoKVtyYXRlV2Vlay5hY3RpdmVXZWVrKCldLnZhbHVlKDEwMCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGl0ZW0ucGVyY2VudGFnZSgpW3JhdGVXZWVrLmFjdGl2ZVdlZWsoKV0udmFsdWUoMCk7XG5cdFx0fVxuXG5cdH1cblxuXHRyYXRlV2Vlay5zZWxlY3RXZWVrID0gZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRyYXRlV2Vlay5hY3RpdmVXZWVrKGluZGV4KTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJhdGVXZWVrOyIsIi8qKlxuICogc2NyaXB0cy9zZWxlY3QtcHJvamVjdC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTZWxlY3RQcm9qZWN0KGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHNlbGVjdFByb2plY3QgPSBhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdCA9IHt9O1xuXG5cdHNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuXHRcdHtcblx0XHRcdG5hbWU6ICdEcml2ZVNjcmliZTogU3ByaW50Jyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnTGlhc29uOiBDQVMnLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdjbGllbnQnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICdJbnRlcm5hbDogQWxsb2NhdGUnLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdpbnRlcm5hbCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ0ludGVybmFsOiBQbGF5Ym9vaycsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2ludGVybmFsJyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnTWV0VGVsOiBSZXRhaW5lcicsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ1JlZ2lvbnM6IFJlZ2lvbnMuY29tJyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnU3VuVHJ1c3Q6IE9uLWJvYXJkaW5nJyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnU3VuVHJ1c3Q6IE9ubGluZSBCYW5raW5nJyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnU3VuVHJ1c3Q6IFN1blRydXN0LmNvbScsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ1ZhY2F0aW9uL1RpbWUgb2ZmJyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnaW50ZXJuYWwnLFxuXHRcdFx0aW5jcmVtZW50czoge1xuXHRcdFx0XHR0eXBlOiAnZGF5Jyxcblx0XHRcdFx0dmFsdWU6IDAuNVxuXHRcdFx0fSxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnWiBDbGllbnQ6IFNvbWUgcHJvamVjdCAxJyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnWiBDbGllbnQ6IFNvbWUgcHJvamVjdCAyJyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnWiBDbGllbnQ6IFNvbWUgcHJvamVjdCAzJyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnWiBDbGllbnQ6IFNvbWUgcHJvamVjdCA0Jyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnWiBDbGllbnQ6IFNvbWUgcHJvamVjdCA1Jyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnWiBDbGllbnQ6IFNvbWUgcHJvamVjdCA2Jyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnWiBDbGllbnQ6IFNvbWUgcHJvamVjdCA3Jyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fVxuXHRdKTtcblxuXHRcdHNlbGVjdFByb2plY3QudG9nZ2xlUHJvamVjdCA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0aWYgKGl0ZW0uYWN0aXZlKCkpIHtcblx0XHRcdGl0ZW0uYWN0aXZlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aXRlbS5hY3RpdmUodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0UHJvamVjdDsiLCIvKipcbiAqIHNjcmlwdHMvc3RlcHMuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gU3RlcHMoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgc3RlcHMgPSBhcHAubXlWaWV3TW9kZWwuc3RlcHMgPSB7fTtcblxuXHRzdGVwcy5jdXJyZW50U3RlcCA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHN0ZXBzLnN0ZXBzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtcblx0XHR7XG5cdFx0XHRzdGVwTnVtYmVyOiAwLFxuXHRcdFx0c3RlcE5hbWU6ICdzZWxlY3RQcm9qZWN0J1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0c3RlcE51bWJlcjogMSxcblx0XHRcdHN0ZXBOYW1lOiAnc2VsZWN0UHJvamVjdCdcblx0XHR9LFxuXHRcdHtcblx0XHRcdHN0ZXBOdW1iZXI6IDIsXG5cdFx0XHRzdGVwTmFtZTogJ3NlbGVjdFByb2plY3QnXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRzdGVwTnVtYmVyOiAzLFxuXHRcdFx0c3RlcE5hbWU6ICdzZWxlY3RQcm9qZWN0J1xuXHRcdH1cblx0XSk7XG5cblx0Ly8gJChkb2N1bWVudCkub24oJ3N3aXBlJywgZnVuY3Rpb24oKSB7XG5cdC8vIFx0YWxlcnQoJ3N3aXBlJylcblx0Ly8gfSk7XG5cblx0c3RlcHMuY2hhbmdlU3RlcCA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRzdGVwcy5jdXJyZW50U3RlcChpdGVtLnN0ZXBOdW1iZXIpO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5yYXRlUHJvamVjdC5pbml0UHJvamVjdCgpO1xuXHR9XG5cblx0c3RlcHMubmV4dFN0ZXAgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcblx0XHRzdGVwcy5jdXJyZW50U3RlcChzdGVwcy5jdXJyZW50U3RlcCgpICsgZGlyZWN0aW9uKTtcblx0XHRhcHAubXlWaWV3TW9kZWwucmF0ZVByb2plY3QuaW5pdFByb2plY3QoKTtcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0ZXBzOyJdfQ==
