import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { trips } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getOrCreateUser } from '@/lib/db/get-or-create-user';

// GET /api/trips
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser?.emailAddresses[0]?.emailAddress ?? '');

  const userTrips = await db
    .select()
    .from(trips)
    .where(eq(trips.user_id, user.id))
    .orderBy(desc(trips.created_at));

  return NextResponse.json(userTrips);
}

// POST /api/trips — save a calculated trip
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser?.emailAddresses[0]?.emailAddress ?? '');

  const body = await req.json();
  const {
    car_id,
    origin,
    destination,
    distance_km,
    travel_time_minutes,
    fuel_required_liters,
    fuel_cost_pkr,
    cost_per_km,
  } = body;

  const inserted = await db
    .insert(trips)
    .values({
      user_id: user.id,
      car_id: parseInt(car_id),
      origin,
      destination,
      distance_km,
      travel_time_minutes,
      fuel_required_liters,
      fuel_cost_pkr,
      cost_per_km,
    })
    .returning();

  return NextResponse.json(inserted[0], { status: 201 });
}
