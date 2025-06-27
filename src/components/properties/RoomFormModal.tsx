import React, { useState, useEffect } from 'react';
import { Room } from '@/pages/PropertyManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: any, files: File[]) => Promise<void>;
  room?: Room | null;
  hotelId: number;
}

const bedTypes = ['Single', 'Twin', 'Double', 'Queen Size', 'King Size', 'Sofa Bed'];
const roomTypes = ['Standard Room', 'Deluxe Room', 'Suite', 'Presidential Suite', 'Family Room', 'Twin Room'];

const RoomFormModal: React.FC<RoomFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  room,
  hotelId,
}) => {
  const [formData, setFormData] = useState({
    id: null as number | null,
    hotelId: hotelId,
    roomType: '',
    pricePerNight: 0,
    maxOccupancy: 1,
    availableRooms: 1,
    roomSize: '',
    bedType: '',
    roomAmenities: '',
    roomNumber: '',
    floorNumber: 1,
    active: true,
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (room) {
      setFormData({
        id: room.id ? Number(room.id) : null,
        hotelId: Number(room.hotelId) ?? 1,
        roomType: room.roomType || '',
        pricePerNight: room.pricePerNight || 0,
        maxOccupancy: room.maxOccupancy || 1,
        availableRooms: room.availableRooms || 1,
        roomSize: room.roomSize || '',
        bedType: room.bedType || '',
        roomAmenities: room.roomAmenities || '',
        roomNumber: room.roomNumber || '',
        floorNumber: room.floorNumber || 1,
        active: room.active ?? true,
      });


      if (Array.isArray(room.roomImages)) {
        setPreviewImages(room.roomImages);
      }
    } else {
      setFormData({
        hotelId: 1,
        roomType: '',
        pricePerNight: '',
        maxOccupancy: 1,
        availableRooms: 1,
        roomSize: '',
        bedType: '',
        roomAmenities: '',
        roomNumber: '',
        floorNumber: 1,
        active: true,
      } as any);

      setImageFiles([]);
      setPreviewImages([]);
    }
  }, [room]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.roomType || !formData.bedType || formData.pricePerNight <= 0) {
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSave({
        ...formData,
        hotelId,
      }, imageFiles);
    } catch (error) {
      console.error('Error in parent save handler:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);

      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
    }
  };

  const handleImageRemove = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    if (index < previewImages.length) {
      URL.revokeObjectURL(previewImages[index]);
    }

    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="roomType">Room Type *</Label>
              <Select
                value={formData.roomType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, roomType: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pricePerNight">Price per Night *</Label>
              <Input
                id="pricePerNight"
                type="number"
                value={formData.pricePerNight}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    pricePerNight: parseFloat(e.target.value) || 0
                  }))
                }
                placeholder="Enter price"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="maxOccupancy">Max Occupancy</Label>
              <Input
                id="maxOccupancy"
                type="number"
                value={formData.maxOccupancy}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxOccupancy: parseInt(e.target.value) || 1
                }))}
                min="1"
                max="10"
              />
            </div>

            <div>
              <Label htmlFor="availableRooms">Available Rooms</Label>
              <Input
                id="availableRooms"
                type="number"
                value={formData.availableRooms}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  availableRooms: parseInt(e.target.value) || 1
                }))}
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="roomSize">Room Size</Label>
              <Input
                id="roomSize"
                value={formData.roomSize}
                onChange={(e) => setFormData(prev => ({ ...prev, roomSize: e.target.value }))}
                placeholder="e.g., 45 sq m"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bedType">Bed Type *</Label>
            <Select
              value={formData.bedType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, bedType: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bed type" />
              </SelectTrigger>
              <SelectContent>
                {bedTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="roomAmenities">Room Amenities</Label>
            <Input
              id="roomAmenities"
              value={formData.roomAmenities}
              onChange={(e) => setFormData(prev => ({ ...prev, roomAmenities: e.target.value }))}
              placeholder="Enter amenities separated by commas"
            />
            <p className="text-sm text-gray-500 mt-1">Example: Ocean View, Balcony, Mini Bar, WiFi</p>
          </div>

          <div>
            <Label htmlFor="roomImages">Room Images {!room && '*'}</Label>
            <Input
              id="roomImages"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={!!room} // Disable for editing existing rooms
            />
            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Room preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {room && (
              <p className="text-sm text-gray-500 mt-1">
                Note: Image editing is not supported for existing rooms.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : room ? 'Update Room' : 'Create Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomFormModal;