import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

interface Make {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
  manufacturer_id: number;
}

export default function MakesModels() {
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMakeModal, setShowAddMakeModal] = useState(false);
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [newMakeName, setNewMakeName] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [selectedMakeForModel, setSelectedMakeForModel] = useState('');
  const [addingMake, setAddingMake] = useState(false);
  const [addingModel, setAddingModel] = useState(false);

  const fetchMakesAndModels = async () => {
    try {
      const [makesRes, modelsRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/makes'),
        fetch('http://localhost:8000/api/admin/models')
      ]);

      const makesData = await makesRes.json();
      const modelsData = await modelsRes.json();

      if (makesData.success) setMakes(makesData.data);
      if (modelsData.success) setModels(modelsData.data);
    } catch (error) {
      console.error('Error fetching makes and models:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMakesAndModels();
  }, []);

  const addMake = async () => {
    if (!newMakeName.trim()) {
      alert('Please enter a make name');
      return;
    }

    setAddingMake(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/makes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMakeName })
      });

      if (response.ok) {
        setShowAddMakeModal(false);
        setNewMakeName('');
        fetchMakesAndModels();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add make');
      }
    } catch (error) {
      console.error('Error adding make:', error);
      alert('Failed to add make');
    } finally {
      setAddingMake(false);
    }
  };

  const addModel = async () => {
    if (!newModelName.trim() || !selectedMakeForModel) {
      alert('Please enter a model name and select a make');
      return;
    }

    setAddingModel(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newModelName,
          manufacturer_id: parseInt(selectedMakeForModel)
        })
      });

      if (response.ok) {
        setShowAddModelModal(false);
        setNewModelName('');
        setSelectedMakeForModel('');
        fetchMakesAndModels();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add model');
      }
    } catch (error) {
      console.error('Error adding model:', error);
      alert('Failed to add model');
    } finally {
      setAddingModel(false);
    }
  };

  const deleteMake = async (id: number, name: string) => {
    const modelCount = models.filter(m => m.manufacturer_id === id).length;
    if (modelCount > 0) {
      alert(`Cannot delete ${name} because it has ${modelCount} associated models`);
      return;
    }

    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await fetch(`http://localhost:8000/api/admin/makes/${id}`, {
        method: 'DELETE'
      });
      fetchMakesAndModels();
    } catch (error) {
      console.error('Error deleting make:', error);
      alert('Failed to delete make');
    }
  };

  const deleteModel = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await fetch(`http://localhost:8000/api/admin/models/${id}`, {
        method: 'DELETE'
      });
      fetchMakesAndModels();
    } catch (error) {
      console.error('Error deleting model:', error);
      alert('Failed to delete model');
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
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Makes & Models Management</h1>

        {/* Makes Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Makes</h2>
            <button
              onClick={() => setShowAddMakeModal(true)}
              className="btn-primary"
            >
              Add Make
            </button>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Models</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {makes.map((make) => (
                  <tr key={make.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{make.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{make.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {models.filter(m => m.manufacturer_id === make.id).length}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => deleteMake(make.id, make.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Models Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Models</h2>
            <button
              onClick={() => setShowAddModelModal(true)}
              className="btn-primary"
            >
              Add Model
            </button>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {models.map((model) => {
                  const make = makes.find(m => m.id === model.manufacturer_id);
                  return (
                    <tr key={model.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{model.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{model.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{make?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => deleteModel(model.id, model.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Make Modal */}
      {showAddMakeModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New Make</h2>
            
            <input
              type="text"
              value={newMakeName}
              onChange={(e) => setNewMakeName(e.target.value)}
              placeholder="Make name (e.g., Toyota)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              onKeyPress={(e) => e.key === 'Enter' && addMake()}
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddMakeModal(false);
                  setNewMakeName('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={addMake}
                disabled={addingMake}
                className="btn-primary disabled:opacity-50"
              >
                {addingMake ? 'Adding...' : 'Add Make'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Model Modal */}
      {showAddModelModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New Model</h2>
            
            <div className="space-y-4">
              <select
                value={selectedMakeForModel}
                onChange={(e) => setSelectedMakeForModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Make</option>
                {makes.map(make => (
                  <option key={make.id} value={make.id}>{make.name}</option>
                ))}
              </select>

              <input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="Model name (e.g., Land Cruiser 300)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && addModel()}
              />
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => {
                  setShowAddModelModal(false);
                  setNewModelName('');
                  setSelectedMakeForModel('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={addModel}
                disabled={addingModel}
                className="btn-primary disabled:opacity-50"
              >
                {addingModel ? 'Adding...' : 'Add Model'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}