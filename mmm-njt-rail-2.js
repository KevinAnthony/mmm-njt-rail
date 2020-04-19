Module.register("MMM-NJT-Rail", {
  defaults: {
    station: 'NY',
    fadePoint: .25,
    maxShown: 0,
    refreshIntervale: 60,
  },
  start: function () {
    Log.log(`Starting module: ${this.name}`);
  },
  getDom: function () {
    var wrapper = document.createElement("div")
    wrapper.className = "BaseWrapper"
    wrapper.id = "wrapper"
    t = document.createElement("table");
    t.id = "station_table"
    t.className = "fa njtr_table"
    t.innerHtml = "loading..."
    //TODO create header

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
    switch (notification) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT_NJT", {
          station: this.config.station,
          max: this.config.maxShown,
          refresh: this.config.refreshIntervale * 1000,
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
        const startingPoint = payload.length * this.config.fadePoint;
        const steps = payload.length - startingPoint;

        var tbl = document.getElementById("station_table")
        tbl.className = "small";
        var tblBody = document.createElement("tbody");
        tblBody.className = "njtr_table"
        tbl.appendChild(tblBody)
        if (payload.length === 0) {
          tbl.innerHTML = "No Trains Schedualed"
          break;
        }
        payload.forEach(function (train, i) {
          var row = document.createElement("tr")
          row.className = "njtr_row";

          var cell = document.createElement("td");
          cell.innerText = train.time;
          cell.className = "fa njtr_row njtr_time";
          row.appendChild(cell);

          var cell = document.createElement("td");
          cell.innerText = train.dest;
          cell.className = "fa njtr_row njtr_dest";
          row.appendChild(cell);

          var cell = document.createElement("td");
          cell.innerText = train.track;
          cell.className = "fa njtr_row njtr_track";
          row.appendChild(cell);

          var cell = document.createElement("td");
          cell.innerText = train.line;
          cell.className = "fa njtr_row njtr_line";
          row.appendChild(cell);

          var cell = document.createElement("td");
          cell.innerText = train.status;
          cell.className = "fa njtr_row njtr_status";
          row.appendChild(cell);

          tblBody.appendChild(row);
          if (i >= startingPoint) {
            const currentStep = i - startingPoint;
            row.style.opacity = 1 - (1 / steps * currentStep);
          }
          tblBody.appendChild(row);
        })

        break
    }
  },
})