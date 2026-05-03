'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface Props {
  originCoords: [number, number]; // [lng, lat]
  destCoords: [number, number];
  originName: string;
  destName: string;
}

export function RouteMap({ originCoords, destCoords, originName, destName }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const loadLeaflet = async () => {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const L = (await import('leaflet')).default;
      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      const start: [number, number] = [originCoords[1], originCoords[0]];
      const end: [number, number] = [destCoords[1], destCoords[0]];

      const startMarker = L.marker(start).addTo(map).bindPopup(originName);
      const endMarker = L.marker(end).addTo(map).bindPopup(destName);

      // Create a "ghost route" (dashed line)
      const polyline = L.polyline([start, end], {
        color: '#f97316', // accent color
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10',
        lineJoin: 'round'
      }).addTo(map);

      // Fit bounds to show both points
      const bounds = L.latLngBounds([start, end]);
      map.fitBounds(bounds, { padding: [40, 40] });

      mapInstanceRef.current = map;
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [originCoords, destCoords, originName, destName]);

  return (
    <Card className="overflow-hidden border-border/50 bg-muted/30">
      <div ref={mapRef} className="w-full h-48 grayscale-[0.5] hover:grayscale-0 transition-all duration-700" />
      <div className="p-2 text-[10px] text-center text-muted-foreground uppercase tracking-widest bg-background/50">
        Estimated Route Preview
      </div>
    </Card>
  );
}
