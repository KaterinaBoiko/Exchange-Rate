const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const config = require('./config.json');

const dbService = 'http://localhost:3003';

exports.signIn = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res({ data: 'Required data is not provided' });

    axios.post(`${ dbService }/signin`, { email })
        .then(result => {
            const user = result.data;

            if (!bcrypt.compareSync(password, user.password))
                return res('Incorrect password');

            const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: '7d' });
            delete user.password;
            user.token = token;
            res(null, user);
        })
        .catch(err => {
            res(err.response);
        });
};

exports.signUp = (req, res) => {
    const saltRounds = 10;
    const { email, password } = req.body;

    if (!password || !email)
        return res({ data: 'Required data is not provided' });
        
    const user = { ...req.body, password: bcrypt.hashSync(password, saltRounds) };
    axios.post(`${ dbService }/signup`, user)
        .then(response => {
            res(null, response.data);
        })
        .catch(err => {
            res(err.response);
        });
};

exports.deleteById = (req, res) => {
    axios.delete(`${ dbService }/delete/${ req.params.id }`)
        .then(result => {
            res(null, result.data);
        })
        .catch(err => {
            res(err.response);
        });
};