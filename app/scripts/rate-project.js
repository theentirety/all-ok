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