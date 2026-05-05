'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { Trash2, MapPin, Calendar, Fuel, Clock, List, LayoutGrid } from 'lucide-react';

export default function TripsPage() {
  const { trips, cars, deleteTrip, isLoading } = useApp();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  const handleDeleteTrip = async (id: number) => {
    if (confirm('Delete this trip?')) {
      await deleteTrip(id);
    }
  };

  const totalCost = trips.reduce((s, t) => s + t.fuel_cost_pkr, 0);
  const totalDistance = trips.reduce((s, t) => s + t.distance_km, 0);

  return (
    <AppLayout>
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-4xl font-bold text-foreground">
            Trip <span className="text-accent">History</span>
          </h1>

          <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-lg shadow-sm w-max">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
            >
              <List className="w-4 h-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'cards' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              Cards
            </button>
          </div>
        </div>

        {trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 gradient-card glow-accent">
              <p className="text-sm text-muted-foreground mb-2">Total Trips</p>
              <p className="text-3xl font-bold">{trips.length}</p>
            </Card>
            <Card className="p-6 gradient-card glow-accent">
              <p className="text-sm text-muted-foreground mb-2">Total Distance</p>
              <p className="text-3xl font-bold">{totalDistance.toFixed(0)} km</p>
            </Card>
            <Card className="p-6 gradient-card glow-accent">
              <p className="text-sm text-muted-foreground mb-2">Total Cost</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">
                ₨ {totalCost.toFixed(0)}
              </p>
            </Card>
          </div>
        )}

        {isLoading ? (
          <p className="text-muted-foreground">Loading trips...</p>
        ) : trips.length === 0 ? (
          <Card className="p-12 text-center gradient-card glow-accent">
            <p className="text-muted-foreground text-lg">No trips recorded yet. Start by calculating a trip!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {viewMode === 'cards' ? (
              trips.map(trip => {
                const car = cars.find(c => c.id === trip.car_id);
                const date = new Date(trip.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                });

                return (
                  <Card key={trip.id} className="p-4 md:p-6 bg-card border border-border hover:shadow-md transition-shadow">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                          {trip.origin} → {trip.destination}
                        </h3>
                        <p className="text-sm text-muted-foreground">{car?.name ?? 'Unknown Car'}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-secondary rounded-lg"><MapPin className="w-4 h-4 text-muted-foreground" /></div>
                        <div>
                          <p className="text-xs text-muted-foreground">Distance</p>
                          <p className="font-semibold">{trip.distance_km.toFixed(1)} km</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-secondary rounded-lg"><Calendar className="w-4 h-4 text-muted-foreground" /></div>
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="font-semibold">{date}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Fuel Cost</p>
                          <p className="font-bold text-accent text-lg">₨ {trip.fuel_cost_pkr.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{trip.distance_km.toFixed(1)} km · {Math.round(trip.travel_time_minutes)} min</p>
                        </div>
                        <Button
                          onClick={() => handleDeleteTrip(trip.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="overflow-x-auto border border-border rounded-lg bg-card shadow-sm">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-secondary/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Route</th>
                      <th className="px-4 py-3 font-medium">Car</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium text-right">Distance</th>
                      <th className="px-4 py-3 font-medium text-right">Time</th>
                      <th className="px-4 py-3 font-medium text-right">Cost</th>
                      <th className="px-4 py-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {trips.map(trip => {
                      const car = cars.find(c => c.id === trip.car_id);
                      const date = new Date(trip.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      });
                      
                      return (
                        <tr key={trip.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate" title={`${trip.origin} → ${trip.destination}`}>
                            {trip.origin} → {trip.destination}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{car?.name ?? 'Unknown'}</td>
                          <td className="px-4 py-3 text-muted-foreground">{date}</td>
                          <td className="px-4 py-3 text-right font-medium">{trip.distance_km.toFixed(1)} km</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{Math.round(trip.travel_time_minutes)} min</td>
                          <td className="px-4 py-3 text-right font-bold text-accent">₨ {trip.fuel_cost_pkr.toFixed(0)}</td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              onClick={() => handleDeleteTrip(trip.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
