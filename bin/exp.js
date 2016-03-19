var options;
global.include = require(__dirname + "/include");
options = include(['options'])[0];
options.addAlias('p', 'port');
options.assume('port', 3000);
console.log(options);