let fs = require('fs');
const hbs = require("hbs");

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
    result += "<p>Тип тендера: " + dk[0] + "</p>";
    for (let f of dir_list) {
        let date = getDateFromString(f);
        let counts = getCountFromFile(`${dir}/${f}`);
        result += "<p><strong>Дата: " + date + "</strong></p>";
        result += "<p>Путь к файлу: " + `${dir}/${f}` + "</p>";
        result += "<ul>";
        for (let o of counts) {
            result += "<li>" + o + "</li>";
        }
        result += "</br></br>";
        result += "</ul>";
    }
    return new hbs.SafeString(result)


};
module.exports.GetTenList = function (dir_l) {
    let result = "";
    result += "<p>Тип тендера: <strong>" + dir_l[0] + "</strong></p>";
    result += "<p>Смотреть отчеты: " + "<a href='/tenders/" + dir_l[0] + "' >" + dir_l[0] + "</a>" + "</p>";
    return new hbs.SafeString(result)
};

function getDateFromString(s) {
    let reg = /(\d{4}-\d{2}-\d{2})/;
    if (s.match(reg)) {
        return s.match(reg)[0]
    }
    reg = /(\d{2}_\d{2}_\d{4})/;
    if (s.match(reg)) {
        return s.match(reg)[0]
    }

}

function getCountFromFile(s) {
    let ftext = fs.readFileSync(s, "utf8");
    let reg = /(Добав(или|лено)|Обнов(лено|или)) .* (\d+)/gm;
    return ftext.match(reg)

}

const dir_prefix = '/home/alex/WebstormProjects/expapp/tenders.enter-it.ru/python/';
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

;


let export_map = [];
for (let m of map) {
    export_map.push([m[0], `${dir_prefix}${m[1]}`])
}
module.exports.tenders = export_map;