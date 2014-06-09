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