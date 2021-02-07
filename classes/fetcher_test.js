const njtr = require("./njtr_fetcher");

var fetcher = new njtr("New York Penn Station", 1, 10)

fetcher.onReceive((schedule) => {
    console.log(schedule)
    console.log(schedule.length)
});

(async() => {
    await fetcher.fetch();
})();

