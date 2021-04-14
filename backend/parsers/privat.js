const axios = require('axios');
const formatDate = require('dateformat');
const { sql, endConnection } = require('../database/connection');
const { DATE } = require('./date');

const date = formatDate(DATE, "d.m.yyyy");
console.log('PrivatBank', date);;

(function (date) {
    axios.get(`https://api.privatbank.ua/p24api/exchange_rates?json&date=${date}`)
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

            DBData.forEach(pair => {
                const { base_currency, currency, rate_nb, sale_privat, purchase_privat, date } = pair;
                if (base_currency && currency) {
                    sql.query(`select id from currency_pairs where base_currency='${base_currency}' and currency = '${currency}'`, (err, result) => {
                        if (err)
                            return console.log(err);

                        if (!result.rowCount)
                            return;

                        sql.query(`update exchange_rates set (sale_privat, purchase_privat) = (${sale_privat ? sale_privat : 'null'}, ${purchase_privat ? purchase_privat : 'null'}) where currency_pair_id = ${result.rows[0].id} and date = '${date}'`, (err) => {
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