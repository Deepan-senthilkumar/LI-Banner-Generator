import { useEffect, useState, useCallback, useRef } from 'react';
import adminPanelService from '../services/adminPanelService';

const useAdminData = (loader) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await loaderRef.current();
      setData(result || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, setData, loading, error, refresh, service: adminPanelService };
};

export default useAdminData;
