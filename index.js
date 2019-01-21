const svgFolder = './svg-files/';
const fs = require('fs');
const mustache = require('mustache');

var view = {"svgs": []};
var template = '';

fs.readFile('./template.mustache', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    template = data;
});

var symbols = /[\r\n%#()<>?\[\\\]^`{|}]/g;
var svgFileContents = '';
var svg = '';

function encodeSVG(data) {
    data = data.replace(/"/g, '\'');
    data = data.replace(/>\s{1,}</g, "><");
    data = data.replace(/\s{2,}/g, " ");

    return data.replace(symbols, encodeURIComponent);
}

var filesLength = fs.readdirSync(svgFolder).length;
var itemsProcessed = 0;

fs.readdirSync(svgFolder).forEach(function(file, index) {
    fs.readFile(svgFolder + file, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        // console.log(file, itemsProcessed);
        view.svgs[index] = {};
        view.svgs[index].name = file.replace('.svg', '');
        view.svgs[index].width = data.match(/width=\"(\d+)\"/)[1] + "px";
        view.svgs[index].height = data.match(/height=\"(\d+)\"/)[1] + "px";
        if (data.split('<path').length-1 === 1) {
            svg = data.replace(/fill=\"(.+?)\"/, 'fill="$color"');
        } else {
            svg = data;
        }
        view.svgs[index].inline = 'data:image/svg+xml;charset=utf8,' + encodeSVG(svg);

        itemsProcessed++;

        if(itemsProcessed === filesLength) {
            svgFileContents = mustache.render(template, view);
            fs.writeFile('./_svg.scss', svgFileContents, function(err) {
                if(err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
            });
        }
    });
});

