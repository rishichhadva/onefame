// Vercel serverless function wrapper for Express app
import app from '../backend/index.js';

// Vercel serverless function handler
// Vercel routes /api/* to this function
export default (req, res) => {
  // Vercel might pass the path without /api prefix in some cases
  // Ensure req.url has /api prefix for Express routes
  const originalUrl = req.url || req.path || '/';
  
  if (!originalUrl.startsWith('/api')) {
    req.url = `/api${originalUrl}`;
    req.path = `/api${originalUrl}`;
  }
  
  // Log for debugging
  console.log(`[Vercel API Handler] ${req.method} ${req.url} (original: ${originalUrl})`);
  
  // Delegate to Express app
  return app(req, res);
};

