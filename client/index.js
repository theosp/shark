Meteor.subscribe("userData");
Meteor.subscribe("openTables");
Meteor.subscribe("runningTables");

Template.new_table.events({
	"click .btn": function(e, tmpl){
        Tables.insert({state: "open", owner: Meteor.userId(), players: []});
        console.log(this.userId);
        
	}
});

Template.open_tables.tables = function () {
    return Tables.find({state: "open"});
};

Template.open_tables.is_mine = function () {
    return this.owner === Meteor.userId();
};

Template.user_loggedout.events({
	"click #login": function(e, tmpl){
		Meteor.loginWithFacebook({
            requestPermissions: ['email']
		}, function (err) {
			if(err) {
				//error handling
			} else {
				//show an alert
				//alert('logged in');
			}
		});
	}
});

Template.user_loggedin.events({
	"click #logout": function(e, tmpl) {
		Meteor.logout(function(err) {
			if(err) {
				//sow err message
			} else {
				//show alert that says logged out
				//alert('logged out');
			}
		});
	}
});

Template.view.is_viewing_game = function () {
    return Session.get("is_viewing_game");
};

Template.game.helpers({
    map: "003333300000000000020202000000000000010100100000000000000000000000000000000000000000000000000000000000000000000000000000",
    prices: [1, 0, 0, 0],
    stocks: [0, 2, 0, 0],
    markers: [1, 0, 0, 0],
});
