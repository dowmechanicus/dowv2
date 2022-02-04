const mysql = require('mysql')
const logger = require('./logger')

const pool = mysql.createPool({
  database: 'esl',
  host: 'localhost',
  port: 3306,
  user: 'esl',
  password: 'esl',
  bigNumberStrings: true,
  supportBigNumbers: true
});

pool.query('SELECT 1;', (error, results) => error ? process.exit(1) : logger.info('Successfully connected to database'));

console.log(process.env.MYSQL_USER);
console.log(process.env.MYSQL_PASSWORD);

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
