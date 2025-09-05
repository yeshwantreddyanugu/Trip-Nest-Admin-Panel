import React, { useState, useEffect } from 'react';
import { Property } from '@/pages/PropertyManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import axios from 'axios';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (propertyData: Omit<Property, 'id'>) => void;
  property?: Property | null;
}

const propertyTypes = ['Hotel', 'Guest House', 'Resort', 'Other'];
const API_BASE_URL = 'https://hbr.lytortech.com/api/v1/hotels';

const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  property,
}) => {
  const [formData, setFormData] = useState<{
    id?: string | null;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    type: string;
    rating: number;
    description: string;
    amenities: string;
    admin: string;
    status: string;
    bookings: number;
    revenue: number;
    minPrice: number;
    maxPrice: number;
  }>({
    id: null,
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    type: '',
    rating: 4.0,
    description: '',
    amenities: '',
    admin: '',
    status: 'Pending',
    bookings: 0,
    revenue: 0,
    minPrice: 0,
    maxPrice: 0,
  });


  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (property) {
      setFormData({
        id: property.id,
        name: property.name,
        address: property.address,
        city: property.city,
        state: property.state,
        country: property.country,
        zipCode: property.zipCode,
        type: property.type,
        rating: property.rating,
        description: property.description,
        amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : '',
        admin: property.admin,
        status: property.status,
        bookings: property.bookings,
        revenue: property.revenue,
        minPrice: property.minPrice ?? 0,
        maxPrice: property.maxPrice ?? 0,

      });
    } else {
      setFormData({
        id: null,
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        type: '',
        rating: 4.0,
        description: '',
        amenities: '',
        admin: '',
        status: 'Pending',
        bookings: 0,
        revenue: 0,
        minPrice: 0,
        maxPrice: 0,
      });
    }
    setThumbnailFile(null);
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (
      !formData.name ||
      !formData.address ||
      !formData.city ||
      !formData.type ||
      !formData.admin
    ) {
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare hotel data (with amenities as string)
      const hotelData = {
        id: formData.id ?? null,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
        type: formData.type,
        rating: formData.rating,
        description: formData.description,
        amenities: formData.amenities, // Kept as string
        admin: formData.admin,
        status: formData.status,
        bookings: formData.bookings,
        revenue: formData.revenue,
        minPrice: formData.minPrice,
        maxPrice: formData.maxPrice,

      };

      // Create FormData payload
      const formPayload = new FormData();

      // Append hotel data as JSON blob
      formPayload.append(
        'hotel',
        new Blob([JSON.stringify(hotelData)], {
          type: 'application/json'
        })
      );

      // Append image file if exists
      if (thumbnailFile) {
        formPayload.append('image', thumbnailFile);
      }

      // Debug output
      console.log('📤 Submission payload:', {
        hotel: hotelData,
        image: thumbnailFile ? thumbnailFile.name : 'No image'
      });

      // Send to backend
      const response = await axios.post(API_BASE_URL, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      // Handle success
      const isEdit = !!formData.id;
      toast.success(isEdit ? 'Property updated successfully!' : 'Property created successfully!');

      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to save hotel');
    } finally {
      setIsSubmitting(false);
    }
  };





  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property ? 'Edit Property' : 'Add New Property'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter property name"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Property Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter address"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Enter city"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="Enter state"
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Enter country"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="Enter zip code"
                required
              />
            </div>
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 4.0 }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="admin">Property Admin *</Label>
            <Input
              id="admin"
              value={formData.admin}
              onChange={(e) => setFormData(prev => ({ ...prev, admin: e.target.value }))}
              placeholder="Enter admin email"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="amenities">Amenities (comma-separated)</Label>
            <Input
              id="amenities"
              value={formData.amenities}
              onChange={(e) => setFormData(prev => ({ ...prev, amenities: e.target.value }))}
              placeholder="Pool, WiFi, Gym"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPrice">Minimum Price</Label>
              <Input
                id="minPrice"
                type="number"
                value={formData.minPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Maximum Price</Label>
              <Input
                id="maxPrice"
                type="number"
                value={formData.maxPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
          </div>


          <div>
            <Label htmlFor="thumbnail">Thumbnail Image {!property && '*'}</Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setThumbnailFile(file);
              }}
              required={!property}
            />
            <p className="text-sm text-gray-500 mt-1">Upload a JPEG/PNG image</p>
          </div>

          {property && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bookings">Bookings</Label>
                <Input
                  id="bookings"
                  type="number"
                  value={formData.bookings}
                  onChange={(e) => setFormData(prev => ({ ...prev, bookings: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="revenue">Revenue</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => setFormData(prev => ({ ...prev, revenue: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : property ? 'Update Property' : 'Create Property'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyFormModal;