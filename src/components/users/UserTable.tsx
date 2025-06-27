
import React from 'react';
import { Eye, Edit, Key, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const UserTable = ({ users, onViewUser, onToggleStatus, onResetPassword }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{user.avatar}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">ID: {user.id}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-gray-900">{user.email}</div>
              </TableCell>
              <TableCell>
                <div className="text-gray-900">{user.phone}</div>
              </TableCell>
              <TableCell>
                <div className="text-gray-900">{formatDate(user.registeredDate)}</div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={user.status === 'Active' ? 'default' : 'destructive'}
                  className={user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewUser(user)}
                    className="flex items-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Edit size={14} />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResetPassword(user)}
                    className="flex items-center gap-1"
                  >
                    <Key size={14} />
                    Reset
                  </Button>
                  
                  <Button
                    variant={user.status === 'Active' ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => onToggleStatus(user)}
                    className="flex items-center gap-1"
                  >
                    {user.status === 'Active' ? (
                      <>
                        <UserX size={14} />
                        Block
                      </>
                    ) : (
                      <>
                        <UserCheck size={14} />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
