let express = require('express');
let router = express.Router();
let fun = require('../fun_tools');
/* GET home page. */
router.get('/:tenderType', function(req, res, next) {
    let tenType = req.params['tenderType'];
    res.render('tenders', { title: 'Отчет', tenderT: tenType});
});
router.get('/:tenderType/:file', function(req, res, next) {
    let file = req.params['file'].replace(/--/g, '/');
    res.render('file', { title: 'Файл протокола работы парсера', file: file});
});

module.exports = router;