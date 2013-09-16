var winston = Winston;

Meteor.publish('userData', function () {
    winston.info("userData subscribed");

    return Meteor.users.find({_id: this.userId}, {fields: {"services.facebook.id": 1}});
});

Meteor.publish("openTables", function () {
    winston.info("openTables subscribed");

    return Tables.find({state: "open"});
});

Meteor.publish("runningTables", function () {
    winston.info("runningTables subscribed");

    return Tables.find({state: "running"});
});
