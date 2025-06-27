
import React from 'react';
import { X, Calendar, DollarSign, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Mock booking data
const mockBookings = [
  {
    id: 'BK001',
    type: 'Hotel',
    destination: 'New York Hotel',
    checkIn: '2024-03-15',
    checkOut: '2024-03-18',
    amount: 450,
    status: 'Completed'
  },
  {
    id: 'BK002',
    type: 'Vehicle',
    destination: 'Toyota Camry Rental',
    checkIn: '2024-02-20',
    checkOut: '2024-02-25',
    amount: 280,
    status: 'Completed'
  },
  {
    id: 'BK003',
    type: 'Hotel',
    destination: 'Miami Beach Resort',
    checkIn: '2024-04-10',
    checkOut: '2024-04-14',
    amount: 680,
    status: 'Upcoming'
  }
];

const UserProfileModal = ({ user, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">User Profile</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">{user.avatar}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                <Badge 
                  className={`mt-2 ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {user.status}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-700">{user.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Joined {new Date(user.registeredDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{user.totalBookings}</div>
                  <div className="text-xs text-gray-500">Total Bookings</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${user.totalSpent}</div>
                  <div className="text-xs text-gray-500">Total Spent</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Booking History */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold mb-4">Booking History</h4>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {mockBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{booking.destination}</span>
                        <Badge variant="outline" className="text-xs">
                          {booking.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">Booking ID: {booking.id}</div>
                    </div>
                    <Badge 
                      variant={booking.status === 'Completed' ? 'default' : 'secondary'}
                      className={booking.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Check-in:</span>
                      <div className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Check-out:</span>
                      <div className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <DollarSign size={16} />
                      ${booking.amount}
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            Edit User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
