import React, { useState } from 'react';
import { Search, Filter, Eye, Edit, Check, X, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
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


  // Sort logic
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sortBy === 'revenue') {
      return sortOrder === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue;
    } else {
      const dateA = new Date(a.dateOfListing).getTime();
      const dateB = new Date(b.dateOfListing).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedVehicles.length / itemsPerPage);
  const paginatedVehicles = sortedVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
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

        <Select value={typeFilter} onValueChange={setTypeFilter}>
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
            {paginatedVehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={vehicle.thumbnail}
                      alt={vehicle.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-medium">{vehicle.name}</div>
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
                <TableCell className="font-medium">{formatCurrency(vehicle.revenue)}</TableCell>
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
                      onClick={() => onView(vehicle)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(vehicle)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit size={16} />
                    </Button>
                    {vehicle.status === 'Pending' && (
                      <>
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApprove(vehicle.id)}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                        >
                          <Check size={16} />
                        </Button> */}
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReject(vehicle.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </Button> */}
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(vehicle.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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