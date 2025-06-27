import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Check, X, Search } from 'lucide-react';

// ✅ Backend base URL
const base_url = 'https://your-ngrok-url.ngrok-free.app/api'; // Replace this with your actual backend base URL

interface CommissionItem {
  id: string;
  name: string;
  type: 'property' | 'vehicle';
  commissionRate: number;
  totalRevenue: number;
  platformEarnings: number;
  payoutsDone: number;
  pendingPayout: number;
}

const CommissionSettings = () => {
  const [commissionData, setCommissionData] = useState<CommissionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'property' | 'vehicle'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<number>(0);

  // ✅ Fetch commission data from backend
  const loadCommissionData = async () => {
    console.log('[INFO] Fetching commission data...');
    try {
      const response = await axios.get(`${base_url}/commission-settings`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      console.log('[SUCCESS] Data received:', response.data);
      setCommissionData(response.data);
    } catch (error) {
      console.error('[ERROR] Failed to fetch commission data:', error);
    }
  };

  // ✅ Update commission rate to backend
  const saveCommissionRate = async (id: string, newRate: number) => {
    console.log(`[INFO] Saving commission rate for ID: ${id}, New Rate: ${newRate}`);
    try {
      await axios.post(`${base_url}/commission-settings/${id}/update`, {
        commissionRate: newRate
      }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      console.log('[SUCCESS] Commission rate updated.');
      await loadCommissionData();
    } catch (error) {
      console.error('[ERROR] Failed to update commission rate:', error);
    }
  };

  useEffect(() => {
    loadCommissionData();
  }, []);

  const handleEditStart = (id: string, currentRate: number) => {
    setEditingId(id);
    setEditingRate(currentRate);
  };

  const handleEditSave = async (id: string) => {
    await saveCommissionRate(id, editingRate);
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingRate(0);
  };

  const filteredData = commissionData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search vendors, properties, vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'property' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('property')}
              >
                Properties
              </Button>
              <Button
                variant={filterType === 'vehicle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('vehicle')}
              >
                Vehicles
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Settings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Commission %</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Platform Earnings</TableHead>
                  <TableHead>Payouts Done</TableHead>
                  <TableHead>Pending Payout</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant={item.type === 'property' ? 'default' : 'secondary'}>
                        {item.type === 'property' ? 'Property' : 'Vehicle'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editingRate}
                            onChange={(e) => setEditingRate(Number(e.target.value))}
                            className="w-20"
                            min="0"
                            max="100"
                          />
                          <span>%</span>
                        </div>
                      ) : (
                        `${item.commissionRate}%`
                      )}
                    </TableCell>
                    <TableCell>₹{item.totalRevenue.toLocaleString()}</TableCell>
                    <TableCell>₹{item.platformEarnings.toLocaleString()}</TableCell>
                    <TableCell>₹{item.payoutsDone.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="text-orange-600 font-medium">
                        ₹{item.pendingPayout.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEditSave(item.id)}>
                            <Check size={16} />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleEditCancel}>
                            <X size={16} />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStart(item.id, item.commissionRate)}
                        >
                          <Edit size={16} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionSettings;
