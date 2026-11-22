const { Pool } = require('pg');
const cfg = require('./config');
const pool = new Pool({ connectionString: cfg.databaseUrl, max: 3, ssl: cfg.prod ? { rejectUnauthorized: false } : undefined });
module.exports = { pool, query: (text, params) => pool.query(text, params) };
