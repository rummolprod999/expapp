let fs = require('fs');
const hbs = require("hbs");

module.exports.getFileAjax = function (file) {
    let ftext = fs.readFileSync(file, "utf8");
    return ftext
};