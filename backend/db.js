import { Pool } from 'pg';

// Support Supabase connection string or individual variables
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use connection string (Supabase format)
  const dbUrl = process.env.DATABASE_URL;
  console.log('📝 Using DATABASE_URL (first 50 chars):', dbUrl.substring(0, 50) + '...');
  
  // Fix common Supabase URL issues
  let fixedUrl = dbUrl;
  
  // If URL is missing protocol, add it
  if (!fixedUrl.startsWith('postgres://') && !fixedUrl.startsWith('postgresql://')) {
    // Try to detect if it's a Supabase format and fix it
    if (fixedUrl.includes('supabase')) {
      console.warn('⚠️ DATABASE_URL might be missing protocol. Expected format: postgresql://user:pass@host:port/db');
    }
  }
  
  poolConfig = {
    connectionString: fixedUrl,
    ssl: fixedUrl.includes('supabase') ? { rejectUnauthorized: false } : false,
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
