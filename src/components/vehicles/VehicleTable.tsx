import React, { useState } from 'react';
import { Search, Filter, Eye, Edit, Check, X, Trash2, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Vehicle } from '@/pages/VehicleManagement';

interface VehicleTableProps {
  vehicles: Vehicle[];
  onView: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onApprove: (vehicleId: string) => void;
  onReject: (vehicleId: string) => void;
  onDelete: (vehicleId: string) => void;
}

const VehicleTable = ({ vehicles, onView, onEdit, onApprove, onReject, onDelete }: VehicleTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'revenue' | 'dateOfListing'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  console.log('📊 VehicleTable received vehicles:', vehicles.length);
  console.log('🔍 Temp vehicles found:', vehicles.filter(v => v.id.startsWith('temp-')).length);

  // Filter and search logic
  const filteredVehicles = vehicles.filter(vehicle => {
    const name = vehicle?.name ?? '';
    const number = vehicle?.vehicleNumber ?? '';

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  console.log('🔍 Filtered vehicles:', filteredVehicles.length);

  // Custom sort logic - prioritize new/temp vehicles at the top
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    // Always put temporary/new vehicles at the top
    const aIsTemp = a.id.startsWith('temp-');
    const bIsTemp = b.id.startsWith('temp-');
    
    if (aIsTemp && !bIsTemp) return -1;
    if (!aIsTemp && bIsTemp) return 1;
    
    // For non-temp vehicles, use normal sorting
    if (sortBy === 'revenue') {
      return sortOrder === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue;
    } else {
      const dateA = new Date(a.dateOfListing).getTime();
      const dateB = new Date(b.dateOfListing).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    }
  });

  console.log('📈 Sorted vehicles:', sortedVehicles.length);

  // Pagination logic
  const totalPages = Math.ceil(sortedVehicles.length / itemsPerPage);
  const paginatedVehicles = sortedVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  console.log('📄 Paginated vehicles:', paginatedVehicles.length);

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

  const handleSort = (field: 'revenue' | 'dateOfListing') => {
    console.log('📊 Sorting by:', field);
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
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

  const isTemporaryVehicle = (vehicleId: string) => {
    return vehicleId.startsWith('temp-');
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search by vehicle name or number..."
              value={searchTerm}
              onChange={(e) => {
                console.log('🔍 Search term changed:', e.target.value);
                setSearchTerm(e.target.value);
              }}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={(value) => {
          console.log('🏷️ Status filter changed:', value);
          setStatusFilter(value);
        }}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(value) => {
          console.log('🚗 Type filter changed:', value);
          setTypeFilter(value);
        }}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Bike">Bike</SelectItem>
            <SelectItem value="Scooter">Scooter</SelectItem>
            <SelectItem value="Car">Car</SelectItem>
            <SelectItem value="SUV">SUV</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {paginatedVehicles.length} of {filteredVehicles.length} vehicles
        {vehicles.filter(v => v.id.startsWith('temp-')).length > 0 && (
          <span className="ml-2 text-blue-600">
            ({vehicles.filter(v => v.id.startsWith('temp-')).length} pending save)
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('dateOfListing')}
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  Listed Date
                  {sortBy === 'dateOfListing' && (
                    sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                  )}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('revenue')}
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  Revenue
                  {sortBy === 'revenue' && (
                    sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                  )}
                </button>
              </TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                  No vehicles found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              paginatedVehicles.map((vehicle) => {
                const isTempVehicle = isTemporaryVehicle(vehicle.id);
                console.log(`🚗 Rendering vehicle ${vehicle.name} (ID: ${vehicle.id}, isTemp: ${isTempVehicle})`);
                
                return (
                  <TableRow key={vehicle.id} className={isTempVehicle ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={vehicle.thumbnail}
                            alt={vehicle.name}
                            className={`w-12 h-12 rounded-lg object-cover ${isTempVehicle ? 'opacity-80' : ''}`}
                            onError={(e) => {
                              console.log('🖼️ Image failed to load, using fallback');
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64';
                            }}
                          />
                          {isTempVehicle && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                              <Clock size={8} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {vehicle.name}
                            {isTempVehicle && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Saving...
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{vehicle.vendor}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{vehicle.vehicleNumber}</TableCell>
                    <TableCell>{vehicle.type}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(vehicle.status)}>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAvailabilityBadgeColor(vehicle.availability)}>
                        {vehicle.availability}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(vehicle.dateOfListing)}</TableCell>
                    <TableCell className="font-medium">
                      {isTempVehicle ? (
                        <span className="text-gray-400">Calculating...</span>
                      ) : (
                        formatCurrency(vehicle.revenue)
                      )}
                    </TableCell>
                    <TableCell>{vehicle.mileage}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>₹{vehicle.pricing.hourly}/hr</div>
                        <div>₹{vehicle.pricing.daily}/day</div>
                        <div>₹{vehicle.pricing.weekly}/week</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log('👁️ View vehicle clicked:', vehicle.id);
                            onView(vehicle);
                          }}
                          className="h-8 w-8 p-0"
                          disabled={isTempVehicle}
                          title={isTempVehicle ? 'Vehicle is being saved...' : 'View vehicle details'}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log('✏️ Edit vehicle clicked:', vehicle.id);
                            onEdit(vehicle);
                          }}
                          className="h-8 w-8 p-0"
                          disabled={isTempVehicle}
                          title={isTempVehicle ? 'Vehicle is being saved...' : 'Edit vehicle'}
                        >
                          <Edit size={16} />
                        </Button>
                        {vehicle.status === 'Pending' && !isTempVehicle && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                console.log('✅ Approve vehicle clicked:', vehicle.id);
                                onApprove(vehicle.id);
                              }}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                              title="Approve vehicle"
                            >
                              <Check size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                console.log('❌ Reject vehicle clicked:', vehicle.id);
                                onReject(vehicle.id);
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              title="Reject vehicle"
                            >
                              <X size={16} />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log('🗑️ Delete vehicle clicked:', vehicle.id);
                            onDelete(vehicle.id);
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          disabled={isTempVehicle}
                          title={isTempVehicle ? 'Vehicle is being saved...' : 'Delete vehicle'}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default VehicleTable;