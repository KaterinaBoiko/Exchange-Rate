const axios = require('axios');
const formatDate = require('dateformat');
const { sql, endConnection } = require('../database/connection');
const { DATE } = require('./date');

const date = formatDate(DATE, "yyyymmdd");
console.log('NBU', date);

for (let d = new Date(2021, 0, 1); d <= new Date(2021, 1, 28); d.setDate(d.getDate() + 1)) {
    let date = formatDate(d, "yyyymmdd");
    (function (date) {
        axios.get(`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${date}&json`)
            .then(response => {
                console.log(date);
                const { data } = response;
                data.forEach((pair, i) => {
                    const { cc, rate } = pair;
                    if (cc && rate) {
                        sql.query(`select id from currency_pairs where base_currency='UAH' and currency = '${cc}'`, (err, result) => {
                            if (err)
                                return console.log(err);

                            if (!result.rowCount)
                                return;

                            sql.query(`INSERT INTO exchange_rates (currency_pair_id, rate_nb, date)` +
                                `values (${result.rows[0].id}, ${rate ? rate : 'null'}, '${date}') on conflict do nothing`, (err, result) => {
                                    if (err)
                                        return console.log(err);
                                });
                        });
                    };
                });
                //endConnection();
            })
            .catch(error => {
                console.log(error);
            });
    })(date);
}