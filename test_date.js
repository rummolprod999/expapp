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
        let first_time = result[0].replace(" MSK", "").trim();
        let last_time = result[result.length - 1].replace(" MSK", "").trim();
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
        date = moment(dt, undefined, false);
    }
    return date
}

let str = "31.03.19 6:04:51 Начало парсинга\n" +
    "31.03.19 6:04:59 Конец парсинга\n" +
    "31.03.19 6:04:59 Добавили тендеров 3\n" +
    "31.03.19 6:04:59 Обновили тендеров 0\n" +
    "31.03.19 7:04:32 Начало парсинга\n" +
    "31.03.19 7:04:38 Конец парсинга\n" +
    "31.03.19 7:04:38 Добавили тендеров 1\n" +
    "31.03.19 7:04:38 Обновили тендеров 0\n" +
    "31.03.19 8:00:06 Начало парсинга\n" +
    "31.03.19 8:00:13 Конец парсинга\n" +
    "31.03.19 8:00:13 Добавили тендеров 1\n" +
    "31.03.19 8:00:13 Обновили тендеров 0\n" +
    "31.03.19 9:04:59 Начало парсинга\n" +
    "31.03.19 9:05:06 Конец парсинга\n" +
    "31.03.19 9:05:06 Добавили тендеров 1\n" +
    "31.03.19 9:05:06 Обновили тендеров 0\n" +
    "31.03.19 10:04:33 Начало парсинга\n" +
    "31.03.19 10:04:40 Конец парсинга\n" +
    "31.03.19 10:04:40 Добавили тендеров 1\n" +
    "31.03.19 10:04:40 Обновили тендеров 0\n" +
    "31.03.19 11:04:30 Начало парсинга\n" +
    "31.03.19 11:04:37 Конец парсинга\n" +
    "31.03.19 11:04:37 Добавили тендеров 1\n" +
    "31.03.19 11:04:37 Обновили тендеров 0\n" +
    "31.03.19 12:04:53 Начало парсинга\n" +
    "31.03.19 12:05:01 Конец парсинга\n" +
    "31.03.19 12:05:01 Добавили тендеров 1\n" +
    "31.03.19 12:05:01 Обновили тендеров 0\n" +
    "31.03.19 13:05:01 Начало парсинга\n" +
    "31.03.19 13:05:09 Конец парсинга\n" +
    "31.03.19 13:05:09 Добавили тендеров 1\n" +
    "31.03.19 13:05:09 Обновили тендеров 0\n" +
    "31.03.19 14:05:09 Начало парсинга\n" +
    "31.03.19 14:05:17 Конец парсинга\n" +
    "31.03.19 14:05:17 Добавили тендеров 2\n" +
    "31.03.19 14:05:17 Обновили тендеров 0\n" +
    "31.03.19 21:31:31 Начало парсинга\n" +
    "31.03.19 21:31:40 Конец парсинга\n" +
    "31.03.19 21:31:40 Добавили тендеров 48\n" +
    "31.03.19 21:31:40 Обновили тендеров 0\n" +
    "31.03.19 22:34:29 Начало парсинга\n" +
    "31.03.19 22:34:39 Конец парсинга\n" +
    "31.03.19 22:34:39 Добавили тендеров 8\n" +
    "31.03.19 22:34:39 Обновили тендеров 0";

let res = getDiff(str);
console.log(res);
let date = moment("31.03.19 13:34:39", ["DD.MM.YY HH:mm:ss"], 'ru', true);
console.log(date);
console.log(date.toDate());