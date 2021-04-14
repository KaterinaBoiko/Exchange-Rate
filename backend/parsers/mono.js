const axios = require('axios');
const formatDate = require('dateformat');
const sql = require('../database/connection');

const date = formatDate(new Date(), "yyyy-mm-dd");
(function () {
    axios.get(`https://api.monobank.ua/bank/currency`)
        .then(response => {
            const { data } = response;

            data.forEach(pair => {
                let { currencyCodeA, currencyCodeB, rateBuy, rateSell, rateCross } = pair;
                if (currencyCodeB !== 980)
                    return;

                sql.query(`select id from currency_pairs where base_currency='UAH' and currency = (select code from currencies where number_code = ${currencyCodeA})`, (err, result) => {
                    if (err || !result.rowCount)
                        return;

                    rateSell = rateSell ? rateSell : rateCross;
                    rateBuy = rateBuy ? rateBuy : rateCross;
                    sql.query(`update exchange_rates set (sale_mono, purchase_mono) = (${rateSell ? rateSell : 'null'}, ${rateBuy ? rateBuy : 'null'}) where currency_pair_id = ${result.rows[0].id} and date = '${date}'`, (err) => {
                        if (err)
                            return console.log(err);
                    });
                });
            });
            sql.end();
        })
        .catch(error => {
            console.log(error);
        });
})();