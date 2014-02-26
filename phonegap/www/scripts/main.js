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
},{"./app.js":1,"./auth.js":2,"./header.js":4,"./rate-project.js":5,"./select-project.js":6,"./steps.js":7}],4:[function(require,module,exports){
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

	rateProject.dates = ko.observableArray([
		{ 
			date: ko.observable(moment(rateProject.today).format('MMM D'))
		},
		{ 
			date: ko.observable(moment(rateProject.today).add('days', 7).format('MMM D'))
		},
		{ 
			date: ko.observable(moment(rateProject.today).add('days', 14).format('MMM D'))
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
		console.log(project)
		return project;
	});


	rateProject.dragHandle = function(item, event) {
		$('#rate-project .handle').addClass('dragging');
		rateProject.registerMouseY(event.originalEvent.touches[0].clientY);

		$(document).on('touchmove', function(event) {
			var diff = rateProject.registerMouseY() - event.originalEvent.touches[0].clientY;
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

		$(document).one('touchend', function(event) {
			var endingPercentage = rateProject.workingPercentage() * 1.8;
			rateProject.registerStartPercentage(180 + endingPercentage);
			$('#rate-project .handle').removeClass('dragging');
			$(document).off('touchmove');
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
},{}],6:[function(require,module,exports){
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
			name: 'test 2',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 3 with a much longer name',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 4',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 5',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 6',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 7',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 8',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 9',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 10',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 11',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 12',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 13',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 14',
			active: ko.observable(false),
			type: 'client',
			percentage: ko.observableArray([{ value: ko.observable(0) }, { value: ko.observable(0) }, { value: ko.observable(0) }])
		},
		{
			name: 'test 15',
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
},{}],7:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvYXV0aC5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvZmFrZV80YmQ1OWZjNi5qcyIsIi9Vc2Vycy9hbWFydGxhZ2UvYWxsb2NhdGUvYXBwL3NjcmlwdHMvaGVhZGVyLmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9yYXRlLXByb2plY3QuanMiLCIvVXNlcnMvYW1hcnRsYWdlL2FsbG9jYXRlL2FwcC9zY3JpcHRzL3NlbGVjdC1wcm9qZWN0LmpzIiwiL1VzZXJzL2FtYXJ0bGFnZS9hbGxvY2F0ZS9hcHAvc2NyaXB0cy9zdGVwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIHNjcmlwdHMvYXBwLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEFwcCgpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdC8vIGluaXRpYWxpemUga25vY2tvdXRcblx0c2VsZi5teVZpZXdNb2RlbCA9IHt9O1xuXG5cdHNlbGYubXlWaWV3TW9kZWwuY3VycmVudFVzZXIgPSBrby5vYnNlcnZhYmxlKG51bGwpO1xuXG5cdHNlbGYuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZXJlYWR5Jywgc2VsZi5vbkRldmljZVJlYWR5LCBmYWxzZSk7XG5cdH1cblxuXHRzZWxmLm9uRGV2aWNlUmVhZHkgPSBmdW5jdGlvbigpIHtcblx0XHRrby5hcHBseUJpbmRpbmdzKHNlbGYubXlWaWV3TW9kZWwpO1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuLmhpZGUoKTtcblx0XHR9LCAyMDAwKTtcblx0XHRcblx0fVxuXG5cdHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDsiLCIvKipcbiAqIHNjcmlwdHMvYXV0aC5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBBdXRoKGFwcCkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dmFyIGF1dGggPSBhcHAubXlWaWV3TW9kZWwuYXV0aCA9IHt9O1xuXG5cdGF1dGguY3VycmVudFVzZXIgPSBrby5vYnNlcnZhYmxlKCk7XG5cdGF1dGguZXJyb3JNZXNzYWdlID0ga28ub2JzZXJ2YWJsZSgnJyk7XG5cdGF1dGguc2lnblVwTW9kZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuXG5cdHZhciBjdXJyZW50VXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuXHRpZiAoY3VycmVudFVzZXIpIHtcblx0XHRhdXRoLmN1cnJlbnRVc2VyKGN1cnJlbnRVc2VyKTtcblx0fVxuXG5cdGF1dGgucmVzZXRFcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdGF1dGguZXJyb3JNZXNzYWdlKCcnKTtcblx0fVxuXG5cdGF1dGguc2lnbkluVXAgPSBmdW5jdGlvbihmb3JtRWxlbWVudCkge1xuXHRcdC8vIGtvLnBvc3Rib3gucHVibGlzaCgnaXNMb2FkaW5nJywgdHJ1ZSk7XG5cdFx0YXV0aC5yZXNldEVycm9yKCk7XG5cblx0XHR2YXIgdXNlcm5hbWUgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfdXNlcm5hbWVdJykudmFsKCk7XG5cdFx0dmFyIHBhc3N3b3JkID0gJChmb3JtRWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1hdXRoX3Bhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0aWYgKGF1dGguc2lnblVwTW9kZSgpKSB7XG5cdFx0XHR2YXIgZW1haWwgPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfZW1haWxdJykudmFsKCkudG9Mb3dlckNhc2UoKTtcblx0XHRcdHZhciBkaXNwbGF5TmFtZSA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9YXV0aF9kaXNwbGF5TmFtZV0nKS52YWwoKTtcblx0XHRcdHZhciBwYXNzd29yZENvbmZpcm0gPSAkKGZvcm1FbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPWF1dGhfY29uZmlybVBhc3N3b3JkXScpLnZhbCgpO1xuXG5cdFx0XHQvLyB2YWxpZGF0aW9uXG5cdFx0XHRpZiAoZW1haWwubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZW1haWwgYWRkcmVzcy4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZGlzcGxheU5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIHlvdXIgZmlyc3QgYW5kIGxhc3QgbmFtZS4nKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodXNlcm5hbWUubGVuZ3RoIDwgMSkge1xuXHRcdFx0XHRhdXRoLmVycm9yTWVzc2FnZSgnUGxlYXNlIGVudGVyIGEgdXNlcm5hbWUuJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHBhc3N3b3JkLmxlbmd0aCA8IDEgfHwgcGFzc3dvcmRDb25maXJtIDwgMSB8fCBwYXNzd29yZCAhPSBwYXNzd29yZENvbmZpcm0pIHtcblx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoJ1BsZWFzZSBlbnRlciBhbmQgY29uZmlybSBhIHBhc3N3b3JkLicpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHZhciB1c2VyID0gbmV3IFBhcnNlLlVzZXIoKTtcblx0XHRcdHZhciBzY3J1YmJlZFVzZXJuYW1lID0gdXNlcm5hbWUucmVwbGFjZSgvXFxzKy9nLFwiXCIpOyAvL3JlbW92ZSB3aGl0ZSBzcGFjZVxuXHRcdFx0c2NydWJiZWRVc2VybmFtZSA9IHNjcnViYmVkVXNlcm5hbWUudG9Mb3dlckNhc2UoKTtcblxuXHRcdFx0dXNlci5zZXQoJ3VzZXJuYW1lJywgc2NydWJiZWRVc2VybmFtZSk7XG5cdFx0XHR1c2VyLnNldCgncGFzc3dvcmQnLCBwYXNzd29yZCk7XG5cdFx0XHR1c2VyLnNldCgnZW1haWwnLCBlbWFpbCk7XG5cdFx0XHR1c2VyLnNldCgnZGlzcGxheU5hbWUnLCBkaXNwbGF5TmFtZSk7XG5cblx0XHRcdC8vIG90aGVyIGZpZWxkcyBjYW4gYmUgc2V0IGp1c3QgbGlrZSB3aXRoIFBhcnNlLk9iamVjdFxuXHRcdFx0Ly8gdXNlci5zZXQoXCJwaG9uZVwiLCBcIjQxNS0zOTItMDIwMlwiKTtcblxuXHRcdFx0dXNlci5zaWduVXAobnVsbCwge1xuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdFx0YXV0aC5jdXJyZW50VXNlcih1c2VyKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0UGFyc2UuVXNlci5sb2dJbih1c2VybmFtZSwgcGFzc3dvcmQsIHtcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHRcdGF1dGguY3VycmVudFVzZXIodXNlcik7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuXHRcdFx0XHRcdC8vIFRoZSBsb2dpbiBmYWlsZWQuIENoZWNrIGVycm9yIHRvIHNlZSB3aHkuXG5cdFx0XHRcdFx0YXV0aC5lcnJvck1lc3NhZ2UoYXV0aC5zYW5pdGl6ZUVycm9ycyhlcnJvcikpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0YXV0aC5sb2dvdXQgPSBmdW5jdGlvbigpIHtcblx0XHRQYXJzZS5Vc2VyLmxvZ091dCgpO1xuXHRcdGF1dGguY3VycmVudFVzZXIobnVsbCk7XG5cdH1cblxuXHRhdXRoLnNob3dTaWduVXAgPSBmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZygnYXNkZicpXG5cdFx0YXV0aC5lcnJvck1lc3NhZ2UoJycpO1xuXHRcdGlmIChhdXRoLnNpZ25VcE1vZGUoKSkge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXV0aC5zaWduVXBNb2RlKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdGF1dGguc2FuaXRpemVFcnJvcnMgPSBmdW5jdGlvbihlcnJvcikge1xuXHRcdHN3aXRjaChlcnJvci5jb2RlKVxuXHRcdHtcblx0XHRcdGNhc2UgMTAxOlxuXHRcdFx0XHRyZXR1cm4gJ1BsZWFzZSBlbnRlciBhIHZhbGlkIHVzZXJuYW1lIGFuZCBwYXNzd29yZC4nO1xuXHRcdFx0Y2FzZSAxMjQ6XG5cdFx0XHRcdHJldHVybiAnT29wcyEgV2UgbWVzc2VkIHVwLiBQbGVhc2UgdHJ5IGFnYWluLic7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gZXJyb3IubWVzc2FnZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGVycm9yLm1lc3NhZ2Uuc2xpY2UoMSkgKyAnLic7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0aDsiLCIvKipcbiAqIHNjcmlwdHMvbWFpbi5qc1xuICpcbiAqIFRoaXMgaXMgdGhlIHN0YXJ0aW5nIHBvaW50IGZvciB5b3VyIGFwcGxpY2F0aW9uLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXBwID0gcmVxdWlyZSgnLi9hcHAuanMnKTtcbnZhciBBdXRoID0gcmVxdWlyZSgnLi9hdXRoLmpzJyk7XG52YXIgU3RlcHMgPSByZXF1aXJlKCcuL3N0ZXBzLmpzJyk7XG52YXIgU2VsZWN0UHJvamVjdCA9IHJlcXVpcmUoJy4vc2VsZWN0LXByb2plY3QuanMnKTtcbnZhciBIZWFkZXIgPSByZXF1aXJlKCcuL2hlYWRlci5qcycpO1xudmFyIFJhdGVQcm9qZWN0ID0gcmVxdWlyZSgnLi9yYXRlLXByb2plY3QuanMnKTtcblxuLy8gaW5pdGlhbGl6ZSBwYXJzZVxuUGFyc2UuaW5pdGlhbGl6ZShcIkprWU5mUEJ3MmFQZ2NjN1BlVEdITUFVMlhLdmp6ZXFWSWt5Q2xWdW9cIiwgXCI0NU9NVTNaUzNvNWMxNjhsUXhhMGlseFF1NEZkTVZIVDFOVlRrT1JsXCIpO1xuXG4vLyBpbml0aWFsaXplIHR5cGVraXRcbnRyeXtUeXBla2l0LmxvYWQoKTt9Y2F0Y2goZSl7fVxuXG52YXIgYXBwID0gbmV3IEFwcCgpO1xudmFyIGF1dGggPSBuZXcgQXV0aChhcHApO1xudmFyIHN0ZXBzID0gbmV3IFN0ZXBzKGFwcCk7XG52YXIgc2VsZWN0UHJvamVjdCA9IG5ldyBTZWxlY3RQcm9qZWN0KGFwcCk7XG52YXIgaGVhZGVyID0gbmV3IEhlYWRlcihhcHApO1xudmFyIHJhdGVQcm9qZWN0ID0gbmV3IFJhdGVQcm9qZWN0KGFwcCk7XG5cblxuLy8gQ3VzdG9tIGtub2Nrb3V0IGV4dG5lZGVyc1xuXG4vLyBIZXJlJ3MgYSBjdXN0b20gS25vY2tvdXQgYmluZGluZyB0aGF0IG1ha2VzIGVsZW1lbnRzIHNob3duL2hpZGRlbiB2aWEgalF1ZXJ5J3MgZmFkZUluKCkvZmFkZU91dCgpIG1ldGhvZHNcbi8vIENvdWxkIGJlIHN0b3JlZCBpbiBhIHNlcGFyYXRlIHV0aWxpdHkgbGlicmFyeVxua28uYmluZGluZ0hhbmRsZXJzLmZhZGVWaXNpYmxlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gSW5pdGlhbGx5IHNldCB0aGUgZWxlbWVudCB0byBiZSBpbnN0YW50bHkgdmlzaWJsZS9oaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZVxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICQoZWxlbWVudCkudG9nZ2xlKGtvLnVud3JhcCh2YWx1ZSkpOyAvLyBVc2UgXCJ1bndyYXBPYnNlcnZhYmxlXCIgc28gd2UgY2FuIGhhbmRsZSB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBvYnNlcnZhYmxlXG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gV2hlbmV2ZXIgdGhlIHZhbHVlIHN1YnNlcXVlbnRseSBjaGFuZ2VzLCBzbG93bHkgZmFkZSB0aGUgZWxlbWVudCBpbiBvciBvdXRcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICBrby51bndyYXAodmFsdWUpID8gJChlbGVtZW50KS5mYWRlSW4oKSA6ICQoZWxlbWVudCkuZmFkZU91dCgpO1xuICAgIH1cbn1cblxuYXBwLmluaXRpYWxpemUoKTsiLCIvKipcbiAqIHNjcmlwdHMvaGVhZGVyLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEhlYWRlcihhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBoZWFkZXIgPSBhcHAubXlWaWV3TW9kZWwuaGVhZGVyID0ge307XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyOyIsIi8qKlxuICogc2NyaXB0cy9yYXRlLXByb2plY3QuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUmF0ZVByb2plY3QoYXBwKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHR2YXIgcmF0ZVByb2plY3QgPSBhcHAubXlWaWV3TW9kZWwucmF0ZVByb2plY3QgPSB7fTtcblxuXHRyYXRlUHJvamVjdC5hY3RpdmVJbmRleCA9IGtvLm9ic2VydmFibGUoLTEpO1xuXHRyYXRlUHJvamVjdC5hY3RpdmVEb21JbmRleCA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHJhdGVQcm9qZWN0LnByb2plY3REb21MZW5ndGggPSBrby5vYnNlcnZhYmxlKDApO1xuXHRyYXRlUHJvamVjdC5yZWdpc3Rlck1vdXNlWSA9IGtvLm9ic2VydmFibGUoKTtcblx0cmF0ZVByb2plY3QucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UgPSBrby5vYnNlcnZhYmxlKDE4MCk7XG5cdHJhdGVQcm9qZWN0LndvcmtpbmdQZXJjZW50YWdlID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0cmF0ZVByb2plY3Qud29ya2luZ0NvbHVtbiA9IGtvLm9ic2VydmFibGUoMCk7XG5cdHJhdGVQcm9qZWN0LnRvZGF5ID0gbW9tZW50KG5ldyBEYXRlKCkpLnN0YXJ0T2YoJ2lzb3dlZWsnKTtcblxuXHRyYXRlUHJvamVjdC5kYXRlcyA9IGtvLm9ic2VydmFibGVBcnJheShbXG5cdFx0eyBcblx0XHRcdGRhdGU6IGtvLm9ic2VydmFibGUobW9tZW50KHJhdGVQcm9qZWN0LnRvZGF5KS5mb3JtYXQoJ01NTSBEJykpXG5cdFx0fSxcblx0XHR7IFxuXHRcdFx0ZGF0ZToga28ub2JzZXJ2YWJsZShtb21lbnQocmF0ZVByb2plY3QudG9kYXkpLmFkZCgnZGF5cycsIDcpLmZvcm1hdCgnTU1NIEQnKSlcblx0XHR9LFxuXHRcdHsgXG5cdFx0XHRkYXRlOiBrby5vYnNlcnZhYmxlKG1vbWVudChyYXRlUHJvamVjdC50b2RheSkuYWRkKCdkYXlzJywgMTQpLmZvcm1hdCgnTU1NIEQnKSlcblx0XHR9XG5cdF0pO1xuXG5cdHJhdGVQcm9qZWN0LmRpYWxTZXR0aW5ncyA9IGtvLm9ic2VydmFibGUoe1xuXHRcdGludGVydmFsOiA1LCAvL3BlcmNlbnRcblx0XHR2YWx1ZTogJyUnXG5cdH0pO1xuXG5cdHJhdGVQcm9qZWN0LmZpcnN0SW5kZXggPSBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgcHJvamVjdHMgPSBhcHAubXlWaWV3TW9kZWwuc2VsZWN0UHJvamVjdC5hbGxQcm9qZWN0cygpO1xuXHRcdHZhciBmaXJzdFByb2plY3QgPSBfLmZpbmQocHJvamVjdHMsIGZ1bmN0aW9uKG9iail7XG5cdFx0XHRyZXR1cm4gb2JqLmFjdGl2ZSgpID09IHRydWU7XG5cdFx0fSk7XG5cdFx0dmFyIGZpcnN0SW5kZXggPSBfLmluZGV4T2YocHJvamVjdHMsIGZpcnN0UHJvamVjdCk7XG5cdFx0cmV0dXJuIGZpcnN0SW5kZXg7XG5cdH0pO1xuXG5cdHJhdGVQcm9qZWN0LmFjdGl2ZVByb2plY3QgPSBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcblx0XHR2YXIgdXNlSW5kZXggPSBhcHAubXlWaWV3TW9kZWwucmF0ZVByb2plY3QuYWN0aXZlSW5kZXgoKVxuXHRcdGlmICh1c2VJbmRleCA9PSAtMSkge1xuXHRcdFx0dXNlSW5kZXggPSBhcHAubXlWaWV3TW9kZWwucmF0ZVByb2plY3QuZmlyc3RJbmRleCgpO1xuXHRcdH1cblx0XHR2YXIgcHJvamVjdCA9IGFwcC5teVZpZXdNb2RlbC5zZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzKClbdXNlSW5kZXhdO1xuXHRcdC8vIGlmIChwcm9qZWN0LnR5cGUgPT0gJ2ludGVybmFsJykge1xuXG5cdFx0Ly8gfVxuXHRcdGNvbnNvbGUubG9nKHByb2plY3QpXG5cdFx0cmV0dXJuIHByb2plY3Q7XG5cdH0pO1xuXG5cblx0cmF0ZVByb2plY3QuZHJhZ0hhbmRsZSA9IGZ1bmN0aW9uKGl0ZW0sIGV2ZW50KSB7XG5cdFx0JCgnI3JhdGUtcHJvamVjdCAuaGFuZGxlJykuYWRkQ2xhc3MoJ2RyYWdnaW5nJyk7XG5cdFx0cmF0ZVByb2plY3QucmVnaXN0ZXJNb3VzZVkoZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLmNsaWVudFkpO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ3RvdWNobW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR2YXIgZGlmZiA9IHJhdGVQcm9qZWN0LnJlZ2lzdGVyTW91c2VZKCkgLSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WTtcblx0XHRcdHZhciBkZWdyZWVzID0gcmF0ZVByb2plY3QucmVnaXN0ZXJTdGFydFBlcmNlbnRhZ2UoKSArIChkaWZmIC8gMS4yNSk7XG5cdFx0XHR2YXIgcGVyY2VudGFnZSA9IE1hdGguZmxvb3IoKChkZWdyZWVzIC0gMTgwKSAvIDEuOCkgLyByYXRlUHJvamVjdC5kaWFsU2V0dGluZ3MoKS5pbnRlcnZhbCkgKiByYXRlUHJvamVjdC5kaWFsU2V0dGluZ3MoKS5pbnRlcnZhbDtcblx0XHRcdGlmIChwZXJjZW50YWdlIDwgMSkge1xuXHRcdFx0XHRwZXJjZW50YWdlID0gMDtcblx0XHRcdFx0ZGVncmVlcyA9IDE4MDtcblx0XHRcdH1cblx0XHRcdGlmIChwZXJjZW50YWdlID4gOTkpIHtcblx0XHRcdFx0cGVyY2VudGFnZSA9IDEwMDtcblx0XHRcdFx0ZGVncmVlcyA9IDM2MDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmF0ZVByb2plY3Qud29ya2luZ1BlcmNlbnRhZ2UocGVyY2VudGFnZSk7XG5cdFx0XHRyYXRlUHJvamVjdC5hY3RpdmVQcm9qZWN0KCkucGVyY2VudGFnZSgpW3JhdGVQcm9qZWN0LndvcmtpbmdDb2x1bW4oKV0udmFsdWUocGVyY2VudGFnZSk7XG5cdFx0XHRyYXRlUHJvamVjdC5yb3RhdGVEaWFsKGRlZ3JlZXMpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub25lKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR2YXIgZW5kaW5nUGVyY2VudGFnZSA9IHJhdGVQcm9qZWN0LndvcmtpbmdQZXJjZW50YWdlKCkgKiAxLjg7XG5cdFx0XHRyYXRlUHJvamVjdC5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZSgxODAgKyBlbmRpbmdQZXJjZW50YWdlKTtcblx0XHRcdCQoJyNyYXRlLXByb2plY3QgLmhhbmRsZScpLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCd0b3VjaG1vdmUnKTtcblx0XHR9KTtcblxuXHR9XG5cblx0cmF0ZVByb2plY3Qucm90YXRlRGlhbCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcblx0XHQkKCcjcmF0ZS1wcm9qZWN0IC5kaWFsJykuY3NzKHsnLXdlYmtpdC10cmFuc2Zvcm0nIDogJ3JvdGF0ZSgnKyBkZWdyZWVzICsnZGVnKScsXG5cdFx0XHQnLW1vei10cmFuc2Zvcm0nIDogJ3JvdGF0ZSgnKyBkZWdyZWVzICsnZGVnKScsXG5cdFx0XHQnLW1zLXRyYW5zZm9ybScgOiAncm90YXRlKCcrIGRlZ3JlZXMgKydkZWcpJyxcblx0XHRcdCd0cmFuc2Zvcm0nIDogJ3JvdGF0ZSgnKyBkZWdyZWVzICsnZGVnKSd9KTtcblx0fVxuXG5cdHJhdGVQcm9qZWN0LnNldENvbHVtbiA9IGZ1bmN0aW9uKGNvbHVtbikge1xuXHRcdHJhdGVQcm9qZWN0LndvcmtpbmdDb2x1bW4oY29sdW1uKTtcblx0XHR2YXIgcGVyY2VudGFnZSA9IHJhdGVQcm9qZWN0LmFjdGl2ZVByb2plY3QoKS5wZXJjZW50YWdlKClbcmF0ZVByb2plY3Qud29ya2luZ0NvbHVtbigpXS52YWx1ZSgpO1xuXG5cdFx0cmF0ZVByb2plY3Qud29ya2luZ1BlcmNlbnRhZ2UocGVyY2VudGFnZSk7XG5cdFx0dmFyIGRlZ3JlZXMgPSBNYXRoLmZsb29yKChwZXJjZW50YWdlICogMS44KSAtIDE4MCk7XG5cblx0XHRyYXRlUHJvamVjdC5yZWdpc3RlclN0YXJ0UGVyY2VudGFnZSgocGVyY2VudGFnZSAqIDEuOCkgKyAxODApO1xuXHRcdHJhdGVQcm9qZWN0LnJvdGF0ZURpYWwoZGVncmVlcyk7XG5cdH1cblxuXHRyYXRlUHJvamVjdC5nb1RvUHJvamVjdCA9IGZ1bmN0aW9uKGluZGV4LCBpdGVtLCBldmVudCkge1xuXHRcdHJhdGVQcm9qZWN0LmFjdGl2ZUluZGV4KGluZGV4KTtcblx0XHR2YXIgdG9wID0gJChldmVudC50YXJnZXQpLnBvc2l0aW9uKCkudG9wO1xuXHRcdHZhciBkb21JbmRleCA9IF8uaW5kZXhPZigkKCcjcmF0ZS1wcm9qZWN0IC51c2VyLXByb2plY3RzJykuY2hpbGRyZW4oKSwgZXZlbnQudGFyZ2V0KTtcblx0XHRpZiAoZG9tSW5kZXggPCAwKSB7XG5cdFx0XHRkb21JbmRleCA9IDA7XG5cdFx0fVxuXHRcdHJhdGVQcm9qZWN0LmFjdGl2ZURvbUluZGV4KGRvbUluZGV4KTtcblx0XHRyYXRlUHJvamVjdC5wcm9qZWN0RG9tTGVuZ3RoKCQoJyNyYXRlLXByb2plY3QgLnVzZXItcHJvamVjdHMnKS5jaGlsZHJlbigpLmxlbmd0aCk7XG5cdFx0JCgnI3JhdGUtcHJvamVjdCAudXNlci1wcm9qZWN0cycpLmFuaW1hdGUoeyBcblx0XHRcdHNjcm9sbFRvcDogZG9tSW5kZXggKiA0NlxuXHRcdH0sIDIwMCk7XG5cdFx0cmF0ZVByb2plY3Quc2V0Q29sdW1uKDApO1xuXHR9XG5cblx0cmF0ZVByb2plY3QuaW5pdFByb2plY3QgPSBmdW5jdGlvbigpIHtcblx0XHRyYXRlUHJvamVjdC5hY3RpdmVEb21JbmRleCgwKTtcblx0XHQkKCcjcmF0ZS1wcm9qZWN0IC51c2VyLXByb2plY3RzJykuY2hpbGRyZW4oKS5maXJzdCgpLnRyaWdnZXIoJ2NsaWNrJyk7XG5cdH1cblxuXHRyYXRlUHJvamVjdC5yZW5kZXJDaGFydCA9IGZ1bmN0aW9uKCkge1xuXG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSYXRlUHJvamVjdDsiLCIvKipcbiAqIHNjcmlwdHMvc2VsZWN0LXByb2plY3QuanNcbiAqXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gU2VsZWN0UHJvamVjdChhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBzZWxlY3RQcm9qZWN0ID0gYXBwLm15Vmlld01vZGVsLnNlbGVjdFByb2plY3QgPSB7fTtcblxuXHRzZWxlY3RQcm9qZWN0LmFsbFByb2plY3RzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtcblx0XHR7XG5cdFx0XHRuYW1lOiAnVmFjYXRpb24vVGltZSBvZmYnLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdpbnRlcm5hbCcsXG5cdFx0XHRpbmNyZW1lbnRzOiB7XG5cdFx0XHRcdHR5cGU6ICdkYXknLFxuXHRcdFx0XHR2YWx1ZTogMC41XG5cdFx0XHR9LFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICd0ZXN0IDInLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdjbGllbnQnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICd0ZXN0IDMgd2l0aCBhIG11Y2ggbG9uZ2VyIG5hbWUnLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdjbGllbnQnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICd0ZXN0IDQnLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdjbGllbnQnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICd0ZXN0IDUnLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdjbGllbnQnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICd0ZXN0IDYnLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdjbGllbnQnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICd0ZXN0IDcnLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdjbGllbnQnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICd0ZXN0IDgnLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdjbGllbnQnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICd0ZXN0IDknLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdjbGllbnQnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICd0ZXN0IDEwJyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAndGVzdCAxMScsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ3Rlc3QgMTInLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdjbGllbnQnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6ICd0ZXN0IDEzJyxcblx0XHRcdGFjdGl2ZToga28ub2JzZXJ2YWJsZShmYWxzZSksXG5cdFx0XHR0eXBlOiAnY2xpZW50Jyxcblx0XHRcdHBlcmNlbnRhZ2U6IGtvLm9ic2VydmFibGVBcnJheShbeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfV0pXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiAndGVzdCAxNCcsXG5cdFx0XHRhY3RpdmU6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuXHRcdFx0dHlwZTogJ2NsaWVudCcsXG5cdFx0XHRwZXJjZW50YWdlOiBrby5vYnNlcnZhYmxlQXJyYXkoW3sgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9LCB7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH1dKVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogJ3Rlc3QgMTUnLFxuXHRcdFx0YWN0aXZlOiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcblx0XHRcdHR5cGU6ICdjbGllbnQnLFxuXHRcdFx0cGVyY2VudGFnZToga28ub2JzZXJ2YWJsZUFycmF5KFt7IHZhbHVlOiBrby5vYnNlcnZhYmxlKDApIH0sIHsgdmFsdWU6IGtvLm9ic2VydmFibGUoMCkgfSwgeyB2YWx1ZToga28ub2JzZXJ2YWJsZSgwKSB9XSlcblx0XHR9XG5cdF0pO1xuXG5cdFx0c2VsZWN0UHJvamVjdC50b2dnbGVQcm9qZWN0ID0gZnVuY3Rpb24oaXRlbSwgZXZlbnQpIHtcblx0XHRpZiAoaXRlbS5hY3RpdmUoKSkge1xuXHRcdFx0aXRlbS5hY3RpdmUoZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpdGVtLmFjdGl2ZSh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RQcm9qZWN0OyIsIi8qKlxuICogc2NyaXB0cy9zdGVwcy5qc1xuICpcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTdGVwcyhhcHApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBzdGVwcyA9IGFwcC5teVZpZXdNb2RlbC5zdGVwcyA9IHt9O1xuXG5cdHN0ZXBzLmN1cnJlbnRTdGVwID0ga28ub2JzZXJ2YWJsZSgwKTtcblx0c3RlcHMuc3RlcHMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuXHRcdHtcblx0XHRcdHN0ZXBOdW1iZXI6IDAsXG5cdFx0XHRzdGVwTmFtZTogJ3NlbGVjdFByb2plY3QnXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRzdGVwTnVtYmVyOiAxLFxuXHRcdFx0c3RlcE5hbWU6ICdzZWxlY3RQcm9qZWN0J1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0c3RlcE51bWJlcjogMixcblx0XHRcdHN0ZXBOYW1lOiAnc2VsZWN0UHJvamVjdCdcblx0XHR9LFxuXHRcdHtcblx0XHRcdHN0ZXBOdW1iZXI6IDMsXG5cdFx0XHRzdGVwTmFtZTogJ3NlbGVjdFByb2plY3QnXG5cdFx0fVxuXHRdKTtcblxuXHRzdGVwcy5jaGFuZ2VTdGVwID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdHN0ZXBzLmN1cnJlbnRTdGVwKGl0ZW0uc3RlcE51bWJlcik7XG5cdFx0YXBwLm15Vmlld01vZGVsLnJhdGVQcm9qZWN0LmluaXRQcm9qZWN0KCk7XG5cdH1cblxuXHRzdGVwcy5uZXh0U3RlcCA9IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuXHRcdHN0ZXBzLmN1cnJlbnRTdGVwKHN0ZXBzLmN1cnJlbnRTdGVwKCkgKyBkaXJlY3Rpb24pO1xuXHRcdGFwcC5teVZpZXdNb2RlbC5yYXRlUHJvamVjdC5pbml0UHJvamVjdCgpO1xuXHR9XG5cblx0cmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RlcHM7Il19
