const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (e) {
    throw e;
  }
}

module.exports = { query, pool };
