const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Lỗi kết nối cơ sở dữ liệu PostgreSQL:', err.stack);
  }
  console.log('Đã kết nối thành công tới cơ sở dữ liệu PostgreSQL: clinic_duc_tin');
  release();
});

module.exports = pool;