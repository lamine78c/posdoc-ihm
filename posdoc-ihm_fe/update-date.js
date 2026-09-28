const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const now = new Date();
const dateLabel =  now.toISOString().replace('T',' ').replace('Z',''); 
packageJson.date = dateLabel.substring(0,dateLabel.length -4);
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

