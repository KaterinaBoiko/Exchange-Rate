const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const http = require('http');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const rates = require('./rates/rates.router');
app.use('/rates', rates);

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Server service running on localhost:${port}`));