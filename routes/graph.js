let express = require('express');
let router = express.Router();
let fun = require('../fun_tools');
router.get('/:tenderType', function(req, res, next) {
    let tenType = req.params['tenderType'];
    res.render('graph', { title: 'График полученных и обновленных тендеров', tenderT: tenType});
});
module.exports = router;