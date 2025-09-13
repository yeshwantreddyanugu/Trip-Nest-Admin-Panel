import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Vehicle } from '@/pages/VehicleManagement';

interface VehicleFormModalProps {
  vehicle?: Vehicle;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  vehicleCategory: '2W' | '4W';
}

const VehicleFormModal = ({ vehicle, onClose, onSubmit, vehicleCategory }: VehicleFormModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    vehicleNumber: '',
    type: 'Bike' as Vehicle['type'],
    category: '2W' as Vehicle['category'],
    description: '',
    mileage: '',
    hourlyPrice: '',
    dailyPrice: '',
    weeklyPrice: '',
    availability: 'Available' as Vehicle['availability'],
    vendor: '',
    status: 'Pending' as Vehicle['status'],
    fuel: '',
    airConditioning: '',
    transmission: '',
    city: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Define vehicle type options based on category
  const getVehicleTypeOptions = (category: '2W' | '4W') => {
    console.log('🔍 Getting vehicle type options for category:', category);
    
    if (category === '2W') {
      return [
        { value: 'Bike', label: 'Bike' },
        { value: 'Scooter', label: 'Scooter' },
      ];
    } else {
      return [
        { value: 'Car', label: 'Car' },
        { value: 'SUV', label: 'SUV' },
        { value: 'Other', label: 'Other' },
      ];
    }
  };

  useEffect(() => {
    console.log('🔧 VehicleFormModal effect triggered. Vehicle:', vehicle, 'VehicleCategory:', vehicleCategory);
    
    if (vehicle) {
      console.log('✏️ Editing existing vehicle, populating form data...');
      setFormData({
        name: vehicle.name,
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.type,
        category: vehicle.category,
        description: vehicle.description,
        mileage: vehicle.mileage.replace(' kmpl', ''),
        hourlyPrice: vehicle.pricing.hourly.toString(),
        dailyPrice: vehicle.pricing.daily.toString(),
        weeklyPrice: vehicle.pricing.weekly.toString(),
        availability: vehicle.availability,
        vendor: vehicle.vendor,
        status: vehicle.status,
        fuel: vehicle.fuel || '',
        airConditioning: vehicle.airConditioning || '',
        transmission: vehicle.transmission || '',
        city: vehicle.city || '',
      });
      
      // Set existing image preview
      if (vehicle.thumbnail) {
        setImagePreview(vehicle.thumbnail);
        console.log('🖼️ Set existing image preview:', vehicle.thumbnail);
      }
    } else {
      console.log('🆕 Adding new vehicle, setting default values...');
      const typeOptions = getVehicleTypeOptions(vehicleCategory);
      const defaultType = typeOptions[0]?.value as Vehicle['type'];
      
      setFormData(prev => ({
        ...prev,
        type: defaultType,
        category: vehicleCategory,
        // Keep pricing fields empty for new vehicles
        hourlyPrice: '',
        dailyPrice: '',
        weeklyPrice: '',
      }));
      
      // Clear image preview for new vehicle
      setImagePreview('');
    }
  }, [vehicle, vehicleCategory]);

  const handleInputChange = (field: string, value: any) => {
    console.log(`📝 Form field changed: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (type: Vehicle['type']) => {
    console.log('🚗 Vehicle type changed to:', type);
    const category = ['Bike', 'Scooter'].includes(type) ? '2W' : '4W';
    setFormData(prev => ({ ...prev, type, category }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    console.log("📸 Selected File:", file?.name);

    // Create image preview
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        console.log('🖼️ Image preview created');
      };
      reader.readAsDataURL(file);
    } else {
      // If no file selected and it's a new vehicle, clear preview
      if (!vehicle) {
        setImagePreview('');
        console.log('🧹 Image preview cleared');
      }
    }
  };

  const removeImagePreview = () => {
    setImageFile(null);
    setImagePreview(vehicle?.thumbnail || '');
    
    // Clear the file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    console.log('🗑️ Image preview removed, reverted to original or cleared');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📤 Form submission started...');
    console.log('📋 Current form data:', formData);
    console.log('🖼️ Image file:', imageFile);
    console.log('👁️ Image preview:', imagePreview);

    // Validation
    if (!formData.hourlyPrice || !formData.dailyPrice || !formData.weeklyPrice) {
      console.error('❌ Pricing fields cannot be empty');
      alert('Please fill in all pricing fields');
      return;
    }

    const vehicleData = {
      ...(vehicle ? { id: vehicle.id } : {}),
      vehicleName: formData.name,
      vehicleNumber: formData.vehicleNumber,
      vehicleType: formData.type,
      description: formData.description,
      mileage: formData.mileage,
      hourlyPrice: formData.hourlyPrice,
      dailyPrice: formData.dailyPrice,
      weeklyPrice: formData.weeklyPrice,
      available: formData.availability === 'Available',
      partnerId: 1,
      status: formData.status,
      fuel: formData.fuel,
      airConditioning: formData.airConditioning,
      transmission: formData.transmission,
      city: formData.city,
      availability: formData.availability, // Add this for frontend processing
      // Include preview URL for optimistic UI updates
      previewUrl: imagePreview
    };

    console.log('🚗 Vehicle Data (JSON):', vehicleData);

    const formDataToSend = new FormData();
    formDataToSend.append('vehicle', JSON.stringify(vehicleData));

    if (imageFile) {
      formDataToSend.append('image', imageFile);
      console.log('📸 Appended image file to FormData');
    } else if (vehicle) {
      console.log('ℹ️ No new image selected, keeping existing image');
    } else {
      console.warn('⚠️ No image selected for new vehicle');
    }

    console.log('📤 FormData Contents:');
    for (const [key, value] of formDataToSend.entries()) {
      console.log(`${key}:`, value);
    }

    onSubmit(formDataToSend);
  };

  const vehicleTypeOptions = getVehicleTypeOptions(vehicleCategory);
  console.log('🎯 Available vehicle type options:', vehicleTypeOptions);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vehicle ? 'Edit Vehicle' : `Add New ${vehicleCategory} Vehicle`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vehicle Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => handleInputChange('name', e.target.value)} 
                required 
                placeholder="Enter vehicle name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input 
                id="vehicleNumber" 
                value={formData.vehicleNumber} 
                onChange={(e) => handleInputChange('vehicleNumber', e.target.value)} 
                required 
                placeholder="Enter vehicle number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Vehicle Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleTypeChange(value as Vehicle['type'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage (in kmpl)</Label>
              <Input 
                id="mileage" 
                value={formData.mileage} 
                onChange={(e) => handleInputChange('mileage', e.target.value)} 
                required 
                placeholder="Enter mileage"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => handleInputChange('description', e.target.value)} 
              className="w-full border rounded-md px-3 py-2" 
              required 
              placeholder="Enter vehicle description"
              rows={3}
            />
          </div>

          {/* New Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuel">Fuel Type</Label>
              <Input 
                id="fuel" 
                value={formData.fuel} 
                onChange={(e) => handleInputChange('fuel', e.target.value)} 
                placeholder="Petrol / Diesel / Electric" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmission</Label>
              <Input 
                id="transmission" 
                value={formData.transmission} 
                onChange={(e) => handleInputChange('transmission', e.target.value)} 
                placeholder="Manual / Automatic" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="airConditioning">Air Conditioning</Label>
              <Input 
                id="airConditioning" 
                value={formData.airConditioning} 
                onChange={(e) => handleInputChange('airConditioning', e.target.value)} 
                placeholder="Yes / No" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                value={formData.city} 
                onChange={(e) => handleInputChange('city', e.target.value)} 
                placeholder="City name" 
              />
            </div>
          </div>

          {/* Pricing - Updated to show empty inputs for new vehicles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Hourly Price (₹)</Label>
              <Input 
                type="number" 
                min="0" 
                value={formData.hourlyPrice} 
                onChange={(e) => handleInputChange('hourlyPrice', e.target.value)} 
                required 
                placeholder="Enter hourly rate"
              />
            </div>
            <div className="space-y-2">
              <Label>Daily Price (₹)</Label>
              <Input 
                type="number" 
                min="0" 
                value={formData.dailyPrice} 
                onChange={(e) => handleInputChange('dailyPrice', e.target.value)} 
                required 
                placeholder="Enter daily rate"
              />
            </div>
            <div className="space-y-2">
              <Label>Weekly Price (₹)</Label>
              <Input 
                type="number" 
                min="0" 
                value={formData.weeklyPrice} 
                onChange={(e) => handleInputChange('weeklyPrice', e.target.value)} 
                required 
                placeholder="Enter weekly rate"
              />
            </div>
          </div>

          {/* Image Upload with Preview */}
          <div className="space-y-2">
            <Label htmlFor="image">Vehicle Image</Label>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Vehicle preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                  onClick={removeImagePreview}
                >
                  <X size={12} />
                </Button>
              </div>
            )}
            
            <Input 
              id="image" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              required={!vehicle && !imagePreview} 
            />
            {vehicle && <p className="text-sm text-gray-500">Leave empty to keep existing image.</p>}
          </div>

          {/* Availability & Vendor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select 
                value={formData.availability} 
                onValueChange={(val) => handleInputChange('availability', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Not Available">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vendor/Partner</Label>
              <Input 
                value={formData.vendor} 
                onChange={(e) => handleInputChange('vendor', e.target.value)} 
                required 
                placeholder="Enter vendor name"
              />
            </div>
          </div>

          {!vehicle && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => handleInputChange('status', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {vehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleFormModal;