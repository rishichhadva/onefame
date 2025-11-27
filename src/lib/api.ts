// API configuration utility
// Uses environment variable in production, localhost in development

const getApiBase = (): string => {
  // In production (Vercel), use the same domain (relative URLs work)
  if (import.meta.env.PROD) {
    // Use relative URLs in production - Vercel will handle routing
    return '';
  }
  
  // In development, use localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:4000';
};

export const API_BASE = getApiBase();

// Helper function to build full API URLs
export const apiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  if (API_BASE) {
    return `${API_BASE}${normalizedPath}`;
  }
  
  // In production with relative URLs, just return the path
  return normalizedPath;
};

