const axios = require('axios');
const formatDate = require('dateformat');
const { sql, endConnection } = require('../database/connection');
const { DATE } = require('./date');

const date = formatDate(DATE, "d.m.yyyy");
console.log('PrivatBank', date);

(function (date) {
    axios.get(`https://api.privatbank.ua/p24api/exchange_rates?json&date=${date}`)
        .then(response => {
            const { data } = response;
            data.exchangeRate.forEach(pair => {
                const { baseCurrency, currency, saleRate, purchaseRate } = pair;
                if (baseCurrency && currency) {
                    sql.query(`select id from currency_pairs where base_currency='${baseCurrency}' and currency = '${currency === 'PLZ' ? 'PLN' : currency}'`, (err, result) => {
                        if (err)
                            return console.log(err);

                        if (!result.rowCount)
                            return;

                        sql.query(`update exchange_rates set (sale_privat, purchase_privat) = (${saleRate ? saleRate : 'null'}, ${purchaseRate ? purchaseRate : 'null'}) where currency_pair_id = ${result.rows[0].id} and date = '${date}'`, (err) => {
                            if (err)
                                return console.log(err);
                        });
                    });
                };
            });
            endConnection();
        })
        .catch(error => {
            console.log(error);
        });
})(date);