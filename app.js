const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Basic Configuration 
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204 // app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

// Print to the console information about all requests made 
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} ${req.ip}`);
  next();
});

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index3.html');
});

const home = require('./routes/homeRoute');
const timestamp = require('./routes/timestampRoute');
const headerParser = require('./routes/headerParserRoute');
const urlShortener = require('./routes/urlShortenerRoute');

app.use('/api', home);
app.use('/api', timestamp);
app.use('/api', headerParser);
app.use('/api', urlShortener);

module.exports = app;