
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingApproval {
  type: string;
  count: number;
  color: string;
}

interface PendingApprovalsProps {
  approvals: PendingApproval[];
}

const PendingApprovals: React.FC<PendingApprovalsProps> = ({ approvals }) => {
  const totalPending = approvals.reduce((sum, approval) => sum + approval.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle size={20} />
          Pending Approvals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Pending */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Total Pending</p>
                <p className="text-2xl font-bold text-orange-900">{totalPending}</p>
              </div>
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>

          {/* Individual Categories */}
          <div className="space-y-3">
            {approvals.map((approval, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("px-2 py-1 rounded-full text-xs font-medium", approval.color)}>
                    {approval.type}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{approval.count}</span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <CheckCircle size={16} />
                Review All Pending
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Set Auto-Approval Rules
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingApprovals;
