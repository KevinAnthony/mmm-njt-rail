let axios = require('axios');

class NJTRFetcher {
    constructor(stationID, fetchInterval, max) {
        this.stationID = stationID;
        this.fetchInterval = fetchInterval;
        this.max = max
        this.reloadTimer = null;

        this.token = 'fSJeKkBzVHpWdFEkcWoiOiJzc2FwIiwiZyFuem8mOWxRWXg3IjoicmVzdSJ7'
        this.hash = '988af61d40d8f98ad68e0793b81a9a04bb96efa8407004a0ef85ec477cf00025'

        console.log("constructor")
    }

    onReceive(callback) {
        console.log("onReceive")
        this.eventsReceivedCallback = callback;
    }

    start() {
        console.log("here")
        this.fetch()
        clearTimeout(this.reloadTimer);
        this.reloadTimer = setTimeout(() => this.fetch(), this.fetchInterval);
    }

    stop() {
        clearTimeout(this.reloadTimer);
        this.reloadTimer = null;
    }

    async fetch() {
        this.stop()
        Log.log("NJT_INIT")
        var data = JSON.stringify({
            "operationName": "TrainDepartureScreens",
            "variables": {"station": this.stationID},
            "extensions": {
                "persistedQuery": {
                    "version": 1,
                    "sha256Hash": this.hash
                }
            }
        });

        var config = {
            method: 'post',
            url: 'https://api.njtransit.com/graphql',
            headers: {
                'authorization': 'Bearer '+ this.token,
                'content-type': 'application/json',
            },
            data: data
        };

        let that = this;
        axios(config).then(function (response) {
            let schedules = []

            response.data.data.getTrainDepartureScreens.items.some(el =>{
                schedules.push({
                    time: el.departureDate,
                    dest: el.destination.replace('&#9992','\\2708'),
                    track: el.track,
                    line: el.line,
                    trainNum: el.trainID,
                    status: el.status
                })
                return that.max > 0 && schedules.length >= that.max
            })
            that.eventsReceivedCallback(schedules);
        }).catch((err) => {
            /* handle HTTP errors */
            console.error(`NJ Transit error querying NJ Transit API for stop id: ${this.stationID}`);
            console.error(err);
        }).finally(
            () => this.start()
        );
    }
}

module.exports = NJTRFetcher;
