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
    result += `<p>Тип тендера: ${dk[0]}</p>`;
    for (let f of dir_list) {
        let date = getDateFromString(f);
        let counts = getCountFromFile(`${dir}/${f}`);
        let param = `${dir}/${f}`.replace(/\//g, '--');
        result += `<p><strong>Дата: ${date}</strong></p>`;
        result += `<p><a href="/">Вернуться назад</a></p>`;
        result += `<p>Смотреть файл протокола: <a href='/tenders/${dk[0]}/${param}'>${dir}/${f}</a></p>`;
        result += "<ul>";
        for (let o of counts) {
            result += `<li>${o}</li>`;
        }
        result += "</br></br>";
        result += "</ul>";
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
    result += `<p>Смотреть отчеты: <a href='/tenders/${dir_l[0]}'>${dir_l[0]}</a></p><br></p>`;
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
        // сначала выведет первое совпадение: <h1>,h1
        // затем выведет второе совпадение: </h1>,/h1
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
        // сначала выведет первое совпадение: <h1>,h1
        // затем выведет второе совпадение: </h1>,/h1
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
    .set('ContractsOpenData', 'ParserContracts223Sharp/log_parsing')
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
    .set('BankGuarantee44', 'ParserUnfair/log_bank')
    .set('Complaint44', 'ParserUnfair/log_complaint')
    .set('ComplaintResult44', 'ParserUnfair/log_complaint_result')
    .set('RNP', 'ParserUnfair/log_rnp')
    .set('TendersAkd', 'ParserWebFSharp/log_tenders_akd')
    .set('TebdersButb', 'ParserWebFSharp/log_tenders_butb')
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
    .set('TendersStroyTorgi', 'ParserWebFSharp/log_tenders_stroytorgi');


let export_map = [];
for (let m of map) {
    export_map.push([m[0], `${dir_prefix}${m[1]}`])
}
module.exports.tenders = export_map;