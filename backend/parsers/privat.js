const axios = require('axios');
const formatDate = require('dateformat');
const { sql, endConnection } = require('../database/connection');
const { DATE } = require('./date');

const date = formatDate(DATE, "d.m.yyyy");
console.log('PrivatBank', date);

for (let d = new Date(2021, 0, 1); d < new Date(2021, 0, 5); d.setDate(d.getDate() + 1)) {
    let date = formatDate(d, "d.m.yyyy");
    setTimeout(() => {
        (function (date) {
            axios.get(`https://api.privatbank.ua/p24api/exchange_rates?json&date=${date}`)
                .then(response => {
                    const { data } = response;
                    console.log(date);
                    data.exchangeRate.forEach(pair => {
                        const { baseCurrency, currency, saleRate, purchaseRate } = pair;
                        if (baseCurrency && currency && saleRate) {
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
                    //endConnection();
                })
                .catch(error => {
                    console.log(error.response.status);
                });
        })(date);
    }, 30000);
}