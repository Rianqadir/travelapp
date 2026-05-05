'use client';

import { AppLayout } from '@/components/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { useState, useMemo } from 'react';
import { AlertCircle, MapPin, Clock, Fuel, Navigation, Gauge, Info, History } from 'lucide-react';
import { LocationInput } from '@/components/location-input';
import { RouteMap } from '@/components/route-map';
import type { CalcResult } from '@/lib/types';

export default function CalculatorPage() {
  const { cars, trips, saveTrip } = useApp();
  const [selectedCar, setSelectedCar] = useState<string>('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<[number, number] | undefined>();
  const [destCoords, setDestCoords] = useState<[number, number] | undefined>();
  const [mileagePref, setMileagePref] = useState<'city' | 'highway'>('city');
  const [result, setResult] = useState<CalcResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    trips.forEach(t => {
      if (t.origin) locs.add(t.origin);
      if (t.destination) locs.add(t.destination);
    });
    return Array.from(locs).slice(0, 8);
  }, [trips]);

  const fuelLabel: Record<string, string> = {
    petrol: 'Petrol — Euro5 Premier',
    diesel: 'Diesel — Euro5 Hi-Cetane',
    high_octane: 'Hi Octane — Euro5 Octane+',
  };

  // Get the selected car object for mileage display
  const selectedCarObj = useMemo(() => {
    if (!selectedCar) return null;
    return cars.find(c => c.id === parseInt(selectedCar)) ?? null;
  }, [selectedCar, cars]);

  const handleCalculate = async () => {
    if (!selectedCar || !origin.trim() || !destination.trim()) {
      setError('Please fill in all fields and select a car.');
      return;
    }
    setError('');
    setResult(null);
    setSaved(false);
    setIsCalculating(true);

    try {
      const body: any = {
        origin: origin.trim(),
        destination: destination.trim(),
        car_id: selectedCar,
        mileage_preference: mileagePref,
      };
      // Pass coordinates if picked from autocomplete or map
      if (originCoords) body.origin_coords = originCoords;
      if (destCoords) body.destination_coords = destCoords;

      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Calculation failed. Check your locations and try again.');
        return;
      }
      setResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await saveTrip({
        car_id: result.car_id,
        origin: result.origin,
        destination: result.destination,
        distance_km: result.distance_km,
        travel_time_minutes: result.travel_time_minutes,
        fuel_required_liters: result.fuel_required_liters,
        fuel_cost_pkr: result.fuel_cost_pkr,
        cost_per_km: result.cost_per_km,
      });
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8">
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          Trip <span className="gradient-primary bg-clip-text text-transparent">Calculator</span>
        </h1>

        {cars.length === 0 && (
          <Card className="p-6 mb-6 gradient-card border border-primary/30 glow-accent">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-primary" />
              <p className="text-muted-foreground">You don&apos;t have any cars yet. Please add a car first.</p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <Card className="p-6 lg:col-span-1 gradient-card">
            <h2 className="text-xl font-bold mb-6">Trip <span className="text-accent">Details</span></h2>
            <div className="space-y-4">

              {/* Car Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Car *</label>
                <select
                  value={selectedCar}
                  onChange={e => setSelectedCar(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  disabled={cars.length === 0}
                >
                  <option value="">Choose a car...</option>
                  {cars.map(car => (
                    <option key={car.id} value={car.id}>
                      {car.name} ({car.custom_mileage ?? car.claimed_mileage} km/L)
                    </option>
                  ))}
                </select>
              </div>

              {/* Mileage Preference (Trip Type) */}
              {selectedCarObj && (
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <label className="block text-sm font-medium mb-3 flex items-center gap-1">
                    <Gauge className="w-4 h-4 text-accent" />
                    Trip Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMileagePref('city')}
                      className={`py-2.5 px-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                        mileagePref === 'city'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                          : 'bg-background border-border hover:border-blue-400'
                      }`}
                    >
                      <span className="text-sm font-bold">🏙️ City</span>
                      <span className="text-[10px] opacity-80">{selectedCarObj.city_mileage ?? (selectedCarObj.claimed_mileage * 0.8).toFixed(1)} km/L</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMileagePref('highway')}
                      className={`py-2.5 px-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                        mileagePref === 'highway'
                          ? 'bg-green-600 text-white border-green-600 shadow-lg'
                          : 'bg-background border-border hover:border-green-400'
                      }`}
                    >
                      <span className="text-sm font-bold">🛣️ Highway</span>
                      <span className="text-[10px] opacity-80">{selectedCarObj.highway_mileage ?? selectedCarObj.claimed_mileage} km/L</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Select based on your destination and traffic conditions
                  </p>
                </div>
              )}

              {/* Recent / Saved Locations */}
              {uniqueLocations.length > 0 && (
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <History className="w-3 h-3" /> Recent Locations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueLocations.map(loc => (
                      <div key={loc} className="flex border border-border rounded-md overflow-hidden text-xs bg-background shadow-sm">
                        <span className="px-2 py-1.5 text-foreground truncate max-w-[120px]" title={loc}>{loc}</span>
                        <button 
                          onClick={() => { setOrigin(loc); setOriginCoords(undefined); }} 
                          className="px-2 py-1.5 bg-secondary hover:bg-accent hover:text-white transition-colors border-l border-border font-medium" 
                          title="Set as Origin"
                        >
                          Orig
                        </button>
                        <button 
                          onClick={() => { setDestination(loc); setDestCoords(undefined); }} 
                          className="px-2 py-1.5 bg-secondary hover:bg-accent hover:text-white transition-colors border-l border-border font-medium" 
                          title="Set as Destination"
                        >
                          Dest
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Origin */}
              <LocationInput
                label="Origin *"
                icon={<MapPin className="inline w-4 h-4 mr-1" />}
                placeholder="e.g., Karachi"
                value={origin}
                onChange={(val, coords) => {
                  setOrigin(val);
                  setOriginCoords(coords);
                }}
              />

              {/* Destination */}
              <LocationInput
                label="Destination *"
                icon={<Navigation className="inline w-4 h-4 mr-1" />}
                placeholder="e.g., Lahore"
                value={destination}
                onChange={(val, coords) => {
                  setDestination(val);
                  setDestCoords(coords);
                }}
              />

              {error && (
                <p className="text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </p>
              )}

              <Button
                onClick={handleCalculate}
                className="w-full btn-gradient"
                disabled={cars.length === 0 || isCalculating}
              >
                {isCalculating ? 'Calculating via ORS...' : 'Calculate Cost'}
              </Button>
            </div>
          </Card>

          {/* Result */}
          {result ? (
            <Card className="p-6 lg:col-span-2 gradient-card glow-accent">
              <h2 className="text-xl font-bold mb-6">Cost <span className="text-accent">Breakdown</span></h2>
              <div className="space-y-5">

                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Trip</p>
                  <p className="text-lg font-semibold">{result.origin} → {result.destination}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.car_name} · {fuelLabel[result.fuel_type] ?? result.fuel_type}
                  </p>
                </div>

                <RouteMap 
                  originCoords={result.origin_coords}
                  destCoords={result.destination_coords}
                  originName={result.origin}
                  destName={result.destination}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <MapPin className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Distance</p>
                      <p className="font-semibold">{result.distance_km} km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Clock className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Travel Time</p>
                      <p className="font-semibold">{Math.round(result.travel_time_minutes)} min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Fuel className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fuel Needed</p>
                      <p className="font-semibold">{result.fuel_required_liters} L</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Fuel className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fuel Price</p>
                      <p className="font-semibold">₨ {result.price_per_liter}/L</p>
                    </div>
                  </div>
                </div>

                {/* Mileage Info */}
                <div className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Mileage Used for Calculation</p>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-accent" />
                    {result.effective_mileage} km/L
                    <span className="text-xs text-muted-foreground font-normal">({result.mileage_source})</span>
                  </p>
                  {result.has_custom_mileage && result.mileage_source === 'Company Claimed' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Tip: Switch to &ldquo;Your Average&rdquo; for a more realistic estimate
                    </p>
                  )}
                </div>

                <div className="p-4 bg-gradient-to-br from-accent/30 to-orange-500/20 border border-accent/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Total Fuel Cost</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">
                    ₨ {result.fuel_cost_pkr.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 font-semibold">
                    ₨ {result.cost_per_km} per km
                  </p>
                </div>

                {saved ? (
                  <p className="text-center text-green-500 font-semibold py-2">✓ Trip saved to history!</p>
                ) : (
                  <Button onClick={handleSaveTrip} className="w-full btn-gradient-secondary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Trip to History'}
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-6 lg:col-span-2 flex items-center justify-center min-h-96 gradient-card">
              <div className="text-center">
                <Navigation className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  Enter origin &amp; destination to calculate trip cost
                </p>
                <p className="text-muted-foreground text-sm">
                  💡 Type to search locations or click the map icon to pick from the map
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* How It Works Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-xl font-bold flex items-center gap-2 px-4">
              <Info className="w-5 h-5 text-accent" />
              How This Calculator Works
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 gradient-card border-border/40">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Navigation className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Route Intelligence</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use OpenRouteService to analyze your exact path. Our system detects segments on Motorways vs. Residential roads to estimate your driving environment.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 gradient-card border-border/40">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Gauge className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Dual Mileage Profiles</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Cars consume differently in traffic vs. open roads. We use a weighted average of your City and Highway figures based on the detected route composition.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 gradient-card border-border/40">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <Fuel className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Manual Fuel Pricing</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Unlike unreliable scrapers, our fuel prices are manually managed by administrators to ensure they match the exact rates currently at Pakistani fuel stations.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 gradient-card border-border/40">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Precise Geolocation</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Using GPS and Interactive Maps, we calculate the exact &ldquo;Gate-to-Gate&rdquo; distance rather than just city-center to city-center, ensuring maximum accuracy.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
