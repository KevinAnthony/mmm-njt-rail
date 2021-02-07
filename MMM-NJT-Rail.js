/* eslint-disable no-undef,guard-for-in,no-restricted-syntax */
// eslint-disable-next-line no-undef
Module.register("MMM-NJT-Rail", {
  defaults: {
    station: 'New York Penn Station',
    fadePoint: .25,
    maxShown: 0,
    refreshInterval: 60,
  },
  start: function () {
    console.log(`Starting module: ${this.name}`);
  },
  getDom: function () {
    let wrapper = document.createElement("div")
    wrapper.className = "BaseWrapper"
    wrapper.id = "wrapper"

    let t = document.createElement("table");
    t.id = "station_table"
    t.className = "small";
    t.innerHTML = "loading..."
    t.className = "normal fa-sm"

    var tblBody = document.createElement("tbody");
    tblBody.className = "njtr_table"

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
  notificationReceived: function (notification) {
    switch (notification) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("NJT_INIT", {
          station: this.config.station,
          max: this.config.maxShown,
          refresh: this.config.refreshInterval * 1000,
        })
        break
    }
  },
  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "NJT_REFRESH":
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

        createCell = this.createCell

        let row = document.createElement("tr")
        row.className = "normal fa-sm";

        row.appendChild(createCell("Time", "njtr_time", "th"))
        row.appendChild(createCell("Destination", "njtr_dest", "th"))
        row.appendChild(createCell("Track", "njtr_track", "th"))
        row.appendChild(createCell("Line", "njtr_line", "th"))
        row.appendChild(createCell("Status", "njtr_status", "th"))

        tblBody.appendChild(row);

        payload.forEach(function (train, i) {
          let row = document.createElement("tr")
          row.className = "normal fa-sm";

          row.appendChild(createCell(train.time, "njtr_time", "td"))
          row.appendChild(createCell(train.dest, "njtr_dest", "td"))
          row.appendChild(createCell(train.track, "njtr_track", "td"))
          row.appendChild(createCell(train.line, "njtr_line", "td"))
          row.appendChild(createCell(train.status, "njtr_status", "td"))

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
  createCell(text, className, tagName) {
    let cell = document.createElement(tagName);
    cell.innerText = text;
    cell.className = "normal fa-sm " + className

    return cell
  }
})
