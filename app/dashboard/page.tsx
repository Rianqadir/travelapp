'use client';

import { AppLayout } from '@/components/app-layout';
import { Card } from '@/components/ui/card';
import { useApp } from '@/lib/context';
import { Fuel, Gauge, MapPin, TrendingUp, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { cars, trips, fuelPrices, isLoading } = useApp();

  const totalTrips = trips.length;
  const totalDistance = trips.reduce((sum, t) => sum + t.distance_km, 0);
  const totalFuelCost = trips.reduce((sum, t) => sum + t.fuel_cost_pkr, 0);

  const stats = [
    { label: 'Total Trips', value: isLoading ? '—' : totalTrips, icon: MapPin, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Total Distance', value: isLoading ? '—' : `${totalDistance.toFixed(0)} km`, icon: TrendingUp, color: 'bg-green-500/10 text-green-600' },
    { label: 'Total Fuel Cost', value: isLoading ? '—' : `₨ ${totalFuelCost.toFixed(0)}`, icon: Fuel, color: 'bg-amber-500/10 text-amber-600' },
    { label: 'Cars', value: isLoading ? '—' : cars.length, icon: Gauge, color: 'bg-purple-500/10 text-purple-600' },
  ];

  const fuelLabel: Record<string, string> = {
    petrol: 'Petrol — Euro5 Premier',
    diesel: 'Diesel — Euro5 Hi-Cetane',
    high_octane: 'Hi Octane — Euro5 Octane+',
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8">
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          Dashboard<span className="text-accent">.</span>
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 gradient-card glow-accent">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Fuel Prices */}
        <Card className="p-6 gradient-card mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">
                Current Fuel Prices <span className="text-accent">(₨/Liter)</span>
              </h2>
            </div>
          </div>
          {fuelPrices.length === 0 ? (
            <p className="text-muted-foreground">Loading prices...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fuelPrices.map(price => (
                <div
                  key={price.fuel_type}
                  className="p-4 bg-gradient-to-br from-primary/20 to-accent/10 rounded-lg border border-primary/30 hover:border-accent/50 transition-all"
                >
                  <p className="text-sm text-muted-foreground mb-2 font-semibold tracking-wide">
                    {fuelLabel[price.fuel_type] ?? price.fuel_type}
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">
                    ₨ {price.price_per_liter.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Updated {new Date(price.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Trips */}
        {trips.length > 0 && (
          <Card className="p-6 gradient-card">
            <h2 className="text-xl font-bold mb-6">Recent Trips<span className="text-accent">.</span></h2>
            <div className="space-y-3">
              {trips.slice(0, 5).map(trip => {
                const car = cars.find(c => c.id === trip.car_id);
                return (
                  <div key={trip.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{trip.origin} → {trip.destination}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <span>{car?.name ?? 'Unknown Car'}</span>
                        <span>·</span>
                        <Clock className="w-3 h-3" />
                        <span>{Math.round(trip.travel_time_minutes)} min</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{trip.distance_km.toFixed(1)} km</p>
                      <p className="text-sm text-accent font-semibold">₨ {trip.fuel_cost_pkr.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

