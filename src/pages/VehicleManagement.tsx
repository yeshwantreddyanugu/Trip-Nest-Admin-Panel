import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppSidebar from '@/components/ui/AppSidebar';
import Navbar from '@/components/ui/Navbar';
import VehicleTable from '@/components/vehicles/VehicleTable';
import VehicleFormModal from '@/components/vehicles/VehicleFormModal';
import VehicleViewModal from '@/components/vehicles/VehicleViewModal';
import ConfirmationDialog from '@/components/users/ConfirmationDialog';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'https://hbr.lytortech.com/api/v1/vehicles';

export interface Vehicle {
  id: string;
  name: string;
  vehicleNumber: string;
  type: 'Bike' | 'Scooter' | 'Car' | 'SUV' | 'Other';
  category: '2W' | '4W';
  description: string;
  mileage: string;
  images: string[];
  thumbnail: string;
  pricing: {
    hourly: number;
    daily: number;
    weekly: number;
  };
  fuel: string;
  airConditioning: string;
  transmission: string;
  city: string;
  availability: 'Available' | 'Not Available';
  vendor: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  dateOfListing: string;
  revenue: number;
}

export interface VehicleBooking {
  id: string;
  vehicleId: string;
  userName: string;
  startDate: string;
  endDate: string;
  amountPaid: number;
  status: 'Confirmed' | 'Cancelled' | 'Completed';
}

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<VehicleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: '', message: '', onConfirm: () => { } });


  const fetchVehicles = async () => {
    try {
      console.log('🚚 Fetching vehicles from backend...');

      const response = await fetch(API_BASE_URL, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      console.log('📨 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error response:', errorText);
        throw new Error('Failed to fetch vehicles');
      }

      const rawData = await response.json();
      console.log('📦 Raw response data:', rawData);

      const vehiclesArray = Array.isArray(rawData.content) ? rawData.content : [];

      if (!vehiclesArray.length) {
        console.warn('⚠️ No vehicles returned from backend');
      }

      const transformedVehicles = vehiclesArray.map((vehicle: any) => ({
        id: vehicle.id.toString(),
        name: vehicle.vehicleName,
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.vehicleType as Vehicle['type'],
        category: ['Bike', 'Scooter'].includes(vehicle.vehicleType) ? '2W' : '4W',
        description: vehicle.description || '',
        mileage: vehicle.mileage ? `${vehicle.mileage} kmpl` : 'N/A',
        images: vehicle.url ? [vehicle.url] : [],
        thumbnail: vehicle.url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',

        pricing: {
          hourly: vehicle.hourlyPrice,
          daily: vehicle.dailyPrice || 0,
          weekly: vehicle.weeklyPrice || 0,
        },

        availability: vehicle.available ? 'Available' : 'Not Available',
        vendor: `Partner ${vehicle.partnerId}`,
        status: vehicle.status as Vehicle['status'],
        dateOfListing: new Date().toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 100000),

        // ✅ New fields
        fuel: vehicle.fuel || 'Not specified',
        airConditioning: vehicle.airConditioning || 'Not specified',
        transmission: vehicle.transmission || 'Not specified',
        city: vehicle.city || 'Unknown',
      }));

      console.log('✅ Transformed vehicles:', transformedVehicles);

      setVehicles(transformedVehicles);
    } catch (error) {
      console.error('🔥 Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };


  // Fetch vehicles from API
  useEffect(() => {


    fetchVehicles();
  }, []);


  const handleAddVehicle = async (formData: FormData) => {
    try {
      console.log('🚗 Starting vehicle creation process...');
      console.log('📥 Received FormData:', formData);

      // Step 1: Parse raw vehicle JSON string from FormData
      const vehicleRaw = formData.get('vehicle') as string;
      const imageFile = formData.get('image') as File | null;

      if (!vehicleRaw) {
        console.error('❌ "vehicle" field is missing in FormData');
        toast.error('Vehicle data missing');
        return;
      }

      let vehicleData;
      try {
        vehicleData = JSON.parse(vehicleRaw);
      } catch (err) {
        console.error('❌ Error parsing vehicle JSON:', err);
        toast.error('Failed to parse vehicle data');
        return;
      }

      if (imageFile) {
        vehicleData.imageFile = imageFile;
        console.log('🖼️ Image file received:', imageFile.name);
      } else {
        console.warn('⚠️ No image file attached');
      }

      console.log('🧪 Parsed vehicleData:', vehicleData);

      // Step 2: Construct payload that matches VehicleDTO
      const vehiclePayload = {
        id: null,
        vehicleName: vehicleData.vehicleName || '',
        vehicleNumber: vehicleData.vehicleNumber || '',
        vehicleType: vehicleData.vehicleType || '',
        description: vehicleData.description || '',
        mileage: vehicleData.mileage?.replace(' kmpl', '') || '0',
        hourlyPrice: parseInt(vehicleData.hourlyPrice) || 0,
        dailyPrice: parseInt(vehicleData.dailyPrice) || 0,
        weeklyPrice: parseInt(vehicleData.weeklyPrice) || 0,
        available:
          typeof vehicleData.available === 'boolean'
            ? vehicleData.available
            : vehicleData.availability === 'Available',
        partnerId: parseInt(vehicleData.partnerId) || 1,
        status: vehicleData.status || 'Pending',

        // ✅ New Fields
        fuel: vehicleData.fuel || 'Not specified',
        airConditioning: vehicleData.airConditioning || 'Not specified',
        transmission: vehicleData.transmission || 'Not specified',
        city: vehicleData.city || 'Unknown',
      };


      console.log('🧾 Prepared Vehicle Payload (to send):', vehiclePayload);

      // Step 3: Prepare FormData again to send to backend
      const payloadFormData = new FormData();
      payloadFormData.append('vehicle', JSON.stringify(vehiclePayload));
      if (vehicleData.imageFile) {
        payloadFormData.append('image', vehicleData.imageFile);
      }

      // Step 4: Send POST request
      console.log('📡 POSTing to backend:', API_BASE_URL);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: payloadFormData,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      console.log('📨 Response status:', response.status);

      let result;
      try {
        result = await response.json();
      } catch (err) {
        console.error('❌ Failed to parse JSON from backend:', err);
        toast.error('Backend response unreadable');
        return;
      }

      console.log('📥 Full backend response:', result);

      const newVehicleData = result.data;
      if (!newVehicleData || !newVehicleData.id) {
        console.error('❌ No valid vehicle data returned:', newVehicleData);
        toast.error(result.message || 'Invalid server response');
        return;
      }

      // Step 5: Transform backend vehicle to frontend format
      const newVehicle: Vehicle = {
        id: newVehicleData.id.toString(),
        name: newVehicleData.vehicleName,
        vehicleNumber: newVehicleData.vehicleNumber,
        type: newVehicleData.vehicleType,
        category: ['Bike', 'Scooter'].includes(newVehicleData.vehicleType) ? '2W' : '4W',
        description: newVehicleData.description || '',
        mileage: newVehicleData.mileage ? `${newVehicleData.mileage} kmpl` : 'N/A',
        images: newVehicleData.url ? [newVehicleData.url] : [],
        thumbnail:
          newVehicleData.url ||
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
        pricing: {
          hourly: newVehicleData.hourlyPrice,
          daily: newVehicleData.dailyPrice || 0,
          weekly: newVehicleData.weeklyPrice || 0
        },
        availability: newVehicleData.available ? 'Available' : 'Not Available',
        vendor: `Partner ${newVehicleData.partnerId}`,
        status: newVehicleData.status,
        dateOfListing: new Date().toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 100000),
        fuel: newVehicleData.fuel || 'Not specified',
        airConditioning: newVehicleData.airConditioning || 'Not specified',
        transmission: newVehicleData.transmission || 'Not specified',
        city: newVehicleData.city || 'Unknown',
      };

      console.log('📊 Final frontend vehicle object:', newVehicle);

      // Step 6: Update UI
      setVehicles(prev => [...prev, newVehicle]);
      setShowAddModal(false);
      toast.success('✅ Vehicle added successfully');
    } catch (error) {
      console.error('🔥 Exception during vehicle creation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add vehicle');
    }
  };





  const handleEditVehicle = async (formData: FormData) => {
    if (!selectedVehicle) return;

    try {
      console.log('✏️ Starting vehicle update process...');
      console.log('📥 Received FormData for update:', formData);

      // Step 1: Parse raw vehicle JSON string from FormData
      const vehicleRaw = formData.get('vehicle') as string;
      const imageFile = formData.get('image') as File | null;

      if (!vehicleRaw) {
        console.error('❌ "vehicle" field is missing in FormData');
        toast.error('Vehicle data missing');
        return;
      }

      let vehicleData;
      try {
        vehicleData = JSON.parse(vehicleRaw);
      } catch (err) {
        console.error('❌ Error parsing vehicle JSON:', err);
        toast.error('Failed to parse vehicle data');
        return;
      }

      if (imageFile) {
        vehicleData.imageFile = imageFile;
        console.log('🖼️ Image file received:', imageFile.name);
      } else {
        console.warn('⚠️ No image file attached');
      }

      console.log('🧪 Parsed vehicleData for update:', vehicleData);

      // Step 2: Construct payload with ID
      const vehiclePayload = {
        id: vehicleData.id, // ✅ Include ID for update
        vehicleName: vehicleData.vehicleName || '',
        vehicleNumber: vehicleData.vehicleNumber || '',
        vehicleType: vehicleData.vehicleType || '',
        description: vehicleData.description || '',
        mileage: vehicleData.mileage?.replace(' kmpl', '') || '0',
        hourlyPrice: parseInt(vehicleData.hourlyPrice) || 0,
        dailyPrice: parseInt(vehicleData.dailyPrice) || 0,
        weeklyPrice: parseInt(vehicleData.weeklyPrice) || 0,
        available:
          typeof vehicleData.available === 'boolean'
            ? vehicleData.available
            : vehicleData.availability === 'Available',
        partnerId: parseInt(vehicleData.partnerId) || 1,
        status: vehicleData.status || 'Pending'
      };

      console.log('🧾 Vehicle Payload (edit):', vehiclePayload);

      // Step 3: Recreate FormData to send to backend
      const payloadFormData = new FormData();
      payloadFormData.append('vehicle', JSON.stringify(vehiclePayload));
      if (vehicleData.imageFile) {
        payloadFormData.append('image', vehicleData.imageFile);
      }

      console.log('📡 Sending POST request to:', API_BASE_URL);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: payloadFormData,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      console.log('📨 Response status:', response.status);

      let result;
      try {
        result = await response.json();
      } catch (err) {
        console.error('❌ Failed to parse JSON from backend:', err);
        toast.error('Backend response unreadable');
        return;
      }

      console.log('✅ Full backend response (edit):', result);

      const updatedVehicleData = result.data;
      if (!updatedVehicleData || !updatedVehicleData.id) {
        console.error('❌ Invalid vehicle data returned:', updatedVehicleData);
        toast.error(result.message || 'Invalid response from server');
        return;
      }

      // Step 4: Convert to frontend structure
      const updatedVehicle: Vehicle = {
        id: updatedVehicleData.id.toString(),
        name: updatedVehicleData.vehicleName,
        vehicleNumber: updatedVehicleData.vehicleNumber,
        type: updatedVehicleData.vehicleType,
        category: ['Bike', 'Scooter'].includes(updatedVehicleData.vehicleType) ? '2W' : '4W',
        description: updatedVehicleData.description || '',
        mileage: updatedVehicleData.mileage ? `${updatedVehicleData.mileage} kmpl` : 'N/A',
        images: updatedVehicleData.url ? [updatedVehicleData.url] : [],
        thumbnail: updatedVehicleData.url || selectedVehicle.thumbnail,
        pricing: {
          hourly: updatedVehicleData.hourlyPrice,
          daily: updatedVehicleData.dailyPrice || 0,
          weekly: updatedVehicleData.weeklyPrice || 0
        },
        availability: updatedVehicleData.available ? 'Available' : 'Not Available',
        vendor: `Partner ${updatedVehicleData.partnerId}`,
        status: updatedVehicleData.status,
        dateOfListing: selectedVehicle.dateOfListing,
        revenue: selectedVehicle.revenue,
        fuel: updatedVehicleData.fuel || selectedVehicle.fuel || 'Not specified',
        airConditioning: updatedVehicleData.airConditioning || selectedVehicle.airConditioning || 'Not specified',
        transmission: updatedVehicleData.transmission || selectedVehicle.transmission || 'Not specified',
        city: updatedVehicleData.city || selectedVehicle.city || 'Unknown',
      };

      const updatedVehicles = vehicles.map(vehicle =>
        vehicle.id === selectedVehicle.id ? updatedVehicle : vehicle
      );

      await fetchVehicles();
      setShowEditModal(false);
      setSelectedVehicle(null);
      toast.success('✅ Vehicle updated successfully');
    } catch (error) {
      console.error('❌ Error updating vehicle:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update vehicle');
    }
  };




  const handleStatusChange = async (vehicleId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      const response = await fetch(`${API_BASE_URL}/${vehicleId}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedVehicles = vehicles.map(vehicle =>
        vehicle.id === vehicleId ? { ...vehicle, status: newStatus } : vehicle
      );

      setVehicles(updatedVehicles);
      toast.success(`Vehicle status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) throw new Error('Failed to delete vehicle');

      const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== vehicleId);
      setVehicles(updatedVehicles);
      toast.success('Vehicle deleted successfully');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ show: true, title, message, onConfirm });
  };

  const hideConfirmDialog = () => {
    setConfirmDialog({ show: false, title: '', message: '', onConfirm: () => { } });
  };

  const twoWheelers = vehicles.filter(v => v.category === '2W');
  const fourWheelers = vehicles.filter(v => v.category === '4W');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div>Loading vehicles...</div>
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
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vehicle Partners Management</h1>
                <p className="text-gray-600 mt-2">Manage 2-wheelers and 4-wheelers for your travel booking platform</p>
              </div>
              <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                <Plus size={20} />
                Add Vehicle
              </Button>
            </div>
          </div>

          <Tabs defaultValue="2W" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="2W" className="flex items-center gap-2">
                2-Wheelers ({twoWheelers.length})
              </TabsTrigger>
              <TabsTrigger value="4W" className="flex items-center gap-2">
                4-Wheelers ({fourWheelers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="2W" className="mt-6">
              <VehicleTable
                vehicles={twoWheelers}
                onView={(vehicle) => {
                  setSelectedVehicle(vehicle);
                  setShowViewModal(true);
                }}
                onEdit={(vehicle) => {
                  setSelectedVehicle(vehicle);
                  setShowEditModal(true);
                }}
                onApprove={(vehicleId) => {
                  showConfirmDialog(
                    'Approve Vehicle',
                    'Are you sure you want to approve this vehicle?',
                    () => {
                      handleStatusChange(vehicleId, 'Approved');
                      hideConfirmDialog();
                    }
                  );
                }}
                onReject={(vehicleId) => {
                  showConfirmDialog(
                    'Reject Vehicle',
                    'Are you sure you want to reject this vehicle?',
                    () => {
                      handleStatusChange(vehicleId, 'Rejected');
                      hideConfirmDialog();
                    }
                  );
                }}
                onDelete={(vehicleId) => {
                  showConfirmDialog(
                    'Delete Vehicle',
                    'Are you sure you want to delete this vehicle? This action cannot be undone.',
                    () => {
                      handleDeleteVehicle(vehicleId);
                      hideConfirmDialog();
                    }
                  );
                }}
              />
            </TabsContent>

            <TabsContent value="4W" className="mt-6">
              <VehicleTable
                vehicles={fourWheelers}
                onView={(vehicle) => {
                  setSelectedVehicle(vehicle);
                  setShowViewModal(true);
                }}
                onEdit={(vehicle) => {
                  setSelectedVehicle(vehicle);
                  setShowEditModal(true);
                }}
                onApprove={(vehicleId) => {
                  showConfirmDialog(
                    'Approve Vehicle',
                    'Are you sure you want to approve this vehicle?',
                    () => {
                      handleStatusChange(vehicleId, 'Approved');
                      hideConfirmDialog();
                    }
                  );
                }}
                onReject={(vehicleId) => {
                  showConfirmDialog(
                    'Reject Vehicle',
                    'Are you sure you want to reject this vehicle?',
                    () => {
                      handleStatusChange(vehicleId, 'Rejected');
                      hideConfirmDialog();
                    }
                  );
                }}
                onDelete={(vehicleId) => {
                  showConfirmDialog(
                    'Delete Vehicle',
                    'Are you sure you want to delete this vehicle? This action cannot be undone.',
                    () => {
                      handleDeleteVehicle(vehicleId);
                      hideConfirmDialog();
                    }
                  );
                }}
              />
            </TabsContent>
          </Tabs>

          {/* Modals */}
          {showAddModal && (
            <VehicleFormModal
              onClose={() => setShowAddModal(false)}
              onSubmit={handleAddVehicle}
            />
          )}

          {showEditModal && selectedVehicle && (
            <VehicleFormModal
              vehicle={selectedVehicle}
              onClose={() => {
                setShowEditModal(false);
                setSelectedVehicle(null);
              }}
              onSubmit={handleEditVehicle}
            />
          )}

          {showViewModal && selectedVehicle && (
            <VehicleViewModal
              vehicle={selectedVehicle}
              bookings={bookings.filter(b => b.vehicleId === selectedVehicle.id)}
              onClose={() => {
                setShowViewModal(false);
                setSelectedVehicle(null);
              }}
            />
          )}

          {confirmDialog.show && (
            <ConfirmationDialog
              title={confirmDialog.title}
              message={confirmDialog.message}
              confirmText="Confirm"
              onConfirm={confirmDialog.onConfirm}
              onCancel={hideConfirmDialog}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default VehicleManagement;