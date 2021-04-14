const { Client } = require('pg');

const sql = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'exchanges',
  password: 'postgre',
  port: 5432,
});

sql.connect((err) => {
  if (err) return console.log(err);
  console.log('Connected to DB');
});

exports.sql = sql;

exports.endConnection = () => {
  setTimeout(() => {
    sql
      .end()
      .then(() => console.log('Disconnected DB'))
      .catch(err => console.error('Error during disconnection', err.stack));
  }, 1000);
};