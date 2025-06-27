import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative';
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  changeType,
  color
}) => {
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          <div className={cn("p-3 rounded-full", color)}>
            <Icon className="text-white" size={24} />
          </div>
        </div>
        
        {change && changeType && (
          <div className="mt-4 flex items-center">
            <span className={cn(
              "text-sm font-medium",
              changeType === 'positive' ? "text-green-600" : "text-red-600"
            )}>
              {change}
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last month</span>
          </div>
        )}
      </CardContent>
      
      {/* Decorative gradient */}
      <div className={cn("absolute bottom-0 left-0 right-0 h-1", color)} />
    </Card>
  );
};

export default MetricCard;