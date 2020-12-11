// const express = require('express');
// const config = require('./config.json');
// const http = require('http');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');

// const dbService = 'http://localhost:3003';

// const app = express();
// app.use(bodyParser.json());

// app.post('/signin', (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password)
//         return res.status(500).json('Required data is not provided');

//     axios.post(`${ dbService }/signin`, { email })
//         .then(result => {
//             const user = result.data;

//             if (!bcrypt.compareSync(password, user.password))
//                 return res.status(401).json('Incorrect password');

//             const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: '7d' });
//             delete user.password;
//             user.token = token;
//             res.status(200).json(user);
//         })
//         .catch(err => {
//             res.status(err.response ? err.response.status : 500).json(err.response ? err.response.data : err.message);
//         });
// });

// app.post('/signup', (req, res) => {
//     const saltRounds = 10;
//     const { password } = req.body;

//     if (!password)
//         return res.status(400).json('Required data is not provided');

//     const user = { ...req.body, password: bcrypt.hashSync(password, saltRounds) };
//     axios.post(`${ dbService }/signup`, user)
//         .then(response => {
//             res.status(200).json(response.data);
//         })
//         .catch(err => {
//             res.status(err.response ? err.response.status : 500).json(err.response ? err.response.data : err.message);
//         });
// });

// const port = process.env.PORT || '3005';
// app.set('port', port);

// const server = http.createServer(app);
// server.listen(port, () => console.log(`Auth service running on localhost:${ port }`));

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const api = require('./auth.router');

const app = express();
app.use(bodyParser.json());

app.use('/', api);

const port = process.env.PORT || '3005';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Auth service running on localhost:${ port }`));
module.exports = app; 