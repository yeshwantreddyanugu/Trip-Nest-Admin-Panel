
import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users, properties, bookings..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile */}
          <button className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="text-white" size={16} />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900">John Admin</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
