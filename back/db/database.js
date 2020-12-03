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
            return res.status(500).json(err.message);

        if (!users.rowCount)
            return res.status(404).json('Email does not exist');

        return res.status(200).json(users.rows[ 0 ]);
    });
});

app.post('/signup', (req, res) => {
    const { username, email, password, address } = req.body;
    sql.query(`INSERT INTO USERS (${ username ? 'username, ' : '' }email, password${ address ? ', address' : '' })`
        + ` VALUES (${ username ? `'${ username }', ` : '' }'${ email }', '${ password }'${ address ? `, '${ address }'` : '' })`, (err) => {
            if (err)
                return res.status(500).json(err.mesage);

            return res.status(200).json('success');
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

                sql.query(`INSERT INTO exchange_rates (currency_pair_id, rate_nb, sale_privat, purchase_privat, date) Values ( ${ result.rows[ 0 ].id }, ${ rate_nb ? rate_nb : 'null' }, ${ sale_privat ? sale_privat : 'null' }, ${ purchase_privat ? purchase_privat : 'null' }, '${ date }')`, (err) => {
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