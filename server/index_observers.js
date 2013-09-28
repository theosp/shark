var winston = Winston;

Tables.find({"state": "open"}).observe({
    changed: function (newDoc) {
        // remove empty tables
        if (newDoc.players.length === 0) {
            Tables.remove({_id: newDoc._id});
        }

        // change full tables status to running
        if (newDoc.players.length === newDoc.size) {
            Tables.update({_id: newDoc._id}, {$set: {state: "running"}});
        }
    }
});
