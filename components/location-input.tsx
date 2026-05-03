'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Map, X, Loader2, Navigation2 } from 'lucide-react';
import type { GeocodeSuggestion } from '@/lib/types';

interface Props {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string, coords?: [number, number]) => void;
}

// Pakistan Boundaries
const PK_BOUNDS: [[number, number], [number, number]] = [
  [23.6345, 60.8728], // South-West
  [37.0841, 77.8403]  // North-East
];

export function LocationInput({ label, icon, placeholder, value, onChange }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | undefined>();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Sync query with external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/geocode/autocomplete?q=${encodeURIComponent(q)}`);
      const data: GeocodeSuggestion[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    onChange(val, undefined);
    setSelectedCoords(undefined);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (suggestion: GeocodeSuggestion) => {
    const displayName = suggestion.name || suggestion.label;
    setQuery(displayName);
    setSelectedCoords(suggestion.coordinates);
    onChange(displayName, suggestion.coordinates);
    setShowSuggestions(false);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const displayName = data.name || data.label;
            setQuery(displayName);
            setSelectedCoords([longitude, latitude]);
            onChange(displayName, [longitude, latitude]);
          }
        } catch (e) {
          console.error("Reverse geocoding failed", e);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        alert("Unable to get your location. Please check your browser permissions.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMapSelect = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        const displayName = data.name || data.label;
        setQuery(displayName);
        setSelectedCoords([lng, lat]);
        onChange(displayName, [lng, lat]);
      }
    } catch {
      // Keep map open
    }
    setShowMap(false);
  };

  return (
    <div ref={inputRef} className="relative">
      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={e => handleInputChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            className={selectedCoords ? 'border-accent/50 pr-8' : ''}
          />
          {(isLoading || isLocating) && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {selectedCoords && !isLoading && !isLocating && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <MapPin className="w-4 h-4 text-accent" />
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCurrentLocation}
          disabled={isLocating}
          title="Use my current location"
          className="shrink-0 hover:border-accent hover:text-accent transition-colors"
        >
          <Navigation2 className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowMap(!showMap)}
          title="Pick from map"
          className="shrink-0 hover:border-accent hover:text-accent transition-colors"
        >
          <Map className="w-4 h-4" />
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors flex items-start gap-2 border-b border-border/50 last:border-0"
            >
              <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Map Picker */}
      {showMap && (
        <MapPicker
          onSelect={handleMapSelect}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}

// Map picker component using Leaflet
function MapPicker({ onSelect, onClose }: { onSelect: (lat: number, lng: number) => void; onClose: () => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically load Leaflet
    const loadLeaflet = async () => {
      // Add Leaflet CSS if not already present
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const L = (await import('leaflet')).default;

      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Center on Pakistan and apply bounds
      const map = L.map(mapRef.current, {
        maxBounds: PK_BOUNDS,
        maxBoundsViscosity: 1.0,
        minZoom: 5
      }).setView([30.3753, 69.3451], 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        // Check if point is inside Pakistan bounds
        const bounds = L.latLngBounds(PK_BOUNDS);
        if (!bounds.contains(e.latlng)) return;

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
        onSelect(lat, lng);
      });

      mapInstanceRef.current = map;

      // Force resize after modal opens
      setTimeout(() => map.invalidateSize(), 200);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onSelect]);

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Click on the map to select a location</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div ref={mapRef} className="w-full h-[400px]" />
      </div>
    </div>
  );
}
