# fret2svg
Creating inline svg variables from svg files

## Example
https://codepen.io/fret2buzz/pen/JxRKLV

## Usage

* Install svgo `npm install -g svgo`
* Put svg files into `svg` folder. Please note that `-mc.svg` means that file is multicolor.
* Update file `config.json`. There is a colors object. You can add colors according to your styleguide.
* Run `./svg-create.sh`
* Include `_svg.scss` into your code
* Use `inline-svg` mixin for icons



