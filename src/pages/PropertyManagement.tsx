import React, { useState, useEffect, useRef } from 'react';
import AppSidebar from '@/components/ui/AppSidebar';
import Navbar from '@/components/ui/Navbar';
import PropertyTable from '@/components/properties/PropertyTable';
import PropertyFormModal from '@/components/properties/PropertyFormModal';
import PropertyDetailModal from '@/components/properties/PropertyDetailModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from '@/components/ui/sonner';

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  location: string;
  type: 'Hotel' | 'Guest House' | 'Resort' | 'Other';
  status: 'Pending' | 'Approved' | 'Rejected';
  rating: number;
  description: string;
  amenities: string[];
  thumbnail: string;
  images: string[];
  bookings: number;
  revenue: number;
  admin: string;
  rooms?: Room[];
  recentBookings?: Booking[];
  isApproved: boolean;
  minPrice: number;
  maxPrice: number;
}

export interface Room {
  id: string;
  hotelId: number;
  roomType: string;
  pricePerNight: number;
  maxOccupancy: number;
  availableRooms: number;
  roomSize: string;
  bedType: string;
  roomAmenities: string; // 👈 string not string[]
  roomImages: string[];
  active: boolean;
  roomNumber: string;
  floorNumber: number;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  propertyId: string;
  roomId: string;
  userName: string;
  roomBooked: string;
  bookingDate: string;
  amountPaid: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

interface PaginationState {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
}

const API_BASE_URL = 'https://hbr.lytortech.com/api/v1/hotels';

const PropertyManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    statusFilter: 'All',
    sortBy: 'revenue',
  });
  const isSavingRef = useRef(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('size', pagination.size.toString());

      if (filters.statusFilter !== 'All') {
        params.append('status', filters.statusFilter);
      }
      if (filters.searchTerm) {
        params.append('search', filters.searchTerm);
      }
      if (filters.sortBy) {
        params.append('sort', filters.sortBy);
      }

      const response = await axios.get(`${API_BASE_URL}?${params.toString()}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      console.log('✅ API Response:', response);

      const raw = response.data;
      const propertyList = Array.isArray(raw?.data?.content) ? raw.data.content : [];

      setProperties(propertyList);

      if (raw?.data) {
        setPagination(prev => ({
          ...prev,
          totalItems: raw.data.totalElements,
          totalPages: raw.data.totalPages,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [pagination.page, pagination.size, filters]);

  const handleAddProperty = () => {
    setEditingProperty(null);
    setIsFormModalOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsFormModalOpen(true);
  };

  const handleViewProperty = (property: Property) => {
    setViewingProperty(property);
    setIsDetailModalOpen(true);
  };


  const handleSaveProperty = async (propertyData: Omit<Property, 'id'>) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    try {
      if (editingProperty) {
        const response = await axios.put(
          `${API_BASE_URL}/update/${editingProperty.id}`,
          propertyData,
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );
        setProperties(prev =>
          prev.map(p => (p.id === editingProperty.id ? response.data : p))
        );
        ;
      } else {
        const response = await axios.post(`${API_BASE_URL}`, propertyData, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        setProperties(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Failed to save property:', error);
    } finally {
      isSavingRef.current = false;
      setIsFormModalOpen(false);
      setEditingProperty(null);
      fetchProperties();
    }
  };

  const handleUpdateStatus = async (propertyId: string, status: Property['status']) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/update-status/${propertyId}`,
        { status },
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
      fetchProperties();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleToggleApproval = async (propertyId: string, approved: boolean) => {
    try {
      await axios.put(`${API_BASE_URL}/${propertyId}/approval-toggle`, {
        approved
      }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      toast.success(`Property ${approved ? 'approved' : 'disapproved'} successfully!`);
      fetchProperties(); // refresh table
    } catch (error) {
      console.error('Approval toggle failed:', error);
      toast.error('Failed to toggle approval status');
    }
  };


  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/${propertyId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      toast.success('Hotel deleted successfully!');

      fetchProperties();
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, size: newSize, page: 0 }));
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
                <p className="text-gray-600 mt-1">Manage hotels, resorts, and guest houses</p>
              </div>
              <Button onClick={handleAddProperty} className="flex items-center gap-2">
                <Plus size={20} />
                Add Property
              </Button>
            </div>

            <PropertyTable
              properties={properties}
              onEdit={handleEditProperty}
              onView={handleViewProperty}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteProperty}
              onToggleApproval={handleToggleApproval}
              pagination={pagination}
              filters={filters}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onFilterChange={handleFilterChange}
            />

            <PropertyFormModal
              isOpen={isFormModalOpen}
              onClose={() => {
                setIsFormModalOpen(false);
                setEditingProperty(null);
              }}
              onSave={handleSaveProperty}
              property={editingProperty}
            />

            <PropertyDetailModal
              isOpen={isDetailModalOpen}
              property={viewingProperty}
              onClose={() => {
                setIsDetailModalOpen(false);
                setViewingProperty(null);
              }}
              onEdit={handleEditProperty}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PropertyManagement;