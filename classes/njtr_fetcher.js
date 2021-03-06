let axios = require('axios');

class NJTRFetcher {
    constructor(stationID, fetchInterval, max) {
        this.stationID = stationID;
        this.fetchInterval = fetchInterval;
        this.max = max
        this.reloadTimer = null;

        this.token = 'fSJeKkBzVHpWdFEkcWoiOiJzc2FwIiwiZyFuem8mOWxRWXg3IjoicmVzdSJ7'
        this.hash = '988af61d40d8f98ad68e0793b81a9a04bb96efa8407004a0ef85ec477cf00025'

    }

    onReceive(callback) {
        this.eventsReceivedCallback = callback;
    }

    start() {
        this.fetch()
        clearTimeout(this.reloadTimer);
        this.reloadTimer = setTimeout(() => this.fetch(), this.fetchInterval);
    }

    stop() {
        clearTimeout(this.reloadTimer);
        this.reloadTimer = null;
    }

    fixUnicode(inText) {
        let matches = inText.matchAll("&#([0-9]+)")

        for (const match of matches) {
           inText = inText.replace(match[0], String.fromCharCode(parseInt(match[1])))
        }

        return inText
    }

    async fetch() {
        this.stop()
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

        let self = this;
        axios(config).then(function (response) {
            let schedules = []

            response.data.data.getTrainDepartureScreens.items.some(el =>{
                schedules.push({
                    time: self.fixUnicode(el.departureDate),
                    dest: self.fixUnicode(el.destination),
                    track: self.fixUnicode(el.track),
                    line: self.fixUnicode(el.line),
                    trainNum: self.fixUnicode(el.trainID),
                    status: self.fixUnicode(el.status)
                })
                return self.max > 0 && schedules.length >= self.max
            })
            self.eventsReceivedCallback(schedules);
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
