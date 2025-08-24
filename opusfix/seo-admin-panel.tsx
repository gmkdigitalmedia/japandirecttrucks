import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Loader, Activity } from 'lucide-react';

export default function SEOAdminPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/seo/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch SEO stats:', error);
    }
  };

  const generateSEO = async (force = false) => {
    setGenerating(true);
    setMessage('');
    
    try {
      const endpoint = force 
        ? '/api/admin/seo/regenerate-all' 
        : '/api/admin/seo/generate';
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        // Refresh stats after 2 seconds
        setTimeout(fetchStats, 2000);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Failed to start SEO generation: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  const coverageColor = stats.percentage >= 90 ? 'green' : 
                        stats.percentage >= 70 ? 'yellow' : 'red';

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">SEO Management Dashboard</h2>
        <p className="text-gray-600">Automatic SEO generation for all vehicles</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Vehicles</span>
            <Activity className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.total.toLocaleString()}</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">With SEO</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.withSeo.toLocaleString()}</div>
          <div className="text-xs text-gray-600 mt-1">{stats.percentage}% coverage</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Missing SEO</span>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.withoutSeo.toLocaleString()}</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Recently Updated (24h)</div>
          <div className="text-xl font-semibold text-blue-600">
            {stats.recentlyUpdated?.toLocaleString() || '0'}
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Outdated SEO (30+ days)</div>
          <div className="text-xl font-semibold text-yellow-600">
            {stats.outdatedSeo?.toLocaleString() || '0'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>SEO Coverage</span>
          <span>{stats.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${
              coverageColor === 'green' ? 'from-green-400 to-green-600' :
              coverageColor === 'yellow' ? 'from-yellow-400 to-yellow-600' :
              'from-red-400 to-red-600'
            } transition-all duration-500`}
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Status Indicator */}
      {stats.isRunning && (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg flex items-center">
          <Loader className="animate-spin h-5 w-5 text-blue-600 mr-3" />
          <span className="text-blue-800">SEO generation is currently running...</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => generateSEO(false)}
          disabled={generating || stats.isRunning}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {generating ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
              Starting...
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5 mr-2" />
              Generate Missing SEO
            </>
          )}
        </button>

        <button
          onClick={() => {
            if (confirm('This will regenerate SEO for ALL vehicles. This may take a while. Continue?')) {
              generateSEO(true);
            }
          }}
          disabled={generating || stats.isRunning}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {generating ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
              Starting...
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5 mr-2" />
              Force Regenerate All
            </>
          )}
        </button>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Automatic SEO Generation</h4>
        <ul className="space-y-1">
          <li>• SEO is generated automatically for new vehicles every 30 minutes</li>
          <li>• Outdated SEO (30+ days old) is refreshed daily</li>
          <li>• SEO is also generated on-demand when a vehicle page is viewed</li>
          <li>• Each vehicle gets unique, optimized title, description, and keywords</li>
        </ul>
      </div>
    </div>
  );
}