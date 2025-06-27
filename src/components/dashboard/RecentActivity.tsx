import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Car, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  type: string;
  description: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'HOTEL_BOOKING':
        return Building;
      case 'VEHICLE_BOOKING':
        return Car;
      default:
        return Building;
    }
  };

  const getActivityColor = (type: string, status: string) => {
    if (status === 'CONFIRMED') {
      return 'text-green-600 bg-green-100';
    } else if (status === 'PENDING') {
      return 'text-amber-600 bg-amber-100';
    }
    return 'text-blue-600 bg-blue-100';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock size={20} />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 7).map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const color = getActivityColor(activity.type, activity.status);
            
            return (
              <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={cn("p-2 rounded-full", color)}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.customerName}</span> {activity.description.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(activity.timestamp)} • ${activity.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all activity →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;