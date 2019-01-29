const fs = require('fs');
const mustache = require('mustache');
const config = require('./config.json');

var view = {"svgs": []};
var template = '';

var symbols = /[\r\n%#()<>?\[\\\]^`{|}]/g;
var svgFileContents = '';

function encodeSVG(data) {
    data = data.replace( /'/g, '"' );
    data = data.replace(/>\s{1,}</g, "><");
    data = data.replace(/\s{2,}/g, " ");
    return data.replace(symbols, encodeURIComponent);
}

function getFilesize(filename) {
    const stats = fs.statSync(filename);
    const fileSize = (stats.size / 1000).toFixed(1);
    return fileSize;
}

var filesLength = fs.readdirSync(config.svgFolder).length;
var itemsProcessed = 0;

fs.readdirSync(config.svgFolder).forEach(function(file, index) {
        var data = fs.readFileSync(config.svgFolder + file, 'utf8');
        var size = getFilesize(config.svgFolder + file);
        var sizeKb = size + ' Kb';

        if(size < config.size) {
            var item = {};
            item.name = file.replace('.svg', '');
            item.width = data.match(/width=\"(\d+)\"/)[1];
            item.height = data.match(/height=\"(\d+)\"/)[1];
            if (data.split('<path').length-1 === 1) {
                item.inline = data.match(/d=\"(.+?)\"/)[1];
            } else {
                item.inline = 'data:image/svg+xml;charset=utf8,' + encodeSVG(data);
            }
            view.svgs.push(item);

            console.log(file, sizeKb, '\x1b[32m', 'Ok', '\x1b[0m');
        } else {
            console.log(file, sizeKb, '\x1b[31m', 'Skipped', '\x1b[0m');
        }

        itemsProcessed++;

        if(itemsProcessed === filesLength) {
            template = fs.readFileSync(config.template, 'utf8');
            console.log('Total: ', itemsProcessed);
            svgFileContents = mustache.render(template, view);
            fs.writeFile(config.scssFilePath, svgFileContents, function(err) {
                if(err) {
                    return console.log(err);
                }

                console.log('The file was saved!');
            });
        }
});

