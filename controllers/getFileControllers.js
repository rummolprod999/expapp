const FileAjax = require('../models/fileModel');
module.exports.GetFileAjax = function (req, res, next) {
    let file = req.body.file;
    if (file.includes("tenders.enter-it.ru/python") && file.endsWith(".log")) {
        let res = FileAjax.getFileAjax(file);
        let f = JSON.stringify(({text: res}));
        res.json(f);
    } else {
        res.status(404).send('Not found');
    }

};