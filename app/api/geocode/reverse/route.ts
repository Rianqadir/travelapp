import { NextRequest, NextResponse } from 'next/server';

const ORS_KEY = process.env.OPENROUTESERVICE_API_KEY!;

// GET /api/geocode/reverse?lat=24.86&lng=67.01
export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat');
  const lng = req.nextUrl.searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  try {
    const url = `https://api.openrouteservice.org/geocode/reverse?api_key=${ORS_KEY}&point.lon=${lng}&point.lat=${lat}&size=1&boundary.country=PK`;
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: 'Reverse geocode failed' }, { status: 502 });
    }
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) {
      return NextResponse.json({ error: 'No results' }, { status: 404 });
    }

    return NextResponse.json({
      label: feature.properties.label,
      name: feature.properties.name,
      region: feature.properties.region,
      coordinates: feature.geometry.coordinates as [number, number],
    });
  } catch {
    return NextResponse.json({ error: 'Reverse geocode error' }, { status: 500 });
  }
}
