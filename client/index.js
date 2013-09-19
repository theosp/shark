Session.set("is_viewing_game", false);

Meteor.subscribe("userData");

var open_tables_sub, running_tables_sub;
Deps.autorun(function () {
    if (!Session.get("is_viewing_game")) {
        open_tables_sub = Meteor.subscribe("openTables");
        running_tables_sub = Meteor.subscribe("runningTables");
    } else {
        open_tables_sub.stop();
        running_tables_sub.stop();
    }
});

Template.navigation.events({
	"click .logo": function(e, tmpl){
        Session.set("is_viewing_game", false);
	}
});

Template.tables.rendered = function () {
    $('.size').slider({min: 3, max: 6, value: $('.size').val()});

    $(window).resize();
};

Template.tables.events({
	"click .create": function(e, tmpl){
        window.a = tmpl;
        console.log(tmpl);
        
        var u = Meteor.user();
        Tables.insert({state: "open", /*size: , */players: [{id: u._id, fb_id: u.services.facebook.id, name: u.profile.name}]});
	}
});

Template.open_tables.tables = function () {
    return Tables.find({state: "open"});
};

Template.open_tables.events({
	"click .btn-leave-join": function(e, tmpl){
        return Session.set("is_viewing_game", true);
	}
});

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
