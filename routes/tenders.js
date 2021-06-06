let express = require('express');
let router = express.Router();
let fun = require('../fun_tools');
let contr = require('../controllers/getFileControllers');
/* GET home page. */
router.post('/ajax', contr.GetFileAjax);
router.get('/:tenderType', function (req, res, next) {
    let tenType = req.params['tenderType'];
    res.render('tenders', {title: 'Отчет', tenderT: tenType});
});
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Отчеты о парсинге', tenders: fun.tenders});
});
router.get('/:tenderType/:file', function (req, res, next) {
    let file = req.params['file'].replace(/--/g, '/');
    if (file.includes("srv/parsers") && file.endsWith(".log")) {
        let prev = req.params['tenderType'];
        res.render('file', {title: `Файл протокола работы парсера ${prev}`, file: file, prev: prev});
    } else {
        res.status(404).send('Not found');
    }

});
module.exports = router;