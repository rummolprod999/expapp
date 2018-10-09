let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
    file = '/var/log/mariadb/mysql-slow.log';
    res.render('slow', { title: 'Лог медленных запросов', file: file});
});
module.exports = router;
