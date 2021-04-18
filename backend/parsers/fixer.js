const axios = require('axios');
const formatDate = require('dateformat');
const { sql, endConnection } = require('../database/connection');
const { DATE } = require('./date');

const date = formatDate(DATE, "yyyy-mm-dd");
console.log('Fixer', date);

for (let d = new Date(2021, 0, 1); d < new Date(2021, 3, 18); d.setDate(d.getDate() + 1)) {
    let date = formatDate(d, "yyyy-mm-dd");
    (function (date) {
        axios.get(`http://data.fixer.io/api/${date}?access_key=6679e8357372364e708cea970900a083`)
            .then(response => {
                const { data } = response;
                const uah = data.rates.UAH;
                for (currency in data.rates) {
                    const rate = data.rates[currency];
                    if (currency && rate && uah) {
                        sql.query(`select id from currency_pairs where base_currency='UAH' and currency = '${currency}'`, (err, result) => {
                            if (err)
                                return console.log(err);

                            if (!result.rowCount)
                                return;

                            sql.query(`update exchange_rates set fixer_rate = ${uah / rate} where currency_pair_id = ${result.rows[0].id} and date = '${date}'`, (err, r) => {
                                if (err)
                                    return console.log(err);
                            });
                        });
                    }
                }
                //endConnection();
            })
            .catch(error => {
                console.log(error);
            });
    })(date);
}