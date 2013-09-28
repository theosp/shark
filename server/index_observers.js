var winston = Winston;

map_init_val = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

Tables.find({"state": "open"}).observe({
    changed: function (newDoc) {
        // remove empty tables
        if (newDoc.players.length === 0) {
            Tables.remove({_id: newDoc._id});
        }

        // change full tables status to running
        if (newDoc.players.length === newDoc.size) {
            var players = newDoc.players;

            _.each(players, function (p) {
                p.stock_position = [0, 0, 0, 0];
                p.cash = 0;
            });

            // shuffle players order
            players = _.shuffle(players);
            
            // phases:
            // 0: buy/sell pre roll
            // 1: roll and position
            // 2: liquidation
            // 3: buy/sell
            Tables.update({_id: newDoc._id}, {$set: {
                state: "running",
                map: map_init_val,
                prices: [0, 0, 0, 0],
                players: players,
                turn: {
                    current_player: 0,
                    commit: false,
                    phase: 0,
                    transaction: [0, 0, 0, 0],
                    buy_limit: 5
                }
            }});
        }
    }
});
