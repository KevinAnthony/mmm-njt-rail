const nodeHelper = require("node_helper");
const njtr = require("./classes/njtr_fetcher");

module.exports = nodeHelper.create({
    start: function() {

      },
      socketNotificationReceived: function(notification, payload) {
        switch(notification) {
          case "INIT_NJT":
            console.log(payload)
                var fetcher = new njtr(payload.station, 10, payload.max)
                fetcher.onReceive((schedual) => {
                  this.sendSocketNotification("REFRESH", schedual);
                });
                fetcher.start()
            break
        }
      },
    })
    