import express from 'express';
import compression from 'compression';
import * as sapper from '../__sapper__/server.js';
const bodyParser = require('body-parser');
import serve from 'serve-static';
const fileUpload = require('express-fileupload');

const app = express();
const { PORT = 3000 } = process.env;

app.use(fileUpload());
app.use(compression({ threshold: 0 }));
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({extended: false}))
app.use(serve('assets'));
app.use(serve('static'));
app.use(sapper.middleware()); // This line is updated in sapper v0.20

app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
});
