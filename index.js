const fs = require('fs');

if (!fs.existsSync('./config.json')) {
    console.log('\x1b[31m', 'Please create config.json', '\x1b[0m');
    process.exit();
}

const config = require('./config.json');
const path = require('path');
const mustache = require('mustache');

if (!fs.existsSync(config.templateScss)) {
    console.log('\x1b[31m', 'SCSS template is missing. Please check config.json', '\x1b[0m');
    process.exit();
}
if (!fs.existsSync(config.templateHtml)) {
    console.log('\x1b[31m', 'HTML template is missing. Please check config.json', '\x1b[0m');
    process.exit();
}
if (!fs.existsSync(config.templateAll)) {
    console.log('\x1b[31m', 'HTML Template for all icons is missing. Please check config.json', '\x1b[0m');
    process.exit();
}

var view = { svgs: [] };
var folderView = {};
var allView = { svgs: [] };

var symbols = /[\r\n%#()<>?\[\\\]^`{|}="]/g;

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
    var reg = /^(.+?)--/;
    if (file.indexOf('c__') > 0) {
        var newName = file.replace('c__', '');
        return 'svg-' + newName.replace(reg, '');
    } else {
        return file.replace(reg, '');
    }
}

function getFolder(filename) {
    var file = filename.split('--');
    return file[0];
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
    if (uniqueNames.indexOf(uniqueName) !== -1) {
        console.log(file, sizeKb, '\x1b[31m', 'Skipped. Icon already exists', '\x1b[0m');
        return false;
    }
    uniqueNames.push(uniqueName);

    var itemHtml = {};
    var itemfolder = getFolder(file);
    itemHtml.name = uniqueName;
    itemHtml.width = sizes.width;
    itemHtml.height = sizes.height;
    itemHtml.paths = data.match(/\<svg(.+?)\>(.+?)\<\/svg\>/)[2];
    if(folderView[itemfolder] == undefined) {
        folderView[itemfolder] = { svgs: [] };
        folderView[itemfolder].svgs.push(itemHtml);
    } else {
        folderView[itemfolder].svgs.push(itemHtml);
    }
    allView.svgs.push(itemHtml);

    if (size > config.size) {
        console.log(file, sizeKb, '\x1b[31m', 'Not included for scss. File size limit rule', '\x1b[0m');
        return false;
    }

    var itemScss = {};
    itemScss.name = uniqueName;
    itemScss.width = sizes.width;
    itemScss.height = sizes.height;
    itemScss.fileName = file;
    if (data.split('<path').length - 1 === 1) {
        itemScss.inline = data.match(/d=\"(.+?)\"/)[1];
    } else {
        itemScss.inline = 'data:image/svg+xml;charset=utf8,' + encodeSVG(data);
    }
    view.svgs.push(itemScss);
    console.log(file, sizeKb, '\x1b[32m', 'Ok', '\x1b[0m');

    itemsProcessed++;
});

console.log('\n\n-------------\nTotal: ', itemsProcessed, '\n-------------\n\n');

var templateScss = fs.readFileSync(config.templateScss, 'utf8');
var newScssFile = mustache.render(templateScss, view);
fs.writeFile(config.scssFilePath, newScssFile, function(err) {
    if (err) {
        return console.log(err);
    }

    console.log('Scss file was saved!');
});

var templateAll = fs.readFileSync(config.templateAll, 'utf8');
var newAllFile = mustache.render(templateAll, allView);
fs.writeFile(config.allFilePath, newAllFile, function(err) {
    if (err) {
        return console.log(err);
    }

    console.log('Html file with all icons was saved!');
});

var templateHtml = fs.readFileSync(config.templateHtml, 'utf8');
for (const [key, value] of Object.entries(folderView)) {
    var newHtmlFile = mustache.render(templateHtml, value);
    var name = key.charAt(0).toUpperCase() + key.slice(1);
    fs.writeFile(config.htmlFilePath + 'sprite' + name + '.html', newHtmlFile, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log(key + ' sprite html file was saved!');
    });
}


