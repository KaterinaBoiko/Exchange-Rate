const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const axios = require('axios');

const dbService = 'http://localhost:3003';

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

setPrivatCurrencyByDate('26.11.2020');

function setPrivatCurrencyByDate(date) {
    axios.get(`https://api.privatbank.ua/p24api/exchange_rates?json&date=${ date }`)
        .then(response => {
            const { data } = response;
            const DBData = data.exchangeRate.map(pair => {
                const { baseCurrency, currency, saleRateNB, saleRate, purchaseRate } = pair;
                return {
                    base_currency: baseCurrency,
                    currency,
                    rate_nb: saleRateNB,
                    sale_privat: saleRate,
                    purchase_privat: purchaseRate,
                    date
                };
            });

            axios.post(`${ dbService }/set-privat-rates`, DBData)
                .then(response => {
                    console.log('success');
                })
                .catch(error => {
                    console.log(error);
                });
        })
        .catch(error => {
            console.log(error);
        });
}


const port = process.env.PORT || '3001';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Privat service running on localhost:${ port }`));