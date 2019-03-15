# svg-inline
Creating inline svg variables from svg files

## Example
https://codepen.io/fret2buzz/pen/VgZPaV?editors=0110

## Usage

* Install svgo `npm install -g svgo`
* Put svg files into `svg` folder. Please note that monochrome icons should have only 1 path.
* Copy config file `config.json.example` to `config.json`. Modify `config.json`.
* Run `./svg-create.sh`
* Include `_svg.scss` into your code
* Use `@include inline-svg-mono($var, #333)` for monochrome icons
* Use `@include inline-svg-multi($var)` for multicolor icons
