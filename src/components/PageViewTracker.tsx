import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

import { apiUrl } from '@/lib/api';

const PageViewTracker = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Track page view on route change
    const trackView = async () => {
      try {
        const response = await fetch(apiUrl('/api/track-view'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pagePath: location.pathname,
            userEmail: user?.email || null,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          console.log(`📊 Page view tracked: ${location.pathname}`);
        } else {
          console.warn('Page view tracking returned false:', data);
        }
      } catch (error) {
        // Log error but don't interrupt user experience
        console.error('Failed to track page view:', error);
      }
    };

    // Small delay to ensure page is loaded, then track
    const timeoutId = setTimeout(trackView, 200);
    return () => clearTimeout(timeoutId);
  }, [location.pathname, user?.email]);

  return null; // This component doesn't render anything
};

export default PageViewTracker;

