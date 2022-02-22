const fs = require('fs');
const templateFile = 'template-export.yml';
let pkg = fs.readFileSync(templateFile).toString();
let regex = /CodeUri\:\ s3:\/\/([^\/]+)\/([0-9|a-f]+)/;
let bucket = pkg.match(regex)[1];
let key = pkg.match(regex)[2];
pkg = pkg.split('~~SOURCE_KEY~~').join(key);
pkg = pkg.split('~~SOURCE_BUCKET~~').join(bucket);
fs.writeFileSync(templateFile, pkg);
