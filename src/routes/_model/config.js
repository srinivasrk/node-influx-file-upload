const Influx = require('influx');
var path = require('path');
var fs = require('fs-extra');
let currentDir = process.cwd()


let cfgLocation = path.join(path.resolve(currentDir),'cfg');
console.log(cfgLocation)


let dbConfig;
dbConfig = fs.readJSONSync(path.join(cfgLocation, 'influx_dev_config.json')).dbConfig;


const connection = new Influx.InfluxDB(dbConfig);

module.exports.influx = connection;
