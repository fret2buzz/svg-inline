const fs = require('fs');

if (!fs.existsSync('./config.json')) {
    console.log('Please create "config.json"');
    process.exit();
}

const config = require('./config.json');
const path = require('path');
const mustache = require('mustache');

var view = { svgs: [] };

var symbols = /[\r\n%#()<>?\[\\\]^`{|}]/g;

function encodeSVG(data) {
    data = data.replace(/'/g, '"');
    data = data.replace(/>\s{1,}</g, '><');
    data = data.replace(/\s{2,}/g, ' ');
    return data.replace(symbols, encodeURIComponent);
}

function getFilesize(filename) {
    const stats = fs.statSync(filename);
    const fileSize = (stats.size / 1000).toFixed(1);
    return fileSize;
}

function createVarName(filename) {
    var file = filename.replace('.svg', '');

    if (file.match(/^\d/)) {
        var newName = file.split('-');
        newName.shift();
        return 'svg-' + newName.join('-');
    } else {
        return file;
    }
}

function getWidthHeight(data) {
    var width = data.match(/width=\"(\d+)\"/);
    var height = data.match(/height=\"(\d+)\"/);
    var sizes = data.match(/viewBox=\"\d+ \d+ (\d+) (\d+)\"/);
    var size = null;

    if (width !== null || height !== null) {
        size = {
            width: width[1],
            height: height[1]
        };
    } else if (sizes !== null) {
        size = {
            width: sizes[1],
            height: sizes[2]
        };
    }

    return size;
}

var filesLength = fs.readdirSync(config.svgFolder).length;
var itemsProcessed = 0;
var uniqueNames = [];

fs.readdirSync(config.svgFolder).forEach(function(file, index) {
    if (path.extname(file) !== '.svg') return false;

    var data = fs.readFileSync(config.svgFolder + '/' + file, 'utf8');
    var size = getFilesize(config.svgFolder + '/' + file);
    var sizeKb = size + ' Kb';
    var sizes = getWidthHeight(data);
    var uniqueName = createVarName(file);

    if (sizes === null) {
        console.log(file, sizeKb, '\x1b[31m', 'Skipped. SVG has no size', '\x1b[0m');
        return false;
    }
    if (size > config.size) {
        console.log(file, sizeKb, '\x1b[31m', 'Skipped. File size limit rule', '\x1b[0m');
        return false;
    }
    if (uniqueNames.indexOf(uniqueName) !== -1) {
        console.log(file, sizeKb, '\x1b[31m', 'Skipped. Icon already exists', '\x1b[0m');
        return false;
    }
    uniqueNames.push(uniqueName);

    var item = {};
    item.name = uniqueName;
    item.width = sizes.width;
    item.height = sizes.height;
    item.fileName = file;
    if (data.split('<path').length - 1 === 1) {
        item.inline = data.match(/d=\"(.+?)\"/)[1];
    } else {
        item.inline = 'data:image/svg+xml;charset=utf8,' + encodeSVG(data);
    }
    view.svgs.push(item);
    console.log(file, sizeKb, '\x1b[32m', 'Ok', '\x1b[0m');

    itemsProcessed++;
});

var template = fs.readFileSync(config.template, 'utf8');
console.log('Total: ', itemsProcessed);
var svgFileContents = mustache.render(template, view);
fs.writeFile(config.scssFilePath, svgFileContents, function(err) {
    if (err) {
        return console.log(err);
    }

    console.log('The file was saved!');
});
