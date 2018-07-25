let express = require('express');
let router = express.Router();
let fun = require('../fun_tools');
/* GET home page. */
router.get('/:tenderType', function(req, res, next) {
    let tenType = req.params['tenderType'];
    res.render('tenders', { title: 'Отчет', tenderT: tenType});
});
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Отчеты о парсинге', tenders: fun.tenders});
});
router.get('/:tenderType/:file', function(req, res, next) {
    let file = req.params['file'].replace(/--/g, '/');
    let prev = req.params['tenderType'];
    res.render('file', { title: 'Файл протокола работы парсера', file: file, prev: prev});
});

module.exports = router;