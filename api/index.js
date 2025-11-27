// Vercel serverless function wrapper for Express app
import app from '../backend/index.js';

// Vercel serverless function handler
// Vercel routes /api/* requests to this function
// The Express app already has routes with /api/ prefix, so paths should match
export default app;

