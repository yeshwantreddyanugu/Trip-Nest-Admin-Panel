import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, Clock, TrendingUp, Calendar } from 'lucide-react';

// ✅ Backend base URL
const base_url = 'https://your-ngrok-url.ngrok-free.app/api'; // Replace this with your real endpoint

interface EarningsData {
  totalPlatformEarnings: number;
  totalPayoutsDone: number;
  pendingPayouts: number;
  growth: number;
  propertyRevenue: number;
  vehicleRevenue: number;
  otherRevenue: number;
}

const EarningsOverview = () => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'thisWeek' | 'thisMonth' | 'custom'>('thisMonth');
  const [earningsData, setEarningsData] = useState<EarningsData>({
    totalPlatformEarnings: 0,
    totalPayoutsDone: 0,
    pendingPayouts: 0,
    growth: 0,
    propertyRevenue: 0,
    vehicleRevenue: 0,
    otherRevenue: 0
  });

  const timeFilters = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // ✅ Fetch earnings data based on selected time filter
  const loadEarnings = async () => {
    console.log(`[INFO] Fetching earnings for: ${timeFilter}`);
    try {
      const response = await axios.get(`${base_url}/earnings-overview?range=${timeFilter}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      console.log('[SUCCESS] Earnings data loaded:', response.data);
      setEarningsData(response.data);
    } catch (error) {
      console.error('[ERROR] Failed to load earnings data:', error);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, [timeFilter]);

  return (
    <div className="space-y-6">
      {/* Time Filter */}
      <div className="flex items-center gap-4">
        <Calendar className="text-gray-500" size={20} />
        <span className="text-sm font-medium text-gray-700">Time Period:</span>
        <div className="flex gap-2">
          {timeFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={timeFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFilter(filter.value as typeof timeFilter)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{earningsData.totalPlatformEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{earningsData.growth}%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts Done</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{earningsData.totalPayoutsDone.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Paid to vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{earningsData.pendingPayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(earningsData.totalPlatformEarnings - earningsData.totalPayoutsDone).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Platform net earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">₹{earningsData.propertyRevenue.toLocaleString()}</div>
              <p className="text-sm text-gray-600">Property Commissions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₹{earningsData.vehicleRevenue.toLocaleString()}</div>
              <p className="text-sm text-gray-600">Vehicle Commissions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">₹{earningsData.otherRevenue.toLocaleString()}</div>
              <p className="text-sm text-gray-600">Other Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsOverview;
