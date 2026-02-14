import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsTracker from '../../services/analyticsTracker';

const AppTracker = () => {
  const location = useLocation();
  const previousPathRef = useRef('');

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    if (path === previousPathRef.current) return;
    previousPathRef.current = path;
    analyticsTracker.trackPageView(path);
  }, [location.pathname, location.search]);

  return null;
};

export default AppTracker;
