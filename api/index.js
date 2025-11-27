// Vercel serverless function wrapper for Express app
import app from '../backend/index.js';

// Vercel serverless function handler
// Export the Express app - Vercel will handle routing /api/* to this function
// Express routes are already defined with /api/ prefix
export default app;

