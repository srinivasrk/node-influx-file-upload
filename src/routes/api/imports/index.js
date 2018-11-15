var csvparse = require('csv-parse');
const { DateTime } = require('luxon');
const _ = require('underscore');
const config = require('../../_model/config.js')
const schema = config.influx;

export function post(req, res, next){
  let rowCount = 0
  let points = []
  if(!req.files)
    return res.status(400).send('No files were uploaded');

  let sampleFile = req.files.file;
  var csv = csvparse();
  let task;
  let siteName = 'LM-FE-001'
  let generator = 'edit'
  let measurement =['level', 'velocity', 'flow']
  let units = ['in', 'ft/s', 'mgd']
  /*
    LM-FE-001,LM-FE-001,LM-FE-001
    generator,edit,edit,edit
    measurement,level,velocity ,flow
    units,in,ft/s,mgd
    method,,,
    location,,,
    number,1,1,1
  */
  csv.on('readable', () => {
    let r = csv.read();
    if (!r) return;
    if(rowCount > 6) {
      let timeStr = r.shift();
      let timestamp = DateTime.fromString(timeStr, 'M/d/yyyy H:mm', {zone: 'UTC-5'}).toUTC().toJSDate();
      let values = r.map(e => e.trim());
      let i = 0
      for(i = 0; i< values.length; i++) {
        let fv = parseFloat(values[i]);
        points.push({
          measurement : measurement[i],
          tags: {
            generator: 'edit',
            number: 3,
            units: units[i],
            number: 1
          },
          timestamp : timestamp,
          fields : {
            value: fv ? fv : 0
          }
        })
      }

    }
    rowCount = rowCount + 1
  });
  csv.on('error', (err) => {
    return res.status(500).send("Unable to parse the file");
  });
  csv.on('finish', () => {
    console.log("DONE");
    let promiseChain = Promise.resolve()
    let count = 0
    let writeBuffer = []
    console.log(points.length);
    _.each(points, (point) => {
      promiseChain = promiseChain.then(() => {
          writeBuffer.push(point)
          if(count == 100000) {
            console.log("Writing chunk to db");
            console.log(writeBuffer.length);
            count = count + 1
            return schema.writePoints(writeBuffer)
          }
          else if(count > 100000) {
            writeBuffer = []
            writeBuffer.push(point)
            count = 1
            return new Promise(function(resolve, reject) {
              resolve()
            });
          }
           else {
            count = count + 1
            return new Promise(function(resolve, reject) {
              resolve()
            });
          }
      })
    })
    promiseChain.then(() => {
      console.log("DONE with promise chain");
      schema.writePoints(writeBuffer).then(() => {
        // last batch of points
        return res.status(200).send("Reading complete")
      })

    })

  });

  csv.write(sampleFile.data);
  csv.end();
}

//test get method
export function get(req, res, next){
  res.write("get called");
  res.end();
}
