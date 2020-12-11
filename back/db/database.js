const sql = require('../db/connection');

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const axios = require('axios');

const { connected } = require('process');

const app = express();
app.use(bodyParser.json());

app.post('/signin', (req, res) => {
    const { email } = req.body;
    sql.query(`select * from users where email = '${ email }'`, (err, users) => {
        if (err)
            return res.status(500).json(err.routine);

        if (!users.rowCount)
            return res.status(404).json('Email does not exist');

        return res.status(200).json(users.rows[ 0 ]);
    });
});

app.post('/signup', (req, res) => {
    const { username, email, password, address } = req.body;
    sql.query(`insert into users (${ username ? 'username, ' : '' }email, password${ address ? ', address' : '' })`
        + ` values (${ username ? `'${ username }', ` : '' }'${ email }', '${ password }'${ address ? `, '${ address }'` : '' })`, (err) => {
            if (err) {
                if (err.code == 23505)
                    return res.status(409).json('Email is already exist');
                return res.status(500).json(err.routine);
            }

            return res.status(200).json('success');
        });
});

app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    sql.query(`delete from users where id = ${ id }`, (err) => {
        if (err) {
            return res.status(500).json(err.routine);
        }

        return res.status(200).json('success');
    });
});

app.get('/rate/:date', (req, res) => {
    const { date } = req.params;
    sql.query(`select rates.*, pairs.currency from exchange_rates rates left join currency_pairs pairs ON rates.currency_pair_id = pairs.id where rates.date = '${ date }' and rates.sale_privat is not null`, (err, data) => {
        if (err)
            return res.status(err.routine === 'DateTimeParseError' ? 400 : 500).json(err.routine);

        if (!data.rowCount)
            return res.status(204).json(data.rows);

        return res.status(200).json(data.rows);
    });
});

app.get('/details/:currency', (req, res) => {
    const { currency } = req.params;
    sql.query(`select * from currencies where code = '${ currency }'`, (err, data) => {
        if (err)
            return res.status(500).json(err.routine);

        return res.status(200).json(data.rows[ 0 ]);
    });
});

app.get('/interval-rates/:currency', (req, res) => {
    const { currency } = req.params;
    const { from, to } = req.query;

    sql.query(`select * from exchange_rates where currency_pair_id = (select id from currency_pairs where base_currency = 'UAH' and currency = '${ currency }') and date >= '${ from }' and date < '${ to }'`, (err, data) => {
        if (err)
            return res.status(500).json(err.routine);

        return res.status(200).json(data.rows);
    });
});

app.get('/currency-pairs', (req, res) => {
    sql.query(`select pairs.base_currency, pairs.currency, ` +
        `(select title from currencies where code = pairs.currency) currency_title, ` +
        `(select title from currencies where code = pairs.base_currency) base_currency_title from currency_pairs pairs`, (err, data) => {
            if (err)
                return res.status(500).json(err.routine);

            return res.status(200).json(data.rows);
        });
});

app.get('/get-nbu-rate', async (req, res) => {
    const { date } = req.query;
    const result = await getPair(req);
    if (!result.rowCount)
        return res.status(204).end();

    const { id, base_currency } = result.rows[ 0 ];
    sql.query(`select rate_nb from exchange_rates where currency_pair_id = ${ id } and date = '${ date }'`, (err, result) => {
        if (err)
            return res.status(500).json(err.routine);

        if (!result.rowCount)
            return res.status(204).json(`No data about NBU rate on this date`);

        const { rate_nb } = result.rows[ 0 ];
        return res.status(200).json({ rate_nb, base_currency });
    });
});

function getPair(req) {
    const { currency, base_currency } = req.query;
    return sql.query(`select id, base_currency from currency_pairs where base_currency='${ base_currency }' and currency = '${ currency }' ` +
        `or base_currency='${ currency }' and currency = '${ base_currency }'`);
}

app.get('/nbu-rate/:date', (req, res) => {
    const { date } = req.params;
    sql.query(`select pairs.base_currency, pairs.currency, rates.rate_nb from exchange_rates rates left join currency_pairs pairs ON rates.currency_pair_id = pairs.id where rates.date = '${ date }' and rates.rate_nb is not null`, (err, data) => {
        if (err)
            return res.status(err.routine === 'DateTimeParseError' ? 400 : 500).json(err.routine);

        if (!data.rowCount)
            return res.status(204).json(data.rows);

        return res.status(200).json(data.rows);
    });
});

app.post('/set-privat-rates', (req, res) => {
    const data = req.body;
    data.forEach(pair => {
        const { base_currency, currency, rate_nb, sale_privat, purchase_privat, date } = pair;
        if (base_currency && currency) {
            sql.query(`select id from currency_pairs where base_currency='${ base_currency }' and currency = '${ currency }'`, (err, result) => {
                if (err || !result.rowCount)
                    return;

                sql.query(`INSERT INTO exchange_rates (currency_pair_id, rate_nb, sale_privat, purchase_privat, date)` +
                    `values (${ result.rows[ 0 ].id }, ${ rate_nb ? rate_nb : 'null' }, ${ sale_privat ? sale_privat : 'null' }, ${ purchase_privat ? purchase_privat : 'null' }, '${ date }') on conflict do nothing`, (err) => {
                        if (err)
                            return console.log(err);
                    });
            });
        };
    });
});

const port = process.env.PORT || '3003';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Database service running on localhost:${ port }`));