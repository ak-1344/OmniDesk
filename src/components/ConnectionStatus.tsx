import { useState, useEffect } from 'react';
import './ConnectionStatus.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const healthUrl = API_URL.replace('/api', '/health');
        const response = await fetch(healthUrl);
        if (response.ok) {
          setStatus('connected');
        } else {
          setStatus('disconnected');
        }
      } catch (error) {
        setStatus('disconnected');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (status === 'checking') return null;

  return (
    <div className={`connection-status connection-status--${status}`}>
      <div className="connection-status__indicator"></div>
      <div className="connection-status__text">
        {status === 'connected' ? (
          <>
            <strong>Connected</strong> to MongoDB
          </>
        ) : (
          <>
            <strong>Offline</strong> - Using LocalStorage
          </>
        )}
      </div>
    </div>
  );
};
