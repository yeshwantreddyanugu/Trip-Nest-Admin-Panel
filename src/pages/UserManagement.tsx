
import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppSidebar from '@/components/ui/AppSidebar';
import Navbar from '@/components/ui/Navbar';
import UserTable from '@/components/users/UserTable';
import UserProfileModal from '@/components/users/UserProfileModal';
import ConfirmationDialog from '@/components/users/ConfirmationDialog';

// Mock data for users
const mockUsers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    registeredDate: '2024-01-15',
    status: 'Active',
    avatar: 'JS',
    totalBookings: 12,
    totalSpent: 2400
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1-555-0124',
    registeredDate: '2024-02-10',
    status: 'Active',
    avatar: 'SJ',
    totalBookings: 8,
    totalSpent: 1800
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike.wilson@email.com',
    phone: '+1-555-0125',
    registeredDate: '2024-01-22',
    status: 'Blocked',
    avatar: 'MW',
    totalBookings: 3,
    totalSpent: 450
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1-555-0126',
    registeredDate: '2024-03-05',
    status: 'Active',
    avatar: 'ED',
    totalBookings: 15,
    totalSpent: 3200
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@email.com',
    phone: '+1-555-0127',
    registeredDate: '2024-02-28',
    status: 'Active',
    avatar: 'DB',
    totalBookings: 6,
    totalSpent: 1100
  },
  {
    id: 6,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    phone: '+1-555-0128',
    registeredDate: '2024-01-08',
    status: 'Blocked',
    avatar: 'LA',
    totalBookings: 2,
    totalSpent: 300
  },
  {
    id: 7,
    name: 'Robert Taylor',
    email: 'robert.taylor@email.com',
    phone: '+1-555-0129',
    registeredDate: '2024-03-12',
    status: 'Active',
    avatar: 'RT',
    totalBookings: 9,
    totalSpent: 2100
  },
  {
    id: 8,
    name: 'Jessica Miller',
    email: 'jessica.miller@email.com',
    phone: '+1-555-0130',
    registeredDate: '2024-02-15',
    status: 'Active',
    avatar: 'JM',
    totalBookings: 11,
    totalSpent: 2800
  }
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const usersPerPage = 10;

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleToggleStatus = (user) => {
    setSelectedUser(user);
    setConfirmAction({
      type: 'toggle_status',
      title: `${user.status === 'Active' ? 'Block' : 'Activate'} User`,
      message: `Are you sure you want to ${user.status === 'Active' ? 'block' : 'activate'} ${user.name}?`,
      confirmText: user.status === 'Active' ? 'Block User' : 'Activate User'
    });
    setShowConfirmDialog(true);
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setConfirmAction({
      type: 'reset_password',
      title: 'Reset Password',
      message: `Are you sure you want to reset the password for ${user.name}? They will receive an email with a new temporary password.`,
      confirmText: 'Reset Password'
    });
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction?.type === 'toggle_status') {
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, status: user.status === 'Active' ? 'Blocked' : 'Active' }
          : user
      ));
    } else if (confirmAction?.type === 'reset_password') {
      // Simulate password reset API call
      console.log(`Password reset for user ${selectedUser.id}`);
    }
    
    setShowConfirmDialog(false);
    setSelectedUser(null);
    setConfirmAction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage and monitor all registered users on your platform.</p>
          </div>

          {/* Controls */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-4">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Users</option>
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                  </select>

                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    Add User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable
                users={currentUsers}
                onViewUser={handleViewUser}
                onToggleStatus={handleToggleStatus}
                onResetPassword={handleResetPassword}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Modals */}
      {showProfileModal && selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showConfirmDialog && confirmAction && selectedUser && (
        <ConfirmationDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          onConfirm={handleConfirmAction}
          onCancel={() => {
            setShowConfirmDialog(false);
            setSelectedUser(null);
            setConfirmAction(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
