const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.VPN_DB_HOST,
      port: parseInt(process.env.VPN_DB_PORT || '3306', 10),
      user: process.env.VPN_DB_USER,
      password: process.env.VPN_DB_PASSWORD,
      database: process.env.VPN_DB_DATABASE,
      connectTimeout: 10000,
    });

    console.log(
      'Conectado a',
      process.env.VPN_DB_HOST + ':' + process.env.VPN_DB_PORT,
    );
    const [rows] = await conn.query('SHOW COLUMNS FROM `docentes`');
    console.log('Columnas de docentes:');
    console.dir(rows, { depth: null });
    await conn.end();
  } catch (err) {
    console.error(
      'Error al inspeccionar la tabla docentes:',
      err && err.message ? err.message : err,
    );
    process.exit(1);
  }
}

run();
