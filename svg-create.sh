if [[ ! -f config.file ]] ; then
    echo 'Please create "config.file".'
    exit
fi

source config.file

pattern="$svgOptimizedFolder/*.svg"
files=( $pattern )
for file in "${files[@]}"
do
    rm -v $file
done

svgo -f $svgSourceFolder -o $svgOptimizedFolder
node index.js
