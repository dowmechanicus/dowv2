const mysql = require('mysql')
const logger = require('./logger')

const pool = mysql.createPool({
  database: process.env.MYSQL_DB ?? 'esl',
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: process.env.MYSQL_PORT ?? 3306,
  user: process.env.MYSQL_USER ?? 'esl',
  password: process.env.MYSQL_PASSWORD ?? 'esl',
  bigNumberStrings: true,
  supportBigNumbers: true
});

pool.query('SELECT 1;', (error, results) => {
  if (error) {
    logger.error(`Could not connect to database. ${error}\n`);
    process.exit(1);
  }

  logger.info('Successfully connected to database')
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
