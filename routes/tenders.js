let express = require('express');
let router = express.Router();
let fun = require('../fun_tools');
/* GET home page. */
router.get('/:tenderType', function(req, res, next) {
    let tenType = req.params['tenderType'];
    res.render('tenders', { title: 'Отчет', tenderT: tenType});
});
module.exports = router;