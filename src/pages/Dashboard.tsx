import React, { useEffect, useState } from 'react';
import { Users, Building, Car, DollarSign, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebar from '@/components/ui/AppSidebar';
import Navbar from '@/components/ui/Navbar';
import MetricCard from '@/components/dashboard/MetricCard';
import RecentActivity from '@/components/dashboard/RecentActivity';

interface DashboardStats {
  totalBookings: number;
  totalUsers: number;
  totalHotels: number;
  totalVehicles: number;
  totalHotelRevenue: number;
  totalVehicleRevenue: number;
  recentActivities: any[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('https://a0bd-2401-4900-1cb4-2028-78a2-eabb-c0cc-977d.ngrok-free.app/api/dashboard/stats', {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <p>Loading dashboard data...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <p className="text-red-500">Error: {error}</p>
          </main>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <p>No data available</p>
          </main>
        </div>
      </div>
    );
  }

  // Calculate total revenue
  const totalRevenue = stats.totalHotelRevenue + stats.totalVehicleRevenue;

  // Prepare metrics data
  const metrics = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      subtitle: "Rooms + Vehicles",
      icon: Calendar,
      color: "bg-blue-500"
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      subtitle: "Active customers",
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Properties",
      value: stats.totalHotels,
      subtitle: "Hotels registered",
      icon: Building,
      color: "bg-purple-500"
    },
    {
      title: "Vehicles",
      value: stats.totalVehicles,
      subtitle: "Available vehicles",
      icon: Car,
      color: "bg-amber-500"
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      subtitle: "From all bookings",
      icon: DollarSign,
      color: "bg-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <AppSidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your travel booking platform.</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity - Takes 2 columns */}
            <div className="lg:col-span-2">
              <RecentActivity activities={stats.recentActivities} />
            </div>

            {/* Additional cards can be added here */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign size={20} />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <p className="text-sm font-medium text-gray-900">Hotel Revenue</p>
                      <p className="text-2xl font-bold">${stats.totalHotelRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50">
                      <p className="text-sm font-medium text-gray-900">Vehicle Revenue</p>
                      <p className="text-2xl font-bold">${stats.totalVehicleRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;