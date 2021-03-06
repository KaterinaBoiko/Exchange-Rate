const axios = require('axios');
const formatDate = require('dateformat');
const { sql, endConnection } = require('../database/connection');
const { DATE } = require('./date');

const date = formatDate(DATE, "yyyy-mm-dd");
console.log('Currency layer', date);;

(function (date) {
    axios.get(`http://api.currencylayer.com/historical?access_key=d53eddc8bbd6f17586d4d83faa6a8740&date=${date}`)
        .then(response => {
            const { data } = response;
            const uah = data.quotes.USDUAH;
            for (pair in data.quotes) {
                const currency = pair.substr(3);
                const rate = data.quotes[pair];
                if (currency && rate && uah) {
                    sql.query(`select id from currency_pairs where base_currency='UAH' and currency = '${currency}'`, (err, result) => {
                        if (err)
                            return console.log(err);

                        if (!result.rowCount)
                            return;

                        sql.query(`update exchange_rates set layer_rate = ${uah / rate} where currency_pair_id = ${result.rows[0].id} and date = '${date}'`, (err, r) => {
                            if (err)
                                return console.log(err);
                        });
                    });
                }
            }
            endConnection();
        })
        .catch(error => {
            console.log(error);
        });
})(date);