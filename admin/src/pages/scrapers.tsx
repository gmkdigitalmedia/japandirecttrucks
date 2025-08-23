import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

interface ScraperJob {
  id: number;
  search_url: string;
  manufacturer_id: number;
  model_id: number;
  manufacturer_name: string;
  model_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_found: number;
  total_added: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

interface Make {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
  manufacturer_id: number;
}

export default function Scrapers() {
  const [jobs, setJobs] = useState<ScraperJob[]>([]);
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchUrl, setSearchUrl] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [customModelName, setCustomModelName] = useState('');
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [jobsRes, makesRes, modelsRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/scraper-jobs'),
        fetch('http://localhost:8000/api/admin/makes'),
        fetch('http://localhost:8000/api/admin/models')
      ]);

      const jobsData = await jobsRes.json();
      const makesData = await makesRes.json();
      const modelsData = await modelsRes.json();

      if (jobsData.success) setJobs(jobsData.data);
      if (makesData.success) setMakes(makesData.data);
      if (modelsData.success) setModels(modelsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 5 seconds to show progress
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getAvailableModels = () => {
    if (!selectedMake) return [];
    return models.filter(m => m.manufacturer_id === parseInt(selectedMake));
  };

  const submitScraperJob = async () => {
    if (!searchUrl || !selectedMake) {
      alert('Please provide URL and select a manufacturer');
      return;
    }

    if (!useCustomModel && !selectedModel) {
      alert('Please select a model or enter a custom model name');
      return;
    }

    if (useCustomModel && !customModelName.trim()) {
      alert('Please enter a model name');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/scraper-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_url: searchUrl,
          manufacturer_id: parseInt(selectedMake),
          model_id: useCustomModel ? null : parseInt(selectedModel),
          model_name: useCustomModel ? customModelName.trim() : null
        })
      });

      if (response.ok) {
        setShowAddModal(false);
        setSearchUrl('');
        setSelectedMake('');
        setSelectedModel('');
        setCustomModelName('');
        setUseCustomModel(false);
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start scraper');
      }
    } catch (error) {
      console.error('Error submitting scraper job:', error);
      alert('Failed to start scraper');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      pending: 'bg-gray-100 text-gray-800',
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || classes.pending;
  };

  const cancelJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to cancel this scraper job?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/admin/scraper-jobs/${jobId}/cancel`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchData(); // Refresh the data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to cancel job');
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
      alert('Failed to cancel job');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Scrapers</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            New Scraper Job
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">How to use scrapers:</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Go to CarSensor.net and search for vehicles you want to add</li>
            <li>Copy the search results URL from your browser</li>
            <li>Select the appropriate make and model</li>
            <li>The scraper will automatically add all vehicles from the search results</li>
          </ol>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make/Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Search URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{job.manufacturer_name}</div>
                    <div className="text-gray-500">{job.model_name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <a
                      href={job.search_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 truncate block max-w-xs"
                    >
                      {job.search_url}
                    </a>
                    {job.error_message && (
                      <div className="text-red-600 text-xs mt-1">{job.error_message}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {job.status === 'completed' ? (
                      <div>
                        <div className="text-green-600 font-medium">
                          {job.total_added} added
                        </div>
                        <div className="text-gray-500 text-xs">
                          of {job.total_found} found
                        </div>
                      </div>
                    ) : job.status === 'running' ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                        <span>Processing...</span>
                      </div>
                    ) : job.status === 'failed' ? (
                      <span className="text-red-600">Failed</span>
                    ) : (
                      <span className="text-gray-500">Waiting...</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(job.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {(job.status === 'running' || job.status === 'pending') && (
                      <button
                        onClick={() => cancelJob(job.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No scraper jobs yet. Click "New Scraper Job" to start adding vehicles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Scraper Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Start New Scraper Job</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CarSensor Search URL
                </label>
                <input
                  type="url"
                  value={searchUrl}
                  onChange={(e) => setSearchUrl(e.target.value)}
                  placeholder="https://www.carsensor.net/usedcar/search.php?..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the URL from your CarSensor search results page
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Make
                </label>
                <select
                  value={selectedMake}
                  onChange={(e) => {
                    setSelectedMake(e.target.value);
                    setSelectedModel('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Make</option>
                  {makes.map(make => (
                    <option key={make.id} value={make.id}>{make.name}</option>
                  ))}
                </select>
              </div>

              {selectedMake && (
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="useCustomModelScraper"
                      checked={useCustomModel}
                      onChange={(e) => {
                        setUseCustomModel(e.target.checked);
                        if (e.target.checked) {
                          setSelectedModel('');
                        } else {
                          setCustomModelName('');
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor="useCustomModelScraper" className="text-sm text-gray-700">
                      Enter custom model name
                    </label>
                  </div>

                  {useCustomModel ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model Name
                      </label>
                      <input
                        type="text"
                        value={customModelName}
                        onChange={(e) => setCustomModelName(e.target.value)}
                        placeholder="e.g., Land Cruiser 300 ZX"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model
                      </label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Model</option>
                        {getAvailableModels().map(model => (
                          <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchUrl('');
                  setSelectedMake('');
                  setSelectedModel('');
                  setCustomModelName('');
                  setUseCustomModel(false);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={submitScraperJob}
                disabled={submitting}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? 'Starting...' : 'Start Scraper'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}