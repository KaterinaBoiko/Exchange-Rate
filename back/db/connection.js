const { Client } = require('pg');

const connection = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

connection.connect((err) => {
  if (err) return console.log(err);
  console.log('Connected to DB');
});

module.exports = connection;

