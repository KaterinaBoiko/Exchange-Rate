const axios = require('axios');
const formatDate = require('dateformat');
const sql = require('../database/connection');

const date = formatDate(new Date(), "yyyymmdd");
console.log(date);
(function (date) {
    axios.get(`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${date}&json`)
        .then(response => {
            const { data } = response;
            data.forEach(pair => {
                const { cc, rate } = pair;
                if (cc && rate) {
                    sql.query(`select id from currency_pairs where base_currency='UAH' and currency = '${cc}'`, (err, result) => {
                        if (err || !result.rowCount)
                            return;

                        sql.query(`INSERT INTO exchange_rates (currency_pair_id, rate_nb, date)` +
                            `values (${result.rows[0].id}, ${rate ? rate : 'null'}, '${date}') on conflict do nothing`, (err, result) => {
                                if (err)
                                    return console.log(err);
                            });
                    });
                };
            });
            sql.end();
        })
        .catch(error => {
            console.log(error);
        });
})(date);