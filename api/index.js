// Vercel serverless function wrapper for Express app
import app from '../backend/index.js';

// Vercel serverless function handler
// Vercel routes /api/* to this function, and Express handles the routing
export default (req, res) => {
  // Ensure the path includes /api prefix for Express routes
  // Vercel might strip it, so we add it back if needed
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }
  return app(req, res);
};

