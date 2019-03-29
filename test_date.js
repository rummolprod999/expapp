let fs = require('fs');
const moment = require("moment");

function getDiff(s){
    let diff = 0;
    try {
        //let ftext = fs.readFileSync(s, "utf8");
        let ftext = s;
        let reg = /\d+\/\d+\/\d+\s+\d+:\d+:\d+/gm;
        let result = s.match(reg);
        if (result == null) {
            reg = /\d+-\d+-\d+\s+\d+:\d+:\d+/gm;
            result = s.match(reg);
        }
        if (result == null) {
            reg = /\d+.\d+.\d+\s+\d+:\d+:\d+/gm;
            result = s.match(reg);
        }
        if (result == null) {
            return null
        }
        let first_time = result[0];
        let last_time = result[result.length - 1];
        let ftime = moment(first_time, undefined, false);
        let lasttime = moment(last_time, undefined, false);
        console.log(ftime);
        diff = lasttime.diff(ftime) / 1000 / 60;
    } catch (e) {
    }
    return diff
}
let str = "29.03.19 6:04:58 Начало парсинга\n" +
    "29.03.19 6:04:59 1000 Tenders limit!!!!! https://otc.ru/tenders/api/public/GetTendersExtended?id=e1eceed1-cfc9-4138-8406-0541aa7d8beb&DatePublishedFrom=03/28/2019&FilterData.PageSize=100&state=1&FilterData.SortingField=2&FilterData.SortingDirection=2\n" +
    "29.03.19 6:05:09 Конец парсинга\n" +
    "29.03.19 6:05:09 Добавили тендеров 10\n" +
    "29.03.19 6:05:09 Обновили тендеров 0\n" +
    "29.03.19 7:04:36 Начало парсинга\n" +
    "29.03.19 7:04:37 1000 Tenders limit!!!!! https://otc.ru/tenders/api/public/GetTendersExtended?id=e1eceed1-cfc9-4138-8406-0541aa7d8beb&DatePublishedFrom=03/28/2019&FilterData.PageSize=100&state=1&FilterData.SortingField=2&FilterData.SortingDirection=2\n" +
    "29.03.19 7:04:49 Конец парсинга\n" +
    "29.03.19 7:04:49 Добавили тендеров 15\n" +
    "29.03.19 7:04:49 Обновили тендеров 0\n" +
    "29.03.19 8:04:43 Начало парсинга";

let res = getDiff(str);
console.log(res);