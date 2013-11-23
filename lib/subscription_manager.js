SubscriptionManager = function (subscription_name) {
    this.name = subscription_name;
    this.subscription = null;
};

_.extend(SubscriptionManager.prototype, {
    subscribe: function () {
        var self = this;

        if (self.subscription !== null) {
            self.subscription.stop();
        }

        var args = Array.prototype.slice.apply(arguments);
        
        args.unshift(self.name);
        console.log(args);

        self.subscription = Meteor.subscribe.apply(self, args);
    },

    stop: function () {
        var self = this;

        if (self.subscription !== null) {
            self.subscription.stop();

            self.subscription = null;
        }
    }
});

