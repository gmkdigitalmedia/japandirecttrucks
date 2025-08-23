import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

interface Vehicle {
  id: number;
  title_description: string;
  manufacturer_name: string;
  model_name: string;
  price_total_yen: number;
  year_month: string;
  is_available: boolean;
  is_featured: boolean;
  views: number;
  url: string;
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicleUrl, setNewVehicleUrl] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [customModelName, setCustomModelName] = useState('');
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);

  const makes = [
    { id: 1, name: 'Toyota' },
    { id: 2, name: 'Daihatsu' },
    { id: 3, name: 'Nissan' },
    { id: 4, name: 'Honda' },
    { id: 5, name: 'Mazda' },
    { id: 6, name: 'Mitsubishi' },
    { id: 7, name: 'Suzuki' },
    { id: 8, name: 'Subaru' }
  ];

  const models = {
    '1': [
      { id: 1, name: 'Land Cruiser 300' },
      { id: 2, name: 'Land Cruiser 200' },
      { id: 3, name: 'Land Cruiser Prado' },
      { id: 4, name: 'Hiace' },
      { id: 5, name: 'Hilux' }
    ],
    '2': [
      { id: 6, name: 'Hijet' },
      { id: 7, name: 'Tanto' }
    ]
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/vehicles?page=${page}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setVehicles(data.data.vehicles);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page]);

  const toggleVehicleSelection = (id: number) => {
    setSelectedVehicles(prev => 
      prev.includes(id) 
        ? prev.filter(vid => vid !== id)
        : [...prev, id]
    );
  };

  const deleteSelectedVehicles = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedVehicles.length} vehicle(s)?`)) {
      return;
    }

    try {
      for (const id of selectedVehicles) {
        await fetch(`http://localhost:8000/api/admin/vehicles/${id}`, {
          method: 'DELETE'
        });
      }
      
      setSelectedVehicles([]);
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicles:', error);
      alert('Failed to delete vehicles');
    }
  };

  const addVehicle = async () => {
    if (!newVehicleUrl || !selectedMake) {
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

    setAddingVehicle(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/vehicles/add-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: newVehicleUrl,
          manufacturer_id: parseInt(selectedMake),
          model_id: useCustomModel ? null : parseInt(selectedModel),
          model_name: useCustomModel ? customModelName.trim() : null
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setShowAddModal(false);
        setNewVehicleUrl('');
        setSelectedMake('');
        setSelectedModel('');
        setCustomModelName('');
        setUseCustomModel(false);
        fetchVehicles();
        alert('Vehicle added successfully!');
      } else {
        alert(data.error || 'Failed to add vehicle');
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Failed to add vehicle');
    } finally {
      setAddingVehicle(false);
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
          <div className="flex gap-4">
            {selectedVehicles.length > 0 && (
              <button
                onClick={deleteSelectedVehicles}
                className="btn-secondary bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Selected ({selectedVehicles.length})
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add Vehicle
            </button>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVehicles(vehicles.map(v => v.id));
                      } else {
                        setSelectedVehicles([]);
                      }
                    }}
                    checked={selectedVehicles.length === vehicles.length && vehicles.length > 0}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Make/Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className={selectedVehicles.includes(vehicle.id) ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.includes(vehicle.id)}
                      onChange={() => toggleVehicleSelection(vehicle.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {vehicle.title_description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.manufacturer_name} {vehicle.model_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.year_month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{vehicle.price_total_yen?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      vehicle.is_available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.is_available ? 'Available' : 'Sold'}
                    </span>
                    {vehicle.is_featured && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a
                      href={vehicle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View Source
                    </a>
                    <a
                      href={`http://localhost:3000/vehicles/${vehicle.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View on Site
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New Vehicle</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle URL
                </label>
                <input
                  type="url"
                  value={newVehicleUrl}
                  onChange={(e) => setNewVehicleUrl(e.target.value)}
                  placeholder="https://www.carsensor.net/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                      id="useCustomModel"
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
                    <label htmlFor="useCustomModel" className="text-sm text-gray-700">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  ) : (
                    models[selectedMake] && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Model
                        </label>
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select Model</option>
                          {models[selectedMake].map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                          ))}
                        </select>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewVehicleUrl('');
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
                onClick={addVehicle}
                disabled={addingVehicle}
                className="btn-primary disabled:opacity-50"
              >
                {addingVehicle ? 'Adding...' : 'Add Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}