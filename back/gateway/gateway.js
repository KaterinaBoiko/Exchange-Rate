const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const privatService = 'http://localhost:3001';
const dbService = 'http://localhost:3003';
const authService = 'http://localhost:3005';
const ratesService = 'http://localhost:3007';

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/signin', (req, res) => {
    axios.post(`${ authService }/signin`, req.body)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(err => {
            res.status(err.response ? err.response.status : 500).json(err.response ? err.response.data : err.message);
        });
});

app.post('/signup', (req, res) => {
    axios.post(`${ authService }/signup`, req.body)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(err => {
            res.status(err.response ? err.response.status : 500).json(err.response ? err.response.data : err.message);
        });
});

app.delete('/delete/:id', (req, res) => {
    axios.delete(`${ authService }/delete/${ req.params.id }`, req.body)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(err => {
            res.status(err.response ? err.response.status : 500).json({ message: err.response ? err.response.data : err.message });
        });
});

app.delete('/delete-by-email/:email', (req, res) => {
    axios.delete(`${ authService }/delete-by-email/${ req.params.email }`, req.body)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(err => {
            res.status(err.response ? err.response.status : 500).json({ message: err.response ? err.response.data : err.message });
        });
});

app.get('/rate/:date', (req, res) => {
    const { date } = req.params;
    axios.get(`${ ratesService }/rate/${ date }`)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(err => {
            res.status(err.response ? err.response.status : 500).json(err.response ? err.response.data : err.message);
        });
});

app.get('/details/:currency', (req, res) => {
    const { currency } = req.params;
    axios.get(`${ ratesService }/details/${ currency }`, { params: req.query })
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(err => {
            res.status(err.response ? err.response.status : 500).json(err.response ? err.response.data : err.message);
        });
});

app.get('/currency-pairs', (req, res) => {
    axios.get(`${ ratesService }/currency-pairs`)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(err => {
            res.status(err.response ? err.response.status : 500).json(err.response ? err.response.data : err.message);
        });
});

app.get('/convert', (req, res) => {
    axios.get(`${ ratesService }/convert`, { params: req.query })
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(err => {
            res.status(err.response ? err.response.status : 500).json(err.response ? err.response.data : err.message);
        });
});

app.get('/current-nbu-rate', (req, res) => {
    axios.get(`${ ratesService }/current-nbu-rate`)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(err => {
            res.status(err.response ? err.response.status : 500).json(err.response ? err.response.data : err.message);
        });
});

app.get('/privat-rates', (req, res) => {
    axios.get(`${ privatService }/privat-rates`)
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            res.status(500).json({ message: error });
        });
});

app.get('/add-currencies', (req, res) => {
    axios.get(`${ dbService }/set-currencies`)
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            res.status(500).json({ message: error });
        });
});

app.get('/', (req, res) => {
    res.send('api works');
});

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Gateway running on localhost:${ port }`));

module.exports = app;