import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from './config.json';
import './App.css';

import { NotificationManager, NotificationContainer } from 'react-notifications';
import './react-notifications/dist/react-notifications.css';

function App() {
  const [pcData, setPcData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApiData = async (ip, apiUrl, username, password) => {
    try {
      const response = await axios.get(`${apiUrl}?ip=${ip}&username=${username}&password=${password}`);
      
      if (response.data && response.data.disk_usage) {
        const data = response.data.disk_usage;
        const diskUsagePercentage = data.use_percentage
          ? parseInt(data.use_percentage.replace('%', '')) 
          : 0;

        const currentTime = new Date().toLocaleTimeString();
        
        if (diskUsagePercentage > 94) {
          NotificationManager.error(
            `Sent by IP:${ip}
             Hostname: ${data.hostname}
             Total Space: ${data.size}
             Free Space: ${data.avail}
             Disk Usage: ${data.use_percentage}
             Time: ${currentTime}`,
            'Disk Usage Warning',
            0,
            () => {},
            true,
            { className: 'red-notification' }
          );
        }
        else if (diskUsagePercentage > 90) {
          NotificationManager.warning(
            `Sent by IP:${ip}
             Hostname: ${data.hostname}
             Total Space: ${data.size}
             Free Space: ${data.avail}
             Disk Usage: ${data.use_percentage}
             Time: ${currentTime}`,
            'Disk Usage Warning',
            0,
            () => {},
            true,
            { className: 'red-notification' }
          );
        }
        else {
          NotificationManager.success(
            `Sent by IP:${ip}
             Hostname: ${data.hostname}
             Total Space: ${data.size}
             Free Space: ${data.avail}
             Disk Usage: ${data.use_percentage}
             Time: ${currentTime}`,
            'Disk Usage normal',
            5000,
            () => {},
            true,
            { className: 'yellow-notification' }
          );
        }

        return {
          ip,
          hostname: data.hostname,
          usePercentage: data.use_percentage,
          progress: diskUsagePercentage,
          freeSpace: data.avail,
          totalSpace: data.size,
          usedSpace: data.used,
          timestamp: currentTime,
        };
      } else {
        return { ip, error: 'No disk usage data found.' };
      }
    } catch (error) {
      return { ip, error: 'Error fetching data from API: ' + error.message };
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        config.map(({ ip, apiUrl, username, password }) =>
          fetchApiData(ip, apiUrl, username, password)
        )
      );
      setPcData(prevData => [...prevData, ...results]);
    } catch (error) {
      setError('Error fetching data from all IPs: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 120000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  return (
    <div className="app">
      <div className="data-container">
        {error && <div className="error">{error}</div>}

        {!loading && !error && pcData.length > 0 ? (
          <div className="no-data-message">
            {loading ? 'Loading data...' : 'No data available.'}
          </div>
        ) : (
          <div className="no-data-message">
            {loading ? 'Loading data...' : 'No data available.'}
          </div>
        )}
      </div>

      <NotificationContainer />
    </div>
  );
}

export default App;
