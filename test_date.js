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
    let date = moment(dt, "DD.MM.YYYY hh:mm:ss");
    if (!date.isValid()) {
        date = moment(dt, "MMM DD hh:mm:ss ZZ YYYY");
    }
    if (!date.isValid()) {
        date = moment(dt, "DD.MM.YY hh:mm:ss");
    }
    if (!date.isValid()) {
        date = moment(dt, undefined, false);
    }
    return date
}

let str = "﻿30.03.2019 9:33:05 Начало парсинга\n" +
    "30.03.2019 10:09:55 Конец парсинга\n" +
    "30.03.2019 10:09:55 Добавили тендеров 4289\n" +
    "30.03.2019 10:09:55 Обновили тендеров 7628";

let res = getDiff(str);
console.log(res);