import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { cars, fuel_prices } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getOrCreateUser } from '@/lib/db/get-or-create-user';

const ORS_KEY = process.env.OPENROUTESERVICE_API_KEY!;

async function geocode(location: string): Promise<[number, number]> {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(location + ', Pakistan')}&boundary.country=PK&size=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.features?.length) throw new Error(`Location not found: ${location}`);
  // ORS returns [longitude, latitude]
  return data.features[0].geometry.coordinates as [number, number];
}

// POST /api/calculate
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser?.emailAddresses[0]?.emailAddress ?? '');

  const body = await req.json();
  const {
    origin,
    destination,
    car_id,
    mileage_preference = 'auto', // 'claimed' | 'custom' | 'auto'
    origin_coords,      // optional [lng, lat] if user picked from map
    destination_coords,  // optional [lng, lat] if user picked from map
  } = body;

  if (!origin || !destination || !car_id) {
    return NextResponse.json({ error: 'origin, destination, and car_id are required' }, { status: 400 });
  }

  // Use provided coordinates or geocode
  let originCoords: [number, number];
  let destCoords: [number, number];
  try {
    if (origin_coords && Array.isArray(origin_coords) && origin_coords.length === 2) {
      originCoords = origin_coords;
    } else {
      originCoords = await geocode(origin);
    }
    if (destination_coords && Array.isArray(destination_coords) && destination_coords.length === 2) {
      destCoords = destination_coords;
    } else {
      destCoords = await geocode(destination);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 422 });
  }

  // Get route from ORS Directions API (Basic distance/time only)
  const orsRes = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
    method: 'POST',
    headers: {
      Authorization: ORS_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      coordinates: [originCoords, destCoords]
    }),
  });

  if (!orsRes.ok) {
    const errText = await orsRes.text();
    return NextResponse.json({ error: 'ORS routing failed', detail: errText }, { status: 502 });
  }

  const orsData = await orsRes.json();
  const route = orsData.routes[0];
  const summary = route.summary;
  const distance_km = summary.distance / 1000;
  const travel_time_minutes = summary.duration / 60;

  // Fetch the selected car (must belong to this user)
  const [car] = await db
    .select()
    .from(cars)
    .where(and(eq(cars.id, parseInt(car_id)), eq(cars.user_id, user.id)))
    .limit(1);

  if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 });

  // Get fuel price for the car's fuel type
  const [fuelPrice] = await db
    .select()
    .from(fuel_prices)
    .where(eq(fuel_prices.fuel_type, car.fuel_type))
    .limit(1);

  const price_per_liter = fuelPrice?.price_per_liter ?? 0;

  // Determine effective mileage based on manual preference
  let effective_mileage: number;
  let mileage_source: string;

  const cityMileage = car.city_mileage ?? car.claimed_mileage * 0.8;
  const highwayMileage = car.highway_mileage ?? car.claimed_mileage;

  if (mileage_preference === 'highway') {
    effective_mileage = highwayMileage;
    mileage_source = 'Highway Average';
  } else {
    // Default to city if 'city' or if 'auto' was somehow passed
    effective_mileage = cityMileage;
    mileage_source = 'City Average';
  }

  const fuel_required_liters = distance_km / effective_mileage;
  const fuel_cost_pkr = fuel_required_liters * price_per_liter;
  const cost_per_km = distance_km > 0 ? fuel_cost_pkr / distance_km : 0;

  return NextResponse.json({
    origin,
    destination,
    origin_coords: originCoords,
    destination_coords: destCoords,
    car_id: car.id,
    car_name: car.name,
    fuel_type: car.fuel_type,
    distance_km: parseFloat(distance_km.toFixed(2)),
    travel_time_minutes: parseFloat(travel_time_minutes.toFixed(1)),
    effective_mileage,
    mileage_source,
    has_custom_mileage: car.custom_mileage !== null,
    claimed_mileage: car.claimed_mileage,
    custom_mileage: car.custom_mileage,
    price_per_liter,
    fuel_required_liters: parseFloat(fuel_required_liters.toFixed(3)),
    fuel_cost_pkr: parseFloat(fuel_cost_pkr.toFixed(2)),
    cost_per_km: parseFloat(cost_per_km.toFixed(2)),
  });
}
