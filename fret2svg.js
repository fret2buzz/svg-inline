const svgFolder = './svg-files/';
const fs = require('fs');
var symbols = /[\r\n%#()<>?\[\\\]^`{|}]/g;
var svgFileContents = '';
var svg = '';

function encodeSVG( data ) {
    data = data.replace( /"/g, '\'' );
    data = data.replace( />\s{1,}</g, "><" );
    data = data.replace( /\s{2,}/g, " " );

    return data.replace( symbols, encodeURIComponent );
}

var filesLength = fs.readdirSync(svgFolder).length;
var itemsProcessed = 0;

fs.readdirSync(svgFolder).forEach(file => {
    fs.readFile(svgFolder + file, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        // console.log(file, itemsProcessed);

        var width = data.match(/width=\"(\d+)\"/)[1] + "px";
        var height = data.match(/height=\"(\d+)\"/)[1] + "px";
        var dims = width+ ", " + height;

        if (data.split('<path').length-1 === 1) {
            svg = data.replace(/fill=\"(.+?)\"/, 'fill="$color"');
        } else {
            svg = data;
        }

        svg = '$' + file.replace('.svg', '') + ': "data:image/svg+xml;charset=utf8,' + encodeSVG(svg) + '",';

        svgFileContents = svgFileContents + svg + dims + ";\n";
        itemsProcessed++;

        if(itemsProcessed === filesLength) {
            fs.writeFile('./svg.scss', svgFileContents, function(err) {
                if(err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
            });
        }
    });
});

