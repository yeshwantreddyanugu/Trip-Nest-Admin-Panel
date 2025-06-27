import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Vehicle } from '@/pages/VehicleManagement';

interface VehicleFormModalProps {
  vehicle?: Vehicle;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

const VehicleFormModal = ({ vehicle, onClose, onSubmit }: VehicleFormModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    vehicleNumber: '',
    type: 'Bike' as Vehicle['type'],
    category: '2W' as Vehicle['category'],
    description: '',
    mileage: '',
    hourlyPrice: 0,
    dailyPrice: 0,
    weeklyPrice: 0,
    availability: 'Available' as Vehicle['availability'],
    vendor: '',
    status: 'Pending' as Vehicle['status'],
    fuel: '',
    airConditioning: '',
    transmission: '',
    city: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.type,
        category: vehicle.category,
        description: vehicle.description,
        mileage: vehicle.mileage.replace(' kmpl', ''),
        hourlyPrice: vehicle.pricing.hourly,
        dailyPrice: vehicle.pricing.daily,
        weeklyPrice: vehicle.pricing.weekly,
        availability: vehicle.availability,
        vendor: vehicle.vendor,
        status: vehicle.status,
        fuel: vehicle.fuel || '',
        airConditioning: vehicle.airConditioning || '',
        transmission: vehicle.transmission || '',
        city: vehicle.city || '',
      });
    }
  }, [vehicle]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (type: Vehicle['type']) => {
    const category = ['Bike', 'Scooter'].includes(type) ? '2W' : '4W';
    setFormData(prev => ({ ...prev, type, category }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    console.log("📸 Selected File:", file?.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
      city: formData.city
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vehicle Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input id="vehicleNumber" value={formData.vehicleNumber} onChange={(e) => handleInputChange('vehicleNumber', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Vehicle Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleTypeChange(value as Vehicle['type'])}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bike">Bike</SelectItem>
                  <SelectItem value="Scooter">Scooter</SelectItem>
                  <SelectItem value="Car">Car</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage (in kmpl)</Label>
              <Input id="mileage" value={formData.mileage} onChange={(e) => handleInputChange('mileage', e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} className="w-full border rounded-md px-3 py-2" required />
          </div>

          {/* New Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuel">Fuel Type</Label>
              <Input id="fuel" value={formData.fuel} onChange={(e) => handleInputChange('fuel', e.target.value)} placeholder="Petrol / Diesel / Electric" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmission</Label>
              <Input id="transmission" value={formData.transmission} onChange={(e) => handleInputChange('transmission', e.target.value)} placeholder="Manual / Automatic" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="airConditioning">Air Conditioning</Label>
              <Input id="airConditioning" value={formData.airConditioning} onChange={(e) => handleInputChange('airConditioning', e.target.value)} placeholder="Yes / No" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} placeholder="City name" />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Hourly Price (₹)</Label>
              <Input type="number" min="0" value={formData.hourlyPrice} onChange={(e) => handleInputChange('hourlyPrice', +e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Daily Price (₹)</Label>
              <Input type="number" min="0" value={formData.dailyPrice} onChange={(e) => handleInputChange('dailyPrice', +e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Weekly Price (₹)</Label>
              <Input type="number" min="0" value={formData.weeklyPrice} onChange={(e) => handleInputChange('weeklyPrice', +e.target.value)} required />
            </div>
          </div>

          {/* Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Vehicle Image</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleFileChange} required={!vehicle} />
            {vehicle && <p className="text-sm text-gray-500">Leave empty to keep existing image.</p>}
          </div>

          {/* Availability & Vendor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select value={formData.availability} onValueChange={(val) => handleInputChange('availability', val)}>
                <SelectTrigger><SelectValue placeholder="Choose availability" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Not Available">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vendor/Partner</Label>
              <Input value={formData.vendor} onChange={(e) => handleInputChange('vendor', e.target.value)} required />
            </div>
          </div>

          {!vehicle && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(val) => handleInputChange('status', val)}>
                <SelectTrigger><SelectValue placeholder="Choose status" /></SelectTrigger>
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
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">{vehicle ? 'Update Vehicle' : 'Add Vehicle'}</Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleFormModal;
