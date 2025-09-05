import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Filter, Calendar, Download, Eye, X, RefreshCw, Car, Hotel
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import BookingViewModal from '@/components/bookings/BookingViewModal';
import ConfirmationDialog from '@/components/users/ConfirmationDialog';
import Navbar from '@/components/ui/Navbar';
import AppSidebar from '@/components/ui/AppSidebar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
}

type Booking = RoomBooking | VehicleBooking;

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingType, setBookingType] = useState<'room' | 'vehicle'>('room');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [actionBooking, setActionBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);

  const base_url = 'https://hbr.lytortech.com/api';

  // Load bookings from backend
  const loadBookings = async (page: number = currentPage) => {
    console.log("🔎 Filters Applied:", {
      bookingType,
      searchTerm,
      dateFilter,
      dateToFilter,
      paymentStatusFilter,
      sortBy,
      sortDir,
      page,
      size: pageSize
    });

    setLoading(true);
    try {
      let url = '';
      const params = new URLSearchParams();

      if (searchTerm) params.append('bookingReference', searchTerm);
      if (paymentStatusFilter && paymentStatusFilter !== 'All') params.append('paymentStatus', paymentStatusFilter);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortDir) params.append('sortDir', sortDir);

      // Date filters based on booking type
      if (bookingType === 'room') {
        if (dateFilter) params.append('checkInDate', dateFilter);
        if (dateToFilter) params.append('checkOutDate', dateToFilter);
      } else {
        if (dateFilter) params.append('startDate', dateFilter);
        if (dateToFilter) params.append('endDate', dateToFilter);
      }

      const hasFilters =
        searchTerm.trim() !== '' ||
        dateFilter.trim() !== '' ||
        dateToFilter.trim() !== '' ||
        (paymentStatusFilter.trim() !== '' && paymentStatusFilter !== 'All');

      if (bookingType === 'room') {
        if (hasFilters) {
          url = `${base_url}/bookings/filter/advanced?${params.toString()}&page=${page}&size=${pageSize}`;
        } else {
          url = `${base_url}/bookings/all?page=${page}&size=${pageSize}`;
        }
      } else {
        if (hasFilters) {
          url = `${base_url}/v1/bookings/filter/advanced?${params.toString()}&page=${page}&size=${pageSize}`;
        } else {
          url = `${base_url}/v1/bookings?page=${page}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`;
        }
      }

      console.log("📡 API Called →", url);

      const response = await axios.get(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      console.log("✅ API Response →", response.data);

      // Parse correct booking data structure
      let bookingsData = response.data;
      let bookingsArray: Booking[] = [];
      let totalPages = 1;
      let totalElements = 0;

      if (bookingType === 'room') {
        if (hasFilters) {
          bookingsArray = Array.isArray(bookingsData.bookings?.content) ?
            bookingsData.bookings.content :
            (Array.isArray(bookingsData.content) ? bookingsData.content : []);
          totalPages = bookingsData.bookings?.totalPages || bookingsData.totalPages || 1;
          totalElements = bookingsData.bookings?.totalElements || bookingsData.totalElements || bookingsArray.length;
        } else {
          bookingsArray = Array.isArray(bookingsData.content) ? bookingsData.content : [];
          totalPages = bookingsData.totalPages || 1;
          totalElements = bookingsData.totalElements || bookingsArray.length;
        }
      } else {
        bookingsArray = Array.isArray(bookingsData.content) ? bookingsData.content : [];
        totalPages = bookingsData.totalPages || 1;
        totalElements = bookingsData.totalElements || bookingsArray.length;
      }

      console.log("📦 Bookings Array →", bookingsArray);

      setBookings(bookingsArray);
      setTotalPages(totalPages);
      setTotalElements(totalElements);
      setCurrentPage(bookingsData.number || bookingsData.pageNumber || 0);

    } catch (error) {
      console.error('❌ Failed to fetch bookings:', error);
      setBookings([]);
      setTotalPages(0);
      setTotalElements(0);
      setCurrentPage(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(0);
  }, [bookingType, paymentStatusFilter, sortBy, sortDir]);

  const cancelBooking = async (id: number) => {
    try {
      const endpoint = bookingType === 'room'
        ? `${base_url}/bookings/${id}/cancel`
        : `${base_url}/bookings/${id}/cancel`;

      await axios.post(endpoint, {}, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      await loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const handleCancelBooking = (booking: Booking) => {
    setActionBooking(booking);
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async () => {
    if (actionBooking) await cancelBooking(actionBooking.id);
    setShowCancelDialog(false);
    setActionBooking(null);
  };

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
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AppSidebar />
        <div className="flex-1">
          <Navbar />

          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
              <p className="text-gray-600">Manage all room and vehicle bookings</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <ToggleGroup
                      type="single"
                      value={bookingType}
                      onValueChange={(value: 'room' | 'vehicle') => {
                        if (value) {
                          setBookingType(value);
                          setCurrentPage(0);
                        }
                      }}
                    >
                      <ToggleGroupItem value="room" className="flex items-center gap-2">
                        <Hotel className="h-4 w-4" />
                        <span>Room Bookings</span>
                      </ToggleGroupItem>
                      <ToggleGroupItem value="vehicle" className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span>Vehicle Bookings</span>
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div className="mb-6 flex justify-end gap-2">
                    <Button
                      onClick={() => loadBookings(0)}
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Apply Filters
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setPaymentStatusFilter('');
                        setDateFilter('');
                        setDateToFilter('');
                        setSortBy('createdAt');
                        setSortDir('desc');
                        loadBookings(0);
                      }}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  </div>

                </CardTitle>
              </CardHeader>

              <CardContent>
                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      placeholder="Search by booking reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') loadBookings(0);
                      }}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={paymentStatusFilter}
                    onValueChange={(value) => {
                      setPaymentStatusFilter(value);
                      setCurrentPage(0);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      {bookingType === 'vehicle' && <SelectItem value="REFUNDED">Refunded</SelectItem>}
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    placeholder={bookingType === 'room' ? "Check-in From" : "Start Date From"}
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />

                  <Input
                    type="date"
                    placeholder={bookingType === 'room' ? "Check-out To" : "End Date To"}
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                  />

                  <Select
                    value={sortBy}
                    onValueChange={(value) => {
                      setSortBy(value);
                      setCurrentPage(0);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Booking Date</SelectItem>
                      {bookingType === 'room' ? (
                        <SelectItem value="checkInDate">Check-in Date</SelectItem>
                      ) : (
                        <SelectItem value="startDate">Start Date</SelectItem>
                      )}
                      <SelectItem value="totalAmount">Total Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Apply Filters Button */}


                <div className="rounded-md border max-h-[450px] overflow-y-auto">

                  {/* Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking Ref</TableHead>
                          <TableHead>Customer</TableHead>
                          {bookingType === 'room' ? (
                            <>
                              <TableHead>Hotel</TableHead>
                              <TableHead>Room</TableHead>
                            </>
                          ) : (
                            <>
                              <TableHead>Vehicle</TableHead>
                              <TableHead>Booking Type</TableHead>
                            </>
                          )}
                          <TableHead>Dates</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={bookingType === 'room' ? 9 : 9} className="text-center py-8">
                              Loading bookings...
                            </TableCell>
                          </TableRow>
                        ) : bookings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={bookingType === 'room' ? 9 : 9} className="text-center py-8">
                              No bookings found
                            </TableCell>
                          </TableRow>
                        ) : (
                          bookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">{booking.bookingReference}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {isRoomBooking(booking) ? booking.userName : booking.customerName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {isRoomBooking(booking) ? booking.userEmail : booking.customerEmail}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {isRoomBooking(booking) ? booking.userPhone : booking.customerPhone}
                                  </div>
                                </div>
                              </TableCell>

                              {isRoomBooking(booking) ? (
                                <>
                                  <TableCell>
                                    <div className="font-medium">{booking.hotelName}</div>
                                    <div className="text-sm text-gray-500">{booking.hotelCity}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{booking.roomType}</div>
                                      <div className="text-sm text-gray-500">{booking.bedType} </div>
                                      <div className="text-sm text-gray-500">{formatCurrency(booking.pricePerNight)}/night</div>
                                    </div>
                                  </TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{booking.vehicleName}</div>
                                      <div className="text-sm text-gray-500">{booking.vehicleType}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {booking.bookingType}
                                    </Badge>
                                  </TableCell>
                                </>
                              )}

                              <TableCell>
                                <div className="flex flex-col text-sm text-gray-700 leading-tight">
                                  {isRoomBooking(booking) ? (
                                    <>
                                      <span className="font-medium">{formatDate(booking.checkInDate)}</span>
                                      <span className="text-xs text-gray-500">to</span>
                                      <span className="font-medium">{formatDate(booking.checkOutDate)}</span>
                                      <span className="text-xs text-gray-500">
                                        {booking.numberOfNights} nights
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-medium">{formatDateTime(booking.startDate)}</span>
                                      <span className="text-xs text-gray-500">to</span>
                                      <span className="font-medium">{formatDateTime(booking.endDate)}</span>
                                    </>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell className="font-medium">
                                {formatCurrency(booking.totalAmount)}
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusBadgeColor(booking.bookingStatus)}>
                                  {booking.bookingStatus}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={getPaymentStatusBadgeColor(booking.paymentStatus)}>
                                  {booking.paymentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewBooking(booking)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {/* {booking.bookingStatus !== 'CANCELLED' && booking.bookingStatus !== 'COMPLETED' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCancelBooking(booking)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )} */}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 0) {
                                loadBookings(currentPage - 1);
                              }
                            }}
                            className={currentPage === 0 ? 'pointer-events-none opacity-50' : ''}
                            aria-disabled={currentPage === 0}
                          />
                        </PaginationItem>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i;
                          } else if (currentPage <= 2) {
                            pageNum = i;
                          } else if (currentPage >= totalPages - 3) {
                            pageNum = totalPages - 5 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === pageNum}
                                onClick={(e) => {
                                  e.preventDefault();
                                  loadBookings(pageNum);
                                }}
                              >
                                {pageNum + 1}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages - 1) {
                                loadBookings(currentPage + 1);
                              }
                            }}
                            className={currentPage === totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
                            aria-disabled={currentPage === totalPages - 1}
                          />
                        </PaginationItem>

                      </PaginationContent>
                    </Pagination>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500">
                  Showing {bookings.length} of {totalElements} bookings (Page {currentPage + 1} of {totalPages})
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showViewModal && selectedBooking && (
        <BookingViewModal
          booking={selectedBooking}
          bookingType={bookingType}
          onClose={() => {
            setShowViewModal(false);
            setSelectedBooking(null);
          }}
          onCancel={() => handleCancelBooking(selectedBooking)}
        />
      )}

      {showCancelDialog && (
        <ConfirmationDialog
          title="Cancel Booking"
          message={`Are you sure you want to cancel booking ${actionBooking?.bookingReference}? This action cannot be undone.`}
          confirmText="Cancel Booking"
          onConfirm={confirmCancelBooking}
          onCancel={() => {
            setShowCancelDialog(false);
            setActionBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default BookingManagement;