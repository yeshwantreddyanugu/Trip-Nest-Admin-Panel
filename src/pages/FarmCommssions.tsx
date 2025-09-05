import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppSidebar from '@/components/ui/AppSidebar';
import Navbar from '@/components/ui/Navbar';
import { 
  DollarSign, 
  Users, 
  Clock, 
  TrendingUp, 
  Eye,
  Filter,
  Calendar,
  Building2,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';

const BASE_URL = 'https://hbr.lytortech.com';

interface FarmBooking {
  id: number;
  bookingReference: string;
  bookingType: 'FARM';
  entityId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  transactionReference: string;
  paymentId: string;
  paymentSignature: string;
  paidAmount: number;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

interface FarmBookingResponse {
  content: FarmBooking[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      direction: string;
      property: string;
    };
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

interface Statistics {
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  averageBookingValue: number;
  statusBreakdown: {
    CONFIRMED: number;
    PENDING: number;
    CANCELLED: number;
    COMPLETED: number;
  };
}

const FarmCommission = () => {
  // State management
  const [bookings, setBookings] = useState<FarmBooking[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [totalCommissionInRange, setTotalCommissionInRange] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED'>('ALL');
  const [startDate, setStartDate] = useState<string>('2024-01-01');
  const [endDate, setEndDate] = useState<string>('2024-12-31');
  
  // Modal state
  const [selectedBooking, setSelectedBooking] = useState<FarmBooking | null>(null);
  const [showModal, setShowModal] = useState(false);

  const pageSize = 10;

  // API calls
  const fetchBookings = async (page = 0, status = statusFilter) => {
    console.log(`[INFO] Fetching farm bookings - Page: ${page}, Status: ${status}`);
    setLoading(true);
    setError(null);

    try {
      let url = '';
      
      if (status === 'ALL') {
        url = `${BASE_URL}/api/farm-bookings/all?page=${page}&size=${pageSize}&sortBy=createdAt&sortDir=desc`;
      } else {
        url = `${BASE_URL}/api/farm-bookings/by-status/${status}?page=${page}&size=${pageSize}&sortBy=createdAt&sortDir=desc`;
      }

      console.log(`[API] Calling: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FarmBookingResponse = await response.json();
      console.log('[SUCCESS] Farm bookings data loaded:', data);
      
      setBookings(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.pageable.pageNumber);
      
    } catch (err) {
      console.error('[ERROR] Failed to load farm bookings:', err);
      setError('Failed to load farm bookings data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    console.log(`[INFO] Fetching farm booking statistics for date range: ${startDate} to ${endDate}`);
    try {
      const startDateTime = `${startDate}T00:00:00`;
      const endDateTime = `${endDate}T23:59:59`;
      
      const url = `${BASE_URL}/api/farm-bookings/statistics?bookingType=FARM&startDate=${startDateTime}&endDate=${endDateTime}`;
      console.log(`[API] Calling statistics: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Statistics = await response.json();
      console.log('[SUCCESS] Statistics loaded:', data);
      setStatistics(data);
      
    } catch (err) {
      console.error('[ERROR] Failed to load statistics:', err);
    }
  };

  const fetchTotalCommission = async () => {
    console.log(`[INFO] Fetching total commission for date range: ${startDate} to ${endDate}`);
    try {
      const startDateTime = `${startDate}T00:00:00`;
      const endDateTime = `${endDate}T23:59:59`;
      
      const url = `${BASE_URL}/api/farm-bookings/commission/total?startDate=${startDateTime}&endDate=${endDateTime}`;
      console.log(`[API] Calling total commission: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[SUCCESS] Total commission loaded:', data);
      setTotalCommissionInRange(data.totalCommission);
      
    } catch (err) {
      console.error('[ERROR] Failed to load total commission:', err);
    }
  };

  const fetchBookingDetails = async (bookingReference: string) => {
    console.log(`[INFO] Fetching booking details for reference: ${bookingReference}`);
    try {
      const url = `${BASE_URL}/api/farm-bookings/${bookingReference}`;
      console.log(`[API] Calling booking details: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FarmBooking = await response.json();
      console.log('[SUCCESS] Booking details loaded:', data);
      setSelectedBooking(data);
      setShowModal(true);
      
    } catch (err) {
      console.error('[ERROR] Failed to load booking details:', err);
      setError('Failed to load booking details');
    }
  };

  // Effects
  useEffect(() => {
    fetchBookings(0, statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    fetchStatistics();
    fetchTotalCommission();
  }, [startDate, endDate]);

  // Event handlers
  const handlePageChange = (newPage: number) => {
    console.log(`[INFO] Changing page to: ${newPage}`);
    setCurrentPage(newPage);
    fetchBookings(newPage, statusFilter);
  };

  const handleViewBooking = (booking: FarmBooking) => {
    console.log('[INFO] Opening booking modal for reference:', booking.bookingReference);
    fetchBookingDetails(booking.bookingReference);
  };

  const closeModal = () => {
    console.log('[INFO] Closing booking modal');
    setShowModal(false);
    setSelectedBooking(null);
  };

  const handleDateRangeUpdate = () => {
    console.log(`[INFO] Updating date range: ${startDate} to ${endDate}`);
    fetchStatistics();
    fetchTotalCommission();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN');
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      CONFIRMED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  if (loading && !bookings.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <p>Loading farm commission data...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Farm Commission Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage farm bookings, commissions, and revenue analytics</p>
            </div>

            {/* Date Range Filter */}
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays size={20} />
                    Date Range Filter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="pt-6">
                      <Button onClick={handleDateRangeUpdate}>
                        Update Statistics
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-900">
                      Total Commission in Range: {formatCurrency(totalCommissionInRange)}
                    </div>
                    <div className="text-sm text-blue-600">
                      From {formatDateOnly(startDate)} to {formatDateOnly(endDate)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.totalBookings}</div>
                    <p className="text-xs text-muted-foreground">Farm bookings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(statistics.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">Total earnings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(statistics.totalCommission)}</div>
                    <p className="text-xs text-muted-foreground">Commission earned</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(statistics.averageBookingValue)}</div>
                    <p className="text-xs text-muted-foreground">Per booking</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Status Breakdown */}
            {statistics && (
              <div className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{statistics.statusBreakdown.CONFIRMED}</div>
                        <p className="text-sm text-green-700">Confirmed</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{statistics.statusBreakdown.PENDING}</div>
                        <p className="text-sm text-yellow-700">Pending</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{statistics.statusBreakdown.CANCELLED}</div>
                        <p className="text-sm text-red-700">Cancelled</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{statistics.statusBreakdown.COMPLETED}</div>
                        <p className="text-sm text-blue-700">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Status Filter */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <Filter className="text-gray-500" size={20} />
                <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                <div className="flex gap-2">
                  {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'].map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status as typeof statusFilter)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <Card>
              <CardHeader>
                <CardTitle>Farm Bookings List</CardTitle>
                <p className="text-sm text-gray-600">
                  Showing {bookings.length} of {totalElements} bookings
                </p>
              </CardHeader>
              <CardContent>
                {loading && <div className="text-center py-4">Loading...</div>}
                {error && <div className="text-center py-4 text-red-600">{error}</div>}
                
                {!loading && !error && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium">Booking Ref</th>
                            <th className="text-left p-2 font-medium">Customer</th>
                            <th className="text-left p-2 font-medium">Dates</th>
                            <th className="text-left p-2 font-medium">Guests</th>
                            <th className="text-left p-2 font-medium">Amount</th>
                            <th className="text-left p-2 font-medium">Commission</th>
                            <th className="text-left p-2 font-medium">Status</th>
                            <th className="text-left p-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((booking) => (
                            <tr key={booking.id} className="border-b hover:bg-gray-50">
                              <td className="p-2">
                                <div className="font-mono text-sm">{booking.bookingReference}</div>
                                <div className="text-xs text-gray-500">Entity ID: {booking.entityId}</div>
                              </td>
                              <td className="p-2">
                                <div>
                                  <div className="font-medium">{booking.customerName}</div>
                                  <div className="text-sm text-gray-600">{booking.customerEmail}</div>
                                  <div className="text-xs text-gray-500">{booking.customerPhone}</div>
                                </div>
                              </td>
                              <td className="p-2">
                                <div className="text-sm">
                                  <div>Check-in: {formatDateOnly(booking.checkInDate)}</div>
                                  <div>Check-out: {formatDateOnly(booking.checkOutDate)}</div>
                                </div>
                              </td>
                              <td className="p-2 text-center">
                                <div className="text-lg font-medium">{booking.numberOfGuests}</div>
                              </td>
                              <td className="p-2">
                                <div>
                                  <div className="font-medium">{formatCurrency(booking.totalAmount)}</div>
                                  <div className="text-sm text-gray-600">Paid: {formatCurrency(booking.paidAmount)}</div>
                                </div>
                              </td>
                              <td className="p-2">
                                <div>
                                  <div className="font-medium">{formatCurrency(booking.commissionAmount)}</div>
                                  <div className="text-sm text-gray-600">{booking.commissionRate}%</div>
                                </div>
                              </td>
                              <td className="p-2">
                                {getStatusBadge(booking.status)}
                              </td>
                              <td className="p-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewBooking(booking)}
                                  className="flex items-center gap-1"
                                >
                                  <Eye size={14} />
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Page {currentPage + 1} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                          >
                            <ChevronLeft size={14} />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                          >
                            Next
                            <ChevronRight size={14} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Modal */}
            {showModal && selectedBooking && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Farm Booking Details</h2>
                    <Button variant="outline" size="sm" onClick={closeModal}>
                      <X size={16} />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Booking Reference</label>
                      <div className="text-lg font-mono">{selectedBooking.bookingReference}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Entity ID</label>
                      <div className="text-lg">{selectedBooking.entityId}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div>{getStatusBadge(selectedBooking.status)}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Customer Name</label>
                      <div className="text-lg">{selectedBooking.customerName}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Customer Email</label>
                      <div className="text-lg">{selectedBooking.customerEmail}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <div className="text-lg">{selectedBooking.customerPhone}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Check-in Date</label>
                      <div className="text-lg">{formatDateOnly(selectedBooking.checkInDate)}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Check-out Date</label>
                      <div className="text-lg">{formatDateOnly(selectedBooking.checkOutDate)}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Number of Guests</label>
                      <div className="text-lg font-medium">{selectedBooking.numberOfGuests}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Total Amount</label>
                      <div className="text-lg font-medium">{formatCurrency(selectedBooking.totalAmount)}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Commission Rate</label>
                      <div className="text-lg">{selectedBooking.commissionRate}%</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Commission Amount</label>
                      <div className="text-lg font-medium text-green-600">{formatCurrency(selectedBooking.commissionAmount)}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Paid Amount</label>
                      <div className="text-lg font-medium">{formatCurrency(selectedBooking.paidAmount)}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Transaction Reference</label>
                      <div className="text-lg font-mono ">{selectedBooking.transactionReference}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment ID</label>
                      <div className="text-lg font-mono ">{selectedBooking.paymentId}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Date</label>
                      <div className="text-lg">{formatDate(selectedBooking.paymentDate)}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created At</label>
                      <div className="text-lg">{formatDate(selectedBooking.createdAt)}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Updated At</label>
                      <div className="text-lg">{formatDate(selectedBooking.updatedAt)}</div>
                    </div>
                    
                    <div className="lg:col-span-3">
                      <label className="text-sm font-medium text-gray-600">Payment Signature</label>
                      <div className="text-sm font-mono bg-gray-50 p-2 rounded break-all">{selectedBooking.paymentSignature}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FarmCommission;