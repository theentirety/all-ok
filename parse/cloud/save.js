Parse.Cloud.define('saveTime', function(request, response) {
	var currentUser = Parse.User.current();
	if (currentUser) {
		var data = request.params.data;
		var date = request.params.date;

		var query = new Parse.Query('Times');
		query.equalTo('date', date);
		query.equalTo('email', currentUser.attributes.email);
        query.first({
            success: function(object) {
                if (object) {
                	object.set('data', data);
					object.save(null, {
						success: function(time) {
							response.success(time);
						},
						error: function(error) {
							response.error(error);
						}
					});
                } else {
					var Times = Parse.Object.extend("Times");
					var time = new Times();

			        time.set('user', {
			            __type: 'Pointer',
			            className: '_User',
			            objectId: currentUser.id
			        });
			        time.set('email', currentUser.attributes.email);
			        time.set('data', data);
			        time.set('date', date);

					time.save(null, {
						success: function(time) {
							response.success(time);
						},
						error: function(error) {
							response.error(error);
						}
					});
				}
			},
			error: function(error) {
				response.error(error);
			}
		});


	} else {
		response.error('Not logged in.');
	}
});