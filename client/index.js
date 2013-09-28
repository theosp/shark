Session.set("is_viewing_game", false);

Meteor.subscribe("userData");

var open_tables_sub, running_tables_sub;
Deps.autorun(function () {
    // unsubscribe form openTables/runningTables when viewing game
    if (!Session.get("is_viewing_game")) {
        open_tables_sub = Meteor.subscribe("openTables");
        running_tables_sub = Meteor.subscribe("runningTables");
    } else {
        open_tables_sub.stop();
        running_tables_sub.stop();
    }
});

var getPlayerStructure = function () {
    var u = Meteor.user();

    return {id: u._id, fb_id: u.services.facebook.id, name: u.profile.name};
};

// navigator
Template.navigation.events({
	"click .logo": function(e, tmpl){
        Session.set("is_viewing_game", false);
	}
});

// tables
Template.tables.helpers({
    can_create_table: function () {
        return Meteor.user && Tables.find({state: "open", "players.id": Meteor.userId()}).count() === 0;
    },

    config: function () {
        return {min_table_size: CONFIG.min_table_size, max_table_size: CONFIG.max_table_size};
    }
});

Template.tables.rendered = function () {
    $(window).resize();
};

Template.tables.events({
	"click .create": function(e, tmpl){
        Tables.insert({state: "open", size: parseInt($(tmpl.find("input")).val()), players: [getPlayerStructure()]});
	}
});

// open_tables
Template.open_tables.helpers({
    tables: function () {
        return Tables.find({state: "open"});
    },

    chairs: function () {
        var chairs = this.players.slice();

        for (var i = 0; i < (this.size - this.players.length); i++) {
            chairs.push(null);
        }

        return chairs;
    },

    myself: function () {
        return this.id === Meteor.userId() ? "myself" : "";
    },

    sitting: function () {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].id === Meteor.userId()) {
                return true;
            }
        }

        return false;
    }
});

Template.open_tables.rendered = function () {
    $(".logged-in .open_tables .table:not(.sitting) .empty-chair").tooltip({title: "Click to join!"})
    $(".open_tables .myself").tooltip({title: "Click to leave"})
};


Template.open_tables.events({
    "click .myself": function (e) {
        var $t = $(e.target);
        var table_id = $t.parents(".table").attr("table-id");

        Tables.update({_id: table_id}, {$pull: {players: {id: Meteor.userId()}}});
    },

    "click .empty-chair": function (e) {
        var $t = $(e.target);
        var table_id = $t.parents(".table").attr("table-id");

        if ($t.parents(".logged-in").length > 0 && $t.parents(".table:not(.sitting)").length > 0) {
            $(".open-tables .myself").click();

            Tables.update({_id: table_id}, {$push: {players: getPlayerStructure()}});
        }
    }
});

// running tables
Template.running_tables.helpers({
    tables: function () {
        return Tables.find({state: "running"});
    },

    myself: function () {
        return this.id === Meteor.userId() ? "myself" : "";
    },

    sitting: function () {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].id === Meteor.userId()) {
                return true;
            }
        }

        return false;
    }
});

// user_loggedout
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

// user_loggedin
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

// view
Template.view.is_viewing_game = function () {
    return Session.get("is_viewing_game");
};

// game
Template.game.helpers({
    map: "003333300000000000020202000000000000010100100000000000000000000000000000000000000000000000000000000000000000000000000000",
    prices: [1, 0, 0, 0],
    stocks: [0, 2, 0, 0],
    markers: [1, 0, 0, 0],
});
