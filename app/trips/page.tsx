'use client';

import { AppLayout } from '@/components/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { Trash2, MapPin, Calendar, Fuel, Clock } from 'lucide-react';

export default function TripsPage() {
  const { trips, cars, deleteTrip, isLoading } = useApp();

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
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          Trip <span className="gradient-primary bg-clip-text text-transparent">History</span>
        </h1>

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
            {trips.map(trip => {
              const car = cars.find(c => c.id === trip.car_id);
              const date = new Date(trip.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
              });

              return (
                <Card key={trip.id} className="p-4 md:p-6 gradient-card hover:shadow-lg hover:shadow-accent/30 transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                        {trip.origin} → {trip.destination}
                      </h3>
                      <p className="text-sm text-muted-foreground">{car?.name ?? 'Unknown Car'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-secondary rounded-lg"><MapPin className="w-4 h-4" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground">Distance</p>
                        <p className="font-semibold">{trip.distance_km.toFixed(1)} km</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-secondary rounded-lg"><Calendar className="w-4 h-4" /></div>
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
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
