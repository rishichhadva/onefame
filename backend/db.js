import { Pool } from 'pg';

// Support Supabase connection string or individual variables
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use connection string (Supabase format)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : false,
  };
} else {
  // Use individual variables
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'onefame',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_HOST?.includes('supabase') ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool(poolConfig);

export default pool;
