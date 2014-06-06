var _ = require('underscore');

// getProjects retrieves the list of projects from the database
Parse.Cloud.define('getProjects', function(request, response) {
	var currentUser = Parse.User.current();
	if (currentUser) {

		var innerQuery = new Parse.Query('Memberships');
		innerQuery.equalTo('group', {
			__type: 'Pointer',
			className: 'Groups',
			objectId: request.params.groupId
		});
		innerQuery.equalTo('user', {
			__type: 'Pointer',
			className: '_User',
			objectId: currentUser.id
		});

		var query = new Parse.Query('Projects');
		query.matchesKeyInQuery('group', 'group', innerQuery);
		query.ascending('company', 'name');
		query.notEqualTo('private', true);

		query.find({
			success: function(projects) {
				var result = {
					groupId: request.params.groupId,
					projects: projects
				};
				response.success(result);
			},
			error: function(error) {
				response.error(error);
			}
		});
	} else {
		response.error('You must be logged in.');
	}
});

// getUniqueCompanyNames retrieves the sorted list of project names from the database
Parse.Cloud.define('getUniqueCompanyNames', function(request, response) {
	var currentUser = Parse.User.current();
	if (currentUser) {
		var query = new Parse.Query('Projects');
		var email = currentUser.attributes.email;
		email = email.substring(email.lastIndexOf('@'));
		query.endsWith('creator', email);
		query.ascending('company');
		query.find({
			success: function(projects) {
				var justNames = [];
				var projectsLength = projects.length;
				for (var i = 0; i < projectsLength; i++) {
					justNames.push(projects[i].attributes.company);
				}
				var uniques = _.uniq(justNames, true);
				response.success(uniques);
			},
			error: function(error) {
				response.error(error);
			}
		});
	} else {
		response.error('You must be logged in with admin permissions to add projects.');
	}
});

// saveProject adds a new project to the database
Parse.Cloud.define('saveProject', function(request, response) {
	var data = request.params;
	if (data.company.length <= 0 || data.project.length <=0) {
		response.error('Please enter a company and project.');
	}
	var currentUser = Parse.User.current();
	if (currentUser) {
		var Projects = Parse.Object.extend("Projects");
		var project = new Projects();

		var email = currentUser.attributes.email;

		project.set("company", data.company);
		project.set("name", data.project);
		project.set("archived", false);
		project.set("creator", email);

		project.save(null, {
			success: function(project) {
				response.success(project);
			},
			error: function(error) {
				response.error(error);
			}
		});
	} else {
		response.error('You must be logged in with admin permissions to add projects.');
	}
});