import React from 'react';
import {
  X, Calendar, CreditCard, User, Home, Bed, Phone, Mail, Clock, 
  CheckCircle, XCircle, Car, MapPin, Navigation, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RoomBooking {
  id: number;
  bookingReference: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms: number;
  numberOfGuests: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  specialRequests: string;
  numberOfNights: number;
  roomId: number;
  roomType: string;
  pricePerNight: number;
  bedType: string;
  roomSize: string;
  hotelId: number;
  hotelName: string;
  hotelAddress: string;
  hotelCity: string;
  hotelCountry: string;
  hotelRating: number;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  cancellationReason: string | null;
  uid: string;
}

interface VehicleBooking {
  id: number;
  vehicleId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  dropLocation: string;
  bookingType: string;
  specialRequests: string;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  aadharCardUrl: string;
  panCardUrl: string;
  uid: string;
  vehicleName: string;
  vehicleType: string;
  createdAt: string;
  updatedAt: string;
  bookingReference: string;
  cancelledAt: string | null;
  cancellationReason: string | null;
}

type Booking = RoomBooking | VehicleBooking;

interface BookingViewModalProps {
  booking: Booking;
  bookingType: 'room' | 'vehicle';
  onClose: () => void;
  onCancel: () => void;
}

const BookingViewModal: React.FC<BookingViewModalProps> = ({ 
  booking, 
  bookingType, 
  onClose, 
  onCancel 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'REFUNDED': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isRoomBooking = (booking: Booking): booking is RoomBooking => {
    return bookingType === 'room';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">Booking Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Summary */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Booking Summary</h3>
                <Badge className={getStatusBadgeColor(booking.bookingStatus)}>
                  {booking.bookingStatus}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Booking Reference</p>
                    <p className="font-medium">{booking.bookingReference}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Booking Date</p>
                    <p className="font-medium">{formatDate(booking.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Payment</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {isRoomBooking(booking) ? booking.paymentMethod : 'Online'}
                      </span>
                      <Badge className={getPaymentStatusBadgeColor(booking.paymentStatus)}>
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium">{formatCurrency(booking.totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="font-medium">
                      {isRoomBooking(booking) ? booking.userName : booking.customerName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">
                      {isRoomBooking(booking) ? booking.userEmail : booking.customerEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">
                      {isRoomBooking(booking) ? booking.userPhone : booking.customerPhone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Property/Vehicle Information */}
            {isRoomBooking(booking) ? (
              <>
                {/* Hotel Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hotel Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Hotel Name</p>
                        <p className="font-medium">{booking.hotelName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">
                          {booking.hotelAddress}, {booking.hotelCity}, {booking.hotelCountry}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        <p className="font-medium">{booking.hotelRating}/5</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Room Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Room Type</p>
                        <p className="font-medium">{booking.roomType}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Bed Type</p>
                        <p className="font-medium">{booking.bedType}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Room Size</p>
                        <p className="font-medium">{booking.roomSize}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Price Per Night</p>
                        <p className="font-medium">{formatCurrency(booking.pricePerNight)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Vehicle Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Vehicle Name</p>
                        <p className="font-medium">{booking.vehicleName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Vehicle Type</p>
                        <p className="font-medium">{booking.vehicleType}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Booking Type</p>
                        <p className="font-medium">{booking.bookingType}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Pickup Location</p>
                        <p className="font-medium">{booking.pickupLocation}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Navigation className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Drop Location</p>
                        <p className="font-medium">{booking.dropLocation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Booking Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {isRoomBooking(booking) ? 'Stay Details' : 'Rental Period'}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">
                      {isRoomBooking(booking) ? 'Check-in Date' : 'Start Date'}
                    </p>
                    <p className="font-medium">
                      {isRoomBooking(booking) 
                        ? formatDate(booking.checkInDate) 
                        : formatDateTime(booking.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">
                      {isRoomBooking(booking) ? 'Check-out Date' : 'End Date'}
                    </p>
                    <p className="font-medium">
                      {isRoomBooking(booking) 
                        ? formatDate(booking.checkOutDate) 
                        : formatDateTime(booking.endDate)}
                    </p>
                  </div>
                </div>

                {isRoomBooking(booking) && (
                  <>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Number of Nights</p>
                        <p className="font-medium">{booking.numberOfNights}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Number of Guests</p>
                        <p className="font-medium">{booking.numberOfGuests}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Number of Rooms</p>
                        <p className="font-medium">{booking.numberOfRooms}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Documents (Vehicle Only) */}
            {!isRoomBooking(booking) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Documents</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Aadhar Card</p>
                      <a 
                        href={booking.aadharCardUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">PAN Card</p>
                      <a 
                        href={booking.panCardUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Special Requests</h3>
                <p className="text-gray-700">{booking.specialRequests}</p>
              </div>
            )}

            {/* Cancellation Info */}
            {booking.cancelledAt && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cancellation Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Cancelled At</p>
                      <p className="font-medium">{formatDate(booking.cancelledAt)}</p>
                    </div>
                  </div>
                  {booking.cancellationReason && (
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Reason</p>
                        <p className="font-medium">{booking.cancellationReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3">
            {/* {booking.bookingStatus !== 'CANCELLED' && booking.bookingStatus !== 'COMPLETED' && (
              <Button variant="destructive" onClick={onCancel}>
                Cancel Booking
              </Button>
            )} */}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingViewModal;