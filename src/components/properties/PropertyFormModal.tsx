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
import { X } from 'lucide-react';
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
    minPrice: string;
    maxPrice: string;
    thumbnail: string;
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
    minPrice: '',
    maxPrice: '',
    thumbnail: '',
  });

  const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('PropertyFormModal useEffect triggered');
    console.log('Property data received:', property);

    if (property) {
      console.log('Editing existing property, populating form...');
      setFormData({
        id: property.id,
        name: property.name || '',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        country: property.country || '',
        zipCode: property.zipCode || '',
        type: property.type || '',
        rating: property.rating || 4.0,
        description: property.description || '',
        amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : (property.amenities || ''),
        admin: property.admin || '',
        status: property.status || 'Pending',
        bookings: property.bookings || 0,
        revenue: property.revenue || 0,
        minPrice: (property.minPrice && property.minPrice > 0) ? property.minPrice.toString() : '',
        maxPrice: (property.maxPrice && property.maxPrice > 0) ? property.maxPrice.toString() : '',
        thumbnail: property.thumbnail || '',
      });

      if (property.thumbnail) {
        setImagePreviews([property.thumbnail]);
        console.log('Set existing image preview:', property.thumbnail);
      }
    } else {
      console.log('Adding new property, resetting form...');
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
        minPrice: '',
        maxPrice: '',
        thumbnail: '',
      });
      setImagePreviews([]);
    }

    setThumbnailFiles([]);
  }, [property]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Selected files:', files.map(f => f.name));

    if (files.length > 0) {
      setThumbnailFiles(files);

      const newPreviews: string[] = [];
      let loadedCount = 0;

      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newPreviews[index] = event.target.result as string;
            loadedCount++;

            if (loadedCount === files.length) {
              setImagePreviews([...newPreviews]);
              console.log(`Created previews for ${files.length} images`);
            }
          }
        };
        reader.onerror = () => {
          console.error(`Error reading file: ${file.name}`);
          loadedCount++;
          if (loadedCount === files.length) {
            setImagePreviews([...newPreviews.filter(Boolean)]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImagePreview = (indexToRemove: number) => {
    console.log(`Removing image preview at index ${indexToRemove}...`);

    const updatedFiles = [...thumbnailFiles];
    const updatedPreviews = [...imagePreviews];

    updatedFiles.splice(indexToRemove, 1);
    updatedPreviews.splice(indexToRemove, 1);

    setThumbnailFiles(updatedFiles);
    setImagePreviews(updatedPreviews);

    console.log(`Remaining files: ${updatedFiles.length}`);
    console.log(`Remaining previews: ${updatedPreviews.length}`);

    if (updatedFiles.length === 0 && property?.thumbnail) {
      setImagePreviews([property.thumbnail]);
      console.log('Reverted to original image');
    }

    if (updatedFiles.length === 0) {
      const fileInput = document.getElementById('thumbnail') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const removeAllImagePreviews = () => {
    console.log('Removing all image previews...');
    setThumbnailFiles([]);

    if (property?.thumbnail) {
      setImagePreviews([property.thumbnail]);
      console.log('Reverted to existing image');
    } else {
      setImagePreviews([]);
      console.log('Cleared all image previews');
    }

    const fileInput = document.getElementById('thumbnail') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Replace the problematic section in your handleSubmit function around line 312

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('Property form submission started...');
    console.log('Current form data:', formData);
    console.log('Selected files:', thumbnailFiles.map(f => f.name));

    if (
      !formData.name ||
      !formData.address ||
      !formData.city ||
      !formData.type ||
      !formData.admin
    ) {
      console.error('Required fields missing');
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    if (!property && thumbnailFiles.length === 0 && imagePreviews.length === 0) {
      console.error('No image selected for new property');
      toast.error('Please select at least one image for the property');
      setIsSubmitting(false);
      return;
    }

    try {
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
        amenities: formData.amenities,
        admin: formData.admin,
        status: formData.status,
        bookings: formData.bookings,
        revenue: formData.revenue,
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : 0,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : 0,
      };

      console.log('Prepared hotel data:', hotelData);

      const formPayload = new FormData();

      formPayload.append(
        'hotel',
        new Blob([JSON.stringify(hotelData)], {
          type: 'application/json'
        })
      );

      thumbnailFiles.forEach((file, index) => {
        formPayload.append('image', file);
        console.log(`Appended image ${index + 1}:`, file.name);
      });

      console.log('FormData contents:');
      for (const [key, value] of formPayload.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
        } else if (value instanceof Blob) {
          console.log(`${key}: [Blob] ${value.type}`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      console.log('Sending request to:', API_BASE_URL);

      const response = await axios.post(API_BASE_URL, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      console.log('Backend response status:', response.status);
      console.log('Backend response data:', response.data);

      // FIX: Use 'property' instead of undefined 'isEdit' variable
      const isEditMode = !!property; // This determines if we're editing or creating
      const successMessage = isEditMode ? 'Property updated successfully!' : 'Property created successfully!';

      console.log(successMessage);
      toast.success(successMessage);

      if (response.status >= 200 && response.status < 300) {
        console.log('Scheduling page reload in 2 seconds...');
        toast.success('Page will reload in 2 seconds to refresh data...');

        setTimeout(() => {
          console.log('Executing page reload now...');
          window.location.reload();
        }, 2000);
      }

      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Property submission error:', error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;

        console.error('Response status:', status);
        console.error('Response data:', responseData);
        console.error('Response headers:', error.response?.headers);

        // Parse nested error message if present
        let errorMessage = 'Failed to save property';

        if (responseData?.data && typeof responseData.data === 'string') {
          try {
            const nestedData = JSON.parse(responseData.data);
            errorMessage = nestedData.message || responseData.message || errorMessage;
          } catch {
            errorMessage = responseData.message || errorMessage;
          }
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        }

        // Handle specific error cases
        if (errorMessage.includes('Hotel not found for update')) {
          console.error('UPDATE ERROR: The hotel ID does not exist in the backend');
          console.error('Attempted ID:', formData.id);
          console.error('Suggestion: This might be a new property that should be created instead');

          toast.error('Property not found for update. Please try creating a new property instead.');
        } else if (status === 400) {
          console.error('BAD REQUEST: Check the data format and required fields');
          toast.error(`Bad Request: ${errorMessage}`);
        } else {
          toast.error(`Error (${status}): ${errorMessage}`);
        }
      } else {
        console.error('Non-Axios error:', error);
        toast.error('Failed to save property');
      }
    } finally {
      setIsSubmitting(false);
      console.log('Form submission completed');
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
                onChange={(e) => setFormData(prev => ({ ...prev, minPrice: e.target.value }))}
                min="0"
                step="0.01"
                placeholder="Enter minimum price"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Maximum Price</Label>
              <Input
                id="maxPrice"
                type="number"
                value={formData.maxPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: e.target.value }))}
                min="0"
                step="0.01"
                placeholder="Enter maximum price"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="thumbnail">Property Images {!property && '*'}</Label>

            {imagePreviews && imagePreviews.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {imagePreviews.length} image{imagePreviews.length > 1 ? 's' : ''} selected
                  </span>
                  {imagePreviews.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeAllImagePreviews}
                    >
                      Remove All
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {imagePreviews.map((preview, index) => {
                    if (!preview) return null;
                    return (
                      <div key={`preview-${index}`} className="relative group">
                        <img
                          src={preview}
                          alt={`Property preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border hover:shadow-md transition-shadow"
                          onError={(e) => {
                            console.error('Error loading image preview at index:', index);
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="%23666"%3EImage Error%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImagePreview(index)}
                        >
                          <X size={12} />
                        </Button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              required={!property && (!imagePreviews || imagePreviews.length === 0)}
            />
            <p className="text-sm text-gray-500">
              {property
                ? "Select new images to replace existing ones (optional)"
                : "Select one or more images for the property"
              }
            </p>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, revenue: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
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