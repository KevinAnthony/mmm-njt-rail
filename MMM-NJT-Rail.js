/* eslint-disable no-undef,guard-for-in,no-restricted-syntax */
// eslint-disable-next-line no-undef
Module.register("MMM-NJT-Rail", {
  defaults: {
    station: 'NY',
    fadePoint: .25,
    maxShown: 0,
    refreshInterval: 60,
  },
  start: function () {
    Log.log(`Starting module: ${this.name}`);
  },
  getDom: function () {
    let wrapper = document.createElement("div")
    wrapper.className = "BaseWrapper"
    wrapper.id = "wrapper"
    let t = document.createElement("table");
    t.id = "station_table"
    t.className = "normal fa-sm njtr_table"
    t.innerText = "loading..."

    wrapper.append(t)
    return wrapper
  },
  getStyles() {
    return ["default.css", "font-awesome.css"];
  },

  getScripts() {
    return [];
  },

  getTranslations() {
    return false;
  },
  notificationReceived: function (notification, payload, sender) {
    Log.log("Got Notification "+ sender + payload)
    switch (notification) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT_NJT", {
          station: this.config.station,
          max: this.config.maxShown,
          refresh: this.config.refreshInterval * 1000,
        })
        break
    }
  },
  socketNotificationReceived: function (notification, payload) {
    Log.log(notification)
    Log.log(payload)
    switch (notification) {
      case "REFRESH":
        if (this.config.fadePoint < 0) {
          this.config.fadePoint = 0;
        }
        var startingPoint = payload.length * this.config.fadePoint;
        var steps = payload.length - startingPoint;

        var tbl = document.getElementById("station_table")
        tbl.className = "small";
        var tblBody = document.createElement("tbody");
        tblBody.className = "njtr_table"
        if (payload.length === 0) {
          tbl.innerHTML = "No Trains Scheduled"
          tbl.className = "normal fa-sm"
          break;
        }

        payload.forEach(function (train, i) {
          let row = document.createElement("tr")
          row.className = "normal fa-sm njtr_row";

          let timeCell = document.createElement("td");
          timeCell.innerText = train.time;
          timeCell.className = "normal fa-sm njtr_row njtr_time";
          row.appendChild(timeCell);

          let destCell = document.createElement("td");
          destCell.innerText = train.dest;
          destCell.className = "normal fa-sm njtr_row njtr_dest";
          row.appendChild(destCell);

          let trackCell = document.createElement("td");
          trackCell.innerText = train.track;
          trackCell.className = "normal fa-sm njtr_row njtr_track";
          row.appendChild(trackCell);

          let lineCell = document.createElement("td");
          lineCell.innerText = train.line;
          lineCell.className = "normal fa-sm njtr_row njtr_line";
          row.appendChild(lineCell);

          let statusCell = document.createElement("td");
          statusCell.innerText = train.status;
          statusCell.className = "normal fa-sm njtr_row njtr_status";
          row.appendChild(statusCell);

          tblBody.appendChild(row);
          if (i >= startingPoint) {
            const currentStep = i - startingPoint;
            row.style.opacity = 1 - (1 / steps * currentStep);
          }
          tblBody.appendChild(row);

          tbl.innerHTML = '';
          tbl.appendChild(tblBody)
        })
        break
    }
  },
})
