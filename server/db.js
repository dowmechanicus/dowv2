const mysql = require('mysql')
const logger = require('./logger')

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
  logger.debug(`SQL Query: ${query}\nSQL Query Parameters: ${params}`);
  return new Promise((resolve, reject) => {
    pool.query(query, params, (error, results) => {
      if (error) {
        logger.error(`SQL Query error: ${error}\nResults: ${results}`);
        reject(error);
      }

      resolve(results)
    })
  })
}

module.exports = query
