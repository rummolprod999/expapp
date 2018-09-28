let fs = require('fs');
const hbs = require("hbs");

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
    for (let f of dir_list) {
        let date = getDateFromString(f);
        let dateParts = date.split("-");
        if (dateParts[2].length === 4) {
            let ddd = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            dates.push(ddd);
        }
        else {
            dates.push(date);
        }
        let countsAdded = getAddedFromFile(`${dir}/${f}`);
        let countsUpdates = getUpdatedFromFile(`${dir}/${f}`);
        added.push(countsAdded);
        updated.push(countsUpdates);
    }
    let obb = [];
    for (let i = 0; i < added[0].length; i++) {
        let temp = [];
        let add = [];
        for (let j = 0; j < added.length; j++) {
            temp.push(added[j][i]);
            if (updated[j][i]) {
                add.push(updated[j][i])
            }
            else {
                add.push({})
            }
        }
        obb.push({dates: dates, counts: temp, added: add})
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
            }
            else {
                cc.push(0)
            }
        }
        for (let ccc of a[i].added) {
            if (ccc.count) {
                dd.push(ccc.count)
            }
            else {
                dd.push(0)
            }
        }
        result += `<div>${a[i].counts[0].name}</div><div id="tester${i}" style="width:800px;height:350px;"></div>
<script>
    TESTER${i} = document.getElementById('tester${i}');
    var trace1 = {
  x: ${JSON.stringify(a[i].dates)},
  y: ${JSON.stringify(cc) },
  name: 'Добавили',
  type: 'bar'
};

var trace2 = {
  x: ${JSON.stringify(a[i].dates)},
  y: ${JSON.stringify(dd) },
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
                }
                else {
                    cc.push(0)
                }
            }
            for (let ccc of a[i].added) {
                if (ccc.count) {
                    dd.push(ccc.count)
                }
                else {
                    dd.push(0)
                }
            }
            result += `<div>${a[i].counts[0].name}</div><div id="tester${i}_${d[0]}" style="width:800px;height:350px;"></div>
<script>
    TESTER${i}_${d[0]} = document.getElementById('tester${i}_${d[0]}');
    var trace1 = {
  x: ${JSON.stringify(a[i].dates)},
  y: ${JSON.stringify(cc) },
  name: 'Добавили',
  type: 'bar'
};

var trace2 = {
  x: ${JSON.stringify(a[i].dates)},
  y: ${JSON.stringify(dd) },
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
        result += `<p><a href="/">Вернуться назад</a></p>`;
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

module.exports.GetTenList = function (dir_l) {
    let result = "";
    result += `<p>Тип парсера: <strong>${dir_l[0]}</strong></p>`;
    result += `<p>Площадка: <strong>${get_description(dir_l[0])}</strong></p>`;
    result += `<p>Смотреть отчеты: <a href='/tenders/${dir_l[0]}'>${dir_l[0]}</a></p>`;
    result += `<p>Смотреть графики загрузки: <a href='/graph/${dir_l[0]}'>${dir_l[0]}</a></p><br></p>`;
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
        }
        else {
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
        }
        else {
            ob_list[index] = {name: free_string, count: ob_list[index].count + Number(match[1])}
        }
    }
    return ob_list

}

const dir_prefix = '/srv/tenders.enter-it.ru/python/';
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
    .set('TendersTektorgGazprom', 'ParserTenders/log_tektorg_gazprom')
    .set('TendersTektorgInterRao', 'ParserTenders/log_tektorg_interrao')
    .set('TendersTektorgRZD', 'ParserTenders/log_tektorg_rzd')
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
    .set('TendersRTS', 'ParserWebUniversal/log_rts')
    .set('TendersSIBUR', 'ParserWebUniversal/log_sibur')
    .set('TendersSTG', 'ParserWebUniversal/log_stg')
    .set('TendersTAtNeft', 'ParserWebUniversal/log_tat')
    .set('TendersUralKaliy', 'ParserWebUniversal/log_ural')
    .set('TendersMvideo', 'UnParserSelen/log_mvideo')
    .set('TendersSafMar', 'UnParserSelen/log_safmar')
    .set('TendersTalan', 'UnParserSelen/log_talan')
    .set('TendersTander', 'UnParserSelen/log_tander')
    .set('TendersKomTech', 'ParserWebGo/log_komtech')
    .set('OnlineContract', 'ParserWebGo/log_onlinecontract')
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
    .set('TendersGosYakut', 'ParserWebFSharp/log_tenders_gosyakut')
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
    .set('TendersZmo', 'UnParserSelen/log_zmo')
    .set('TendersTenderPlusKz', 'ParserWebFSharp/log_tenders_tplus')
    .set('TendersSegezha', 'ParserWebCore/log_segezha')
    .set('TendersAkashevo', 'ParserWebCore/log_akashevo')
    .set('TendersSibServ', 'ParserWebFSharp/log_tenders_sibserv')
    .set('TendersTenderGuru', 'ParserWebFSharp/log_tenders_tguru')
    .set('TendersSalym', 'ParserWebGo/log_salym')
    .set('TendersLsr2', 'ParserKotlinNew/logdir_tenders_lsr')
    .set('TendersBidMart', 'ParserWebFSharp/log_tenders_bidmart')
    .set('TendersSitno', 'ParserWebCore/log_sitno')
    .set('TendersMonetka', 'ParserWebGo/log_monetka');

let map_description = new Map().set('Tenders44Fz', 'Закупки с http://zakupki.gov.ru/, ФЗ 44')
    .set('Tenders223Fz', 'Закупки с http://zakupki.gov.ru/, ФЗ 223')
    .set('TendersB2B', 'Закупки с https://www.b2b-center.ru, коммерческие')
    .set('TendersFabrikant', 'Закупки с https://www.fabrikant.ru/, коммерческие')
    .set('TendersRosneft', 'Закупки с http://ws-rn.tektorg.ru, коммерческие')
    .set('TendersOTC', 'Закупки с https://otc.ru/, коммерческие')
    .set('Contracts223OpenData', 'Завершенные контракты с https://clearspending.ru/, ФЗ 223')
    .set('Customers223OpenData', 'Заказчики с https://clearspending.ru/, ФЗ 223')
    .set('Suppliers223OpenData', 'Поставщики с https://clearspending.ru/, ФЗ 223')
    .set('Contracts223', 'Завершенные контракты с http://zakupki.gov.ru/, ФЗ 223')
    .set('Contracts44', 'Завершенные контракты с http://zakupki.gov.ru/, ФЗ 44')
    .set('TendersKomos', 'Закупки с http://zakupkikomos.ru, коммерческие')
    .set('Organizations44', 'Организации с http://zakupki.gov.ru/, ФЗ 44')
    .set('Organizations223', 'Организации с http://zakupki.gov.ru/, ФЗ 223')
    .set('Protocols44', 'Протоколы с http://zakupki.gov.ru/, ФЗ 44')
    .set('Protocols223', 'Протоколы с http://zakupki.gov.ru/, ФЗ 223')
    .set('TendersPRO', 'Закупки с http://www.tender.pro/, коммерческие')
    .set('Explations223', 'Разъяснения с http://zakupki.gov.ru/, ФЗ 223')
    .set('TendersGPB', 'Закупки с https://etp.gpb.ru/, коммерческие')
    .set('TendersGNTWeb', 'Закупки с https://www.gazneftetorg.ru/, коммерческие')
    .set('TendersMrsk', 'Закупки с http://www.mrsksevzap.ru/, коммерческие')
    .set('TendersObTorgWeb', 'Закупки с https://www.oborontorg.ru/, коммерческие')
    .set('TendersRosneftWeb', 'Закупки с http://zakupki.rosneft.ru/, коммерческие')
    .set('TendersSakhalinWeb', 'Закупки с http://www.sakhalinenergy.ru/, коммерческие')
    .set('Sign223', 'Подписанные контракты с http://zakupki.gov.ru/, ФЗ 223')
    .set('TendersSpecTorgWeb', 'Закупки с https://www.sstorg.ru/, коммерческие')
    .set('TendersTektorgGazprom', 'Закупки с https://www.tektorg.ru/gazprom/, коммерческие')
    .set('TendersTektorgInterRao', 'Закупки с https://www.tektorg.ru/interao/, коммерческие')
    .set('TendersTektorgRZD', 'Закупки с https://www.tektorg.ru/rzd/, коммерческие')
    .set('Tenders615', 'Закупки с http://zakupki.gov.ru/, ФЗ 615')
    .set('TendersFromEIS', 'Закупки с Web-версии http://zakupki.gov.ru/, ФЗ 223, 44')
    .set('TendersUkr', 'Закупки с https://прозорро.укр/')
    .set('Complaint44', 'Жалобы с http://zakupki.gov.ru/, ФЗ 44')
    .set('ComplaintResult44', 'Результаты жалоб с http://zakupki.gov.ru/, ФЗ 44')
    .set('RNP', 'Реестр недобросовестных поставщиков с http://zakupki.gov.ru/, ФЗ 44')
    .set('TendersAkd', 'Закупки с http://www.a-k-d.ru/, коммерческие')
    .set('TendersButb', 'Закупки с http://zakupki.butb.by')
    .set('TendersIrkutskOil', 'Закупки с https://tenders.irkutskoil.ru/, коммерческие')
    .set('TendersLSR', 'Закупки с http://zakupki.lsrgroup.ru/, коммерческие')
    .set('TendersDixy', 'Закупки с https://dixy.ru/, коммерческие')
    .set('TendersPhosAgro', 'Закупки с https://www.phosagro.ru/, коммерческие')
    .set('TendersRusneft', 'Закупки с http://www.russneft.ru/, коммерческие')
    .set('TendersX5Group', 'Закупки с https://www.x5.ru/ru/, коммерческие')
    .set('TendersBashNeft', 'Закупки с http://www.bashneft.ru/, коммерческие')
    .set('TendersEtpRF', 'Закупки с http://etprf.ru/, коммерческие')
    .set('TendersGPN', 'Закупки с http://zakupki.gazprom-neft.ru/, коммерческие')
    .set('TendersLukoil', 'Закупки с http://www.lukoil.ru/, коммерческие')
    .set('TendersMiratorg', 'Закупки с https://miratorg.ru/, коммерческие')
    .set('TendersPolis', 'Закупки с http://polyus.com/ru/, коммерческие')
    .set('TendersRTS', 'Закупки с https://www.rts-tender.ru/, коммерческие')
    .set('TendersSIBUR', 'Закупки с https://www.sibur.ru/, коммерческие')
    .set('TendersSTG', 'Закупки с https://tender.stg.ru/, коммерческие')
    .set('TendersTAtNeft', 'Закупки с http://www.tatneft.ru/, коммерческие')
    .set('TendersUralKaliy', 'Закупки с http://www.uralkali.com/, коммерческие')
    .set('TendersMvideo', 'Закупки с https://www.mvideo.ru/, коммерческие')
    .set('TendersSafMar', 'Закупки с http://www.safmargroup.ru/, коммерческие')
    .set('TendersTalan', 'Закупки с http://тендеры.талан.рф/, коммерческие')
    .set('TendersTander', 'Закупки с http://magnit-info.ru/, коммерческие')
    .set('TendersKomTech', 'Закупки с http://zakupki.kom-tech.ru/, коммерческие')
    .set('OnlineContract', 'Закупки с http://onlinecontract.ru/, коммерческие')
    .set('RosElTorg', 'Закупки с https://www.roseltorg.ru/, коммерческие')
    .set('TendersCpc', 'Закупки с http://www.cpc.ru/, коммерческие')
    .set('DemoAccess', 'Запрос демо-доступа')
    .set('TendersMosReg', 'Закупки с https://market.mosreg.ru/, коммерческие')
    .set('TendersRfp', 'Закупки с https://www.rfp.ltd/, коммерческие')
    .set('TendersNeftAvtomatika', 'Закупки с https://www.nefteavtomatika.ru/, коммерческие')
    .set('TendersSlavNeft', 'Закупки с http://www.slavneft.ru/, коммерческие')
    .set('TendersAeroFlot', 'Закупки с https://www.aeroflot.ru/ru-ru/, коммерческие')
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
    .set('TendersBico', 'Закупки с https://www.bicotender.ru/, все')
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
    .set('TendersZmo', 'Закупки с https://zmo.rts-tender.ru/, все')
    .set('TendersTenderPlusKz', 'Закупки с https://tenderplus.kz/, все')
    .set('TendersSegezha', 'Закупки с https://segezha-group.com/, коммерческие')
    .set('TendersAkashevo', 'Закупки с http://akashevo.ru/, коммерческие')
    .set('TendersSibServ', 'Закупки с https://tp.sibserv.com/, коммерческие')
    .set('TendersTenderGuru', 'Закупки с http://www.tenderguru.ru/, коммерческие')
    .set('TendersSalym', 'Закупки с https://salympetroleum.ru/, коммерческие')
    .set('TendersLsr2', 'Закупки с http://zakupki.lsr.ru/, коммерческие')
    .set('TendersBidMart', 'Закупки с https://www.bidmart.by/, коммерческие')
    .set('TendersSitno', 'Закупки с http://sitno.ru/, коммерческие')
    .set('TendersMonetka', 'Закупки с http://www.monetka.ru/, коммерческие');
let export_map = [];
for (let m of map) {
    export_map.push([m[0], `${dir_prefix}${m[1]}`])
}
function get_description(key){
    if(map_description.has(key)){
        return map_description.get(key)
    }
    else{
        return ""
    }
}
module.exports.getDescription = get_description;
module.exports.tenders = export_map;