// Vercel serverless function wrapper for Express app
import app from '../backend/index.js';

// Vercel serverless function handler
// Vercel routes /api/* requests to this function
// The Express app already has routes defined with /api/ prefix
export default async (req, res) => {
  // Log for debugging
  console.log(`[API] ${req.method} ${req.url}`);
  
  // Vercel passes the full path including /api, so Express routes should match
  // Handle the request with Express app
  app(req, res);
};

