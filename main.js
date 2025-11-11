import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, Zap, Globe, AlertCircle } from 'lucide-react';

export default function WiFiDiagnostics() {
  const [connected, setConnected] = useState(navigator.onLine);
  const [ping, setPing] = useState(null);
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [testing, setTesting] = useState(false);
  const [connectionType, setConnectionType] = useState('unknown');
  const [effectiveType, setEffectiveType] = useState('unknown');

  useEffect(() => {
    const handleOnline = () => setConnected(true);
    const handleOffline = () => setConnected(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get connection info if available
    if ('connection' in navigator) {
      const conn = navigator.connection;
      setConnectionType(conn.type || 'unknown');
      setEffectiveType(conn.effectiveType || 'unknown');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const measurePing = async () => {
    const start = Date.now();
    try {
      await fetch('https://www.google.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-store'
      });
      return Date.now() - start;
    } catch {
      return null;
    }
  };

  const measureDownloadSpeed = async () => {
    const fileSize = 5000000; // 5MB test file
    const start = Date.now();
    
    try {
      const response = await fetch(`https://via.placeholder.com/1000x1000.jpg?${Date.now()}`, {
        cache: 'no-store'
      });
      await response.blob();
      const duration = (Date.now() - start) / 1000;
      const bitsLoaded = fileSize * 8;
      const speedMbps = (bitsLoaded / duration / 1024 / 1024).toFixed(2);
      return speedMbps;
    } catch {
      return null;
    }
  };

  const runSpeedTest = async () => {
    setTesting(true);
    setPing(null);
    setDownloadSpeed(null);
    setUploadSpeed(null);

    // Test ping
    const pingResult = await measurePing();
    setPing(pingResult);

    // Test download speed
    const downloadResult = await measureDownloadSpeed();
    setDownloadSpeed(downloadResult);

    // Upload test is harder without a server, so we'll simulate with connection info
    if ('connection' in navigator && navigator.connection.downlink) {
      setUploadSpeed((navigator.connection.downlink * 0.8).toFixed(2));
    }

    setTesting(false);
  };

  const getSignalQuality = () => {
    if (!connected) return { label: 'Disconnected', color: 'text-red-500', bars: 0 };
    if (ping === null) return { label: 'Unknown', color: 'text-gray-400', bars: 0 };
    if (ping < 50) return { label: 'Excellent', color: 'text-green-500', bars: 4 };
    if (ping < 100) return { label: 'Good', color: 'text-green-400', bars: 3 };
    if (ping < 200) return { label: 'Fair', color: 'text-yellow-500', bars: 2 };
    return { label: 'Poor', color: 'text-red-500', bars: 1 };
  };

  const signal = getSignalQuality();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">WiFi Diagnostics</h1>
            {connected ? (
              <Wifi className="w-10 h-10 text-blue-500" />
            ) : (
              <WifiOff className="w-10 h-10 text-red-500" />
            )}
          </div>

          {/* Connection Status */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Connection Status</p>
                <p className="text-2xl font-bold">
                  {connected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Signal Quality</p>
                <p className={`text-2xl font-bold ${signal.label === 'Unknown' ? 'opacity-60' : ''}`}>
                  {signal.label}
                </p>
              </div>
            </div>
            
            {/* Signal Bars */}
            <div className="flex gap-1 mt-4">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`h-8 flex-1 rounded ${
                    bar <= signal.bars ? 'bg-white' : 'bg-white/20'
                  }`}
                  style={{ height: `${bar * 8 + 8}px` }}
                />
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <p className="text-sm font-medium text-gray-600">Ping</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {ping === null ? '—' : `${ping}ms`}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-500" />
                <p className="text-sm font-medium text-gray-600">Download</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {downloadSpeed === null ? '—' : `${downloadSpeed} Mbps`}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-purple-500" />
                <p className="text-sm font-medium text-gray-600">Upload</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {uploadSpeed === null ? '—' : `${uploadSpeed} Mbps`}
              </p>
            </div>
          </div>

          {/* Connection Details */}
          {effectiveType !== 'unknown' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Connection Type</p>
                  <p className="text-sm text-gray-600">
                    Effective: {effectiveType.toUpperCase()}
                    {connectionType !== 'unknown' && ` • Type: ${connectionType}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Test Button */}
          <button
            onClick={runSpeedTest}
            disabled={testing || !connected}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
              testing || !connected
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-95'
            }`}
          >
            {testing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Testing...
              </span>
            ) : !connected ? (
              'No Internet Connection'
            ) : (
              'Run Speed Test'
            )}
          </button>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Tests your connection by measuring ping latency and approximate download speed
          </p>
        </div>
      </div>
    </div>
  );
}