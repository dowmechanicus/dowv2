const mysql = require('mysql')

const pool = mysql.createPool({
  database: process.env.MYSQL_DATABASE ?? 'esl',
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: process.env.MYSQL_PORT ?? 3306,
  user: process.env.MYSQL_USER ?? 'esl-user',
  password: process.env.MYSQL_PASSWORD ?? 'esl',
  bigNumberStrings: true,
  supportBigNumbers: true
});

function query(query, params) {
  return new Promise((resolve, reject) => {
    pool.query(query, params, (error, results, fields) => {
      if (error) {
        reject(error);
      }

      resolve(results)
    })
  })
}

module.exports = query
