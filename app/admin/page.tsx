'use client';

import { AppLayout } from '@/components/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/context';
import { useState, useEffect } from 'react';
import { AlertCircle, ShieldCheck, Users, MapPin, Fuel } from 'lucide-react';

const FUEL_LABELS: Record<string, string> = {
  petrol: 'Petrol — Euro5 Premier',
  diesel: 'Diesel — Euro5 Hi-Cetane',
  high_octane: 'Hi Octane — Euro5 Octane+',
};

interface Stats { total_users: number; total_trips: number; total_distance_km: number }

export default function AdminPage() {
  const { dbUser, fuelPrices, updateFuelPrice } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  // Initialise local price state from context
  useEffect(() => {
    const map: Record<string, string> = {};
    fuelPrices.forEach(p => { map[p.fuel_type] = String(p.price_per_liter); });
    setPrices(map);
  }, [fuelPrices]);

  // Fetch platform stats
  useEffect(() => {
    if (dbUser?.role === 'admin') {
      fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(console.error);
    }
  }, [dbUser]);

  if (!dbUser) {
    return (
      <AppLayout>
        <div className="p-6 md:p-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (dbUser.role !== 'admin') {
    return (
      <AppLayout>
        <div className="p-6 md:p-8">
          <Card className="p-6 gradient-card border-destructive/30">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-destructive/90">Access Denied. Only administrators can access this page.</p>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const fp of fuelPrices) {
        const newVal = parseFloat(prices[fp.fuel_type] ?? '0');
        if (newVal > 0 && newVal !== fp.price_per_liter) {
          await updateFuelPrice(fp.fuel_type, newVal);
        }
      }
      setEditMode(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-8 h-8 text-accent" />
          <h1 className="text-4xl font-bold text-foreground">
            Admin <span className="gradient-primary bg-clip-text text-transparent">Panel</span>
          </h1>
        </div>

        {/* Fuel Prices */}
        <Card className="p-6 gradient-card glow-accent mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Manage Fuel Prices <span className="text-accent">(₨/Liter)</span></h2>
            <Button
              onClick={() => editMode ? setEditMode(false) : setEditMode(true)}
              className={editMode ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'btn-gradient'}
            >
              {editMode ? 'Cancel' : 'Edit Prices'}
            </Button>
          </div>

          <div className="space-y-4">
            {fuelPrices.map(fp => (
              <div
                key={fp.fuel_type}
                className="p-4 bg-gradient-to-r from-primary/20 to-accent/10 rounded-lg border border-primary/30 hover:border-accent/50 transition-all flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{FUEL_LABELS[fp.fuel_type] ?? fp.fuel_type}</p>
                  {editMode ? (
                    <Input
                      type="number"
                      value={prices[fp.fuel_type] ?? ''}
                      onChange={e => setPrices(prev => ({ ...prev, [fp.fuel_type]: e.target.value }))}
                      min="0"
                      step="0.01"
                      className="w-36"
                    />
                  ) : (
                    <p className="text-2xl font-bold bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">
                      ₨ {fp.price_per_liter.toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  <p>Last Updated</p>
                  <p>{new Date(fp.updated_at).toLocaleDateString()}</p>
                  <p>{new Date(fp.updated_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>

          {editMode && (
            <Button onClick={handleSave} className="w-full mt-6 btn-gradient" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Prices'}
            </Button>
          )}
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 gradient-card glow-accent">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-accent" />
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <p className="text-3xl font-bold">{stats?.total_users ?? '—'}</p>
          </Card>
          <Card className="p-6 gradient-card glow-accent">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-accent" />
              <p className="text-sm text-muted-foreground">Total Trips</p>
            </div>
            <p className="text-3xl font-bold">{stats?.total_trips ?? '—'}</p>
          </Card>
          <Card className="p-6 gradient-card glow-accent">
            <div className="flex items-center gap-3 mb-2">
              <Fuel className="w-5 h-5 text-accent" />
              <p className="text-sm text-muted-foreground">Total Distance</p>
            </div>
            <p className="text-3xl font-bold">{stats ? `${stats.total_distance_km.toFixed(0)} km` : '—'}</p>
          </Card>
        </div>

        {/* Admin info */}
        <Card className="p-6 gradient-card mt-6">
          <h3 className="text-lg font-bold mb-4">Admin <span className="text-accent">Account</span></h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-semibold">{dbUser.email}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="font-semibold capitalize text-accent">{dbUser.role}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">User ID</span><span className="font-semibold text-sm">#{dbUser.id}</span></div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
