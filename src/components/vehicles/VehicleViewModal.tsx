import React from 'react';
import { X, Calendar, User, DollarSign, MapPin, Fuel, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Vehicle, VehicleBooking } from '@/pages/VehicleManagement';

interface VehicleViewModalProps {
  vehicle: Vehicle;
  bookings: VehicleBooking[];
  onClose: () => void;
}

const VehicleViewModal = ({ vehicle, bookings, onClose }: VehicleViewModalProps) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityBadgeColor = (availability: string) => {
    return availability === 'Available' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Vehicle Details</h2>

        <DialogHeader>
          <DialogTitle className="text-2xl">{vehicle.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
         

          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Header Info */}
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/2">
                <img
                  src={vehicle.thumbnail}
                  alt={vehicle.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                
                {/* Additional Images */}
                {vehicle.images && vehicle.images.length > 1 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {vehicle.images.slice(1, 4).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${vehicle.name} ${index + 2}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:w-1/2 space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusBadgeColor(vehicle.status)}>
                    {vehicle.status}
                  </Badge>
                  <Badge className={getAvailabilityBadgeColor(vehicle.availability)}>
                    {vehicle.availability}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Number</p>
                    <p className="font-mono font-medium">{vehicle.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{vehicle.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{vehicle.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mileage</p>
                    <p className="font-medium">{vehicle.mileage}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Vendor/Partner</p>
                  <p className="font-medium">{vehicle.vendor}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date of Listing</p>
                  <p className="font-medium">{formatDate(vehicle.dateOfListing)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{vehicle.description}</p>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">₹{vehicle.pricing.hourly}</div>
                  <div className="text-sm text-gray-600">Per Hour</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">₹{vehicle.pricing.daily}</div>
                  <div className="text-sm text-gray-600">Per Day</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">₹{vehicle.pricing.weekly}</div>
                  <div className="text-sm text-gray-600">Per Week</div>
                </div>
              </div>
            </div>

            {/* Revenue Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Revenue Statistics</h3>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Revenue Generated</p>
                    <p className="text-3xl font-bold">{formatCurrency(vehicle.revenue)}</p>
                  </div>
                  <DollarSign size={48} className="text-blue-200" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* <TabsContent value="bookings" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Bookings</h3>
              
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No bookings found for this vehicle</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono">{booking.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-400" />
                              {booking.userName}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(booking.startDate)}</TableCell>
                          <TableCell>{formatDate(booking.endDate)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(booking.amountPaid)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getBookingStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent> */}
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleViewModal;