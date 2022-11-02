const mysql = require('mysql')
const logger = require('./logger')

const loggerMeta = { service: 'Query' };

const pool = mysql.createPool({
  database: process.env.MYSQL_DB ?? 'esl',
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: process.env.MYSQL_PORT ?? 3306,
  user: process.env.MYSQL_USER ?? 'esl',
  password: process.env.MYSQL_PASSWORD ?? 'esl',
  bigNumberStrings: true,
  supportBigNumbers: true
});

pool.query('SELECT 1;', (error,) => {
  if (error) {
    logger.error(`Could not connect to database. ${error}\n`);
    process.exit(1);
  }

  logger.info('Successfully connected to database')
});

function query(query, params) {
  logger.debug(`SQL Query: ${query}`, loggerMeta);
  logger.debug(`SQL Query Parameters: ${params}`, loggerMeta);
  return new Promise((resolve, reject) => {
    pool.query(query, params, (error, results) => {
      if (error) {
        logger.error(`SQL Query error: ${error}`, loggerMeta);
        reject(error);
      }

      resolve(results)
    })
  })
}

/**
 * You will need to use Promise.all to resolve the queries
 *
 * @param {Array<{ query: string, params: any[]}>} queries
 * @returns
 */
function transaction(queries) {
  if (queries?.length < 1 || !queries) {
    Promise.reject(new Error('Trying to start a DB transaction without passing queries'));
  }

  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }

      connection.beginTransaction(error => {
        if (error) {
          connection.rollback();
          reject(error);
        }

        queries.forEach(({ queryString, params }) => query(queryString, params))

      })
    })

  })
}

module.exports = { query, transaction };
