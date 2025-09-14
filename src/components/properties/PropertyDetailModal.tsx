import React, { useState, useEffect } from 'react';
import { Property, Room, Booking } from '@/pages/PropertyManagement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Star, Users, Bed, Maximize, Edit, Trash2, Plus } from 'lucide-react';
import RoomFormModal from './RoomFormModal';
import ConfirmationDialog from '@/components/users/ConfirmationDialog';
import axios from 'axios';

interface PropertyDetailModalProps {
  isOpen: boolean;
  property: Property | null;
  onClose: () => void;
  onEdit: (property: Property) => void;
}

const API_BASE_URL = 'https://hbr.lytortech.com/api/v1/rooms1';

const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  isOpen,
  property,
  onClose,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings'>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'deleteRoom';
    room: Room;
  } | null>(null);
  const [loading, setLoading] = useState({
    rooms: false,
    bookings: false,
  });

  useEffect(() => {
    if (property && isOpen) {
      fetchRooms();
      fetchBookings();
    }
  }, [property, isOpen]);

  const fetchRooms = async () => {
    if (!property) return;

    setLoading(prev => ({ ...prev, rooms: true }));

    try {
      const response = await axios.get(`${API_BASE_URL}/hotel/${property.id}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      console.log('📦 Full room fetch response:', response.data);

      const rooms = Array.isArray(response.data?.data) ? response.data.data : [];
      setRooms(rooms);

      if (rooms.length === 0) {
        console.log('⚠️ No rooms found for this hotel');
      }
    } catch (error) {
      console.error('❌ Failed to fetch rooms:', error);
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(prev => ({ ...prev, rooms: false }));
    }
  };

  const fetchBookings = async () => {
    if (!property) return;
    setLoading(prev => ({ ...prev, bookings: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/hotel/${property.id}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(prev => ({ ...prev, bookings: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'Confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddRoom = () => {
    setEditingRoom(null);
    setIsRoomFormOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsRoomFormOpen(true);
  };

  const handleSaveRoom = async (roomData: any, files: File[]) => {
    try {
      const formData = new FormData();
      formData.append('room', JSON.stringify(roomData));
      files.forEach(file => formData.append('images', file));

      const mode = roomData.id ? "EDIT" : "CREATE";
      const endpoint = roomData.id ? `${API_BASE_URL}` : API_BASE_URL;

      console.log("📦 Sending Room Data", {
        mode,
        endpoint,
        payload: {
          room: roomData,
          images: files.map(f => ({
            name: f.name,
            size: `${(f.size / 1024).toFixed(2)} KB`,
            type: f.type
          }))
        }
      });

      let response;
      if (roomData.id) {
        // ✏️ Edit room
        response = await axios.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'ngrok-skip-browser-warning': 'true',
          },
        });

        toast.success('Room updated successfully');
      } else {
        // 🆕 Create room
        response = await axios.post(API_BASE_URL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'ngrok-skip-browser-warning': 'true',
          },
        });

        toast.success('Room created successfully');
      }

      console.log("✅ Room save success:", response.data);

      // 🔄 Refresh rooms list from server
      console.log("🔄 Refreshing room list...");
      await fetchRooms();

      // 🧹 Reset form state
      setIsRoomFormOpen(false);
      setEditingRoom(null);

    } catch (error) {
      console.error('❌ Failed to save room:', error);
      toast.error('Failed to save room');
    }
  };




  const handleToggleAvailability = async (roomId: number, active: boolean) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/${roomId}/availability`,
        null,
        {
          params: { status: active },
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );

      if (response.status === 200) {
        // ✅ Locally update UI
        setRooms(prev =>
          prev.map(room =>
            room.id === roomId.toString() ? { ...room, active } : room
          )
        );
        await fetchRooms();

        toast.success(`Room marked as ${active ? 'Available' : 'Unavailable'}`);
      } else {
        throw new Error('Unexpected response');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');

      // 🔄 Revert UI state if error
      setRooms(prev =>
        prev.map(room =>
          room.id === roomId.toString() ? { ...room, isAvailable: !active } : room
        )
      );
    }
  };



  const handleDeleteRoom = async (roomId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/${roomId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      setRooms(prev => prev.filter(r => r.id !== roomId));
      toast.success('Room deleted successfully');
    } catch (error) {
      console.error('Failed to delete room:', error);
      toast.error('Failed to delete room');
    } finally {
      setConfirmDialog(null);
    }
  };

  if (!property) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={property.thumbnail}
                  alt={property.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold">{property.name}</h2>
                  <p className="text-gray-600">{property.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(property.status)}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <Badge variant="outline">{property.type}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{property.rating}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Admin</p>
                <p className="text-gray-900">{property.admin}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-900">{property.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-gray-900 font-semibold">{property.bookings}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <p className="text-gray-900 font-semibold">${property.revenue.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{property.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {(
                  Array.isArray(property.amenities)
                    ? property.amenities
                    : typeof property.amenities === 'string'
                      ? (property.amenities as string).split(',').map(s => s.trim())
                      : []
                ).map((amenity, index) => (
                  <Badge key={index} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex space-x-1 mb-4">
                <Button
                  variant={activeTab === 'rooms' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('rooms')}
                >
                  Rooms ({rooms.length})
                </Button>
                {/* <Button
                  variant={activeTab === 'bookings' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('bookings')}
                >
                  Recent Bookings ({bookings.length})
                </Button> */}
              </div>

              {activeTab === 'rooms' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Room Management</h3>
                    <Button onClick={handleAddRoom}>
                      <Plus size={16} className="mr-1" />
                      Add Room
                    </Button>
                  </div>

                  {loading.rooms ? (
                    <div className="flex justify-center items-center h-32">
                      Loading rooms...
                    </div>
                  ) : rooms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No rooms found. Add your first room.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Room Type</TableHead>
                          <TableHead>Price/Night</TableHead>
                          <TableHead>Occupancy</TableHead>
                          <TableHead>Available Rooms</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Bed Type</TableHead>
                          <TableHead>Is Available</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rooms.map((room) => (
                          <TableRow key={room.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-medium">{room.roomType}</p>
                                  <p className="text-xs text-gray-500">
                                    {typeof room.roomAmenities === 'string'
                                      ? room.roomAmenities.split(',').slice(0, 2).join(', ')
                                      : '—'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="font-semibold">${room.pricePerNight}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users size={14} />
                                {room.maxOccupancy}
                              </div>
                            </TableCell>
                            <TableCell>{room.availableRooms}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Maximize size={14} />
                                {room.roomSize}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Bed size={14} />
                                {room.bedType}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center justify-center">
                                <div className={`p-1 rounded-full transition-colors duration-200 ${room.isAvailable ? 'bg-green-50' : 'bg-red-50'
                                  }`}>
                                  <Switch
                                    checked={room.isAvailable}
                                    onCheckedChange={(checked) =>
                                      handleToggleAvailability(Number(room.id), checked)
                                    }
                                    className={`
          data-[state=checked]:bg-green-500 
          data-[state=unchecked]:bg-red-500
          hover:data-[state=checked]:bg-green-600
          hover:data-[state=unchecked]:bg-red-600
          focus-visible:ring-2 focus-visible:ring-offset-2
          focus-visible:ring-green-500/60
        `}
                                  />
                                </div>
                              </div>
                            </TableCell>


                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRoom(room)}
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setConfirmDialog({ type: 'deleteRoom', room })}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                  {loading.bookings ? (
                    <div className="flex justify-center items-center h-32">
                      Loading bookings...
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No bookings found.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Guest Name</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Booking Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-mono">{booking.id}</TableCell>
                            <TableCell className="font-medium">{booking.userName}</TableCell>
                            <TableCell>{booking.roomBooked}</TableCell>
                            <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                            <TableCell className="font-semibold">${booking.amountPaid}</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RoomFormModal
        isOpen={isRoomFormOpen}
        onClose={() => {
          setIsRoomFormOpen(false);
          setEditingRoom(null);
        }}
        onSave={handleSaveRoom}
        room={editingRoom}
        hotelId={Number(property.id)}
      />

      {confirmDialog && (
        <ConfirmationDialog
          title="Delete Room"
          message={`Are you sure you want to delete "${confirmDialog.room.roomType}"? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={() => handleDeleteRoom(confirmDialog.room.id)}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </>
  );
};

export default PropertyDetailModal;