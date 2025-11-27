import { Pool } from 'pg';

// Support Supabase connection string or individual variables
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use connection string (Supabase format)
  const dbUrl = process.env.DATABASE_URL;
  
  // Log URL without password for debugging
  const urlWithoutPassword = dbUrl.replace(/:[^:@]+@/, ':****@');
  console.log('📝 Using DATABASE_URL:', urlWithoutPassword);
  
  // Extract hostname for debugging
  try {
    const urlObj = new URL(dbUrl);
    console.log('📝 Database hostname:', urlObj.hostname);
    console.log('📝 Database port:', urlObj.port || '5432 (default)');
  } catch (e) {
    console.error('❌ Invalid DATABASE_URL format:', e.message);
    console.error('Expected format: postgresql://user:password@host:port/database');
  }
  
  poolConfig = {
    connectionString: dbUrl,
    ssl: dbUrl.includes('supabase') ? { rejectUnauthorized: false } : false,
  };
} else {
  // Use individual variables
  console.log('📝 Using individual DB variables');
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

// Test connection on startup
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
});

export default pool;
