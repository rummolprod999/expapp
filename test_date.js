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
            reg = /\b\w{3}\s\d+.+GMT\s\d{4}/gm;
            result = ftext.match(reg);
        }
        if (result == null) {
            reg = /\d{4}-\d{2}-\d{2}T\d+:\d+:\d+/gm;
            result = ftext.match(reg);
        }
        if (result == null) {
            return 0
        }
        let first_time = result[0].replace(" MSK", "").replace(" GMT", "");
        let last_time = result[result.length - 1].replace(" MSK", "").replace(" GMT", "");
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
    let date = moment(dt, "DD.MM.YYYY hh:mm:ss", true);
    if (!date.isValid()) {
        date = moment(dt, "DD.MM.YYYY HH:mm:ss", true);
    }
    if (!date.isValid()) {
        date = moment(dt, "DD.MM.YY hh:mm:ss", true);
    }
    if (!date.isValid()) {
        date = moment(dt, "DD.MM.YY HH:mm:ss", true);
    }
    if (!date.isValid()) {
        date = moment(dt, "DD.MM.YY h:mm:ss", true);
    }
    if (!date.isValid()) {
        date = moment(dt, "DD.MM.YY H:mm:ss", true);
    }
    if (!date.isValid()) {
        date = moment(dt, "DD.MM.YYYY h:mm:ss", true);
    }
    if (!date.isValid()) {
        date = moment(dt, "DD.MM.YYYY H:mm:ss", true);
    }
    if (!date.isValid()) {
        date = moment(dt, "MM/DD/YYYY hh:mm:ss", true);
    }
    if (!date.isValid()) {
        date = moment(dt, "MM/DD/YYYY HH:mm:ss", true);
    }
    if (!date.isValid()) {
        date = moment(dt, "MMM DD hh:mm:ss YYYY", true);
    }
    if (!date.isValid()) {
        date = moment(dt, "MMM DD HH:mm:ss YYYY", true);
    }
    if (!date.isValid()) {
        date = moment(dt, undefined, false);
    }
    return date
}

let str = "Tue Mar 26 03:31:16 GMT 2019 Начало парсинга\n" +
    "Tue Mar 26 03:37:54 GMT 2019 can not find pubDate on page\n" +
    " \n" +
    " 1000059160\n" +
    "Tue Mar 26 03:38:05 GMT 2019 Добавили тендеров 0\n" +
    "Tue Mar 26 03:38:05 GMT 2019 Обновили тендеров 0\n" +
    "Tue Mar 26 03:38:05 GMT 2019 Конец парсинга";

let res = getDiff(str);
console.log(res);
/*let date = moment("31.03.19 13:34:39", ["DD.MM.YY HH:mm:ss"], 'ru', true);
console.log(date);*/
