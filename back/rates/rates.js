const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const api = require('./rates.router');

const app = express();
app.use(bodyParser.json());

app.use('/', api);

const port = process.env.PORT || '3007';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Rates service running on localhost:${ port }`));

module.exports = app; 