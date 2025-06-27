
import React from 'react';
import { Property } from '@/pages/PropertyManagement';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PropertyViewModalProps {
  property: Property;
  onClose: () => void;
}

const PropertyViewModal: React.FC<PropertyViewModalProps> = ({
  property,
  onClose,
}) => {
  const getStatusBadge = (status: Property['status']) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {property.name}
            {getStatusBadge(property.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Images */}
          {property.images && property.images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${property.name} ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-gray-900">{property.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p className="text-gray-900">{property.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Property Admin</p>
                <p className="text-gray-900">{property.admin}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-1">{getStatusBadge(property.status)}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-600">Total Bookings</p>
                <p className="text-2xl font-bold text-blue-900">{property.bookings}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-600">Revenue Generated</p>
                <p className="text-2xl font-bold text-green-900">${property.revenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyViewModal;
