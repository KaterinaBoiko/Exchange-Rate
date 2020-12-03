const express = require('express');
const config = require('./config.json');
const http = require('http');
const bodyParser = require('body-parser');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const dbService = 'http://localhost:3003';

const app = express();
app.use(bodyParser.json());

app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(500).json({ message: 'Required data is not provided' });

    axios.post(`${ dbService }/signin`, { email })
        .then(result => {
            const user = result.data;

            if (!bcrypt.compareSync(password, user.password))
                return res.status(401).json({ message: 'Incorrect password' });

            const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: '7d' });
            delete user.password;
            user.token = token;
            return res.status(200).json(user);
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ message: err.response.data });
        });
});

app.post('/signup', (req, res) => {
    const saltRounds = 10;
    const { password } = req.body;

    if (!password)
        return res.status(500).json({ message: 'Required data is not provided' });

    const user = { ...req.body, password: bcrypt.hashSync(password, saltRounds) };
    axios.post(`${ dbService }/signup`, user)
        .then(response => {
            return res.status(200).json({ message: response.data });
        })
        .catch(err => {
            return res.status(500).json({ message: err });
        });
});

const port = process.env.PORT || '3005';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Auth service running on localhost:${ port }`));