import { NextRequest, NextResponse } from 'next/server';

const ORS_KEY = process.env.OPENROUTESERVICE_API_KEY!;

// GET /api/geocode/autocomplete?q=Karach
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_KEY}&text=${encodeURIComponent(q)}&boundary.country=PK&size=5&layers=locality,borough,neighbourhood,county,region,address`;
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json([]);
    }
    const data = await res.json();

    const suggestions = (data.features ?? []).map((f: any) => ({
      label: f.properties.label,
      name: f.properties.name,
      region: f.properties.region,
      coordinates: f.geometry.coordinates as [number, number], // [lng, lat]
    }));

    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json([]);
  }
}
