// MyForm.tsx
import React, { useState, useEffect } from "react";
import AppSidebar from "@/components/ui/AppSidebar";
import Navbar from "@/components/ui/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Edit, Trash2, Plus, X } from "lucide-react";

const BASE_URL = "https://hbr.lytortech.com";

interface Farm {
  id: number;
  name: string;
  description: string;
  location: string;
  contactNumber: string;
  email: string;
  pricePerDay: number;
  maxCapacity: number;
  amenities: string[];
  activities: string[];
  imageUrls: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  content: Farm[];
  pageable: {
    sort: { sorted: boolean; unsorted: boolean };
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
}

export default function MyForm() {
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [viewingFarm, setViewingFarm] = useState<Farm | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    contactNumber: "",
    email: "",
    pricePerDay: "",
    maxCapacity: "",
    amenities: "",
    activities: "",
    isActive: true
  });

  const [images, setImages] = useState<FileList | null>(null);

  // List states
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch farms on component mount and page change
  useEffect(() => {
    fetchFarms();
  }, [currentPage]);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      console.log(`Fetching farms - Page: ${currentPage}, Size: ${pageSize}`);
      const response = await fetch(
        `${BASE_URL}/api/farms?page=${currentPage}&size=${pageSize}&sortBy=id&sortDir=asc`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      if (response.ok) {
        const data: ApiResponse = await response.json();
        console.log("Farms fetched successfully:", data);
        setFarms(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        console.error("Failed to fetch farms:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching farms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImages(e.target.files);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      contactNumber: "",
      email: "",
      pricePerDay: "",
      maxCapacity: "",
      amenities: "",
      activities: "",
      isActive: true
    });
    setImages(null);
    setEditingFarm(null);

    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare farm data object
      const farmData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        contactNumber: formData.contactNumber,
        email: formData.email,
        pricePerDay: parseFloat(formData.pricePerDay),
        maxCapacity: parseInt(formData.maxCapacity),
        amenities: formData.amenities.split(",").map(item => item.trim()).filter(item => item),
        activities: formData.activities.split(",").map(item => item.trim()).filter(item => item),
        isActive: formData.isActive
      };

      console.log(`${editingFarm ? 'Updating' : 'Creating'} farm:`, farmData);

      // Create FormData object
      const formDataToSend = new FormData();

      // Add farm data as @RequestPart (JSON string)
      formDataToSend.append("farm", JSON.stringify(farmData));

      // Add images as @RequestParam if they exist
      if (images && images.length > 0) {
        Array.from(images).forEach(image => {
          formDataToSend.append("images", image);
        });
        console.log(`Adding ${images.length} images to request`);
      }

      // Log FormData contents for debugging
      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: ${value.name} (${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const url = editingFarm
        ? `${BASE_URL}/api/farms/${editingFarm.id}/with-images`
        : `${BASE_URL}/api/farms`;

      const method = editingFarm ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
        headers: {
          'ngrok-skip-browser-warning': 'true'
          // Do NOT set Content-Type header - let the browser set it automatically for multipart/form-data
        }
      });

      console.log(`Response status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const result = await response.json();
        console.log(`Farm ${editingFarm ? 'updated' : 'created'} successfully:`, result);

        setShowAddForm(false);
        resetForm();
        fetchFarms();
      } else {
        const errorText = await response.text();
        console.error(`Failed to ${editingFarm ? 'update' : 'create'} farm:`, response.status, errorText);
        alert(`Failed to ${editingFarm ? 'update' : 'create'} farm: ${errorText}`);
      }
    } catch (error) {
      console.error(`Error ${editingFarm ? 'updating' : 'creating'} farm:`, error);
      alert(`Error ${editingFarm ? 'updating' : 'creating'} farm: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (farm: Farm) => {
    console.log("Editing farm:", farm);
    setFormData({
      name: farm.name,
      description: farm.description,
      location: farm.location,
      contactNumber: farm.contactNumber,
      email: farm.email,
      pricePerDay: farm.pricePerDay.toString(),
      maxCapacity: farm.maxCapacity.toString(),
      amenities: farm.amenities.join(", "),
      activities: farm.activities.join(", "),
      isActive: farm.isActive
    });
    setEditingFarm(farm);
    setShowAddForm(true);

    // Clear the file input when editing (since we don't want to show existing images in file input)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    setImages(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this farm?")) return;

    setLoading(true);
    try {
      console.log("Deleting farm with ID:", id);
      const response = await fetch(`${BASE_URL}/api/farms/${id}`, {
        method: "DELETE",
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.ok) {
        console.log("Farm deleted successfully");
        fetchFarms();
      } else {
        console.error("Failed to delete farm:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting farm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (farm: Farm) => {
    console.log("Toggling availability for farm:", farm.id, "Current status:", farm.isActive);

    const newStatus = !farm.isActive;
    console.log("New availability status will be:", newStatus ? "Available" : "Unavailable");

    // Update the local state immediately for better UX
    setFarms(prev => prev.map(f =>
      f.id === farm.id ? { ...f, isActive: newStatus } : f
    ));

    try {
      // TODO: Implement PATCH API call when your API is ready
      // const response = await fetch(`${BASE_URL}/api/farms/${farm.id}`, {
      //   method: "PATCH",
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'ngrok-skip-browser-warning': 'true'
      //   },
      //   body: JSON.stringify({ isActive: newStatus })
      // });

      // if (!response.ok) {
      //   // Revert the change if API call fails
      //   setFarms(prev => prev.map(f => 
      //     f.id === farm.id ? { ...f, isActive: farm.isActive } : f
      //   ));
      //   console.error("Failed to update farm availability");
      // } else {
      //   console.log("Farm availability updated successfully");
      // }

      // For now, just logging the action since API is not ready
      console.log(`Farm ${farm.id} availability changed to: ${newStatus ? "Available" : "Unavailable"}`);

    } catch (error) {
      console.error("Error updating farm availability:", error);
      // Revert the change on error
      setFarms(prev => prev.map(f =>
        f.id === farm.id ? { ...f, isActive: farm.isActive } : f
      ));
    }
  };

  const handleView = (farm: Farm) => {
    console.log("Viewing farm:", farm);
    setViewingFarm(farm);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Farm Management</h1>
              <p className="text-gray-600 mt-2">
                Manage your farm listings and information
              </p>
            </div>

            <button
              onClick={() => {
                setShowAddForm(true);
                resetForm();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add Farm
            </button>
          </div>

          {/* Add/Edit Farm Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                      {editingFarm ? "Edit Farm" : "Add New Farm"}
                    </h2>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        resetForm();
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location *
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Number *
                        </label>
                        <input
                          type="tel"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price per Day ($) *
                        </label>
                        <input
                          type="number"
                          name="pricePerDay"
                          value={formData.pricePerDay}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Capacity *
                        </label>
                        <input
                          type="number"
                          name="maxCapacity"
                          value={formData.maxCapacity}
                          onChange={handleInputChange}
                          required
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amenities (comma separated)
                      </label>
                      <input
                        type="text"
                        name="amenities"
                        value={formData.amenities}
                        onChange={handleInputChange}
                        placeholder="WiFi, Parking, Restaurant"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activities (comma separated)
                      </label>
                      <input
                        type="text"
                        name="activities"
                        value={formData.activities}
                        onChange={handleInputChange}
                        placeholder="Horse Riding, Fishing, Hiking"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Images{" "}
                        <span className="text-red-500 text-xs">(mandatory for adding farm)</span>
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>


                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Available for Booking
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors"
                      >
                        {loading ? "Saving..." : editingFarm ? "Update Farm" : "Create Farm"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          resetForm();
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* View Farm Modal */}
          {viewingFarm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Farm Details</h2>
                    <button
                      onClick={() => setViewingFarm(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-700">Basic Information</h3>
                      <div className="mt-2 space-y-2">
                        <p><strong>Name:</strong> {viewingFarm.name}</p>
                        <p><strong>Location:</strong> {viewingFarm.location}</p>
                        <p><strong>Contact:</strong> {viewingFarm.contactNumber}</p>
                        <p><strong>Email:</strong> {viewingFarm.email}</p>
                        <p><strong>Price per Day:</strong> ${viewingFarm.pricePerDay}</p>
                        <p><strong>Max Capacity:</strong> {viewingFarm.maxCapacity} people</p>
                        <p><strong>Availability:</strong>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${viewingFarm.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {viewingFarm.isActive ? 'Available' : 'Unavailable'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700">Additional Details</h3>
                      <div className="mt-2 space-y-2">
                        <div>
                          <strong>Description:</strong>
                          <p className="text-sm text-gray-600 mt-1">{viewingFarm.description}</p>
                        </div>
                        <div>
                          <strong>Amenities:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {viewingFarm.amenities.map((amenity, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <strong>Activities:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {viewingFarm.activities.map((activity, index) => (
                              <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {viewingFarm.imageUrls.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-700 mb-2">Images</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {viewingFarm.imageUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Farm image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 text-sm text-gray-500">
                    <p>Created: {new Date(viewingFarm.createdAt).toLocaleDateString()}</p>
                    <p>Updated: {new Date(viewingFarm.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Farms List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Farms List</span>
                <span className="text-sm font-normal text-gray-500">
                  Total: {totalElements} farms
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !farms.length ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500">Loading farms...</div>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left p-3 font-semibold">Name</th>
                          <th className="text-left p-3 font-semibold">Location</th>
                          <th className="text-left p-3 font-semibold">Phone</th>
                          <th className="text-left p-3 font-semibold">Price</th>
                          <th className="text-center p-3 font-semibold">Availability</th>
                          <th className="text-center p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {farms.map((farm) => (
                          <tr key={farm.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3">
                              <div className="font-medium">{farm.name}</div>
                            </td>
                            <td className="p-3 text-gray-600">{farm.location}</td>
                            <td className="p-3 text-gray-600">{farm.contactNumber}</td>
                            <td className="p-3 font-medium">${farm.pricePerDay}/day</td>
                            <td className="p-3 text-center">
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={farm.isActive}
                                  onChange={() => handleToggleActive(farm)}
                                  className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                <span className={`ml-3 text-xs font-medium ${farm.isActive ? 'text-green-800' : 'text-red-800'
                                  }`}>
                                  {farm.isActive ? 'Available' : 'Unavailable'}
                                </span>
                              </label>
                            </td>
                            <td className="p-3">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleView(farm)}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="View"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleEdit(farm)}
                                  className="text-yellow-600 hover:text-yellow-800 p-1"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(farm.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {farms.map((farm) => (
                      <div key={farm.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{farm.name}</h3>
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={farm.isActive}
                              onChange={() => handleToggleActive(farm)}
                              className="sr-only peer"
                            />
                            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                            <span className={`ml-2 text-xs font-medium ${farm.isActive ? 'text-green-800' : 'text-red-800'
                              }`}>
                              {farm.isActive ? 'Available' : 'Unavailable'}
                            </span>
                          </label>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <p><strong>Location:</strong> {farm.location}</p>
                          <p><strong>Phone:</strong> {farm.contactNumber}</p>
                          <p><strong>Price:</strong> ${farm.pricePerDay}/day</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(farm)}
                            className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(farm)}
                            className="flex-1 bg-yellow-100 text-yellow-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(farm.id)}
                            className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {farms.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                      No farms found. Click "Add Farm" to create your first farm listing.
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        Page {currentPage + 1} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                          disabled={currentPage === 0}
                          className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                          disabled={currentPage === totalPages - 1}
                          className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}