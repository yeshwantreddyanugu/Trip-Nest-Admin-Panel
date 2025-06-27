import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Car, 
  Calendar, 
  DollarSign, 
  FileText, 
  Bell, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Users, label: 'User Management', href: '/users' },
    { icon: Building, label: 'Properties', href: '/properties' },
    { icon: Car, label: 'Vehicle Partners', href: '/vehicles' },
    { icon: Calendar, label: 'Bookings', href: '/bookings' },
    { icon: DollarSign, label: 'Commission & Earnings', href: '/commission' },
    { icon: FileText, label: 'CMS Management', href: '/cms' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: BarChart3, label: 'Reports & Analytics', href: '/reports' },
    { icon: Settings, label: 'Settings & Roles', href: '/settings' }
  ];

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col min-h-screen",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="text-xl font-bold text-gray-900">TravelAdmin</h2>
            <p className="text-sm text-gray-500">Control Panel</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <item.icon size={20} />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
