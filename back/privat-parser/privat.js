const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.get('/privat-rates', (req, res) => {
    axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            res.status(500).json({ message: error });
        });
});

const port = process.env.PORT || '3001';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Privat service running on localhost:${ port }`));