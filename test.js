const fs = require('fs');
const content = fs.readFileSync('ui/index.html', 'utf8');
console.log(content.indexOf('renderTokenWaterfall'));
console.log(content.indexOf('.waterfall-panel'));
