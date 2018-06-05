let express = require('express');
let router = express.Router();
let fun = require('../fun_tools');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Отчеты о парсинге', tenders: fun.tenders});
});
module.exports = router;
