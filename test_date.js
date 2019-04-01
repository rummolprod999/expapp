let fs = require('fs');
const moment = require("moment");

function getDiff(ftext) {
    let diff = 0;
    try {
        //let ftext = fs.readFileSync(s, "utf8");
        let reg = /\d+\/\d+\/\d+\s+\d+:\d+:\d+/gm;
        let result = ftext.match(reg);
        if (result == null) {
            reg = /\d+-\d+-\d+\s+\d+:\d+:\d+/gm;
            result = ftext.match(reg);
        }
        if (result == null) {
            reg = /\d+.\d+.\d+\s+\d+:\d+:\d+/gm;
            result = ftext.match(reg);
        }
        if (result == null) {
            reg = /\b\w{3}\s\d+.+MSK\s\d{4}/gm;
            result = ftext.match(reg);
        }
        if (result == null) {
            return 0
        }
        let first_time = result[0];
        let last_time = result[result.length - 1];
        let ftime = parsing_date(first_time);
        let lasttime = parsing_date(last_time);
        console.log(ftime);
        console.log(lasttime);
        diff = lasttime.diff(ftime) / 1000 / 60;
    } catch (e) {
    }
    return diff
}

function parsing_date(dt) {
    let date = moment(dt, undefined, false);
    if (!date.isValid()) {
        date = moment(dt, "MMM DD hh:mm:ss ZZ YYYY");
    }
    if (!date.isValid()) {
        date = moment(dt, "DD.MM.YY hh:mm:ss");
    }
    return date
}

let str = "Fri Mar 29 12:45:44 MSK 2019 Начало парсинга\n" +
    "Fri Mar 29 12:45:55 MSK 2019 Добавили тендеров 100\n" +
    "Fri Mar 29 12:45:55 MSK 2019 Обновили тендеров 0\n" +
    "Fri Mar 29 12:45:55 MSK 2019 Конец парсинга\n" +
    "Fri Mar 29 23:28:31 MSK 2019 Начало парсинга\n" +
    "Fri Mar 29 23:28:35 MSK 2019 Добавили тендеров 12\n" +
    "Fri Mar 29 23:28:35 MSK 2019 Обновили тендеров 0\n" +
    "Fri Mar 29 23:28:35 MSK 2019 Конец парсинга";

let res = getDiff(str);
console.log(res);