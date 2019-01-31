rm -r ./svg-optimized/*.svg
svgo -f ./svg -o ./svg-optimized
node index.js
