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
  Car,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const BASE_URL = 'https://hbr.lytortech.com';

interface Commission {
  id: number;
  bookingReference: string;
  bookingType: 'HOTEL' | 'VEHICLE';
  bookingId: number;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  hotelEarnings?: number;
  adminEarnings: number;
  hotelId?: number;
  hotelName?: string;
  vehicleId?: number;
  vehicleName?: string;
  customerName: string;
  customerEmail: string;
  paymentStatus: string;
  commissionStatus: string;
  settlementDate?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface CommissionResponse {
  content: Commission[];
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  number: number;
}

interface Statistics {
  totalAdminEarnings: number;
  totalHotelBookings: number;
  totalVehicleBookings: number;
  totalHotelCommissions: number;
  totalVehicleCommissions?: number;
  averageCommissionPerHotelBooking: number;
}

interface EarningsData {
  id: number;
  date: string;
  hotelId?: number;
  hotelName?: string;
  vehicleId?: number;
  vehicleName?: string;
  bookingType: 'HOTEL' | 'VEHICLE';
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  hotelEarnings?: number;
  adminEarnings: number;
}

const CommissionEarnings = () => {
  // State management
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [bookingTypeFilter, setBookingTypeFilter] = useState<'ALL' | 'HOTEL' | 'VEHICLE'>('ALL');
  const [viewMode, setViewMode] = useState<'commissions' | 'earnings'>('commissions');
  const [earningsFilter, setEarningsFilter] = useState<'today' | 'weekly' | 'monthly'>('today');

  // Modal state
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [showModal, setShowModal] = useState(false);

  const pageSize = 10;

  // API calls
  const fetchCommissions = async (page = 0, type = bookingTypeFilter) => {
    console.log(`[INFO] Fetching commissions - Page: ${page}, Type: ${type}`);
    setLoading(true);
    setError(null);

    try {
      let url = '';

      if (type === 'ALL') {
        url = `${BASE_URL}/api/commissions?page=${page}&size=${pageSize}&sortBy=createdAt&sortDirection=desc`;
      } else {
        url = `${BASE_URL}/api/commissions/type/${type}?page=${page}&size=${pageSize}&sortBy=createdAt&sortDirection=desc`;
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

      const data: CommissionResponse = await response.json();
      console.log('[SUCCESS] Commissions data loaded:', data);

      setCommissions(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.number);

    } catch (err) {
      console.error('[ERROR] Failed to load commissions:', err);
      setError('Failed to load commissions data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    console.log('[INFO] Fetching commission statistics');
    try {
      const response = await fetch(`${BASE_URL}/api/commissions/statistics`, {
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

  const fetchEarningsData = async (period: string) => {
    console.log(`[INFO] Fetching earnings data for period: ${period}`);
    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      switch (period) {
        case 'today':
          endpoint = '/api/commissions/today';
          break;
        case 'weekly':
          endpoint = '/api/commissions/this-week'; // Assuming this exists
          break;
        case 'monthly':
          endpoint = '/api/commissions/this-month';
          break;
        default:
          endpoint = '/api/commissions/today';
      }

      console.log(`[API] Calling: ${BASE_URL}${endpoint}`);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EarningsData[] = await response.json();
      console.log('[SUCCESS] Earnings data loaded:', data);
      setEarningsData(data);

    } catch (err) {
      console.error('[ERROR] Failed to load earnings data:', err);
      setError('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    if (viewMode === 'commissions') {
      fetchCommissions(0, bookingTypeFilter);
    } else {
      fetchEarningsData(earningsFilter);
    }
  }, [bookingTypeFilter, viewMode, earningsFilter]);

  // Event handlers
  const handlePageChange = (newPage: number) => {
    console.log(`[INFO] Changing page to: ${newPage}`);
    setCurrentPage(newPage);
    fetchCommissions(newPage, bookingTypeFilter);
  };

  const handleViewCommission = (commission: Commission) => {
    console.log('[INFO] Opening commission modal:', commission.id);
    setSelectedCommission(commission);
    setShowModal(true);
  };

  const closeModal = () => {
    console.log('[INFO] Closing commission modal');
    setShowModal(false);
    setSelectedCommission(null);
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

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800',
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

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <AppSidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Commission & Earnings</h1>
              <p className="text-gray-600 mt-2">Manage platform revenue, commissions, and vendor payouts</p>
            </div>

            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Admin Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(statistics.totalAdminEarnings)}</div>
                    <p className="text-xs text-muted-foreground">Platform earnings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hotel Bookings</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.totalHotelBookings}</div>
                    <p className="text-xs text-muted-foreground">Total hotel bookings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vehicle Bookings</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.totalVehicleBookings}</div>
                    <p className="text-xs text-muted-foreground">Total vehicle bookings</p>
                  </CardContent>
                </Card>

                {/* <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hotel Commissions</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.totalHotelCommissions}</div>
                    <p className="text-xs text-muted-foreground">Total Hotel Commissions</p>
                  </CardContent>
                </Card> */}

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Commission</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(statistics.averageCommissionPerHotelBooking)}</div>
                    <p className="text-xs text-muted-foreground">Per hotel booking</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="mb-6">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'commissions' ? 'default' : 'outline'}
                  onClick={() => setViewMode('commissions')}
                  className="flex items-center gap-2"
                >
                  <Users size={16} />
                  Commissions List
                </Button>
                <Button
                  variant={viewMode === 'earnings' ? 'default' : 'outline'}
                  onClick={() => setViewMode('earnings')}
                  className="flex items-center gap-2"
                >
                  <Calendar size={16} />
                  Earnings Report
                </Button>
              </div>
            </div>

            {viewMode === 'commissions' ? (
              <>
                {/* Filters */}
                <div className="mb-6">
                  <div className="flex items-center gap-4">
                    <Filter className="text-gray-500" size={20} />
                    <span className="text-sm font-medium text-gray-700">Filter by Type:</span>
                    <div className="flex gap-2">
                      {['ALL', 'HOTEL', 'VEHICLE'].map((type) => (
                        <Button
                          key={type}
                          variant={bookingTypeFilter === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setBookingTypeFilter(type as typeof bookingTypeFilter)}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Commissions Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Commissions List</CardTitle>
                    <p className="text-sm text-gray-600">
                      Showing {commissions.length} of {totalElements} commissions
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
                                <th className="text-left p-2 font-medium">Type</th>
                                <th className="text-left p-2 font-medium">Customer</th>
                                <th className="text-left p-2 font-medium">Total Amount</th>
                                <th className="text-left p-2 font-medium">Commission</th>
                                <th className="text-left p-2 font-medium">Status</th>
                                <th className="text-left p-2 font-medium">Date</th>
                                <th className="text-left p-2 font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {commissions.map((commission) => (
                                <tr key={commission.id} className="border-b hover:bg-gray-50">
                                  <td className="p-2">{commission.bookingReference}</td>
                                  <td className="p-2">
                                    <Badge variant={commission.bookingType === 'HOTEL' ? 'default' : 'secondary'}>
                                      {commission.bookingType}
                                    </Badge>
                                  </td>
                                  <td className="p-2">
                                    <div>
                                      <div className="font-medium">{commission.customerName}</div>
                                      <div className="text-sm text-gray-600">{commission.customerEmail}</div>
                                    </div>
                                  </td>
                                  <td className="p-2">{formatCurrency(commission.totalAmount)}</td>
                                  <td className="p-2">
                                    <div>
                                      <div className="font-medium">{formatCurrency(commission.commissionAmount)}</div>
                                      <div className="text-sm text-gray-600">{commission.commissionRate}%</div>
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="space-y-1">
                                      {getStatusBadge(commission.paymentStatus)}
                                      {getStatusBadge(commission.commissionStatus)}
                                    </div>
                                  </td>
                                  <td className="p-2 text-sm">{formatDate(commission.createdAt)}</td>
                                  <td className="p-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleViewCommission(commission)}
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
              </>
            ) : (
              <>
                {/* Earnings Filters */}
                <div className="mb-6">
                  <div className="flex items-center gap-4">
                    <Calendar className="text-gray-500" size={20} />
                    <span className="text-sm font-medium text-gray-700">Earnings Period:</span>
                    <div className="flex gap-2">
                      {[
                        { value: 'today', label: 'Today' },
                        { value: 'weekly', label: 'This Week' },
                        { value: 'monthly', label: 'This Month' }
                      ].map((period) => (
                        <Button
                          key={period.value}
                          variant={earningsFilter === period.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEarningsFilter(period.value as typeof earningsFilter)}
                        >
                          {period.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Earnings Data */}
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Report - {earningsFilter.charAt(0).toUpperCase() + earningsFilter.slice(1)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading && <div className="text-center py-4">Loading...</div>}
                    {error && <div className="text-center py-4 text-red-600">{error}</div>}

                    {!loading && !error && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {earningsData.map((item) => (
                          <Card key={item.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant={item.bookingType === 'HOTEL' ? 'default' : 'secondary'}>
                                  {item.bookingType}
                                </Badge>
                                <div className="text-sm text-gray-600">{item.date}</div>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <div className="font-medium">
                                    {item.hotelName || item.vehicleName || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {item.totalBookings} booking(s)
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-sm">Total Revenue:</span>
                                    <span className="font-medium">{formatCurrency(item.totalRevenue)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Commission:</span>
                                    <span className="font-medium text-green-600">{formatCurrency(item.totalCommission)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Admin Earnings:</span>
                                    <span className="font-medium text-blue-600">{formatCurrency(item.adminEarnings)}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Modal */}
            {showModal && selectedCommission && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Commission Details</h2>
                    <Button variant="outline" size="sm" onClick={closeModal}>
                      <X size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Booking Reference</label>
                      <div className="text-lg font-medium">{selectedCommission.bookingReference}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Booking Type</label>
                      <div>
                        <Badge variant={selectedCommission.bookingType === 'HOTEL' ? 'default' : 'secondary'}>
                          {selectedCommission.bookingType}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Customer Name</label>
                      <div className="text-lg">{selectedCommission.customerName}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Customer Email</label>
                      <div className="text-lg">{selectedCommission.customerEmail}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Total Amount</label>
                      <div className="text-lg font-medium">{formatCurrency(selectedCommission.totalAmount)}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Commission Rate</label>
                      <div className="text-lg">{selectedCommission.commissionRate}%</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Commission Amount</label>
                      <div className="text-lg font-medium text-green-600">{formatCurrency(selectedCommission.commissionAmount)}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Admin Earnings</label>
                      <div className="text-lg font-medium text-blue-600">{formatCurrency(selectedCommission.adminEarnings)}</div>
                    </div>

                    {selectedCommission.hotelName && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Hotel Name</label>
                        <div className="text-lg">{selectedCommission.hotelName}</div>
                      </div>
                    )}

                    {selectedCommission.hotelEarnings && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Hotel Earnings</label>
                        <div className="text-lg font-medium">{formatCurrency(selectedCommission.hotelEarnings)}</div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Status</label>
                      <div>{getStatusBadge(selectedCommission.paymentStatus)}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Commission Status</label>
                      <div>{getStatusBadge(selectedCommission.commissionStatus)}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Created At</label>
                      <div className="text-lg">{formatDate(selectedCommission.createdAt)}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Updated At</label>
                      <div className="text-lg">{formatDate(selectedCommission.updatedAt)}</div>
                    </div>

                    {selectedCommission.settlementDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Settlement Date</label>
                        <div className="text-lg">{formatDate(selectedCommission.settlementDate)}</div>
                      </div>
                    )}

                    {selectedCommission.remarks && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Remarks</label>
                        <div className="text-lg">{selectedCommission.remarks}</div>
                      </div>
                    )}
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

export default CommissionEarnings;