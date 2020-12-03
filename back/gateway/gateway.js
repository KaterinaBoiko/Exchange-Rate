const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const axios = require('axios');

const privatService = 'http://localhost:3001';
const dbService = 'http://localhost:3003';

const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || '3000';
app.set('port', port);

app.get('/privat-rates', (req, res) => {
    axios.get(`${ privatService }/privat-rates`)
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            res.status(500).json({ message: error });
        });
});

app.get('/add-currencies', (req, res) => {
    axios.get(`${ dbService }/set-currencies`)
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            res.status(500).json({ message: error });
        });
});

app.get('/', (req, res) => {
    res.send('api works');
});

const server = http.createServer(app);
server.listen(port, () => console.log(`Gateway running on localhost:${ port }`));