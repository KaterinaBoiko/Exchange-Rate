const sql = require('../db/connection');

sql.query('SELECT NOW()', (err, res) => {
    console.log(err, res);
    sql.end();
});