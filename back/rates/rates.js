const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const axios = require('axios');

const dbService = 'http://localhost:3003';

const app = express();
app.use(bodyParser.json());

app.get('/rate/:date', (req, res) => {
    const { date } = req.params;
    getRateByDate(req, res, date);
});

function getRateByDate(req, res, date) {
    axios.get(`${ dbService }/rate/${ date }`)
        .then(async (response) => {
            if (response.status === 204) {
                await setPrivatRateByDate(date);
                getRateByDate(req, res, date);
            }
            else
                res.status(200).json(response.data);
        })
        .catch(err => {
            res.status(err.response ? err.response.status : 500).json(err.response ? err.response.data : err.message);
        });
}

function setPrivatRateByDate(date) {
    return axios.get(`https://api.privatbank.ua/p24api/exchange_rates?json&date=${ date }`)
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
                .then(() => {
                    console.log('success');
                })
                .catch(error => {
                    console.log('57 error');
                    console.log(error);
                    //console.log(error.response);
                });
        })
        .catch(error => {
            console.log('62 error');
            //console.log(error.response);
        });
}

function setNBURateByDate(date) {
    return axios.get(`https://bank.gov.ua/ua/tables/exchangerates?date=${ date }&period=daily`)
        .then(response => {
            const { data } = response;
            console.log(data);
            // const DBData = data.exchangeRate.map(pair => {
            //     const { baseCurrency, currency, saleRateNB, saleRate, purchaseRate } = pair;
            //     return {
            //         base_currency: baseCurrency,
            //         currency,
            //         rate_nb: saleRateNB,
            //         sale_privat: saleRate,
            //         purchase_privat: purchaseRate,
            //         date
            //     };
            // });

            axios.post(`${ dbService }/set-nbu-rates`, DBData)
                .then(() => {
                    console.log('success');
                })
                .catch(error => {
                    console.log(error);
                    //console.log(error.response);
                });
        })
        .catch(error => {
            //console.log(error.response);
        });
}

setNBURateByDate('6.12.2020');

const port = process.env.PORT || '3007';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Rates service running on localhost:${ port }`));