const needle = require("needle");
const cheerio = require("cheerio");
const cheerioTableparser = require('cheerio-tableparser');


class NJTRFetcher {
    constructor(stationID, fetchInterval, max) {
        this.stationID = stationID;
        this.fetchInterval = fetchInterval;
        this.max = max
        this.reloadTimer = null;
    }

    onReceive(callback) {
        this.eventsReceivedCallback = callback;
    }

    start() {
        clearTimeout(this.reloadTimer);
        this.reloadTimer = setTimeout(() => this.fetch(), this.fetchInterval);
    }

    stop() {
        clearTimeout(this.reloadTimer);
        this.reloadTimer = null;
    }

    async fetch() {
        this.stop()
        const apiUrl = `https://dv.njtransit.com/webdisplay/tid-mobile.aspx?sid=${this.stationID}`;
        await needle('get', apiUrl)
            .then(async (res) => {
                var $ = cheerio.load(res.body);
                cheerioTableparser($);
                // parse
                var schedual = this.parseResponse($("#GridView1"))
                // broadcast
                this.eventsReceivedCallback(schedual)

            }).catch((err) => {
                /* handle HTTP errors */
                console.error(`NJ Transit error querying NJ Transit API for stop id: ${this.stationID}`);
                console.error(err);
            }).finally(
                () => this.start()
            );
    }

    parseResponse($) {
        var sched = []
        var table = $.parsetable(false, false, true)
        if (table.length === 0 || table[0].length === 0) {
            return sched;
        }
        //shift to remove heading
        table[0].shift()
        table[1].shift()
        table[2].shift()
        table[3].shift()
        table[4].shift()
        table[5].shift()

        // all even numbers 0,2,4,... are blank, so we skip them
        for (var i = 1; i < table[0].length; i += 2) {
            sched.push({
                time: table[0][i],
                dest: table[1][i],
                track: table[2][i],
                line: table[3][i],
                trainNum: table[4][i],
                status: table[5][i]
            })
            if (this.max > 0 && sched.length >= this.max) {
                break
            }
        }

        return sched
    }
}

module.exports = NJTRFetcher;