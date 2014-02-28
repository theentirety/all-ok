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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvYXV0aC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvZmFrZV9iMDZhZTllZC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvaGVhZGVyLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9ub3Rlcy5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvcmF0ZS1wcm9qZWN0LmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9yYXRlLXdlZWsuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3NlbGVjdC1wcm9qZWN0LmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zdGVwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBzY3JpcHRzL2FwcC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBcHAoKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHQvLyBpbml0aWFsaXplIGtub2Nrb3V0XG5cdHNlbGYubXlWaWV3TW9kZWwgPSB7fTtcblxuXHRzZWxmLm15Vmlld01vZGVsLmN1cnJlbnRVc2VyID0ga28ub2JzZXJ2YWJsZShudWxsKTtcblxuXHRzZWxmLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdkZXZpY2VyZWFkeScsIHNlbGYub25EZXZpY2VSZWFkeSwgZmFsc2UpO1xuXHR9XG5cblx0c2VsZi5vbkRldmljZVJlYWR5ID0gZnVuY3Rpb24oKSB7XG5cdFx0a28uYXBwbHlCaW5kaW5ncyhzZWxmLm15Vmlld01vZGVsKTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0bmF2aWdhdG9yLnNwbGFzaHNjcmVlbi5oaWRlKCk7XG5cdFx0fSwgMjAwMCk7XG5cdFx0XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBcHA7IiwiLyoqXG4gKiBzY3JpcHRzL2F1dGguanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQXV0aChhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBhdXRoID0gYXBwLm15Vmlld01vZGVsLmF1dGggPSB7fTtcblxuXHRhdXRoLmN1cnJlbnRVc2VyID0ga28ub2JzZXJ2YWJsZSgpO1xuXHRhdXRoLmVycm9yTWVzc2FnZSA9IGtvLm9ic2VydmFibGUoJycpO1xuXHRhdXRoLnNpZ25VcE1vZGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcblxuXHR2YXIgY3VycmVudFVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcblx0aWYgKGN1cnJlbnRVc2VyKSB7XG5cdFx0YXV0aC5jdXJyZW50VXNlcihjdXJyZW50VXNlcik7XG5cdH1cblxuXHRhdXRoLnJlc2V0RXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRhdXRoLmVycm9yTWVzc2FnZSgnJyk7XG5cdH1cblxuXHRhdXRoLnNpZ25JblVwID0gZnVuY3Rpb24oZm9ybUVsZW1lbnQpIHtcblx0XHQvLyBrby5wb3N0Ym94LnB1Ymxpc2goJ2lzTG9hZGluZycsIHRydWUpO1xuXHRcdGF1dGgucmVzZXRFcnJvcigpO1xuXG5cdFx0dmFyIHVzZXJuYW1lID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX3VzZXJuYW1lXScpLnZhbCgpO1xuXHRcdHZhciBwYXNzd29yZCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9wYXNzd29yZF0nKS52YWwoKTtcblxuXHRcdGlmIChhdXRoLnNpZ25VcE1vZGUoKSkge1xuXHRcdFx0dmFyIGVtYWlsID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2VtYWlsXScpLnZhbCgpLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHR2YXIgZGlzcGxheU5hbWUgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZGlzcGxheU5hbWVdJykudmFsKCk7XG5cdFx0XHR2YXIgcGFzc3dvcmRDb25maXJtID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX2NvbmZpcm1QYXNzd29yZF0nKS52YWwoKTtcblxuXHRcdFx0Ly8gdmFsaWRhdGlvblxuXHRcdFx0aWYgKGVtYWlsLmxlbmd0aCA8IDEpIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciB5b3VyIGVtYWlsIGFkZHJlc3MuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGRpc3BsYXlOYW1lLmxlbmd0aCA8IDEpIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciB5b3VyIGZpcnN0IGFuZCBsYXN0IG5hbWUuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHVzZXJuYW1lLmxlbmd0aCA8IDEpIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciBhIHVzZXJuYW1lLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwYXNzd29yZC5sZW5ndGggPCAxIHx8IHBhc3N3b3JkQ29uZmlybSA8IDEgfHwgcGFzc3dvcmQgIT0gcGFzc3dvcmRDb25maXJtKSB7XG5cdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKCdQbGVhc2UgZW50ZXIgYW5kIGNvbmZpcm0gYSBwYXNzd29yZC4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgdXNlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG5cdFx0XHR2YXIgc2NydWJiZWRVc2VybmFtZSA9IHVzZXJuYW1lLnJlcGxhY2UoL1xccysvZyxcIlwiKTsgLy9yZW1vdmUgd2hpdGUgc3BhY2Vcblx0XHRcdHNjcnViYmVkVXNlcm5hbWUgPSBzY3J1YmJlZFVzZXJuYW1lLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRcdHVzZXIuc2V0KCd1c2VybmFtZScsIHNjcnViYmVkVXNlcm5hbWUpO1xuXHRcdFx0dXNlci5zZXQoJ3Bhc3N3b3JkJywgcGFzc3dvcmQpO1xuXHRcdFx0dXNlci5zZXQoJ2VtYWlsJywgZW1haWwpO1xuXHRcdFx0dXNlci5zZXQoJ2Rpc3BsYXlOYW1lJywgZGlzcGxheU5hbWUpO1xuXG5cdFx0XHQvLyBvdGhlciBmaWVsZHMgY2FuIGJlIHNldCBqdXN0IGxpa2Ugd2l0aCBQYXJzZS5PYmplY3Rcblx0XHRcdC8vIHVzZXIuc2V0KFwicGhvbmVcIiwgXCI0MTUtMzkyLTAyMDJcIik7XG5cblx0XHRcdHVzZXIuc2lnblVwKG51bGwsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRcdGF1dGguY3VycmVudFVzZXIodXNlcik7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuXHRcdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdFBhcnNlLlVzZXIubG9nSW4odXNlcm5hbWUsIHBhc3N3b3JkLCB7XG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRcdFx0XHRhdXRoLmN1cnJlbnRVc2VyKHVzZXIpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcblx0XHRcdFx0XHQvLyBUaGUgbG9naW4gZmFpbGVkLiBDaGVjayBlcnJvciB0byBzZWUgd2h5LlxuXHRcdFx0XHRcdGF1dGguZXJyb3JNZXNzYWdlKGF1dGguc2FuaXRpemVFcnJvcnMoZXJyb3IpKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGF1dGgubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0UGFyc2UuVXNlci5sb2dPdXQoKTtcblx0XHRhdXRoLmN1cnJlbnRVc2VyKG51bGwpO1xuXHR9XG5cblx0YXV0aC5zaG93U2lnblVwID0gZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ2FzZGYnKVxuXHRcdGF1dGguZXJyb3JNZXNzYWdlKCcnKTtcblx0XHRpZiAoYXV0aC5zaWduVXBNb2RlKCkpIHtcblx0XHRcdGF1dGguc2lnblVwTW9kZShmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGF1dGguc2lnblVwTW9kZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhdXRoLnNhbml0aXplRXJyb3JzID0gZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRzd2l0Y2goZXJyb3IuY29kZSlcblx0XHR7XG5cdFx0XHRjYXNlIDEwMTpcblx0XHRcdFx0cmV0dXJuICdQbGVhc2UgZW50ZXIgYSB2YWxpZCB1c2VybmFtZSBhbmQgcGFzc3dvcmQuJztcblx0XHRcdGNhc2UgMTI0OlxuXHRcdFx0XHRyZXR1cm4gJ09vcHMhIFdlIG1lc3NlZCB1cC4gUGxlYXNlIHRyeSBhZ2Fpbi4nO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIGVycm9yLm1lc3NhZ2UuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBlcnJvci5tZXNzYWdlLnNsaWNlKDEpICsgJy4nO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF1dGg7IiwiLyoqXG4gKiBzY3JpcHRzL21haW4uanNcbiAqXG4gKiBUaGlzIGlzIHRoZSBzdGFydGluZyBwb2ludCBmb3IgeW91ciBhcHBsaWNhdGlvbi5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEFwcCA9IHJlcXVpcmUoJy4vYXBwLmpzJyk7XG52YXIgQXV0aCA9IHJlcXVpcmUoJy4vYXV0aC5qcycpO1xudmFyIFN0ZXBzID0gcmVxdWlyZSgnLi9zdGVwcy5qcycpO1xudmFyIFNlbGVjdFByb2plY3QgPSByZXF1aXJlKCcuL3NlbGVjdC1wcm9qZWN0LmpzJyk7XG52YXIgSGVhZGVyID0gcmVxdWlyZSgnLi9oZWFkZXIuanMnKTtcbnZhciBSYXRlUHJvamVjdCA9IHJlcXVpcmUoJy4vcmF0ZS1wcm9qZWN0LmpzJyk7XG52YXIgUmF0ZVdlZWsgPSByZXF1aXJlKCcuL3JhdGUtd2Vlay5qcycpO1xudmFyIE5vdGVzID0gcmVxdWlyZSgnLi9ub3Rlcy5qcycpO1xuXG4vLyBpbml0aWFsaXplIHBhcnNlXG5QYXJzZS5pbml0aWFsaXplKFwiSmtZTmZQQncyYVBnY2M3UGVUR0hNQVUyWEt2anplcVZJa3lDbFZ1b1wiLCBcIjQ1T01VM1pTM281YzE2OGxReGEwaWx4UXU0RmRNVkhUMU5WVGtPUmxcIik7XG5cbi8vIGluaXRpYWxpemUgdHlwZWtpdFxudHJ5e1R5cGVraXQubG9hZCgpO31jYXRjaChlKXt9XG5cbnZhciBhcHAgPSBuZXcgQXBwKCk7XG52YXIgYXV0aCA9IG5ldyBBdXRoKGFwcCk7XG52YXIgc3RlcHMgPSBuZXcgU3RlcHMoYXBwKTtcbnZhciBzZWxlY3RQcm9qZWN0ID0gbmV3IFNlbGVjdFByb2plY3QoYXBwKTtcbnZhciBoZWFkZXIgPSBuZXcgSGVhZGVyKGFwcCk7XG52YXIgcmF0ZVByb2plY3QgPSBuZXcgUmF0ZVByb2plY3QoYXBwKTtcbnZhciByYXRlV2VlayA9IG5ldyBSYXRlV2VlayhhcHApO1xudmFyIG5vdGVzID0gbmV3IE5vdGVzKGFwcCk7XG5cblxuLy8gQ3VzdG9tIGtub2Nrb3V0IGV4dG5lZGVyc1xuXG4vLyBIZXJlJ3MgYSBjdXN0b20gS25vY2tvdXQgYmluZGluZyB0aGF0IG1ha2VzIGVsZW1lbnRzIHNob3duL2hpZGRlbiB2aWEgalF1ZXJ5J3MgZmFkZUluKCkvZmFkZU91dCgpIG1ldGhvZHNcbi8vIENvdWxkIGJlIHN0b3JlZCBpbiBhIHNlcGFyYXRlIHV0aWxpdHkgbGlicmFyeVxua28uYmluZGluZ0hhbmRsZXJzLmZhZGVWaXNpYmxlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gSW5pdGlhbGx5IHNldCB0aGUgZWxlbWVudCB0byBiZSBpbnN0YW50bHkgdmlzaWJsZS9oaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZVxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICBrby51bndyYXAodmFsdWUpID8gJChlbGVtZW50KS5mYWRlSW4oKSA6ICQoZWxlbWVudCkuZmFkZU91dCgpO1xuICAgIH1cbn1cblxuYXBwLmluaXRpYWxpemUoKTsiLCIvKipcbiAqIHNjcmlwdHMvaGVhZGVyLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEhlYWRlcihhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBoZWFkZXIgPSBhcHAubXlWaWV3TW9kZWwuaGVhZGVyID0ge307XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyOyIsIi8qKlxuICogc2NyaXB0cy9ub3Rlcy5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBOb3RlcyhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBub3RlcyA9IGFwcC5teVZpZXdNb2RlbC5ub3RlcyA9IHt9O1xuXG5cblx0cmV0dXJuIHNlbGY7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBOb3RlczsiLCIvKipcbiAqIHNjcmlwdHMvcmF0ZS1wcm9qZWN0LmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFJhdGVQcm9qZWN0KGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHJhdGVQcm9qZWN0ID0gYXBwLm15Vmlld01vZGVsLnJhdGVQcm9qZWN0ID0ge307XG5cblx0cmF0ZVByb2plY3QuYWN0aXZlSW5kZXggPSBrby5vYnNlcnZhYmxlKC0xKTtcblx0cmF0ZVByb2plY3QuYWN0aXZlRG9tSW5kZXggPSBrby5vYnNlcnZhYmxlKDApO1xuXHRyYXRlUHJvamVjdC5wcm9qZWN0RG9tTGVuZ3RoID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cmF0ZVByb2plY3QucmVnaXN0ZXJNb3VzZVkgPSBrby5vYnNlcnZhYmxlKCk7XG5cdHJhdGVQcm9qZWN0LnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlID0ga28ub2JzZXJ2YWJsZSgxODApO1xuXHRyYXRlUHJvamVjdC53b3JraW5nUGVyY2VudGFnZSA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHJhdGVQcm9qZWN0LndvcmtpbmdDb2x1bW4gPSBrby5vYnNlcnZhYmxlKDApO1xuXHRyYXRlUHJvamVjdC50b2RheSA9IG1vbWVudChuZXcgRGF0ZSgpKS5zdGFydE9mKCdpc293ZWVrJyk7XG5cblx0cmF0ZVByb2plY3QuY29sdW1ucyA9IGtvLm9ic2VydmFibGVBcnJheShbXG5cdFx0eyAgXG5cdFx0XHRkYXRlOiBrby5vYnNlcnZhYmxlKG1vbWVudChyYXRlUHJvamVjdC50b2RheSkuZm9ybWF0KCdNTU0gRCcpKSxcblx0XHRcdHRvdGFsOiBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN1bSA9IF8ucmVkdWNlKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG1lbW8sIHByb2plY3QpIHtcblx0XHRcdFx0XHR2YXIgY29sVmFsdWUgPSAwO1xuXHRcdFx0XHRcdGlmIChwcm9qZWN0LmFjdGl2ZSgpKSB7XG5cdFx0XHRcdFx0XHRjb2xWYWx1ZSA9IHByb2plY3QucGVyY2VudGFnZSgpWzBdLnZhbHVlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBtZW1vICsgY29sVmFsdWU7IFxuXHRcdFx0XHR9LCAwKTtcblx0XHRcdFx0cmV0dXJuIHN1bTtcblx0XHRcdH0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRkYXRlOiBrby5vYnNlcnZhYmxlKG1vbWVudChyYXRlUHJvamVjdC50b2RheSkuYWRkKCdkYXlzJywgNykuZm9ybWF0KCdNTU0gRCcpKSxcblx0XHRcdHRvdGFsOiBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN1bSA9IF8ucmVkdWNlKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG1lbW8sIHByb2plY3QpIHtcblx0XHRcdFx0XHR2YXIgY29sVmFsdWUgPSAwO1xuXHRcdFx0XHRcdGlmIChwcm9qZWN0LmFjdGl2ZSgpKSB7XG5cdFx0XHRcdFx0XHRjb2xWYWx1ZSA9IHByb2plY3QucGVyY2VudGFnZSgpWzFdLnZhbHVlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBtZW1vICsgY29sVmFsdWU7IFxuXHRcdFx0XHR9LCAwKTtcblx0XHRcdFx0cmV0dXJuIHN1bTtcblx0XHRcdH0pXG5cdFx0fSxcblx0XHR7ICBcblx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHJhdGVQcm9qZWN0LnRvZGF5KS5hZGQoJ2RheXMnLCAxNCkuZm9ybWF0KCdNTU0gRCcpKSxcblx0XHRcdHRvdGFsOiBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHN1bSA9IF8ucmVkdWNlKGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKCksIGZ1bmN0aW9uKG1lbW8sIHByb2plY3QpIHtcblx0XHRcdFx0XHR2YXIgY29sVmFsdWUgPSAwO1xuXHRcdFx0XHRcdGlmIChwcm9qZWN0LmFjdGl2ZSgpKSB7XG5cdFx0XHRcdFx0XHRjb2xWYWx1ZSA9IHByb2plY3QucGVyY2VudGFnZSgpWzJdLnZhbHVlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBtZW1vICsgY29sVmFsdWU7IFxuXHRcdFx0XHR9LCAwKTtcblx0XHRcdFx0cmV0dXJuIHN1bTtcblx0XHRcdH0pXG5cdFx0fVxuXHRdKTtcblxuXHRyYXRlUHJvamVjdC5kaWFsU2V0dGluZ3MgPSBrby5vYnNlcnZhYmxlKHtcblx0XHRpbnRlcnZhbDogNSwgLy9wZXJjZW50XG5cdFx0dmFsdWU6ICclJ1xuXHR9KTtcblxuXHRyYXRlUHJvamVjdC5maXJzdEluZGV4ID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dmFyIHByb2plY3RzID0gYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QuYWxsUHJvamVjdHMoKTtcblx0XHR2YXIgZmlyc3RQcm9qZWN0ID0gXy5maW5kKHByb2plY3RzLCBmdW5jdGlvbihvYmope1xuXHRcdFx0cmV0dXJuIG9iai5hY3RpdmUoKSA9PSB0cnVlO1xuXHRcdH0pO1xuXHRcdHZhciBmaXJzdEluZGV4ID0gXy5pbmRleE9mKHByb2plY3RzLCBmaXJzdFByb2plY3QpO1xuXHRcdHJldHVybiBmaXJzdEluZGV4O1xuXHR9KTtcblxuXHRyYXRlUHJvamVjdC5hY3RpdmVQcm9qZWN0ID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHVzZUluZGV4ID0gYXBwLm15Vmlld01vZGVsLnJhdGVQcm9qZWN0LmFjdGl2ZUluZGV4KClcblx0XHRpZiAodXNlSW5kZXggPT0gLTEpIHtcblx0XHRcdHVzZUluZGV4ID0gYXBwLm15Vmlld01vZGVsLnJhdGVQcm9qZWN0LmZpcnN0SW5kZXgoKTtcblx0XHR9XG5cdFx0dmFyIHByb2plY3QgPSBhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpW3VzZUluZGV4XTtcblx0XHQvLyBpZiAocHJvamVjdC50eXBlID09ICdpbnRlcm5hbCcpIHtcblxuXHRcdC8vIH1cblx0XHQvLyBjb25zb2xlLmxvZyhwcm9qZWN0KVxuXHRcdHJldHVybiBwcm9qZWN0O1xuXHR9KTtcblxuXHQvLyAkKCcudXNlci1wcm9qZWN0cycpLmhhbW1lcih7IGRyYWdfbG9ja190b19heGlzOiB0cnVlIH0pLm9uKFwic3dpcGUgZHJhZ1wiLCBmdW5jdGlvbihldmVudCkge1xuXHQvLyBcdGV2ZW50Lmdlc3R1cmUucHJldmVudERlZmF1bHQoKTtcblx0Ly8gXHRpZihldmVudC50eXBlID09IFwic3dpcGVcIil7XG5cdC8vIFx0XHRhbGVydCgnc3dpcGUnKTtcblx0Ly8gXHR9IGVsc2Uge1xuXHQvLyBcdFx0YWxlcnQoJ2RyYWcnKTtcblx0Ly8gXHR9XG5cdC8vIH0pO1xuXG5cdHJhdGVQcm9qZWN0LmRyYWdIYW5kbGUgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmIChldmVudC50eXBlID09ICdtb3VzZWRvd24nKSB7XG5cdFx0XHRyYXRlUHJvamVjdC5yZWdpc3Rlck1vdXNlWShldmVudC5vcmlnaW5hbEV2ZW50LmNsaWVudFkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyYXRlUHJvamVjdC5yZWdpc3Rlck1vdXNlWShldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSk7XG5cdFx0fVxuXHRcdCQoJyNyYXRlLXByb2plY3QgLmhhbmRsZScpLmFkZENsYXNzKCdkcmFnZ2luZycpO1xuXHRcdFxuXHRcdCQoZG9jdW1lbnQpLm9uKCd0b3VjaG1vdmUgbW91c2Vtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdHZhciBjbGllbnRZO1xuXHRcdFx0aWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQudHlwZSA9PSAnbW91c2Vtb3ZlJykge1xuXHRcdFx0XHRjbGllbnRZID0gZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRZO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y2xpZW50WSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5jbGllbnRZO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGRpZmYgPSByYXRlUHJvamVjdC5yZWdpc3Rlck1vdXNlWSgpIC0gY2xpZW50WTtcblx0XHRcdHZhciBkZWdyZWVzID0gcmF0ZVByb2plY3QucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoKSArIChkaWZmIC8gMS4yNSk7XG5cdFx0XHR2YXIgcGVyY2VudGFnZSA9IE1hdGguZmxvb3IoKChkZWdyZWVzIC0gMTgwKSAvIDEuOCkgLyByYXRlUHJvamVjdC5kaWFsU2V0dGluZ3MoKS5pbnRlcnZhbCkgKiByYXRlUHJvamVjdC5kaWFsU2V0dGluZ3MoKS5pbnRlcnZhbDtcblx0XHRcdGlmIChwZXJjZW50YWdlIDwgMSkge1xuXHRcdFx0XHRwZXJjZW50YWdlID0gMDtcblx0XHRcdFx0ZGVncmVlcyA9IDE4MDtcblx0XHRcdH1cblx0XHRcdGlmIChwZXJjZW50YWdlID4gOTkpIHtcblx0XHRcdFx0cGVyY2VudGFnZSA9IDEwMDtcblx0XHRcdFx0ZGVncmVlcyA9IDM2MDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmF0ZVByb2plY3Qud29ya2luZ1BlcmNlbnRhZ2UocGVyY2VudGFnZSk7XG5cdFx0XHRyYXRlUHJvamVjdC5hY3RpdmVQcm9qZWN0KCkucGVyY2VudGFnZSgpW3JhdGVQcm9qZWN0LndvcmtpbmdDb2x1bW4oKV0udmFsdWUocGVyY2VudGFnZSk7XG5cdFx0XHRyYXRlUHJvamVjdC5yb3RhdGVEaWFsKGRlZ3JlZXMpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub25lKCd0b3VjaGVuZCBtb3VzZXVwJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdHZhciBlbmRpbmdQZXJjZW50YWdlID0gcmF0ZVByb2plY3Qud29ya2luZ1BlcmNlbnRhZ2UoKSAqIDEuODtcblx0XHRcdHJhdGVQcm9qZWN0LnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlKDE4MCArIGVuZGluZ1BlcmNlbnRhZ2UpO1xuXHRcdFx0JCgnI3JhdGUtcHJvamVjdCAuaGFuZGxlJykucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJyk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ3RvdWNobW92ZSBtb3VzZW1vdmUnKTtcblx0XHR9KTtcblxuXHR9XG5cblx0cmF0ZVByb2plY3Qucm90YXRlRGlhbCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcblx0XHQkKCcjcmF0ZS1wcm9qZWN0IC5kaWFsJykuY3NzKHsnLXdlYmtpdC10cmFuc2Zvcm0nIDogJ3JvdGF0ZSgnKyBkZWdyZWVzICsnZGVnKScsXG5cdFx0XHQnLW1vei10cmFuc2Zvcm0nIDogJ3JvdGF0ZSgnKyBkZWdyZWVzICsnZGVnKScsXG5cdFx0XHQnLW1zLXRyYW5zZm9ybScgOiAncm90YXRlKCcrIGRlZ3JlZXMgKydkZWcpJyxcblx0XHRcdCd0cmFuc2Zvcm0nIDogJ3JvdGF0ZSgnKyBkZWdyZWVzICsnZGVnKSd9KTtcblx0fVxuXG5cdHJhdGVQcm9qZWN0LnNldENvbHVtbiA9IGZ1bmN0aW9uKGNvbHVtbikge1xuXHRcdHJhdGVQcm9qZWN0LndvcmtpbmdDb2x1bW4oY29sdW1uKTtcblx0XHR2YXIgcGVyY2VudGFnZSA9IHJhdGVQcm9qZWN0LmFjdGl2ZVByb2plY3QoKS5wZXJjZW50YWdlKClbcmF0ZVByb2plY3Qud29ya2luZ0NvbHVtbigpXS52YWx1ZSgpO1xuXG5cdFx0cmF0ZVByb2plY3Qud29ya2luZ1BlcmNlbnRhZ2UocGVyY2VudGFnZSk7XG5cdFx0dmFyIGRlZ3JlZXMgPSBNYXRoLmZsb29yKChwZXJjZW50YWdlICogMS44KSAtIDE4MCk7XG5cblx0XHRyYXRlUHJvamVjdC5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZSgocGVyY2VudGFnZSAqIDEuOCkgKyAxODApO1xuXHRcdHJhdGVQcm9qZWN0LnJvdGF0ZURpYWwoZGVncmVlcyk7XG5cdH1cblxuXHRyYXRlUHJvamVjdC5nb1RvUHJvamVjdCA9IGZ1bmN0aW9uKGluZGV4LCBpdGVtLCBldmVudCkge1xuXHRcdHJhdGVQcm9qZWN0LmFjdGl2ZUluZGV4KGluZGV4KTtcblx0XHR2YXIgdG9wID0gJChldmVudC50YXJnZXQpLnBvc2l0aW9uKCkudG9wO1xuXHRcdHZhciBkb21JbmRleCA9IF8uaW5kZXhPZigkKCcjcmF0ZS1wcm9qZWN0IC51c2VyLXByb2plY3RzJykuY2hpbGRyZW4oKSwgZXZlbnQudGFyZ2V0KTtcblx0XHRpZiAoZG9tSW5kZXggPCAwKSB7XG5cdFx0XHRkb21JbmRleCA9IDA7XG5cdFx0fVxuXHRcdHJhdGVQcm9qZWN0LmFjdGl2ZURvbUluZGV4KGRvbUluZGV4KTtcblx0XHRyYXRlUHJvamVjdC5wcm9qZWN0RG9tTGVuZ3RoKCQoJyNyYXRlLXByb2plY3QgLnVzZXItcHJvamVjdHMnKS5jaGlsZHJlbigpLmxlbmd0aCk7XG5cdFx0JCgnI3JhdGUtcHJvamVjdCAudXNlci1wcm9qZWN0cycpLmFuaW1hdGUoeyBcblx0XHRcdHNjcm9sbFRvcDogZG9tSW5kZXggKiA0NlxuXHRcdH0sIDIwMCk7XG5cdFx0cmF0ZVByb2plY3Quc2V0Q29sdW1uKDApO1xuXHR9XG5cblx0cmF0ZVByb2plY3QuaW5pdFByb2plY3QgPSBmdW5jdGlvbigpIHtcblx0XHRyYXRlUHJvamVjdC5hY3RpdmVEb21JbmRleCgwKTtcblx0XHQkKCcjcmF0ZS1wcm9qZWN0IC51c2VyLXByb2plY3RzJykuY2hpbGRyZW4oKS5maXJzdCgpLnRyaWdnZXIoJ2NsaWNrJyk7XG5cdH1cblxuXHRyYXRlUHJvamVjdC5yZW5kZXJDaGFydCA9IGZ1bmN0aW9uKCkge1xuXG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSYXRlUHJvamVjdDsiLCIvKipcbiAqIHNjcmlwdHMvcmF0ZS13ZWVrLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFJhdGVXZWVrKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHJhdGVXZWVrID0gYXBwLm15Vmlld01vZGVsLnJhdGVXZWVrID0ge307XG5cblx0cmF0ZVdlZWsucmVnaXN0ZXJNb3VzZVggPSBrby5vYnNlcnZhYmxlKCk7XG5cdHJhdGVXZWVrLnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cmF0ZVdlZWsudG9kYXkgPSBtb21lbnQobmV3IERhdGUoKSkuc3RhcnRPZignaXNvd2VlaycpO1xuXHRyYXRlV2Vlay5yZWdpc3RlclJhdGlvID0ga28ub2JzZXJ2YWJsZSgkKGRvY3VtZW50KS53aWR0aCgpIC0gMjApO1xuXHRyYXRlV2Vlay5hY3RpdmVXZWVrID0ga28ub2JzZXJ2YWJsZSgwKTtcblxuXHRyYXRlV2Vlay53ZWVrcyA9IGtvLm9ic2VydmFibGVBcnJheShbXG5cdFx0e1xuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocmF0ZVdlZWsudG9kYXkpLmZvcm1hdCgnTU1NIEQnKSksXG5cdFx0XHR0b3RhbDoga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdW0gPSBfLnJlZHVjZShhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihtZW1vLCBwcm9qZWN0KSB7XG5cdFx0XHRcdFx0dmFyIGNvbFZhbHVlID0gMDtcblx0XHRcdFx0XHRpZiAocHJvamVjdC5hY3RpdmUoKSkge1xuXHRcdFx0XHRcdFx0Y29sVmFsdWUgPSBwcm9qZWN0LnBlcmNlbnRhZ2UoKVswXS52YWx1ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gbWVtbyArIGNvbFZhbHVlOyBcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdHJldHVybiBzdW07XG5cdFx0XHR9KVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocmF0ZVdlZWsudG9kYXkpLmFkZCgnZGF5cycsIDcpLmZvcm1hdCgnTU1NIEQnKSksXG5cdFx0XHR0b3RhbDoga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdW0gPSBfLnJlZHVjZShhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihtZW1vLCBwcm9qZWN0KSB7XG5cdFx0XHRcdFx0dmFyIGNvbFZhbHVlID0gMDtcblx0XHRcdFx0XHRpZiAocHJvamVjdC5hY3RpdmUoKSkge1xuXHRcdFx0XHRcdFx0Y29sVmFsdWUgPSBwcm9qZWN0LnBlcmNlbnRhZ2UoKVsxXS52YWx1ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gbWVtbyArIGNvbFZhbHVlOyBcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdHJldHVybiBzdW07XG5cdFx0XHR9KVxuXHRcdH0sXG5cdFx0eyAgXG5cdFx0XHRkYXRlOiBrby5vYnNlcnZhYmxlKG1vbWVudChyYXRlV2Vlay50b2RheSkuYWRkKCdkYXlzJywgMTQpLmZvcm1hdCgnTU1NIEQnKSksXG5cdFx0XHR0b3RhbDoga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdW0gPSBfLnJlZHVjZShhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpLCBmdW5jdGlvbihtZW1vLCBwcm9qZWN0KSB7XG5cdFx0XHRcdFx0dmFyIGNvbFZhbHVlID0gMDtcblx0XHRcdFx0XHRpZiAocHJvamVjdC5hY3RpdmUoKSkge1xuXHRcdFx0XHRcdFx0Y29sVmFsdWUgPSBwcm9qZWN0LnBlcmNlbnRhZ2UoKVsyXS52YWx1ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gbWVtbyArIGNvbFZhbHVlOyBcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdHJldHVybiBzdW07XG5cdFx0XHR9KVxuXHRcdH1cblx0XSk7XG5cblx0cmF0ZVdlZWsuZHJhZyA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0dmFyIHN0YXJ0WCA9IGV2ZW50Lmdlc3R1cmUuc3RhcnRFdmVudC5jZW50ZXIucGFnZVg7XG5cdFx0aWYgKHJhdGVXZWVrLnJlZ2lzdGVyTW91c2VYKCkgIT0gc3RhcnRYKSB7XG5cdFx0XHRyYXRlV2Vlay5yZWdpc3Rlck1vdXNlWChzdGFydFgpO1xuXHRcdFx0cmF0ZVdlZWsucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoaXRlbS5wZXJjZW50YWdlKClbcmF0ZVdlZWsuYWN0aXZlV2VlaygpXS52YWx1ZSgpKTtcblx0XHR9XG5cdFx0dmFyIGRpZmYgPSAoZXZlbnQuZ2VzdHVyZS5kZWx0YVggLyByYXRlV2Vlay5yZWdpc3RlclJhdGlvKCkpICogMTAwO1xuXHRcdHZhciBuZXdQZXJjZW50YWdlID0gTWF0aC5mbG9vcigoZGlmZiArIHJhdGVXZWVrLnJlZ2lzdGVyU3RhcnRQZXJjZW50YWdlKCkpIC8gNSkgKiA1O1xuXG5cdFx0aWYgKG5ld1BlcmNlbnRhZ2UgPiAwICYmIG5ld1BlcmNlbnRhZ2UgPD0gMTAwKSB7XG5cdFx0XHRpdGVtLnBlcmNlbnRhZ2UoKVtyYXRlV2Vlay5hY3RpdmVXZWVrKCldLnZhbHVlKG5ld1BlcmNlbnRhZ2UpO1xuXHRcdH0gZWxzZSBpZiAobmV3UGVyY2VudGFnZSA+IDEwMCkge1xuXHRcdFx0aXRlbS5wZXJjZW50YWdlKClbcmF0ZVdlZWsuYWN0aXZlV2VlaygpXS52YWx1ZSgxMDApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpdGVtLnBlcmNlbnRhZ2UoKVtyYXRlV2Vlay5hY3RpdmVXZWVrKCldLnZhbHVlKDApO1xuXHRcdH1cblxuXHR9XG5cblx0cmF0ZVdlZWsuc2VsZWN0V2VlayA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0cmF0ZVdlZWsuYWN0aXZlV2VlayhpbmRleCk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSYXRlV2VlazsiLCIvKipcbiAqIHNjcmlwdHMvc2VsZWN0LXByb2plY3QuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gU2VsZWN0UHJvamVjdChhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBzZWxlY3RQcm9qZWN0ID0gYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QgPSB7fTtcblxuXHRzZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtcblx0XHR7XG5cdFx0XHRuYW1lOiAnRHJpdmVTY3JpYmU6IFNwcmludCcsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ0xpYXNvbjogQ0FTJyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnSW50ZXJuYWw6IEFsbG9jYXRlJyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnaW50ZXJuYWwnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICdJbnRlcm5hbDogUGxheWJvb2snLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdpbnRlcm5hbCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ01ldFRlbDogUmV0YWluZXInLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdjbGllbnQnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICdSZWdpb25zOiBSZWdpb25zLmNvbScsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ1N1blRydXN0OiBPbi1ib2FyZGluZycsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ1N1blRydXN0OiBPbmxpbmUgQmFua2luZycsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ1N1blRydXN0OiBTdW5UcnVzdC5jb20nLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdjbGllbnQnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICdWYWNhdGlvbi9UaW1lIG9mZicsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2ludGVybmFsJyxcblx0XHRcdGluY3JlbWVudHM6IHtcblx0XHRcdFx0dHlwZTogJ2RheScsXG5cdFx0XHRcdHZhbHVlOiAwLjVcblx0XHRcdH0sXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ1ogQ2xpZW50OiBTb21lIHByb2plY3QgMScsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ1ogQ2xpZW50OiBTb21lIHByb2plY3QgMicsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ1ogQ2xpZW50OiBTb21lIHByb2plY3QgMycsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ1ogQ2xpZW50OiBTb21lIHByb2plY3QgNCcsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ1ogQ2xpZW50OiBTb21lIHByb2plY3QgNScsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ1ogQ2xpZW50OiBTb21lIHByb2plY3QgNicsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ1ogQ2xpZW50OiBTb21lIHByb2plY3QgNycsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH1cblx0XSk7XG5cblx0XHRzZWxlY3RQcm9qZWN0LnRvZ2dsZVByb2plY3QgPSBmdW5jdGlvbihpdGVtLCBldmVudCkge1xuXHRcdGlmIChpdGVtLmFjdGl2ZSgpKSB7XG5cdFx0XHRpdGVtLmFjdGl2ZShmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGl0ZW0uYWN0aXZlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdFByb2plY3Q7IiwiLyoqXG4gKiBzY3JpcHRzL3N0ZXBzLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFN0ZXBzKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIHN0ZXBzID0gYXBwLm15Vmlld01vZGVsLnN0ZXBzID0ge307XG5cblx0c3RlcHMuY3VycmVudFN0ZXAgPSBrby5vYnNlcnZhYmxlKDApO1xuXHRzdGVwcy5zdGVwcyA9IGtvLm9ic2VydmFibGVBcnJheShbXG5cdFx0e1xuXHRcdFx0c3RlcE51bWJlcjogMCxcblx0XHRcdHN0ZXBOYW1lOiAnc2VsZWN0UHJvamVjdCdcblx0XHR9LFxuXHRcdHtcblx0XHRcdHN0ZXBOdW1iZXI6IDEsXG5cdFx0XHRzdGVwTmFtZTogJ3NlbGVjdFByb2plY3QnXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRzdGVwTnVtYmVyOiAyLFxuXHRcdFx0c3RlcE5hbWU6ICdzZWxlY3RQcm9qZWN0J1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0c3RlcE51bWJlcjogMyxcblx0XHRcdHN0ZXBOYW1lOiAnc2VsZWN0UHJvamVjdCdcblx0XHR9XG5cdF0pO1xuXG5cdC8vICQoZG9jdW1lbnQpLm9uKCdzd2lwZScsIGZ1bmN0aW9uKCkge1xuXHQvLyBcdGFsZXJ0KCdzd2lwZScpXG5cdC8vIH0pO1xuXG5cdHN0ZXBzLmNoYW5nZVN0ZXAgPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0c3RlcHMuY3VycmVudFN0ZXAoaXRlbS5zdGVwTnVtYmVyKTtcblx0XHRhcHAubXlWaWV3TW9kZWwucmF0ZVByb2plY3QuaW5pdFByb2plY3QoKTtcblx0fVxuXG5cdHN0ZXBzLm5leHRTdGVwID0gZnVuY3Rpb24oZGlyZWN0aW9uKSB7XG5cdFx0c3RlcHMuY3VycmVudFN0ZXAoc3RlcHMuY3VycmVudFN0ZXAoKSArIGRpcmVjdGlvbik7XG5cdFx0YXBwLm15Vmlld01vZGVsLnJhdGVQcm9qZWN0LmluaXRQcm9qZWN0KCk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTdGVwczsiXX0=
