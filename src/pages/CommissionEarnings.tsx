
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, DollarSign, Users, Clock, TrendingUp } from 'lucide-react';
import Sidebar from '@/components/ui/AppSidebar';
import Navbar from '@/components/ui/Navbar';
import EarningsOverview from '@/components/commission/EarningsOverview';
import CommissionSettings from '@/components/commission/CommissionSettings';
import EarningsReports from '@/components/commission/EarningsReports';
import PayoutsManagement from '@/components/commission/PayoutsManagement';

const CommissionEarnings = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Commission & Earnings</h1>
              <p className="text-gray-600 mt-2">Manage platform revenue, commissions, and vendor payouts</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Earnings Overview</TabsTrigger>
                <TabsTrigger value="commission">Commission Settings</TabsTrigger>
                <TabsTrigger value="reports">Earnings Reports</TabsTrigger>
                <TabsTrigger value="payouts">Payouts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <EarningsOverview />
              </TabsContent>

              <TabsContent value="commission">
                <CommissionSettings />
              </TabsContent>

              <TabsContent value="reports">
                <EarningsReports />
              </TabsContent>

              <TabsContent value="payouts">
                <PayoutsManagement />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommissionEarnings;
