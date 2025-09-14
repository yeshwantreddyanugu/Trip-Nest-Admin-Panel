import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, RefreshCw, CheckCircle, XCircle, AlertCircle, X, AlertTriangle } from 'lucide-react';
import AppSidebar from '@/components/ui/AppSidebar';
import Navbar from '@/components/ui/Navbar';

const BASE_URL = 'https://hbr.lytortech.com';

// Simple Card components (since we don't have shadcn/ui imports working)
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md border ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children }) => (
  <div className="px-6 py-4">
    {children}
  </div>
);

const Settings = () => {
  const [hotels, setHotels] = useState([]);
  const [propertyLogins, setPropertyLogins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalType, setModalType] = useState('create');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedLogin, setSelectedLogin] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    hotelIDValue: '',
    email: '',
    password: '',
    hotelName: ''
  });

  // Logging utility
  const log = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      console[level](logMessage, data);
    } else {
      console[level](logMessage);
    }
  };

  // Toast utility
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Fetch Hotels
  const fetchHotels = async (page = 0) => {
    setLoading(true);
    log('info', `Fetching hotels - Page: ${page}, Size: ${pageSize}`);
    
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/hotels?page=${page}&size=${pageSize}&sortBy=id&sortDir=asc`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      log('info', 'Hotels fetched successfully', result);
      
      if (result.status === 'success') {
        setHotels(result.data.content);
        setTotalPages(result.data.totalPages);
        setCurrentPage(result.data.pageNumber);
      } else {
        throw new Error(result.message || 'Failed to fetch hotels');
      }
    } catch (error) {
      log('error', 'Error fetching hotels', error);
      showToast('error', 'Failed to fetch hotels: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Property Logins
  const fetchPropertyLogins = async () => {
    log('info', 'Fetching property logins');
    
    try {
      const response = await fetch(`${BASE_URL}/api/property-login/all`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      log('info', 'Property logins fetched successfully', result);
      setPropertyLogins(Array.isArray(result) ? result : []);
    } catch (error) {
      log('error', 'Error fetching property logins', error);
      showToast('error', 'Failed to fetch property logins: ' + error.message);
    }
  };

  // Create Property Login
  const createPropertyLogin = async (loginData) => {
    log('info', 'Creating property login', loginData);
    
    try {
      const response = await fetch(`${BASE_URL}/api/property-login/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(loginData),
      });
      
      const result = await response.text();
      
      if (response.ok) {
        log('info', 'Property login created successfully', result);
        fetchPropertyLogins();
        closeModal();
        showToast('success', 'Property login created successfully!');
      } else {
        log('error', 'Failed to create property login', result);
        showToast('error', result || 'Failed to create property login');
      }
    } catch (error) {
      log('error', 'Error creating property login', error);
      showToast('error', 'Error creating property login: ' + error.message);
    }
  };

  // Update Property Login
  const updatePropertyLogin = async (id, loginData) => {
    log('info', `Updating property login with ID: ${id}`, loginData);
    
    try {
      const response = await fetch(`${BASE_URL}/api/property-login/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(loginData),
      });
      
      if (response.ok) {
        const result = await response.json();
        log('info', 'Property login updated successfully', result);
        fetchPropertyLogins();
        closeModal();
        showToast('success', 'Property login updated successfully!');
      } else {
        const errorResult = await response.json();
        log('error', 'Failed to update property login', errorResult);
        showToast('error', 'Failed to update property login');
      }
    } catch (error) {
      log('error', 'Error updating property login', error);
      showToast('error', 'Error updating property login: ' + error.message);
    }
  };

  // Delete Property Login
  const deletePropertyLogin = async (id) => {
    log('info', `Deleting property login with ID: ${id}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/property-login/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (response.ok) {
        const result = await response.text();
        log('info', 'Property login deleted successfully', result);
        fetchPropertyLogins();
        showToast('success', 'Property login deleted successfully!');
      } else {
        log('error', 'Failed to delete property login');
        showToast('error', 'Failed to delete property login');
      }
    } catch (error) {
      log('error', 'Error deleting property login', error);
      showToast('error', 'Error deleting property login: ' + error.message);
    }
  };

  // Modal handlers
  const openCreateModal = (hotel) => {
    log('info', 'Opening create modal for hotel', hotel);
    setSelectedHotel(hotel);
    setModalType('create');
    setFormData({
      hotelIDValue: hotel.id,
      email: '',
      password: '',
      hotelName: hotel.name
    });
    setShowModal(true);
  };

  const openUpdateModal = (login) => {
    log('info', 'Opening update modal for login', login);
    setSelectedLogin(login);
    setModalType('update');
    setFormData({
      hotelIDValue: login.hotelIDValue,
      email: login.email,
      password: login.password,
      hotelName: login.hotelName
    });
    setShowModal(true);
  };

  const closeModal = () => {
    log('info', 'Closing modal');
    setShowModal(false);
    setSelectedHotel(null);
    setSelectedLogin(null);
    setFormData({
      hotelIDValue: '',
      email: '',
      password: '',
      hotelName: ''
    });
  };

  // Delete confirmation modal handlers
  const openDeleteModal = (login) => {
    setDeleteTarget(login);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deletePropertyLogin(deleteTarget.id);
      closeDeleteModal();
    }
  };

  const handleSubmit = () => {
    log('info', 'Form submitted', { modalType, formData });
    
    if (!formData.email || !formData.password) {
      showToast('error', 'Please fill in all required fields');
      return;
    }
    
    if (modalType === 'create') {
      createPropertyLogin(formData);
    } else if (modalType === 'update') {
      updatePropertyLogin(selectedLogin.id, formData);
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getExistingLogin = (hotelId) => {
    return propertyLogins.find(login => login.hotelIDValue === hotelId);
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    log('info', 'Component mounted, loading initial data');
    fetchHotels();
    fetchPropertyLogins();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Hotel & Property Login Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage hotel property login credentials and access controls.
            </p>
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search hotels by name, city, or state..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                fetchHotels(currentPage);
                fetchPropertyLogins();
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Hotels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No hotels found.</p>
              </div>
            ) : (
              filteredHotels.map((hotel) => {
                const existingLogin = getExistingLogin(hotel.id);
                return (
                  <Card key={hotel.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                        <p className="text-sm text-gray-600">{hotel.city}, {hotel.state}</p>
                        <p className="text-sm text-gray-500">ID: {hotel.id}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hotel.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {hotel.status}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Type: {hotel.type}</p>
                      <p className="text-sm text-gray-600">Rating: ⭐ {hotel.rating}</p>
                      <p className="text-sm text-gray-600">Price: ₹{hotel.minPrice} - ₹{hotel.maxPrice}</p>
                    </div>

                    {existingLogin ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm text-green-800 font-medium">Login Configured</p>
                          <p className="text-sm text-green-600">Email: {existingLogin.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openUpdateModal(existingLogin)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1 text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            Update
                          </button>
                          <button
                            onClick={() => openDeleteModal(existingLogin)}
                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-1 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => openCreateModal(hotel)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Set Login
                      </button>
                    )}
                  </Card>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => fetchHotels(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => fetchHotels(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Create/Update Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  {modalType === 'create' ? 'Set Property Login' : 'Update Property Login'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hotel Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      value={formData.hotelName}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hotel ID
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      value={formData.hotelIDValue}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.modal ? "text" : "password"}
                        required
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('modal')}
                      >
                        {showPassword.modal ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {modalType === 'create' ? 'Create Login' : 'Update Login'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && deleteTarget && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-10 w-10 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
                    <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700">
                    Are you sure you want to delete the property login for{' '}
                    <span className="font-semibold">{deleteTarget.hotelName}</span>?
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Email: <span className="font-medium">{deleteTarget.email}</span>
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete Login
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notifications */}
          {toast && (
            <div className="fixed top-4 right-4 z-50">
              <div className={`
                flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 min-w-80 max-w-md
                transform transition-all duration-300 ease-in-out
                ${toast.type === 'success' 
                  ? 'bg-green-50 border-green-500 text-green-800' 
                  : toast.type === 'error'
                  ? 'bg-red-50 border-red-500 text-red-800'
                  : 'bg-blue-50 border-blue-500 text-blue-800'
                }
              `}>
                <div className="flex-shrink-0">
                  {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                  {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{toast.message}</p>
                </div>
                <button
                  onClick={() => setToast(null)}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;