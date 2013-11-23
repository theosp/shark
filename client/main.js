var user_data_sub = new SubscriptionManager("userData"),
    open_tables_sub = new SubscriptionManager("openTables"),
    running_tables_sub = new SubscriptionManager("runningTables"),
    game_sub = new SubscriptionManager("game");

user_data_sub.subscribe();

Deps.autorun(function () {
    // unsubscribe form openTables/runningTables when viewing game
    if (Session.get("table") === false) {
        open_tables_sub.subscribe();
        running_tables_sub.subscribe();
        game_sub.stop();
    } else {
        open_tables_sub.stop();
        running_tables_sub.stop();
        game_sub.subscribe(Session.get("table"));
    }
});

var open_tables_observer;
Deps.autorun(function () {
    // observe the tables i'm sitting on as long as i'm not watching a game
    if (!Session.get("table")) {
        open_tables_observer = Tables.find({"players.id": Meteor.userId()}).observeChanges({
            changed: function (id, fields) {
                if (_.has(fields, "state") && fields.state === "running") {
                    Session.set("table", id);
                }
            }
        });
    } else {
        if (typeof open_tables_observer !== 'undefined') {
            open_tables_observer.stop();
        }
    }
});

var getPlayerStructure = function () {
    var u = Meteor.user();

    return {id: u._id, fb_id: u.services.facebook.id, name: u.profile.name};
};

// navigator
Template.navigation.events({
	"click .logo": function(e, tmpl){
        Session.set("table", false);
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
        var table_id = Tables.insert({state: "open", size: parseInt($(tmpl.find("input")).val()), players: [getPlayerStructure()]});
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

Template.running_tables.events({
    "click .view-table": function (e) {
        var $t = $(e.target);
        var table_id = $t.parents(".table").attr("table-id");

        Session.set("table", table_id);
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
Template.view.loading = function () {
    return typeof Session.get("table") === "undefined";
};

Template.view.game_view = function () {
    return Session.get("table") !== false;
};

// game
Template.game.helpers({
    game: function () {
        return Tables.findOne({_id: Session.get("table")});
    },
});

// map
Template.map.helpers({
    cells: function () {
        if (typeof this.map === 'undefined') {
            return "";
        }

        var map_array = this.map.split("");

        var cells = "";
        for (var i = 0; i < map_array.length; i++) {
            var cell = map_array[i];
        
            if (i % 12 === 0) {
                cells += "<tr>";
            }

            cells += '<td class="blue"><div></div></td>';

            if (i % 12 === 11) {
                cells += "</tr>";
            }
        }

        return cells;
    },

    cells2: function () {
        if (typeof this.map === 'undefined') {
            return "";
        }

        var map_array = this.map.split("");

        var sectors = "";
        for (var i = 0; i < map_array.length; i++) {
            var cell = map_array[i];
        
            if (i % 12 === 0) {
                sectors += "<tr>";
            }

            sectors += '<td class="blue"><div></div></td>';

            if (i % 12 === 11) {
                sectors += "</tr>";
            }
        }

        return sectors;
    },

    sectorCells: function (sector) {
        sector = parseInt(sector, 10);

        var cells = "";
        for (var i = 0; i < 12; i++) {
            cells += '<div class="cell" style="width: 10%; height: 10%;"></div>';
        }
        
        return cells;
    },

    fmap: function (sectors_x, sectors_y, cells_x, cells_y) {
        sectors_x = parseInt(sectors_x, 10);
        sectors_y = parseInt(sectors_y, 10);
        cells_x = parseInt(cells_x, 10);
        cells_y = parseInt(cells_y, 10);

        var map = '<div class="fmap">';
        for (var i = 0; i < sectors_y; i++) {
            map += '<div class="sectors-container">';
            for (var j = 0; j < sectors_x; j++) {
                map += '<div class="sector">';
                for (var k = 0; k < cells_y; k++) {
                    map += '<div class="cells-container">';
                    for (var l = 0; l < cells_x; l++) {
                        map += '<div class="cell"><div class="token"></div></div>';
                    }
                    map += '</div>';
                }
                map += '</div>';
            }
            map += '</div>';
        }
        map += '</div>';

        return map;
    }
});

Template.map.rendered = function () {
    $(window).resize();
};
