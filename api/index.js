// Vercel serverless function wrapper for Express app
import app from '../backend/index.js';

// Vercel expects a handler function, not the app directly
export default (req, res) => {
  // Delegate to Express app
  return app(req, res);
};

