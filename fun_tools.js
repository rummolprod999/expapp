let fs = require('fs');
const hbs = require("hbs");
const moment = require("moment");
const file_log = "message_log.log";

function write_to_log(message) {
    fs.appendFileSync(file_log, message)
}

function getGraphAll(dir_name) {
    let dk = [];
    for (let d of export_map) {
        if (d[0] === dir_name) {
            dk = d;
        }
    }
    let dir = dk[1];
    let dir_list = fs.readdirSync(dir);
    dir_list.sort(function (a, b) {
        return fs.statSync(`${dir}/${b}`).mtime.getTime() -
            fs.statSync(`${dir}/${a}`).mtime.getTime();
    });
    let added = [];
    let updated = [];
    let dates = [];
    let diff_dates = [];
    let file_size = [];
    let mtimes = [];
    for (let f of dir_list) {
        let date = getDateFromString(f);
        let dateParts = date.split("-");
        if (dateParts[2].length === 4) {
            let ddd = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            dates.push(ddd);
        } else {
            dates.push(date);
        }
        let countsAdded = getAddedFromFile(`${dir}/${f}`);
        let countsUpdates = getUpdatedFromFile(`${dir}/${f}`);
        let diffs = getDiff(`${dir}/${f}`);
        let mtm = getLastModif(`${dir}/${f}`);
        let f_size = getFileSize(`${dir}/${f}`);
        added.push(countsAdded);
        updated.push(countsUpdates);
        diff_dates.push(diffs);
        mtimes.push(mtm)
        file_size.push(f_size)
    }
    let obb = [];
    if (added.length > 0) {
        for (let i = 0; i < added[0].length; i++) {
            let temp = [];
            let add = [];
            for (let j = 0; j < added.length; j++) {
                temp.push(added[j][i]);
                if (updated[j][i]) {
                    add.push(updated[j][i])
                } else {
                    add.push({})
                }
            }
            obb.push({
                dates: dates,
                counts: temp,
                added: add,
                diff_dates: diff_dates,
                mtimes: mtimes,
                f_size: file_size
            });
        }
    }
    return obb
}

module.exports.getGraph = function (dir_name) {
    let a = getGraphAll(dir_name);
    let result = "";
    for (let i = 0; i < a.length; i++) {
        let cc = [];
        let dd = [];
        for (let ccc of a[i].counts) {
            if (ccc) {
                cc.push(ccc.count)
            } else {
                cc.push(0)
            }
        }
        for (let ccc of a[i].added) {
            if (ccc.count) {
                dd.push(ccc.count)
            } else {
                dd.push(0)
            }
        }
        result += `<div>${a[i].counts[0].name}</div><div id="tester${i}" style="width:800px;height:350px;"></div>
<script>
    TESTER${i} = document.getElementById('tester${i}');
    var trace1 = {
  x: ${JSON.stringify(a[i].dates)},
  y: ${JSON.stringify(cc)},
  name: 'Добавили',
  type: 'bar'
};

var trace2 = {
  x: ${JSON.stringify(a[i].dates)},
  y: ${JSON.stringify(dd)},
  name: 'Обновили',
  type: 'bar'
};

var data = [trace1, trace2];

var layout = {barmode: 'stack'};

Plotly.newPlot(TESTER${i}, data, layout);
</script>`
    }
    return new hbs.SafeString(result)
};
module.exports.getGraphTimeParsing = function (dir_name) {
    let a = getGraphAll(dir_name);
    let result = "";
    if (a.length > 0) {
        result += `<div>Время парсинга по дням, в минутах</div><div id="tester_time_parsing" style="width:800px;height:350px;"></div>
<script>
    TESTER_TP = document.getElementById('tester_time_parsing');
    var trace1 = {
  x: ${JSON.stringify(a[0].dates)},
  y: ${JSON.stringify(a[0].diff_dates)},
  name: 'Время, в минутах',
  type: 'bar'
};
var data = [trace1];
var layout = {barmode: 'stack'};

Plotly.newPlot(TESTER_TP, data, layout);
</script>`
    }
    if (a.length > 0) {
        result += `<div>Время последнего доступа к файлу лога, в часах с начала дня</div><div id="tester_last_time" style="width:800px;height:350px;"></div>
<script>
    TESTER_M = document.getElementById('tester_last_time');
    var trace2 = {
  x: ${JSON.stringify(a[0].dates)},
  y: ${JSON.stringify(a[0].mtimes)},
  name: 'Время',
  type: 'bar'
};
var datam = [trace2];
var layoutm = {barmode: 'stack'};

Plotly.newPlot(TESTER_M, datam, layoutm);
</script>`
    }
    if (a.length > 0) {
        result += `<div>Размер файла лога по дням</div><div id="tester_file_size" style="width:800px;height:350px;"></div>
<script>
    TESTER_F = document.getElementById('tester_file_size');
    var trace3 = {
  x: ${JSON.stringify(a[0].dates)},
  y: ${JSON.stringify(a[0].f_size)},
  name: 'Время',
  type: 'bar'
};
var datam = [trace3];
var layoutm = {barmode: 'stack'};

Plotly.newPlot(TESTER_F, datam, layoutm);
</script>`
    }
    return new hbs.SafeString(result)
};
module.exports.getGraphA = function () {
    let result = "";
    for (let d of export_map) {
        let a = getGraphAll(d[0]);
        result += `<br><br><div><b>${d[0]}</b></div>`;
        result += `<p>Площадка: <strong>${get_description(d[0])}</strong></p>`;
        for (let i = 0; i < a.length; i++) {
            let cc = [];
            let dd = [];
            for (let ccc of a[i].counts) {
                if (ccc) {
                    cc.push(ccc.count)
                } else {
                    cc.push(0)
                }
            }
            for (let ccc of a[i].added) {
                if (ccc.count) {
                    dd.push(ccc.count)
                } else {
                    dd.push(0)
                }
            }
            result += `<div>${a[i].counts[0].name}</div><div id="tester${i}_${d[0]}" style="width:800px;height:350px;"></div>
<script>
    TESTER${i}_${d[0]} = document.getElementById('tester${i}_${d[0]}');
    var trace1 = {
  x: ${JSON.stringify(a[i].dates)},
  y: ${JSON.stringify(cc)},
  name: 'Добавили',
  type: 'bar'
};

var trace2 = {
  x: ${JSON.stringify(a[i].dates)},
  y: ${JSON.stringify(dd)},
  name: 'Обновили',
  type: 'bar'
};

var data = [trace1, trace2];

var layout = {barmode: 'stack'};

Plotly.newPlot(TESTER${i}_${d[0]}, data, layout);
</script>`
        }
    }

    return new hbs.SafeString(result)
};

module.exports.getTenCounts = function (dir_name) {
    let dk = [];
    for (let d of export_map) {
        if (d[0] === dir_name) {
            dk = d;
        }
    }
    let dir = dk[1];
    let dir_list = fs.readdirSync(dir);
    dir_list.sort(function (a, b) {
        return fs.statSync(`${dir}/${b}`).mtime.getTime() -
            fs.statSync(`${dir}/${a}`).mtime.getTime();
    });
    let result = "";
    result += `<p>Тип парсера: ${dk[0]}</p>`;
    result += `<p><strong>Площадка: ${get_description(dk[0])}</strong></p>`;
    for (let f of dir_list) {
        let date = getDateFromString(f);
        let counts = getCountFromFile(`${dir}/${f}`);
        let param = `${dir}/${f}`.replace(/\//g, '--');
        result += `<div class="list-group-all"><p><strong>Дата: ${date}</strong></p>`;
        result += `<p><button type="button" class="btn btn-secondary"><a href="/">Вернуться назад</a></button></p>`;
        result += `<p>Смотреть файл протокола: <a href='/tenders/${dk[0]}/${param}'>${dir}/${f}</a></p>`;
        result += "<ul>";
        for (let o of counts) {
            result += `<li>${o}</li>`;
        }
        result += "</br></br>";
        result += "</ul></div>";
    }
    return new hbs.SafeString(result)
};

module.exports.getFile = function (file) {
    let ftext = fs.readFileSync(file, "utf8");
    let result = "";
    result += `<pre>${ftext}</pre>`;
    return new hbs.SafeString(result)
};

module.exports.getFileLog = function (file) {
    let ftext = fs.readFileSync(file, "utf8");
    let result = "";
    ftext = ftext.replace(/Query_time:/g, "<b>Query_time:</b>");
    result += `<pre>${ftext}</pre>`;
    return new hbs.SafeString(result)
};

module.exports.GetTenList = function (dir_l) {
    let result = "";
    result += `<p>Тип парсера: <strong>${dir_l[0]}</strong></p>`;
    result += `<p>Площадка: <strong>${get_description(dir_l[0])}</strong></p>`;
    result += `<p><button type="button" class="btn btn-secondary"><a href='/tenders/${dir_l[0]}'>Смотреть отчеты: ${dir_l[0]}</a></button></p>`;
    result += `<p><button type="button" class="btn btn-warning"><a href='/graph/${dir_l[0]}'>Смотреть графики загрузки: ${dir_l[0]}</a></button></p>`;
    result += `<p><button type="button" class="btn btn-info"><a href='/graph/timep/${dir_l[0]}'>Смотреть графики времени работы парсеров: ${dir_l[0]}</a></button><br></p>`;
    return new hbs.SafeString(result)
};

function getDateFromString(s) {
    let reg = /(\d{4}-\d{2}-\d{2})/;
    if (s.match(reg)) {
        return s.match(reg)[0]
    }
    reg = /(\d{2}_\d{2}_\d{4})/;
    if (s.match(reg)) {
        return s.match(reg)[0].replace(/_/gi, "-")
    }

}


function getCountFromFile(s) {
    let ftext = fs.readFileSync(s, "utf8");
    let reg = /(Добав(или|лено)|Обнов(лено|или)) .* (\d+)/gm;
    return ftext.match(reg) || []

}

function getFileSize(f) {
    let stats = fs.statSync(f);
    let fileSizeInBytes = stats["size"];
    return fileSizeInBytes;
}

function getDiff(s) {
    let diff = 0;
    try {
        let ftext = fs.readFileSync(s, "utf8");
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

function getLastModif(file) {
    let stat = fs.statSync(file);
    return stat.mtime.getHours() + stat.mtime.getMinutes() / 60 + stat.mtime.getSeconds() / (60 * 60)
}

function getAddedFromFile(s) {
    let ftext = fs.readFileSync(s, "utf8");
    let reg = /Добав(?:или|лено) .* (\d+)/gm;
    let ob_list = [];
    let match;
    while ((match = reg.exec(ftext)) !== null) {
        let free_string = match[0].replace(/(\d+)$/, "").trim();
        let index = ob_list.findIndex(x => x.name === free_string);
        if (index === -1) {
            ob_list.push({name: free_string, count: Number(match[1])});
        } else {
            ob_list[index] = {name: free_string, count: ob_list[index].count + Number(match[1])}
        }
    }
    return ob_list

}

function getUpdatedFromFile(s) {
    let ftext = fs.readFileSync(s, "utf8");
    let reg = /Обнов(?:лено|или) .* (\d+)/gm;
    let ob_list = [];
    let match;
    while ((match = reg.exec(ftext)) !== null) {
        let free_string = match[0].replace(/(\d+)$/, "").trim();
        let index = ob_list.findIndex(x => x.name === free_string);
        if (index === -1) {
            ob_list.push({name: free_string, count: Number(match[1])});
        } else {
            ob_list[index] = {name: free_string, count: ob_list[index].count + Number(match[1])}
        }
    }
    return ob_list

}

const dir_prefix = '/srv/parsers/';
let map = new Map();
map.set('Tenders44Fz', 'ParserTenders/log_tenders44')
    .set('Tenders223Fz', 'ParserTenders/log_tenders223')
    .set('TendersB2B', 'ParserB2B/LogB2B')
    .set('TendersFabrikant', 'ParserFabrikant/LogFabrikant')
    .set('TendersRosneft', 'ParserRosneft/LogRosneft')
    .set('TendersOTC', 'ParserOTC/log_tenders_otc')
    .set('Contracts223OpenData', 'ParserContracts223Sharp/log_parsing/contr223')
    .set('Customers223OpenData', 'ParserContracts223Sharp/log_parsing/customer')
    .set('Suppliers223OpenData', 'ParserContracts223Sharp/log_parsing/supplier')
    .set('Contracts223', 'ParserContracts44Sharp/log_contracts223')
    .set('Contracts44', 'ParserContracts44Sharp/log_contracts44')
    .set('TendersKomos', 'ParserKotlin/log_tender_komos')
    .set('Organizations44', 'ParserOrganizations/log_organization')
    .set('Organizations223', 'ParserOrganizations223/log_organization223')
    .set('Protocols44', 'ParserProtocols/log_prot')
    .set('Protocols223', 'ParserProtocols223/log_protocols')
    .set('TendersPRO', 'ParserTenderPro/log_tender_pro')
    .set('Explations223', 'ParserTenders/log_exp223')
    .set('TendersGPB', 'ParserTenders/log_gazprom')
    .set('TendersGNTWeb', 'ParserTenders/log_gnt_web')
    .set('TendersMrsk', 'ParserTenders/log_mrsk')
    .set('TendersObTorgWeb', 'ParserTenders/log_obtorg_web')
    .set('TendersRosneftWeb', 'ParserTenders/log_rosneft')
    .set('TendersSakhalinWeb', 'ParserTenders/log_sakhalin')
    .set('Sign223', 'ParserTenders/log_sign223')
    .set('TendersSpecTorgWeb', 'ParserTenders/log_spectorg_web')
    .set('TendersTektorgGazprom', 'ParserWebGo/log_tekgaz')
    .set('TendersTektorgInterRao', 'ParserWebGo/log_tekrao')
    .set('TendersTektorgRZD', 'ParserWebGo/log_tekrzd')
    .set('Tenders615', 'ParserTenders/log_tenders615')
    .set('TendersFromEIS', 'ParserTenders/log_tenders_web')
    .set('TendersUkr', 'ParserUkr/log_tenders_ukr')
    .set('Complaint44', 'ParserUnfair/log_complaint')
    .set('ComplaintResult44', 'ParserUnfair/log_complaint_result')
    .set('RNP', 'ParserUnfair/log_rnp')
    .set('TendersAkd', 'ParserWebFSharp/log_tenders_akd')
    .set('TendersButb', 'ParserWebFSharp/log_tenders_butb')
    .set('TendersIrkutskOil', 'ParserWebFSharp/log_tenders_irkutskoil')
    .set('TendersLSR', 'ParserWebFSharp/log_tenders_lsr')
    .set('TendersDixy', 'ParserWebGo/log_dixy')
    .set('TendersPhosAgro', 'ParserWebGo/log_phosagro')
    .set('TendersRusneft', 'ParserWebGo/log_rusneft')
    .set('TendersX5Group', 'ParserWebGo/log_x5group')
    .set('TendersBashNeft', 'ParserWebUniversal/log_bashneft')
    .set('TendersEtpRF', 'ParserWebUniversal/log_etprf')
    .set('TendersGPN', 'ParserWebUniversal/log_gpn')
    .set('TendersLukoil', 'ParserWebUniversal/log_luk')
    .set('TendersMiratorg', 'ParserWebUniversal/log_miratorg')
    .set('TendersPolis', 'ParserWebUniversal/log_pol')
    .set('TendersRTS', 'ParserWebFSharp/log_tenders_rts_corp')
    .set('TendersSIBUR', 'ParserWebUniversal/log_sibur')
    .set('TendersSTG', 'ParserWebUniversal/log_stg')
    .set('TendersTAtNeft', 'ParserWebUniversal/log_tat')
    .set('TendersUralKaliy', 'ParserWebUniversal/log_ural')
    .set('TendersMvideo', 'UnParserSelen/log_mvideo')
    .set('TendersSafMar', 'UnParserSelen/log_safmar')
    .set('TendersTalan', 'UnParserSelen/log_talan')
    .set('TendersTander', 'UnParserSelen/log_tander')
    .set('TendersKomTech', 'ParserWebGo/log_komtech')
    .set('OnlineContract', 'ParserWebCore/log_ocontract')
    .set('RosElTorg', 'ParserWebFSharp/log_tenders_rossel')
    .set('TendersCpc', 'ParserWebGo/log_cpc')
    .set('DemoAccess', 'log_send_email')
    .set('TendersMosReg', 'UnParserSelen/log_mosreg')
    .set('TendersRfp', 'ParserWebUniversal/log_rfp')
    .set('TendersNeftAvtomatika', 'ParserWebFSharp/log_tenders_neft')
    .set('TendersSlavNeft', 'ParserWebFSharp/log_tenders_slav')
    .set('TendersAeroFlot', 'ParserWebFSharp/log_tenders_aero')
    .set('TendersNovatek', 'ParserWebGo/log_novatek')
    .set('TendersAzot', 'ParserWebGo/log_azot')
    .set('TendersUgmk', 'UnParserSelen/log_ugmk')
    .set('TendersZakupki', 'ParserWebUniversal/log_zakupki')
    .set('TendersUva', 'ParserWebGo/log_uva')
    .set('TendersAgrokomplex', 'ParserWebCore/log_agrocomplex')
    .set('TendersImperiaTorgov', 'UnParserSelen/log_imptorgov')
    .set('TendersKzGroup', 'ParserWebCore/log_kzgroup')
    .set('TendersAgroTomsk', 'ParserWebCore/log_agrotomsk')
    .set('TendersStroyTorgi', 'ParserWebFSharp/log_tenders_stroytorgi')
    .set('TendersSibPrime', 'UnParserSelen/log_sibprime')
    .set('TendersSibIntek', 'ParserWebCore/log_sibintek')
    .set('TendersAsgor', 'ParserWebFSharp/log_tenders_asgor')
    .set('TendersSetOnline', 'ParserWebCore/log_setonline')
    .set('TendersCrimeaBt', 'UnParserSelen/log_crimeabt')
    .set('TendersSalavat', 'ParserKotlinNew/logdir_tenders_salavat')
    .set('TendersGosYakut', 'ParserWebCore/log_gosyakut')
    .set('TendersIceTrade', 'ParserWebGo/log_icetrade')
    .set('TendersBelMarket', 'UnParserSelen/log_belmarket')
    .set('TendersUmzVrn', 'ParserKotlinNew/logdir_tenders_umz')
    .set('TendersMzVoron', 'ParserWebCore/log_mzvoron')
    .set('TendersBico', 'UnParserSelen/log_bico')
    .set('TendersRosTender', 'ParserWebFSharp/log_tenders_rostend')
    .set('TendersMaxiDevelopment', 'ParserWebCore/log_maxi')
    .set('TendersChebakulPt', 'ParserWebFSharp/log_tenders_chpt')
    .set('TendersTver', 'ParserWebCore/log_tver')
    .set('TendersMurman', 'ParserWebCore/log_murman')
    .set('TendersKalug', 'ParserWebCore/log_kalug')
    .set('TendersSmol', 'ParserWebCore/log_smol')
    .set('TendersSamar', 'ParserWebCore/log_samar')
    .set('TendersUdmurt', 'ParserWebCore/log_udmurt')
    .set('TendersRostov', 'UnParserSelen/log_rostov')
    .set('TendersSimferop', 'UnParserSelen/log_simferop')
    .set('TendersKostroma', 'UnParserSelen/log_kostroma')
    .set('TendersTomsk', 'UnParserSelen/log_tomsk')
    .set('TendersZmo', 'ParserWebCore/log_rtsmarket')
    .set('TendersTenderPlusKz', 'ParserWebFSharp/log_tenders_tplus')
    .set('TendersSegezha', 'ParserWebCore/log_segezha')
    .set('TendersAkashevo', 'ParserWebCore/log_akashevo')
    .set('TendersSibServ', 'ParserWebFSharp/log_tenders_sibserv')
    .set('TendersTenderGuru', 'ParserWebFSharp/log_tenders_tguru')
    .set('TendersSalym', 'ParserWebGo/log_salym')
    .set('TendersLsr2', 'ParserKotlinNew/logdir_tenders_lsr')
    .set('TendersBidMart', 'ParserWebFSharp/log_tenders_bidmart')
    .set('TendersSitno', 'ParserWebCore/log_sitno')
    .set('TendersMonetka', 'ParserWebGo/log_monetka')
    .set('TendersComita', 'ParserWebFSharp/log_tenders_comita')
    .set('TendersZmoKursk', 'ParserKotlinNew/logdir_tenders_zmokursk')
    .set('TendersZmo45', 'ParserKotlinNew/logdir_tenders_zmo45')
    .set('TendersZmoKurgan', 'ParserKotlinNew/logdir_tenders_zmokurgan')
    .set('TendersZmoChel', 'ParserKotlinNew/logdir_tenders_zmochel')
    .set('TendersTransAst', 'ParserKotlinNew/logdir_tenders_transast')
    .set('TendersAgEat', 'ParserKotlinNew/logdir_tenders_ageat')
    .set('TendersEshopRzd', 'ParserWebFSharp/log_tenders_eshoprzd')
    .set('TendersYarRegion', 'ParserWebFSharp/log_tenders_yarregion')
    .set('TendersBtg', 'ParserWebFSharp/log_tenders_btg')
    .set('TendersVend', 'ParserWebFSharp/log_tenders_vend')
    .set('TendersDtek', 'ParserWebGo/log_dtek')
    .set('TendersNaftan', 'ParserWebCore/log_naftan')
    .set('TendersMmk', 'ParserWebGo/log_mmk')
    .set('TendersLetoile', 'ParserWebGo/log_letoile')
    .set('TendersSistema', 'ParserWebGo/log_sistema')
    .set('TendersMetafrax', 'ParserWebGo/log_metafrax')
    .set('TendersIes', 'ParserWebGo/log_ies')
    .set('TendersUralChem', 'ParserWebGo/log_uralchem')
    .set('TendersPik', 'ParserWebFSharp/log_tenders_pik')
    .set('TendersGosZakaz', 'UnParserSelen/log_goszakaz')
    .set('TendersNorNic', 'ParserWebFSharp/log_tenders_nornic')
    .set('TendersRwBy', 'ParserWebCore/log_rwby')
    .set('TendersTenderer', 'ParserWebFSharp/log_tenders_tenderer')
    .set('TendersSamolet', 'ParserWebFSharp/log_tenders_samolet')
    .set('TendersMts', 'ParserWebCore/log_mts')
    .set('TendersNefaz', 'WebParserRust/logdir_nefaz')
    .set('TendersKamgb', 'WebParserRust/logdir_kamgb')
    .set('TendersUds', 'WebParserRust/logdir_uds')
    .set('TendersBeeline', 'ParserWebFSharp/log_tenders_beeline')
    .set('TendersMegafon', 'WebParserRust/logdir_megafon')
    .set('TendersGosBy', 'ParserWebGo/log_gosby')
    .set('TendersTekKom', 'ParserWebGo/log_tekkom')
    .set('TendersTekMarket', 'ParserWebGo/log_tekmarket')
    .set('TendersTekMos', 'ParserWebGo/log_tekmos')
    .set('TendersAhstep', 'WebParserRust/logdir_ahstep')
    .set('TendersSalavat1', 'WebParserRust/logdir_salavat')
    .set('MlConformity', 'ParserWebCore/log_mlconf')
    .set('TendersRTSRZD', 'ParserWebUniversal/log_rtsrzd')
    .set('TendersRzn', 'ParserKotlinNew/logdir_tenders_rzn')
    .set('TendersBrn', 'ParserKotlinNew/logdir_tenders_brn')
    .set('TendersAriba', 'ParserWebFSharp/log_tenders_ariba')
    .set('TendersZmoIvan', 'ParserKotlinNew/logdir_tenders_ivan')
    .set('TendersZmoOrel', 'ParserKotlinNew/logdir_tenders_orel')
    .set('TendersTekRn', 'ParserWebCore/log_tekrn')
    .set('TendersZmoNov', 'ParserKotlinNew/logdir_tenders_nov')
    .set('TendersZmoKomi', 'ParserKotlinNew/logdir_tenders_komi')
    .set('TendersZmoKalin', 'ParserKotlinNew/logdir_tenders_kalin')
    .set('TendersZmoNen', 'ParserKotlinNew/logdir_tenders_nen')
    .set('TendersZmoYalta', 'ParserKotlinNew/logdir_tenders_yalta')
    .set('TendersZmoDag', 'ParserKotlinNew/logdir_tenders_dag')
    .set('TendersZmoStav', 'ParserKotlinNew/logdir_tenders_stav')
    .set('TendersZmoChuv', 'ParserKotlinNew/logdir_tenders_chuv')
    .set('TendersZmoCheb', 'ParserKotlinNew/logdir_tenders_cheb')
    .set('TendersZmoHant', 'ParserKotlinNew/logdir_tenders_hant')
    .set('TendersZmoNeft', 'ParserKotlinNew/logdir_tenders_neft')
    .set('TendersZmoPPP', 'ParserKotlinNew/logdir_tenders_ppp')
    .set('TendersZmoSurgut', 'ParserKotlinNew/logdir_tenders_surgut')
    .set('TendersZmoMagnit', 'ParserKotlinNew/logdir_tenders_magnit')
    .set('TendersZmoOmsk', 'ParserKotlinNew/logdir_tenders_omsk')
    .set('TendersZmoOmskObl', 'ParserKotlinNew/logdir_tenders_omskobl')
    .set('TendersZmoIrkObl', 'ParserKotlinNew/logdir_tenders_irkobl')
    .set('TendersZmoAltay', 'ParserKotlinNew/logdir_tenders_altay')
    .set('TendersZmoHakas', 'ParserKotlinNew/logdir_tenders_hakas')
    .set('TendersZmoZabay', 'ParserKotlinNew/logdir_tenders_zabay')
    .set('TendersZmoNovosib', 'ParserKotlinNew/logdir_tenders_novosib')
    .set('TendersZmoTpu', 'ParserKotlinNew/logdir_tenders_tpu')
    .set('TendersZmoGorTomsk', 'ParserKotlinNew/logdir_tenders_gortomsk')
    .set('TendersZmoTsu', 'ParserKotlinNew/logdir_tenders_tsu')
    .set('TendersZmoTusur', 'ParserKotlinNew/logdir_tenders_tusur')
    .set('TendersZmoTgasu', 'ParserKotlinNew/logdir_tenders_tgasu')
    .set('TendersZmoTuva', 'ParserKotlinNew/logdir_tenders_tuva')
    .set('TendersZmoGzalt', 'ParserKotlinNew/logdir_tenders_gzalt')
    .set('TendersZmoAmurObl', 'ParserKotlinNew/logdir_tenders_amurobl')
    .set('TendersZmoDvrt', 'ParserKotlinNew/logdir_tenders_dvrt')
    .set('TendersAlrosa', 'ParserKotlinNew/logdir_tenders_alrosa')
    .set('TendersFromEIS44', 'ParserTenders/log_tenders_web44')
    .set('SignProj44', 'ParserTenders/log_sign_proj44')
    .set('TendersAfkAst', 'ParserKotlinNew/logdir_tenders_afkast')
    .set('TendersNorNic1', 'WebParserRust/logdir_nornic')
    .set('PContr223', 'ParserFSharpN/logdir_Pcotntr223')
    .set('TendersApk', 'ParserWebGo/log_apk')
    .set('TendersPewete', 'WebParserRust/logdir_pewete')
    .set('TendersQuadra', 'WebParserRust/logdir_quadra')
    .set('TendersTsm', 'UnParserSelen/log_tsm')
    .set('TendersTmk', 'ParserKotlinNew/logdir_tenders_tmk')
    .set('PlanGraph44', 'ParserTenderPlan/log_plan44')
    .set('TendersTgk14', 'WebParserRust/logdir_tgk14')
    .set('TendersAztpa', 'ParserWebGo/log_aztpa')
    .set('TendersEvraz', 'ParserKotlinNew/logdir_tenders_evraz')
    .set('TendersMedsi', 'UnParserSelen/log_medsi')
    .set('TendersLada', 'WebParserRust/logdir_lada')
    .set('TendersZmoRosles', 'ParserKotlinNew/logdir_tenders_rosles')
    .set('TendersBrn32', 'ParserWebCore/log_brn32')
    .set('TendersSmart', 'ParserWebFSharp/log_tenders_smart')
    .set('TendersAsia', 'WebParserRust/logdir_asia')
    .set('TendersRtsGen', 'ParserWebFSharp/log_tenders_rtsgen')
    .set('TendersRusNano', 'ParserKotlinNew/logdir_tenders_rusnano')
    .set('TendersEldorado', 'WebParserRust/logdir_eldorado')
    .set('TendersMosobl', 'WebParserRust/logdir_mosobl')
    .set('TendersBaltika', 'WebParserRust/logdir_baltika')
    .set('TendersAlfa', 'WebParserRust/logdir_alfa')
    .set('TendersSmp', 'WebParserRust/logdir_smp')
    .set('TendersTj', 'ParserWebFSharp/log_tenders_tj')
    .set('TendersPromUa', 'ParserPromUa/logdir_PromUa')
    .set('TendersUzex', 'ParserKotlinNew/logdir_tenders_uzex')
    .set('TendersTurk', 'ParserWebFSharp/log_tenders_turk')
    .set('TendersAchi', 'ParserKotlinNew/logdir_tenders_achi')
    .set('TendersKg', 'ParserWebFSharp/log_tenders_kg')
    .set('TendersAm', 'WebParserRust/logdir_am')
    .set('TendersEten', 'ParserWebFSharp/log_tenders_eten')
    .set('TendersAzer', 'WebParserRust/logdir_azer')
    .set('TendersVipAst', 'ParserKotlinNew/logdir_tenders_vipast')
    .set('TendersRetailAst', 'ParserKotlinNew/logdir_tenders_retailast')
    .set('TendersNeftAst', 'ParserKotlinNew/logdir_tenders_neftast')
    .set('TendersDochki', 'WebParserRust/logdir_dochki')
    .set('TendersSportMaster', 'ParserWebCore/log_sportmaster')
    .set('TendersCisLink', 'ParserWebFSharp/log_tenders_cislink')
    .set('TendersTekSil', 'ParserWebGo/log_teksil')
    .set('TendersPetr', 'ParserWebFSharp/log_tenders_petr')
    .set('TendersSberb2b', 'ParserWebCore/log_sberb2b')
    .set('TendersRosatom', 'ParserWebGo/log_rosatom')
    .set('TendersExuzex', 'ParserKotlinNew/logdir_tenders_exusex')
    .set('TendersUngi', 'WebParserRust/logdir_ungi')
    .set('TendersPostAst', 'ParserKotlinNew/logdir_tenders_postast')
    .set('TendersCbrfAst', 'ParserKotlinNew/logdir_tenders_cbrfast')
    .set('TendersMpkz', 'ParserWebFSharp/log_tenders_mpkz')
    .set('TendersRuscoal', 'WebParserRust/logdir_ruscoal')
    .set('TendersAzs', 'WebParserRust/logdir_azs')
    .set('TendersEstoreSpb', 'ParserWebFSharp/log_tenders_estorespb')
    .set('TendersRosAgro', 'ParserWebFSharp/log_tenders_rosagro')
    .set('TendersNeftReg', 'ParserWebFSharp/log_tenders_neftreg')
    .set('TendersForScience', 'ParserWebFSharp/log_tenders_forscience')
    .set('TendersVolgZmo', 'ParserWebFSharp/log_tenders_volgzmo')
    .set('TendersZakupMos', 'ParserWebCore/log_zakupmos')
    .set('TendersRusal', 'ParserWebFSharp/log_tenders_rusal')
    .set('TendersNordstar', 'WebParserRust/logdir_nordstar')
    .set('TendersProtek', 'ParserKotlinNew/logdir_tenders_protek')
    .set('TendersMoek', 'ParserWebFSharp/log_tenders_moek')
    .set('TendersTpsre', 'ParserWebGo/log_tpsre')
    .set('TendersAgat', 'ParserWebCore/log_agat')
    .set('TendersDmtu', 'ParserKotlinNew/logdir_tenders_dmtu')
    .set('TendersUni', 'ParserWebFSharp/log_tenders_unistream')
    .set('TendersRencredit', 'ParserKotlinNew/logdir_tenders_rencredit')
    .set('TendersOrpnz', 'ParserKotlinNew/logdir_tenders_orpnz')
    .set('TendersKsk', 'ParserWebFSharp/log_tenders_ksk')
    .set('TendersIngrad', 'WebParserRust/logdir_ingrad')
    .set('TendersRubex', 'ParserWebCore/log_rubex')
    .set('TendersBerel', 'ParserKotlinNew/logdir_tenders_berel')
    .set('TendersKaprem', 'WebParserRust/logdir_kaprem')
    .set('TendersSamcom', 'ParserWebCore/log_samcom')
    .set('TendersGmt', 'ParserWebFSharp/log_tenders_gmt')
    .set('TendersYmz', 'ParserWebFSharp/log_tenders_ymz')
    .set('TendersUnipro', 'ParserWebFSharp/log_tenders_unipro')
    .set('TendersApps', 'ParserWebFSharp/log_tenders_apps')
    .set('TendersRavis', 'ParserWebCore/log_ravis')
    .set('TendersBoaz', 'ParserWebCore/log_boaz')
    .set('TendersVgtrk', 'ParserKotlinNew/logdir_tenders_vgtrk')
    .set('TendersTekTkp', 'ParserWebGo/log_tektkp')
    .set('TendersRtsZmo', 'ParserWebCore/log_rtszmo')
    .set('TendersSeverStal', 'ParserWebFSharp/log_tenders_severstal')
    .set('TendersMedic', 'ParserWebFSharp/log_tenders_medic')
    .set('TendersAorti', 'ParserKotlinNew/logdir_tenders_aorti')
    .set('TendersKurganKhim', 'ParserKotlinNew/logdir_tenders_kurgankhim')
    .set('TendersOilb2b', 'ParserKotlinNew/logdir_tenders_oilb2b')
    .set('TendersDomRfAst', 'ParserKotlinNew/logdir_tenders_domrfast')
    .set('TendersEnPlusAst', 'ParserKotlinNew/logdir_tenders_enplusast')
    .set('TendersBidzaar', 'ParserWebFSharp/log_tenders_bidzaar')
    .set('TendersMetholding', 'ParserWebFSharp/log_tenders_metodholding')
    .set('TendersUralmash', 'ParserWebCore/log_uralmash')
    .set('TendersKamaz', 'ParserKotlinNew/logdir_tenders_kamaz')
    .set('TendersLotOnline', 'ParserWebCore/log_lotonline')
    .set('TendersBhm', 'ParserWebFSharp/log_tenders_bhm')
    .set('TendersEtpu', 'ParserWebCore/log_etpu')
    .set('TendersDellin', 'ParserWebCore/log_dellin')
    .set('TendersIsmt', 'ParserWebCore/log_ismt')
    .set('TendersTpta', 'ParserWebCore/log_tpta')
    .set('TendersDomRu', 'ParserWebFSharp/log_tenders_domru')
    .set('TendersSnHz', 'WebParserRust/logdir_snhz')
    .set('TendersSamaraGips', 'ParserWebFSharp/log_tenders_samaragips')
    .set('TendersGoldenSeed', 'ParserWebFSharp/log_tenders_goldenseed')
    .set('TendersKaustik', 'ParserWebFSharp/log_tenders_kaustik')
    .set('TendersDme', 'ParserWebFSharp/log_tenders_dme')
    .set('TendersTele2', 'ParserWebFSharp/log_tenders_tele2')
    .set('TendersOsnova', 'ParserWebFSharp/log_tenders_osnova')
    .set('TendersAbsGroup', 'ParserWebCore/log_absgroup')
    .set('TendersSibGenco', 'ParserWebFSharp/log_tenders_sibgenco')
    .set('TendersVtbConnect', 'ParserWebFSharp/log_tenders_vtbconnect')
    .set('TendersRb2b', 'ParserWebCore/log_rb2b')
    .set('TendersEuroTrans', 'UnParserSelen/log_eurotrans')
    .set('TendersRhTorg', 'UnParserSelen/log_rhtorg')
    .set('TendersFederal', 'ParserWebCore/log_federal')
    .set('TendersRtCi', 'ParserWebFSharp/log_tenders_rtci')
    .set('TendersForumGd', 'ParserWebFSharp/log_tenders_forumgd')
    .set('TendersZakazRf', 'ParserKotlinNew/logdir_tenders_zakazrf')
    .set('TendersBidBe', 'ParserKotlinNew/logdir_tenders_bidbe')
    .set('TendersB2BWeb', 'ParserWebCore/log_b2bweb')
    .set('TendersEnergyBase', 'ParserWebFSharp/log_tenders_energybase')
    .set('PriceRequest44', 'PriceRequest44/logdir_Request44')
    .set('TendersGpbPriceRequest', 'ParserWebCore/log_gpb')
    .set('TendersStrateg', 'ParserWebCore/log_strateg')
    .set('TendersEtpRt', 'ParserWebFSharp/log_tenders_etprt')
    .set('TendersComitaZmo', 'ParserWebFSharp/log_tenders_comitazmo')
    .set('PriceRequest44New', 'ParserTenders/log_preq44')
    .set('TendersTenderIt', 'ParserWebCore/log_tenderit')
    .set('TendersKuzocm', 'ParserWebCore/log_kuzocm')
    .set('TendersZdship', 'ParserWebCore/log_zdship')
    .set('TendersEstp', 'ParserWebFSharp/log_tenders_estp')
    .set('TendersMagnitStroy', 'ParserWebFSharp/log_tenders_magnitstroy')
    .set('TendersPptk', 'ParserWebCore/log_pptk')
    .set('TendersDpd', 'ParserWebCore/log_dpd')
    .set('TendersKkbank', 'ParserWebCore/log_kkbank')
    .set('TendersGipVn', 'ParserWebCore/log_gipvn')
    .set('TendersBngf', 'ParserWebCore/log_bngf')
    .set('TendersPnsh', 'UnParserSelen/log_pnsh')
    .set('TendersWorkspace', 'ParserWebCore/log_workspace')
    .set('TendersSpnova', 'ParserKotlinNew/logdir_tenders_spnova')
    .set('TendersNeftisa', 'ParserWebFSharp/log_tenders_neftisa')
    .set('TendersVprom', 'ParserKotlinNew/logdir_tenders_vprom')
    .set('TendersKopemash', 'ParserWebCore/log_kopemash')
    .set('TendersAomsz', 'ParserKotlinNew/logdir_tenders_aomsz')
    .set('TendersRusfish', 'ParserWebCore/log_rusfish')
    .set('TendersUralair', 'ParserWebCore/log_uralair')
    .set('TendersSochipark', 'ParserWebCore/log_sochipark')
    .set('TendersTekRusGazBur', 'ParserWebGo/log_tekrusgazbur')
    .set('TendersTekRosImport', 'ParserWebGo/log_tekrosimport')
    .set('TendersTekTyumen', 'ParserWebGo/log_tektyumen')
    .set('TendersKorabel', 'ParserWebCore/log_korabel')
    .set('TendersEurosib', 'ParserWebCore/log_eurosib')
    .set('TendersBelorusNeft', 'ParserWebFSharp/log_tenders_belorusneft')
    .set('TendersIshim', 'ParserWebFSharp/log_tenders_ishim')
    .set('TendersFpk', 'ParserKotlinNew/logdir_tenders_fpk')
    .set('TendersBarnaulTm', 'ParserWebFSharp/log_tenders_barnaultm')
    .set('TendersBorets', 'ParserKotlinNew/logdir_tenders_borets')
    .set('TendersTknso', 'ParserKotlinNew/logdir_tenders_tknso')
    .set('TendersGns', 'ParserKotlinNew/logdir_tenders_gns')
    .set('TendersSpgr', 'ParserWebCore/log_spgr')
    .set('TendersRcs', 'ParserWebCore/log_rcs')
    .set('TendersYangPur', 'ParserWebCore/log_yangpur')
    .set('TendersTulaRegion', 'ParserWebFSharp/log_tenders_tularegion')
    .set('TendersKpResort', 'ParserWebCore/log_kpresort')
    .set('TendersStniva', 'ParserWebCore/log_stniva')
    .set('TendersLenReg', 'ParserWebCore/log_lenreg')
    .set('TendersDsk1', 'ParserKotlinNew/logdir_tenders_dsk1')
    .set('TendersSlaveco', 'UnParserSelen/log_slaveco')
    .set('TendersBrusnika', 'UnParserSelen/log_brusnika')
    .set('TendersDvina', 'ParserWebCore/log_dvina')
    .set('TendersKursk', 'ParserWebCore/log_kursk')
    .set('TendersUfin', 'ParserWebCore/log_ufin')
    .set('TendersTatar', 'ParserWebCore/log_tatar')
    .set('TendersTverZmo', 'ParserWebCore/log_tverzmo')
    .set('TendersBash', 'ParserWebCore/log_bash')
    .set('TendersCds', 'ParserKotlinNew/logdir_tenders_cds')
    .set('TendersMidural', 'ParserWebCore/log_midural')
    .set('TendersMordov', 'ParserWebCore/log_mordov')
    .set('TendersKurg', 'ParserWebCore/log_kurg')
    .set('TendersSngb', 'ParserWebFSharp/log_tenders_sngb')
    .set('TendersMobWin', 'ParserWebCore/log_mobwin')
    .set('TendersTekSibur', 'ParserWebGo/log_teksibur')
    .set('ParserTekRn', 'ParserWebCore/log_tekrn')
    .set('TendersStroyServ', 'ParserKotlinNew/logdir_tenders_stroyserv')
    .set('TendersAcron', 'ParserWebCore/log_acron')
    .set('TendersEtpdon', 'UnParserSelen/log_etpdon')
    .set('TendersTambov', 'ParserWebCore/log_tambov')
    .set('TendersMolskaz', 'ParserKotlinNew/logdir_tenders_molskaz')
    .set('TendersAkbars', 'ParserKotlinNew/logdir_tenders_akbars')
    .set('TendersSminex', 'UnParserSelen/log_sminex')
    .set('TendersSnm', 'ParserKotlinNew/logdir_tenders_snm')
    .set('TendersTekPpk', 'ParserWebGo/log_tekppk')
    .set('TendersTekSpec', 'ParserWebGo/log_tekspec')
    .set('TendersMmkCoal', 'ParserKotlinNew/logdir_tenders_mmkcoal')
    .set('Grls', 'ParserWebGo/log_grls')
    .set('TendersPrNeft', 'ParserKotlinNew/logdir_tenders_prneft')
    .set('TendersZakazRfEx', 'ParserKotlinNew/logdir_tenders_zakazrfex')
    .set('TendersZakazRfUdmurt', 'ParserKotlinNew/logdir_tenders_zakazrfudmurt')
    .set('TendersEtpAgro', 'ParserKotlinNew/logdir_tenders_etpagro')
    .set('TendersOrelStroy', 'UnParserSelen/log_orelstroy')
    .set('TendersSevZakaz', 'ParserWebFSharp/log_tenders_sevzakaz')
    .set('TendersLevel', 'UnParserSelen/log_level')
    .set('TendersUdsOil', 'ParserWebCore/log_udsoil')
    .set('TendersUos', 'ParserWebCore/log_uos')
    .set('TendersZmk', 'ParserWebCore/log_zmk')
    .set('TendersTekmarketNew', 'ParserWebCore/log_tekmarket');


let map_description = new Map().set('Tenders44Fz', 'Закупки с http://zakupki.gov.ru/, ФЗ 44')
    .set('Tenders223Fz', 'Закупки с http://zakupki.gov.ru/, ФЗ 223')
    .set('TendersB2B', 'Закупки с https://www.b2b-center.ru, API, коммерческие')
    .set('TendersFabrikant', 'Закупки с https://www.fabrikant.ru/, API, коммерческие')   
    .set('TendersOTC', 'Закупки с https://otc.ru/, коммерческие')
    .set('Contracts44', 'Завершенные контракты с http://zakupki.gov.ru/, ФЗ 44, контракты и объекты контрактов')
    .set('TendersKomos', 'Закупки с http://zakupkikomos.ru, коммерческие')
    .set('Organizations44', 'Организации с http://zakupki.gov.ru/, ФЗ 44')
    .set('Organizations223', 'Организации с http://zakupki.gov.ru/, ФЗ 223')
    .set('Protocols44', 'Протоколы с http://zakupki.gov.ru/, ФЗ 44')
    .set('Protocols223', 'Протоколы с http://zakupki.gov.ru/, ФЗ 223')
    .set('TendersPRO', 'Закупки с http://www.tender.pro/, API, коммерческие')
    .set('Explations223', 'Разъяснения с http://zakupki.gov.ru/, ФЗ 223')
    .set('TendersGPB', 'Закупки с https://etp.gpb.ru/, API, коммерческие')    
    .set('TendersMrsk', 'Закупки с http://www.mrsksevzap.ru/, коммерческие')    
    .set('TendersSakhalinWeb', 'Закупки с http://www.sakhalinenergy.ru/, коммерческие')
    .set('Sign223', 'Подписанные контракты с http://zakupki.gov.ru/, ФЗ 223')    
    .set('TendersTektorgGazprom', 'Закупки с https://www.tektorg.ru/gazprom/, API,коммерческие')
    .set('TendersTektorgInterRao', 'Закупки с https://www.tektorg.ru/interao/, API, коммерческие')
    .set('TendersTektorgRZD', 'Закупки с https://www.tektorg.ru/rzd/, API, коммерческие')
    .set('Tenders615', 'Закупки с http://zakupki.gov.ru/, ФЗ 615')
    .set('TendersFromEIS', 'Закупки с Web-версии http://zakupki.gov.ru/, ФЗ 223')   
    .set('Complaint44', 'Жалобы с http://zakupki.gov.ru/, ФЗ 44')
    .set('ComplaintResult44', 'Результаты жалоб с http://zakupki.gov.ru/, ФЗ 44')
    .set('RNP', 'Реестр недобросовестных поставщиков с http://zakupki.gov.ru/, ФЗ 44')
    .set('TendersAkd', 'Закупки с http://www.a-k-d.ru/, коммерческие')
    .set('TendersButb', 'Закупки с http://zakupki.butb.by')
    .set('TendersIrkutskOil', '(новый реестр) Закупки с https://lkk.irkutskoil.ru/active-tenders/list, коммерческие')   
    .set('TendersPhosAgro', 'Закупки с https://www.phosagro.ru/, коммерческие')
    .set('TendersRusneft', 'Закупки с http://www.russneft.ru/, коммерческие')    
    .set('TendersBashNeft', 'Закупки с http://www.bashneft.ru/, коммерческие')   
    .set('TendersGPN', 'Закупки с http://zakupki.gazprom-neft.ru/, коммерческие')
    .set('TendersLukoil', 'Закупки с http://www.lukoil.ru/, коммерческие')
    .set('TendersMiratorg', 'Закупки с https://miratorg.ru/, коммерческие')
    .set('TendersPolis', 'Закупки с http://polyus.com/ru/, коммерческие')    
    .set('TendersSIBUR', 'Закупки с https://www.sibur.ru/, коммерческие')
    .set('TendersSTG', 'Закупки с https://tender.stg.ru/, коммерческие')
    .set('TendersTAtNeft', 'Закупки с http://www.tatneft.ru/, коммерческие')
    .set('TendersUralKaliy', 'Закупки с http://www.uralkali.com/, коммерческие')
    .set('TendersMvideo', 'Закупки с https://www.mvideo.ru/, коммерческие')
    .set('TendersSafMar', 'Закупки с http://www.safmargroup.ru/, коммерческие')
    .set('TendersTalan', 'Закупки с http://тендеры.талан.рф/, коммерческие')   
    .set('TendersKomTech', 'Закупки с http://zakupki.kom-tech.ru/, коммерческие')
    .set('OnlineContract', 'Закупки с http://onlinecontract.ru/, коммерческие')
    .set('RosElTorg', 'Закупки с https://www.roseltorg.ru/, коммерческие, все секции: Коммерческие, 223, Портал Москвы, Прочие, Бизнес, РОССЕТИ, РОСАТОМ (нет), КИМ, ВТБ, РУСГИДРО')
    .set('TendersCpc', 'Закупки с http://www.cpc.ru/, коммерческие')
    .set('DemoAccess', 'Запрос демо-доступа')
    .set('TendersMosReg', 'Закупки с https://market.mosreg.ru/, коммерческие')
    .set('TendersRfp', 'Закупки с https://www.rfp.ltd/, коммерческие')
    .set('TendersNeftAvtomatika', 'Закупки с https://www.nefteavtomatika.ru/, коммерческие')
    .set('TendersSlavNeft', 'Закупки с http://www.slavneft.ru/, коммерческие')   
    .set('TendersNovatek', 'Закупки с http://www.novatek.ru/, коммерческие')
    .set('TendersAzot', 'Закупки с http://zakupki.sbu-azot.ru/, коммерческие')
    .set('TendersUgmk', 'Закупки с http://www.ugmk.com/, коммерческие')
    .set('TendersZakupki', 'Закупки с https://www.zakupki.ru, коммерческие')
    .set('TendersUva', 'Закупки с http://tender.uva-moloko.ru/, коммерческие')
    .set('TendersAgrokomplex', 'Закупки с http://www.zao-agrokomplex.ru/, коммерческие')
    .set('TendersImperiaTorgov', 'Закупки с http://imperia-torgov.ru/, коммерческие')
    .set('TendersKzGroup', 'Закупки с http://kzgroup.ru/, коммерческие')
    .set('TendersAgroTomsk', 'Закупки с http://agro.zakupki.tomsk.ru/, коммерческие')
    .set('TendersStroyTorgi', 'Закупки с https://stroytorgi.ru/, коммерческие')
    .set('TendersSibPrime', 'Закупки с http://sibprime.ru/, коммерческие')
    .set('TendersSibIntek', 'Закупки с http://sibintek.ru/, коммерческие')
    .set('TendersAsgor', 'Закупки с https://etp.asgor.su/, коммерческие')
    .set('TendersSetOnline', 'Закупки с https://etp.setonline.ru/, коммерческие')
    .set('TendersCrimeaBt', 'Закупки с http://crimea.bt.su, все')
    .set('TendersSalavat', 'Закупки с http://salavat-neftekhim.gazprom.ru/, коммерческие')
    .set('TendersGosYakut', 'Закупки с http://market.goszakazyakutia.ru/, все')
    .set('TendersIceTrade', 'Закупки с http://www.icetrade.by/, все')
    .set('TendersBelMarket', 'Закупки с https://belgorodmarket-app.rts-tender.ru/, все')
    .set('TendersUmzVrn', 'Закупки с http://umz-vrn.etc.ru/, все')
    .set('TendersMzVoron', 'Закупки с http://mx3.keysystems.ru/, все')    
    .set('TendersRosTender', 'Закупки с http://rostender.info/, все')
    .set('TendersMaxiDevelopment', 'Закупки с http://maxi-cre.ru/, коммерческие')
    .set('TendersChebakulPt', 'Закупки с http://chpt.ru/, коммерческие')
    .set('TendersTver', 'Закупки с http://www.tver.ru/, все')
    .set('TendersMurman', 'Закупки с http://gz-murman.ru/, все')
    .set('TendersKalug', 'Закупки с http://mimz.tender.admoblkaluga.ru/, все')
    .set('TendersSmol', 'Закупки с http://goszakupki.admin-smolensk.ru/, все')
    .set('TendersSamar', 'Закупки с https://webtorgi.samregion.ru/, все')
    .set('TendersUdmurt', 'Закупки с http://wt.mfur.ru/, все')
    .set('TendersRostov', 'Закупки с https://rostovoblzmo.rts-tender.ru/, все')
    .set('TendersSimferop', 'Закупки с https://zakupki-simferopol.rts-tender.ru/, все')
    .set('TendersKostroma', 'Закупки с https://kostromarket.rts-tender.ru/, все')
    .set('TendersTomsk', 'Закупки с https://region70.rts-tender.ru/, все')
    .set('TendersZmo', 'Закупки с https://zmo.rts-tender.ru/, все ЗМО и ИМ, кроме коммерческих')
    .set('TendersTenderPlusKz', 'Закупки с https://tenderplus.kz/, все')
    .set('TendersSegezha', 'Закупки с https://segezha-group.com/providers/purchasing/, коммерческие')
    .set('TendersAkashevo', 'Закупки с http://akashevo.ru/, коммерческие')
    .set('TendersSibServ', 'Закупки с https://tp.sibserv.com/, коммерческие')
    .set('TendersTenderGuru', 'Закупки с http://www.tenderguru.ru/, коммерческие')
    .set('TendersSalym', 'Закупки с https://salympetroleum.ru/, коммерческие')
    .set('TendersLsr2', 'Закупки с http://zakupki.lsr.ru/, коммерческие')
    .set('TendersBidMart', 'Закупки с https://www.bidmart.by/, коммерческие')
    .set('TendersSitno', 'Закупки с http://sitno.ru/, коммерческие')
    .set('TendersMonetka', 'Закупки с http://www.monetka.ru/, коммерческие')
    .set('TendersComita', 'Закупки с https://etp.comita.ru/, коммерческие')
    .set('TendersZmoKursk', 'Закупки с https://zmokursk.rts-tender.ru/, все')
    .set('TendersZmo45', 'Закупки с https://zmo-g45.rts-tender.ru/, все')
    .set('TendersZmoKurgan', 'Закупки с https://kurgan-med-zmo.rts-tender.ru/, все')
    .set('TendersZmoChel', 'Закупки с https://chelyabinskmarket-app.rts-tender.ru/, все')
    .set('TendersTransAst', 'Закупки с http://utp.sberbank-ast.ru/Transneft/List/PurchaseList, коммерческие')
    .set('TendersAgEat', 'Закупки с https://agregatoreat.ru/, все')
    .set('TendersEshopRzd', 'Закупки с https://eshoprzd.ru/, все')
    .set('TendersYarRegion', 'Закупки с http://zakupki.yarregion.ru/, все')
    .set('TendersBtg', 'Закупки с http://www.btg.by/, все')
    .set('TendersVend', 'Закупки с http://vendorportal.ru/, все')    
    .set('TendersNaftan', 'Закупки с http://www.naftan.by/, все')
    .set('TendersMmk', 'Закупки с http://mmk.ru/, все')
    .set('TendersLetoile', 'Закупки с http://b2b.letoile.ru/, все')
    .set('TendersSistema', 'Закупки с http://www.sistema.ru/, все')
    .set('TendersMetafrax', 'Закупки с http://metafrax.ru/, все')   
    .set('TendersUralChem', 'Закупки с http://www.uralchem.ru/, все')
    .set('TendersPik', 'Закупки с https://tender.pik.ru/, все')
    .set('TendersGosZakaz', 'Закупки с http://goszakaz.by/, все')
    .set('TendersNorNic', 'Закупки с https://www.nornickel.ru/, все')
    .set('TendersRwBy', 'Закупки с https://www.rw.by/, все')
    .set('TendersTenderer', 'Закупки с http://www.tenderer.ru/, коммерческие')
    .set('TendersSamolet', 'Закупки с https://samoletgroup.ru/, все')
    .set('TendersMts', 'Закупки с https://tenders.mts.ru/, все')
    .set('TendersNefaz', 'Закупки с http://www.nefaz.ru/, все')
    .set('TendersKamgb', 'Закупки с http://www.kamgb.ru/, все')
    .set('TendersUds', 'Закупки с http://uds-group.ru/, все')
    .set('TendersBeeline', 'Закупки с https://beeline.ru/, все')
    .set('TendersMegafon', 'Закупки с http://corp.megafon.ru/, все')
    .set('TendersGosBy', 'Закупки с http://www.goszakupki.by/, все')
    .set('TendersTekKom', 'Закупки с https://www.tektorg.ru/223-fz/procedures, все')
    .set('TendersTekMarket', 'Закупки с https://www.tektorg.ru/market/procedures, все')
    .set('TendersTekMos', 'Закупки с https://www.tektorg.ru/mosenergo/procedures, все')
    .set('TendersAhstep', 'Закупки с https://ahstep.ru/tender, все')
    .set('TendersSalavat1', 'Закупки с http://gazpromss.ru/, все')
    .set('MlConformity', 'Прогнозирование типа размещения тендера с использованием машинного обучения')
    .set('TendersRTSRZD', 'Закупки с https://rzd.rts-tender.ru/, все')
    .set('TendersRzn', 'Закупки с https://ryazanvitrinatorgov-app.rts-tender.ru/, все')
    .set('TendersBrn', 'Закупки с https://zm-tender32.rts-tender.ru/, все')
    .set('TendersAriba', 'https://service.ariba.com/, все')
    .set('TendersZmoIvan', 'Закупки с https://ivanovobl-zmo.rts-tender.ru/, все')
    .set('TendersZmoOrel', 'Закупки с https://zmo-orel.rts-tender.ru/, все')
    .set('TendersTekRn', '149 Закупки с https://www.tektorg.ru/rosnefttkp/procedures, (Т)КП Роснефть')   
    .set('TendersAlrosa', 'Закупки с https://zakupki.alrosa.ru/, все')
    .set('TendersFromEIS44', 'Закупки с Web-версии http://zakupki.gov.ru/, ФЗ 44, 504')
    .set('SignProj44', 'Подписанные контракты с http://zakupki.gov.ru/, ФЗ 44')
    .set('TendersAfkAst', 'Закупки с http://utp.sberbank-ast.ru/AFK/List/PurchaseList/, коммерческие')
    .set('TendersNorNic1', 'Закупки с http://www.zf.norilsknickel.ru/, все')
    .set('PContr223', 'Договора с  http://zakupki.gov.ru/, ФЗ 223')
    .set('TendersApk', 'Закупки с http://tender-apk.ru/, все')
    .set('TendersPewete', 'Закупки с http://tender.pewete.com/, все')
    .set('TendersQuadra', 'Закупки с https://trade.quadra.ru/, все')
    .set('TendersTsm', 'Закупки с https://tender.tsm.ru/, все')
    .set('TendersTmk', 'Закупки с https://zakupki.tmk-group.com/, все')
    .set('PlanGraph44', 'План-графики с http://zakupki.gov.ru/, ФЗ 44')
    .set('TendersTgk14', 'Закупки с https://www.tgk-14.com/, все')
    .set('TendersAztpa', 'Закупки с https://zakupki.aztpa.ru/, все')
    .set('TendersEvraz', 'Закупки с http://supply.evraz.com/, все')
    .set('TendersMedsi', 'Закупки с https://medsi.ru/, все')    
    .set('TendersZmoRosles', 'Закупки с https://roslesinforg-market.rts-tender.ru/, все')
    .set('TendersBrn32', 'Закупки с http://tender32.ru/, ЗМО, все НОМЕРА есть в реестре https://zmo.rts-tender.ru/')   
    .set('TendersRtsGen', 'Закупки с https://223.rts-tender.ru/supplier/auction/Trade/Search.aspx, все коммерческие, кроме ЗМО и ИМ')
    .set('TendersRusNano', 'Закупки с https://www.b2b-rusnano.ru/, все')
    .set('TendersEldorado', 'Закупки с https://www.eldorado.ru/, все')
    .set('TendersMosobl', 'Закупки с https://mosoblbank.ru/, все')  
    .set('TendersSmp', 'Закупки с https://smpbank.ru/, все')    
    .set('TendersVipAst', 'Закупки с http://utp.sberbank-ast.ru/VIP/List/PurchaseList/, все')
    .set('TendersRetailAst', 'Закупки с http://utp.sberbank-ast.ru/Retail/List/PurchaseList/, все: ДИКСИ')
    .set('TendersNeftAst', 'Закупки с http://utp.sberbank-ast.ru/Neft/List/PurchaseList/, все')  
    .set('TendersSportMaster', 'Закупки с http://zakupki.sportmaster.ru/, все')
    .set('TendersCisLink', 'Закупки с http://auction.cislink.com/, все: Х5, АШАН, МАГНИТ')
    .set('TendersTekSil', 'Закупки с https://www.tektorg.ru/silovyi_machine/procedures/, все')
    .set('TendersPetr', 'Закупки с https://eshop-ptz.ru/purchases/, все')
    .set('TendersSberb2b', 'Закупки с https://sberb2b.ru/, все')
    .set('TendersRosatom', 'Закупки с http://zakupki.rosatom.ru/, все')
    .set('TendersExuzex', 'Закупки с https://exarid.uzex.uz/, все')
    .set('TendersUngi', 'Закупки с http://ungi.uz/, все')
    .set('TendersPostAst', 'Закупки с http://utp.sberbank-ast.ru/RussianPost/List/PurchaseList/, все')
    .set('TendersCbrfAst', 'Закупки с http://utp.sberbank-ast.ru/CBRF/List/PurchaseList/, все')
    .set('TendersMpkz', 'Закупки с https://mp.kz/, все')
    .set('TendersRuscoal', 'Закупки с https://www.ruscoal.ru/, все')
    .set('TendersAzs', 'Закупки с https://azsgazprom.ru/, все')
    .set('TendersEstoreSpb', 'Закупки с https://estore.gz-spb.ru/, все')
    .set('TendersRosAgro', 'Закупки с https://www.rosagroleasing.ru/, все')
    .set('TendersNeftReg', 'Закупки с https://etp.neftregion.ru/, все')   
    .set('TendersVolgZmo', 'Закупки с https://szvo.gov35.ru/, все')
    .set('TendersZakupMos', 'Закупки с https://zakupki.mos.ru/, все')
    .set('TendersRusal', 'Закупки с https://rusal.ru/, все')
    .set('TendersNordstar', 'Закупки с https://nordstar.ru/, все')
    .set('TendersProtek', 'Закупки с https://protek.ru/, все')
    .set('TendersMoek', 'Закупки с https://www.moek.ru/, все')
    .set('TendersTpsre', 'Закупки с https://www.tpsre.ru/, все')
    .set('TendersAgat', 'Закупки с https://agat-group.com/, все')
    .set('TendersDmtu', 'Закупки с http://anomtu.ru/, все')
    .set('TendersUni', 'Закупки с https://unistream.ru/, все')
    .set('TendersRencredit', 'Закупки с https://rencredit.ru/, все')
    .set('TendersOrpnz', 'Закупки с https://www.ornpz.ru/, все')
    .set('TendersKsk', 'Закупки с http://www.gt-ksk.com/, все')
    .set('TendersIngrad', 'Закупки с https://tenders.ingrad.ru/, все')
    .set('TendersRubex', 'Закупки с https://rubexgroup.ru/, все')
    .set('TendersBerel', 'Закупки с https://berelcomp.ru/, все')
    .set('TendersKaprem', 'Закупки с http://kapremont02.ru/, все')
    .set('TendersSamcom', 'Закупки с https://samcomsys.ru/, все')
    .set('TendersGmt', 'Закупки с http://gazprom-gmt.ru/, все')
    .set('TendersYmz', 'Закупки с https://www.ymzmotor.ru/, все')
    .set('TendersUnipro', 'Закупки с http://unipro.energy/, все')
    .set('TendersApps', 'Закупки с https://apps.chtpz.ru/, все')
    .set('TendersRavis', 'Закупки с http://ravistender.ru/, все')
    .set('TendersBoaz', 'Закупки с http://boaz-konkurs.ru/, все')
    .set('TendersVgtrk', 'Закупки с https://tendering.vgtrk.com/, все')
    .set('TendersTekTkp', 'Закупки с https://www.tektorg.ru/rosnefttkp/procedures, все')
    .set('TendersRtsZmo', 'Закупки с https://www.rts-tender.ru/zmo/corporatemall, все')
    .set('TendersSeverStal', 'Закупки с https://www.severstal.com/, все')
    .set('TendersMedic', 'Закупки с https://tender.medicina.ru/, все')
    .set('TendersAorti', 'Закупки с https://www.aorti.ru/, все')
    .set('TendersKurganKhim', 'Закупки с https://kurgankhimmash-zaproscen.ru/, все')
    .set('TendersOilb2b', 'Закупки с https://oilb2bcs.ru/, все')
    .set('TendersDomRfAst', 'Закупки с https://utp.sberbank-ast.ru/Main/List/UnitedPurchaseListTradeDomRF, все')
    .set('TendersEnPlusAst', 'Закупки с https://utp.sberbank-ast.ru/Main/List/UnitedPurchaseListEnPlusGroup, все')
    .set('TendersBidzaar', 'Закупки с https://bidzaar.com/, все')
    .set('TendersMetholding', 'Закупки с http://metholding.com/, все')
    .set('TendersUralmash', 'Закупки с https://uralmash-kartex.ru/, все')
    .set('TendersKamaz', 'Закупки с https://kamaz.ru/, все')
    .set('TendersLotOnline', 'Закупки с https://market.lot-online.ru/, все')
    .set('TendersBhm', 'Закупки с http://www.oaobhm.ru/tender/, все')
    .set('TendersEtpu', 'Закупки с https://torgi.etpu.ru/, все')
    .set('TendersDellin', 'Закупки с https://etp.dellin.ru/, все')
    .set('TendersIsmt', 'Закупки с http://is-mt.pro/, все')
    .set('TendersTpta', 'Закупки с https://www.tpta.ru/, все')
    .set('TendersDomRu', 'Закупки с https://zakupki.domru.ru/, все')
    .set('TendersSnHz', 'Закупки с https://snhz.ru/, все')
    .set('TendersSamaraGips', 'Закупки с https://samaragips.ru/, все')
    .set('TendersGoldenSeed', 'Закупки с https://www.goldenseed.ru/, все')
    .set('TendersKaustik', 'Закупки с https://www.kaustik.ru/, все')
    .set('TendersDme', 'Закупки с https://market.dme.aero/, все')
    .set('TendersTele2', 'Закупки с https://msk.tele2.ru/, все')
    .set('TendersOsnova', 'Закупки с https://tender.gk-osnova.ru/, все')
    .set('TendersAbsGroup', 'Закупки с https://tender.absgroup.ru/, все')
    .set('TendersSibGenco', 'Закупки с https://sibgenco.ru/, все')
    .set('TendersVtbConnect', 'Закупки с https://www.vtbconnect.ru/, все')
    .set('TendersRb2b', 'Закупки с https://zakupki.rb2b.ru/, все')
    .set('TendersEuroTrans', 'Закупки с http://tender.eurotransstroy.ru/, все')
    .set('TendersRhTorg', 'Закупки с http://rhtorg.com/, все')
    .set('TendersFederal', 'Закупки с https://t2.federal1.ru/, все')
    .set('TendersRtCi', 'Закупки с https://zakupki.rt-ci.ru/, все')
    .set('TendersForumGd', 'Закупки с https://tender.forum-gd.ru/, все')
    .set('TendersZakazRf', 'Закупки с http://bp.zakazrf.ru/, все')   
    .set('TendersB2BWeb', 'Закупки с https://www.b2b-center.ru/, все')    
    .set('PriceRequest44', 'Запросы цен по ФЗ 44 с ЕИС')
    .set('TendersGpbPriceRequest', 'Закупки с https://etp.gpb.ru/, все')
    .set('TendersStrateg', 'Закупки с https://strateg-etp.ru/, все')
    .set('TendersEtpRt', 'Закупки с https://etp-rt.ru/, все')
    .set('TendersComitaZmo', 'Закупки с https://etp.comita.ru/, закупки малого объема')
    .set('PriceRequest44New', 'Запросы цен по 44 ФЗ с https://zakupki.gov.ru')
    .set('TendersTenderIt', 'Закупки с https://tenderit.ru/, все')
    .set('TendersKuzocm', 'Закупки с https://etp.kuzocm.ru/, все')
    .set('TendersZdship', 'Закупки с http://tender.zdship.ru/, все')
    .set('TendersEstp', 'Закупки с http://estp.ru/, ЭМ')
    .set('TendersMagnitStroy', 'Закупки с http://tender.magnitostroy.su/, все')
    .set('TendersPptk', 'Закупки с https://pptk-mos.ru/, все')
    .set('TendersDpd', 'Закупки с https://www1.dpd.ru/, все')
    .set('TendersKkbank', 'Закупки с https://kk.bank/, все')
    .set('TendersGipVn', 'Закупки с http://gipvn.ru/, все')
    .set('TendersBngf', 'Закупки с https://bngf.ru/, все')
    .set('TendersPnsh', 'Закупки с https://tender.pnsh.ru/, все')
    .set('TendersWorkspace', 'Закупки с https://workspace.ru/, все')
    .set('TendersSpnova', 'Закупки с http://www.snpnova.com/, все')
    .set('TendersNeftisa', 'Закупки с https://www.neftisa.ru/, все')
    .set('TendersVprom', 'Закупки с https://voltyre-prom.ru/, все')
    .set('TendersKopemash', 'Закупки с https://www.kopemash.ru/, все')
    .set('TendersAomsz', 'Закупки с https://aomsz.ru/, все')
    .set('TendersRusfish', 'Закупки с https://russianfishery.ru/, все')
    .set('TendersUralair', 'Закупки с https://www.uralairlines.ru/, все')
    .set('TendersSochipark', 'Закупки с https://www.sochipark.ru/, все')
    .set('TendersTekRusGazBur', 'Закупки с https://www.tektorg.ru/rusgazburenie/procedures/, все')
    .set('TendersTekRosImport', 'Закупки с https://www.tektorg.ru/rosmorport/procedures/, все')
    .set('TendersTekTyumen', 'Закупки с https://www.tektorg.ru/portal_tyumen/procedures/, все ЗМО Текторг Тюменская обл')
    .set('TendersKorabel', 'Закупки с https://www.korabel.ru/, все')
    .set('TendersEurosib', 'Закупки с https://www.eurosib-td.ru/, все')
    .set('TendersBelorusNeft', 'Закупки с http://www.belorusneft-siberia.ru/, все')
    .set('TendersIshim', 'Закупки с http://etp.ishim-agro.ru/, все')
    .set('TendersFpk', 'Закупки с https://fpkinvest.ru/, все')
    .set('TendersBarnaulTm', 'Закупки с http://www.barnaultransmash.ru/, все')
    .set('TendersBorets', 'Закупки с http://tenderborets.ru/, все')
    .set('TendersTknso', 'Закупки с http://tknso.ru/, все')
    .set('TendersGns', 'Закупки с https://www.gns-tender.ru/, все')
    .set('TendersSpgr', 'Закупки с http://procurement.spgr.ru/, все')
    .set('TendersRcs', 'Закупки с http://rcs-e.ru/, все')
    .set('TendersYangPur', 'Закупки с http://www.yangpur.ru/, все')
    .set('TendersTulaRegion', 'Закупки с https://zakupki.tularegion.ru/, все')
    .set('TendersKpResort', 'Закупки с https://zakup.kpresort.ru/, все')
    .set('TendersStniva', 'Закупки с https://trade.stniva.ru/, все')
    .set('TendersLenReg', 'Закупки с https://zakupki.lenreg.ru/, все')
    .set('TendersDsk1', 'Закупки с https://tender.dsk1.ru/, все')
    .set('TendersSlaveco', 'Закупки с https://tender.slaveco.ru/, все')
    .set('TendersBrusnika', 'Закупки с https://srm.brusnika.ru/, все')
    .set('TendersDvina', 'Закупки с https://zakupki.dvinaland.ru/, все')
    .set('TendersKursk', 'Закупки с http://zak.imkursk.ru/, все')
    .set('TendersUfin', 'Закупки с http://goszakaz.ufin48.ru/, все')
    .set('TendersTatar', 'Закупки с https://etpzakupki.tatar/, все')
    .set('TendersTverZmo', 'Закупки с https://www.tver.ru/, все')
    .set('TendersBash', 'Закупки с https://zakaz.bashkortostan.ru/, все')
    .set('TendersCds', 'Закупки с https://tender.cds.spb.ru/, все')
    .set('TendersMidural', 'Закупки с https://torgi.midural.ru/, все')   
    .set('TendersSngb', 'Закупки с https://www.sngb.ru/, все')
    .set('TendersMobWin', 'Закупки с https://www.mobile-win.ru/, все оператор Мобайл Крым')
    .set('TendersTekSibur', 'Закупки с https://www.tektorg.ru/sibur/procedures, все')
    .set('ParserTekRn', ' 362 Закупки с https://www.tektorg.ru/rosneft/procedures, все Роснефть кроме ТКП')
    .set('TendersTj', 'СНГ Закупки с http://test.zakupki.gov.tj/, все Таджикистан')    
    .set('TendersUzex', 'СНГ Закупки с https://dxarid.uzex.uz/, все Узбекистан')
    .set('TendersTurk', 'СНГ Закупки с https://turkmenportal.com/, все Туркменистан')
    .set('TendersAchi', 'СНГ Закупки с https://achizitii.md/, все Молдова')
    .set('TendersKg', 'СНГ Закупки с http://zakupki.gov.kg/, все Кыргызстан')
    .set('TendersAm', 'СНГ Закупки с http://procurement.am/, все Армения')    
    .set('TendersAzer', 'СНГ Закупки с http://ru.azerbaijan.tenderinfo.org/, все Азербайджан')
    .set('TendersZmoNov', 'Закупки с https://market-nov.rts-tender.ru/, все ЗМО Н-Новгород')
    .set('TendersZmoKomi', 'Закупки с https://komimarket-app.rts-tender.ru/, ЗМО все Коми')
    .set('TendersZmoKalin', 'Закупки с https://market.gov39.ru/, все ЗМО Калининград')
    .set('TendersZmoNen', 'Закупки с https://naomarket-app.rts-tender.ru/, все')
    .set('TendersZmoYalta', 'Закупки с https://yalta-zmo.rts-tender.ru/, все ЗМО Ялта')
    .set('TendersZmoDag', 'Закупки с https://marketrd.rts-tender.ru/, все')
    .set('TendersZmoStav', 'Закупки с https://stavzmo.rts-tender.ru/, все')
    .set('TendersZmoChuv', 'Закупки с https://zmo21.rts-tender.ru/, все')
    .set('TendersZmoCheb', 'Закупки с https://chebzmo.rts-tender.ru/, все')
    .set('TendersZmoHant', 'Закупки с https://ozhmao-zmo.rts-tender.ru/, все')
    .set('TendersZmoNeft', 'Закупки с https://uganskzmo.rts-tender.ru/, все')
    .set('TendersZmoPPP', 'Закупки с https://pppmarket.rts-tender.ru/, все')
    .set('TendersZmoSurgut', 'Закупки с https://admsr-zmo.rts-tender.ru/, все')
    .set('TendersZmoMagnit', 'Закупки с https://magnitogorskmarket.rts-tender.ru/, все')
    .set('TendersZmoOmsk', 'Закупки с https://zmo-omsk.rts-tender.ru/, все')
    .set('TendersZmoOmskObl', 'Закупки с https://zmo-omskobl.rts-tender.ru/, все')
    .set('TendersZmoIrkObl', 'Закупки с https://irkoblmarket.rts-tender.ru/, все')
    .set('TendersZmoAltay', 'Закупки с https://zmo04.rts-tender.ru/, все')
    .set('TendersZmoHakas', 'Закупки с https://zmo19.rts-tender.ru/, все')
    .set('TendersZmoZabay', 'Закупки с https://zmo-zab.rts-tender.ru/, все')
    .set('TendersZmoNovosib', 'Закупки с https://novobl-zmo.rts-tender.ru/, все')
    .set('TendersZmoTpu', 'Закупки с https://tpu.rts-tender.ru/, все')
    .set('TendersZmoGorTomsk', 'Закупки с https://tomsk.rts-tender.ru/, все ЗМО Томск')
    .set('TendersZmoTsu', 'Закупки с https://tsu.rts-tender.ru/, все')
    .set('TendersZmoTusur', 'Закупки с https://tusur.rts-tender.ru/, все')
    .set('TendersZmoTgasu', 'Закупки с https://tgasu.rts-tender.ru/, все')
    .set('TendersZmoTuva', 'Закупки с https://tuva-zmo.rts-tender.ru/, все')
    .set('TendersZmoGzalt', 'Закупки с https://gzalt.rts-tender.ru/, все')
    .set('TendersZmoAmurObl', 'Закупки с https://zmo-amurobl.rts-tender.ru/, все')
    .set('TendersZmoDvrt', 'Закупки с https://zmodvrt.rts-tender.ru/, все')
    .set('TendersStroyServ', 'Закупки с https://stroyservis.com/, все')
    .set('TendersAcron', 'Закупки с https://etp.acron.ru/, все')
    .set('TendersEtpdon', 'Закупки с https://etpdon.online/, все')
    .set('TendersTambov', 'Закупки с https://torgi.tambov.gov.ru/, все')
    .set('TendersMolskaz', 'Закупки с https://molskaz.priceflow.ru/, все')
    .set('TendersAkbars', 'Закупки с https://akbarsstroi.ru/, все')
    .set('TendersSminex', 'Закупки с https://tender.sminex.com/, все')
    .set('TendersSnm', 'Закупки с http://www.snm.ru/, все')
    .set('TendersTekPpk', 'Закупки с https://www.tektorg.ru/portone/procedures/, все')
    .set('TendersTekSpec', 'Закупки с https://www.tektorg.ru/sntrans/procedures, все')
    .set('TendersMmkCoal', 'Закупки с http://mmk-coal.ru/pokupatelyam-i-postavshchikam/tendery/, все')
    .set('TendersPrNeft', 'Закупки с http://www.prneft.ru/, все')
    .set('Grls', 'GRLS')
    .set('TendersAlfa', 'НЕ РАБОТАЕТ Закупки с https://alfabank.ru/tenders/current/, все, ссылки ведут на https://www.b2b-center.ru/market/')
    .set('TendersBaltika', 'НЕ РАБОТАЕТ Закупки с https://corporate.baltika.ru/, все')
    .set('TendersLada', 'НЕ РАБОТАЕТ Закупки с https://lada-image.ru/, все')
    .set('TendersKurg', 'Закупки с https://zakupki.45fin.ru/, все')
    .set('TendersBico', 'Закупки с https://www.bicotender.ru/, все')
    .set('TendersTander', 'НЕ РАБОТАЕТ Закупки с http://magnit-info.ru/, коммерческие, есть на B2B')
    .set('TendersEtpRF', 'НЕ РАБОТАЕТ (КАПЧА) Закупки с http://etprf.ru/, коммерческие')
    .set('TendersRTS', 'НЕ РАБОТАЕТ Закупки с https://www.rts-tender.ru/, коммерческие')
    .set('TendersX5Group', 'НЕ РАБОТАЕТ Закупки с https://www.x5.ru/ru/, коммерческие')
    .set('TendersUkr', 'ОТКЛЮЧЕН Закупки с https://прозорро.укр/')
    .set('TendersLSR', 'ОТКЛЮЧЕН Закупки с http://zakupki.lsrgroup.ru/, коммерческие')
    .set('TendersDixy', 'ОТКЛЮЧЕН Закупки с https://dixy.ru/, коммерческие')
    .set('TendersSpecTorgWeb', 'ОТКЛЮЧЕН Закупки с https://www.sstorg.ru/, коммерческие')
    .set('TendersObTorgWeb', 'ОТКЛЮЧЕН Закупки с https://www.oborontorg.ru/, коммерческие')
    .set('TendersRosneftWeb', 'НЕ РАБОТАЕТ Закупки с https://www.tektorg.ru/procedures, коммерческие')
    .set('TendersGNTWeb', 'ОТКЛЮЧЕН Закупки с https://www.gazneftetorg.ru/, коммерческие')
    .set('TendersAeroFlot', 'ОТКЛЮЧЕН Закупки с https://www.aeroflot.ru/ru-ru/, коммерческие')
    .set('TendersDtek', 'ОТКЛЮЧЕН Закупки с https://tenders.dtek.com/, все')
    .set('TendersIes', 'ОТКЛЮЧЕН ПУСТОЙ РЕЕСТР  Закупки с http://zakupki.ies-holding.com/, все Т ПЛЮС переехали на B2B')
    .set('TendersPromUa', 'ОТКЛЮЧЕН Закупки с https://zakupki.prom.ua/, все')
    .set('TendersForScience', 'ОТКЛЮЧЕН Закупки с https://4science.ru/, все')
    .set('TendersDochki', 'НЕ РАБОТАЕТ Закупки с https://www.dochkisinochki.ru/, все')
    .set('TendersEten', 'РЕЕСТР ПУСТОЙ Закупки с http://etender.gov.md/, все')
    .set('TendersSmart', 'ОТКЛЮЧЕН Закупки с https://smarttender.biz/, все')
    .set('TendersAsia', 'НЕ РАБОТАЕТ Закупки с https://asiacement.ru/, реестра нет, рассылают на почту, проходим регистрацию')
    .set('TendersEnergyBase', 'ОТКЛЮЧЕН cloudflare поиск решения Закупки с https://energybase.ru/, все')
    .set('TendersMordov', 'ПУСТОЙ РЕЕСТР Закупки с https://goszakaz44.e-mordovia.ru/portal/GzwRegistry/GosZakupMOGrid?ItemId=100&show_title=on, все ЗМО')
    .set('Contracts223OpenData', 'ОТКЛЮЧЕН Завершенные контракты с https://clearspending.ru/, ФЗ 223')
    .set('Customers223OpenData', 'ОТКЛЮЧЕН Заказчики с https://clearspending.ru/, ФЗ 223')
    .set('Suppliers223OpenData', 'ОТКЛЮЧЕН Поставщики с https://clearspending.ru/, ФЗ 223')
    .set('Contracts223', 'ПУСТОЙ КАТАЛОГ ОТЛОЖЕН Завершенные контракты с http://zakupki.gov.ru/, ФЗ 223')
    .set('TendersRosneft', 'ОТКЛЮЧЕН Закупки с http://ws-rn.tektorg.ru, коммерческие')
    .set('TendersBidBe', 'ОТКЛЮЧЕН Закупки с https://bidbe.ru/, все')
    .set('TendersZakazRfEx', 'Закупки с http://zakazrf.ru/NotificationEx, все')
    .set('TendersZakazRfUdmurt', 'Закупки с http://udmurtia.zakazrf.ru/DeliveryRequest, все')
    .set('TendersEtpAgro', 'Закупки с https://zakupka.etpagro.ru/, все')
    .set('TendersOrelStroy', 'Закупки с https://etzp.orelstroy.ru/, все')
    .set('TendersSevZakaz', 'Закупки с https://rks.sevzakaz.ru/, все')
    .set('TendersLevel', 'Закупки с https://etp.level.ru/, все')
    .set('TendersUdsOil', 'Закупки с https://udsoil.ru/, все')
    .set('TendersUos', 'Закупки с https://uos.ru/, все')
    .set('TendersZmk', 'Закупки с https://www.zmk.ru/, все')
    .set('TendersTekMarketNew', 'Закупки с https://www.tektorg.ru/market/procedures, все');


let export_map = [];
for (let m of map) {
    export_map.push([m[0], `${dir_prefix}${m[1]}`])
}

function get_description(key) {
    if (map_description.has(key)) {
        return map_description.get(key)
    } else {
        return ""
    }
}

module.exports.getDescription = get_description;
module.exports.tenders = export_map;
