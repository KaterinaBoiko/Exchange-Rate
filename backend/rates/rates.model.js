const axios = require('axios');
const formatDate = require('dateformat');
const { sql } = require('../database/connection');

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
    sql.query(`select pairs.base_currency, pairs.currency, ` +
        `(select title from currencies where code = pairs.currency) currency_title, ` +
        `(select title from currencies where code = pairs.base_currency) base_currency_title from currency_pairs pairs`, (err, data) => {
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

function getFormatedtFromToDates(req) {
    let { from, to } = req.query;

    if (!to) {
        to = new Date();
    }

    if (!from) {
        from = new Date(to);
        from.setMonth(from.getMonth() - 4);
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