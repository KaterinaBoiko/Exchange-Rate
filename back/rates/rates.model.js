const http = require('http');
const formatDate = require('dateformat');
const axios = require('axios');

const dbService = 'http://localhost:3003';

exports.getRateByDate = (req, res) => {
    const { date } = req.params;
    getRateByDate(req, res, date);
};

exports.getCurrencyPairs = (req, res) => {
    axios.get(`${ dbService }/currency-pairs`)
        .then(response => {
            res(null, response.data);
        })
        .catch(err => {
            res(err.response);
        });
};

exports.getCurrencyDetails = (req, res) => {
    const { currency } = req.params;
    axios.get(`${ dbService }/details/${ currency }`)
        .then(response => {
            const answer = response.data;
            const params = getFormatedtFromToDates(req);
            axios.get(`${ dbService }/interval-rates/${ currency }`, { params })
                .then(response => {
                    if (!response.data.length)
                        return res(null, 'No data avaliable');
                    res(null, { ...answer, data: response.data });
                })
                .catch(err => {
                    res(err.response ? err.response.data : err.message);
                });
        })
        .catch(err => {
            res(err.response);
        });
};

exports.getCurrentNBURate = (req, res) => {
    const date = formatDate(new Date(), "d.m.yyyy");
    axios.get(`${ dbService }/nbu-rate/${ date }`)
        .then(async (response) => {
            if (response.status === 204) {
                await setPrivatRateByDate(date);
                getRateByDate(req, res, date);
            }
            else
                res(null, response.data);
        })
        .catch(err => {
            res(err.response);
        });
};

exports.convert = (req, res) => {
    const { amount, currency, base_currency } = req.query;

    if (isNaN(amount))
        return res('Invalid amount');

    const date = formatDate(new Date(), "d.m.yyyy");
    const params = { currency, base_currency, date };

    axios.get(`${ dbService }/get-nbu-rate`, { params })
        .then(response => {
            if (response.status === 204)
                return res(null, { message: `No pair ${ currency } and ${ base_currency } found` });

            const rate_nb = response.data.rate_nb;
            const base_currency_db = response.data.base_currency;

            const body = {
                result: base_currency === base_currency_db ? amount * rate_nb : amount / rate_nb,
                rate: base_currency === base_currency_db ? rate_nb : 1 / rate_nb,
                reverted_rate: base_currency === base_currency_db ? 1 / rate_nb : rate_nb
            };

            res(null, body);
        })
        .catch(err => {
            res(err.response);
        });
};

function getFormatedtFromToDates(req) {
    let { from, to } = req.query;

    if (!to) {
        to = new Date();
    }

    if (!from) {
        from = new Date(to);
        from.setDate(from.getDate() - 7);
    }

    if (new Date(from) > new Date(to)) {
        throw 'Incorrect dates sequence';
    }

    return {
        from: formatDate(from, "d.m.yyyy"),
        to: formatDate(to, "d.m.yyyy")
    };
};

function getRateByDate(req, res, date) {
    axios.get(`${ dbService }/rate/${ date }`)
        .then(async (response) => {
            if (response.status === 204) {
                await setPrivatRateByDate(date);
                getRateByDate(req, res, date);
            }
            else
                res(null, response.data);
        })
        .catch(err => {
            res(err.response);
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
                .catch(error => {
                    console.log(error);
                });
        })
        .catch(error => {
            console.log(error);
        });
}