import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileText, Calendar } from 'lucide-react';

// ✅ Replace with your actual backend URL
const base_url = 'https://hbr.lytortech.com/api';

const EarningsReports = () => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'daily', label: 'Daily Report' },
    { value: 'weekly', label: 'Weekly Report' },
    { value: 'monthly', label: 'Monthly Report' },
    { value: 'custom', label: 'Custom Date Range' }
  ];

  // ✅ Generate and download report
  const handleGenerateReport = async (format: 'pdf' | 'csv') => {
    setIsGenerating(true);
    try {
      console.log(`[INFO] Generating ${format.toUpperCase()} report for: ${reportType}`);

      const response = await axios.post(
        `${base_url}/generate-report`,
        {
          type: reportType,
          format: format,
          ...(reportType === 'custom' && { startDate, endDate })
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          responseType: 'blob'
        }
      );

      const fileName = `Earnings_Report_${reportType}_${new Date().toISOString()}.${format}`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`[SUCCESS] ${format.toUpperCase()} Report Downloaded`);
    } catch (error) {
      console.error('[ERROR] Failed to generate report:', error);
    }
    setIsGenerating(false);
  };

  const quickReports = [
    {
      title: "Today's Earnings",
      description: 'Platform earnings for today',
      amount: '₹8,500',
      trend: '+12%'
    },
    {
      title: "This Week's Earnings",
      description: 'Platform earnings for this week',
      amount: '₹45,200',
      trend: '+8%'
    },
    {
      title: "This Month's Earnings",
      description: 'Platform earnings for this month',
      amount: '₹1,25,000',
      trend: '+15%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickReports.map((report, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{report.title}</p>
                  <p className="text-2xl font-bold mt-1">{report.amount}</p>
                  <p className="text-xs text-green-600 mt-1">{report.trend} from last period</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Earnings Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-3">
            <Label>Report Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {reportTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={reportType === type.value ? 'default' : 'outline'}
                  onClick={() => setReportType(type.value as any)}
                  className="justify-start"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {reportType === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Export Buttons */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <div className="flex gap-4">
              <Button
                onClick={() => handleGenerateReport('pdf')}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenerateReport('csv')}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                {isGenerating ? 'Generating...' : 'Download CSV'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Monthly Earnings Report - November 2024', date: '2024-12-01', size: '2.3 MB', format: 'PDF' },
              { name: 'Weekly Earnings Report - Week 48', date: '2024-11-30', size: '1.8 MB', format: 'CSV' },
              { name: 'Monthly Earnings Report - October 2024', date: '2024-11-01', size: '2.1 MB', format: 'PDF' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-gray-600">{report.date} • {report.size} • {report.format}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download size={16} />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsReports;
