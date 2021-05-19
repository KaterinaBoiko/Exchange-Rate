const axios = require('axios');
const formatDate = require('dateformat');
const { sql } = require('../database/connection');
const forecastServer = 'http://127.0.0.1:8080';

exports.getRateByDate = (req, res) => {
    const { date } = req.params;
    sql.query(`select rates.*, pairs.currency from exchange_rates rates left join currency_pairs pairs ON rates.currency_pair_id = pairs.id where rates.date = '${date}'`, (err, data) => {
        if (err)
            return res(err.routine);

        if (!data.rowCount)
            return getAndSetRateByDate(date, res);

        return res(null, data.rows);
    });
};

exports.convert = (req, res) => {
    const { amount, currency, base_currency } = req.query;

    if (isNaN(amount))
        return res('Invalid amount');

    const date = formatDate(new Date(), "d.m.yyyy");
    const params = { currency, base_currency };

    sql.query(`select x.rate_nb from exchange_rates x left join currency_pairs p on x.currency_pair_id = p.id where p.base_currency = '${base_currency}' and p.currency = '${currency}' and x.date = '${date}' or p.base_currency = '${currency}' and p.currency = '${base_currency}' and x.date = '${date}'`, (err, result) => {
        if (err)
            return res(err.routine);

        const rate_nb = result.rows[0].rate_nb;
        const revert_base = base_currency === 'UAH';
        const body = {
            result: revert_base ? amount * rate_nb : amount / rate_nb,
            rate: revert_base ? rate_nb : 1 / rate_nb,
            reverted_rate: revert_base ? 1 / rate_nb : rate_nb
        };
        res(null, body);
    });
};

exports.getCurrencyPairs = (req, res) => {
    sql.query(`select pairs.base_currency, pairs.currency, 
        (select en_title from currencies where code = pairs.currency) en_title, 
        (select en_title from currencies where code = pairs.base_currency) en_base_title,
        (select ua_title from currencies where code = pairs.currency) ua_title, 
        (select ua_title from currencies where code = pairs.base_currency) ua_base_title,
        (select ru_title from currencies where code = pairs.currency) ru_title, 
        (select ru_title from currencies where code = pairs.base_currency) ru_base_title
        from currency_pairs pairs`, (err, data) => {
        if (err)
            return res(err.routine);
        return res(null, data.rows);
    });
};

exports.getCurrencies = (req, res) => {
    sql.query(`select p.currency, c.en_title, c.ua_title, c.ru_title from currency_pairs p left join currencies c on p.currency = c.code where currency <> 'UAH'`, (err, data) => {
        if (err)
            return res(err.routine);
        return res(null, data.rows);
    });
};

exports.getCurrencyDetails = (req, res) => {
    const { currency } = req.params;
    const { from, to } = getFormatedtFromToDates(req);

    sql.query(`select x.*, c.* from exchange_rates x left join currency_pairs p on x.currency_pair_id = p.id left join currencies c on p.currency = c.code where x.currency_pair_id = (select id from currency_pairs p where p.base_currency = 'UAH' and p.currency = '${currency}') and x.date >= '${from}' and x.date <= '${to}'`, (err, data) => {
        if (err)
            return res(err.routine);

        return res(null, data.rows);
    });
};

exports.getCurrencyDetailsByDate = (req, res) => {
    const { currency, date } = req.params;

    sql.query(`select x.*, c.* from exchange_rates x left join currency_pairs p on x.currency_pair_id = p.id left join currencies c on p.currency = c.code where x.currency_pair_id = (select id from currency_pairs p where p.base_currency = 'UAH' and p.currency = '${currency}') and x.date = '${date}'`, (err, data) => {
        if (err)
            return res(err.routine);

        const response = {
            currencyData: {
                en_title: data.rows[0].en_title,
                ua_title: data.rows[0].ua_title,
                ru_title: data.rows[0].ru_title
            },
            bankData: composeBankData(data.rows[0]),
            otherData: [
                {
                    apiName: 'NBU',
                    rate: data.rows[0].rate_nb
                },
                {
                    apiName: 'Currency Layer',
                    rate: data.rows[0].layer_rate
                },
                {
                    apiName: 'Fixer',
                    rate: data.rows[0].fixer_rate
                }
            ]
        };
        return res(null, response);
    });
};

exports.getNBURate = (req, res) => {
    const { currency } = req.params;
    const { from, to } = getFormatedtFromToDates(req, 1);
    sql.query(`select date, rate_nb from exchange_rates where currency_pair_id = (select id from currency_pairs where base_currency = 'UAH' and currency = '${currency}') and date >= '${from}' and date <= '${to}'`, (err, data) => {
        if (err)
            return res(err.routine);

        return res(null, data.rows);
    });

};

exports.forecastRate = (req, res) => {
    axios.get(`${forecastServer}`, {
        params: {
            forecast: req.query.currency,
            period: req.query.period
        }
    })
        .then(response => {
            const forecast = response.data.map(row => {
                return {
                    forecast: row.predicted,
                    date: new Date(row.date).toISOString()
                };
            });
            res(null, forecast);
        })
        .catch(err => {
            res(err.response || err.code);
        });
};

function composeBankData(details) {
    const bankData = [
        {
            bank: 'PrivatBank',
            purchase: details.purchase_privat,
            sale: details.sale_privat
        },
        {
            bank: 'Monobank',
            purchase: details.purchase_mono,
            sale: details.sale_mono
        },
    ];
    return [
        ...bankData,
        {
            bank: 'Minimum',
            purchase: bankData.reduce((min, rate) => rate.purchase && rate.purchase < min ? rate.purchase : min, bankData.find(rate => rate.purchase).purchase),
            sale: bankData.reduce((min, rate) => rate.sale && rate.sale < min ? rate.sale : min, bankData.find(rate => rate.sale).sale)
        },
        {
            bank: 'Average',
            purchase: bankData.reduce((total, next) => total + next.purchase, 0) / bankData.filter(rate => rate.purchase).length,
            sale: bankData.reduce((total, next) => total + next.sale, 0) / bankData.filter(rate => rate.sale).length
        },
        {
            bank: 'Maximum',
            purchase: bankData.reduce((max, rate) => rate.purchase && rate.purchase > max ? rate.purchase : max, bankData.find(rate => rate.purchase).purchase),
            sale: bankData.reduce((max, rate) => rate.sale && rate.sale > max ? rate.sale : max, bankData.find(rate => rate.sale).sale)
        }
    ];
}

function getFormatedtFromToDates(req, minusMonth = 4) {
    let { from, to } = req.query;

    if (!to) {
        to = new Date();
    }

    if (!from) {
        from = new Date(to);
        from.setMonth(from.getMonth() - minusMonth);
    }

    if (new Date(from) > new Date(to)) {
        throw 'Incorrect dates sequence';
    }

    return {
        from: formatDate(from, "d.m.yyyy"),
        to: formatDate(to, "d.m.yyyy")
    };
};

function getAndSetRateByDate(date, res) {
    axios.get(`https://api.privatbank.ua/p24api/exchange_rates?json&date=${date}`)
        .then(response => {
            response.data.exchangeRate.forEach(pair => {
                const { baseCurrency, currency, saleRateNB, saleRate, purchaseRate } = pair;
                sql.query(`select id from currency_pairs where base_currency='${baseCurrency}' and currency = '${currency}'`, (err, result) => {
                    if (err || !result.rowCount)
                        return;

                    sql.query(`INSERT INTO exchange_rates (currency_pair_id, rate_nb, sale_privat, purchase_privat, date)` +
                        `values (${result.rows[0].id}, ${saleRateNB ? saleRateNB : 'null'}, ${saleRate ? saleRate : 'null'}, ${purchaseRate ? purchaseRate : 'null'}, '${date}') on conflict do nothing`);
                });
            });

            res(null, response.data.exchangeRate);
        });
}