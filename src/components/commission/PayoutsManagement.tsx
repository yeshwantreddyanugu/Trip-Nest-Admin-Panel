import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
} from '@/components/ui/pagination';

import { Search, Check, Clock, DollarSign } from 'lucide-react';

// ✅ Backend Base URL
const base_url = 'https://your-ngrok-url.ngrok-free.app/api';

interface Payout {
  id: string;
  vendorName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
  type: 'property' | 'vehicle';
}

const PayoutsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);

  const itemsPerPage = 10;

  // ✅ Load payouts from backend
  const loadPayouts = async () => {
    console.log('[INFO] Loading payouts...');
    try {
      const response = await axios.get(`${base_url}/payouts`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      console.log('[SUCCESS] Payouts fetched:', response.data);
      setPayouts(response.data);
    } catch (error) {
      console.error('[ERROR] Failed to fetch payouts:', error);
    }
  };

  // ✅ Mark payout as paid
  const markPayoutAsPaid = async (id: string) => {
    console.log(`[INFO] Marking payout ${id} as paid...`);
    try {
      await axios.post(`${base_url}/payouts/${id}/mark-paid`, {}, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      console.log('[SUCCESS] Payout marked as paid');
      await loadPayouts();
    } catch (error) {
      console.error('[ERROR] Failed to mark payout as paid:', error);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const handleMarkAsPaid = (payout: Payout) => {
    setSelectedPayout(payout);
    setIsConfirmDialogOpen(true);
  };

  const confirmMarkAsPaid = async () => {
    if (selectedPayout) {
      await markPayoutAsPaid(selectedPayout.id);
      setIsConfirmDialogOpen(false);
      setSelectedPayout(null);
    }
  };

  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = payout.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayouts = filteredPayouts.slice(startIndex, startIndex + itemsPerPage);

  const totalPendingAmount = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPaidAmount = payouts
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: string) => {
    return status === 'paid'
      ? <Badge className="bg-green-100 text-green-800">Paid</Badge>
      : <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid Out</p>
              <p className="text-2xl font-bold text-green-600">₹{totalPaidAmount.toLocaleString()}</p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
              <p className="text-2xl font-bold text-yellow-600">₹{totalPendingAmount.toLocaleString()}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payouts</p>
              <p className="text-2xl font-bold">₹{(totalPaidAmount + totalPendingAmount).toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-600" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search by vendor name or payout ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>All</Button>
              <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('pending')}>Pending</Button>
              <Button variant={statusFilter === 'paid' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('paid')}>Paid</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payouts Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payout ID</TableHead>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>{payout.id}</TableCell>
                    <TableCell>{payout.vendorName}</TableCell>
                    <TableCell>
                      <Badge variant={payout.type === 'property' ? 'default' : 'secondary'}>
                        {payout.type === 'property' ? 'Property' : 'Vehicle'}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{payout.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(payout.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell>
                      {payout.status === 'pending' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleMarkAsPaid(payout)}
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                    >
                      {i + 1}
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
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>Are you sure you want to mark this payout as paid?</DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="py-4">
              <p><strong>Payout ID:</strong> {selectedPayout.id}</p>
              <p><strong>Vendor:</strong> {selectedPayout.vendorName}</p>
              <p><strong>Amount:</strong> ₹{selectedPayout.amount.toLocaleString()}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmMarkAsPaid}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayoutsManagement;
