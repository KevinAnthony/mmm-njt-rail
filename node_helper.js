const nodeHelper = require("node_helper");
const njtr = require("./classes/njtr_fetcher");

module.exports = nodeHelper.create({
  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "NJT_INIT":
        console.log(payload)
        var fetcher = new njtr(payload.station, payload.refresh, payload.max)
        fetcher.onReceive((schedual) => {
          this.sendSocketNotification("NJT_REFRESH", schedual);
        });
        fetcher.start()
        break
    }
  },
})
