import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres', // update with your username
  host: 'localhost',
  database: 'onefame', // update with your db name
  password: 'postgres', // update with your password
  port: 5432,
});

export default pool;
