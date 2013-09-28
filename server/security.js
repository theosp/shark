var winston = Winston;

var userSittingInOpenTable = function (userId) {
    return Tables.find({"players.id": userId, state: "open"}).count() > 0;
};

Tables.allow({
    insert: function (userId, doc) {
        winston.info("An attempt to open a new table", userId, JSON.stringify(doc));

        check(doc, {
            _id: Match.Any,
            size: Match.Where(function (x) {
                check(x, Number);

                return x >= CONFIG.min_table_size && x <= CONFIG.max_table_size;
            }),
            state: Match.Where(function (x) {
                check(x, String);

                return x === "open";
            }),
            players: [Match.ObjectIncluding({
                id: String,
                fb_id: String,
                name: String
            })]
        });

        // allow only one open table per user
        if (userSittingInOpenTable(userId) === true) {
            winston.info("User " + userId + " attempted openning table whilst he was already sitting in another open table");

            return false;
        }

        winston.info("A new table opened");

        return true;
    },

    update: function (userId, doc, fieldNames, modifier) {
        winston.info("An attempt to update table", userId, JSON.stringify(doc), fieldNames, JSON.stringify(modifier));

        // allow user to remove himself from a table he is sitting on, if it
        // is open
        if (doc.state === "open" &&
                fieldNames.length === 1 && fieldNames[0] === "players" &&
                _.has(modifier, "$pull") && _.has(modifier.$pull, "players") && _.has(modifier.$pull.players, "id") &&
                modifier.$pull.players.id === Meteor.userId()) {
            winston.info("A user removed himself from an open table he was sitting on");

            return true;
        }

        // allow user to add himself to a table he is not sitting on, if it 
        // is open and there is still place in it and he is not sitting in
        // other open tables
        if (doc.state === "open" &&
                doc.size > doc.players.length && 
                fieldNames.length === 1 && fieldNames[0] === "players" &&
                _.has(modifier, "$push") && _.has(modifier.$push, "players") && _.has(modifier.$push.players, "id") &&
                modifier.$push.players.id === Meteor.userId() && 
                userSittingInOpenTable(userId) === false
        ) {
            winston.info("A user added himself to an open table");

            return true;
        }
    }
})
