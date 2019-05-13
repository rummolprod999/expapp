const FileAjax = require('../models/fileModel');
module.exports.GetFileAjax = function (req, res, next) {
    let file = req.body.file;
    console.log(file);
    if (file.includes("tenders.enter-it.ru/python") && file.endsWith(".log")) {
        let r = FileAjax.getFileAjax(file);
        let f = JSON.stringify(({text: r}));
        res.json(f);
    } else {
        res.json(file);
    }

};