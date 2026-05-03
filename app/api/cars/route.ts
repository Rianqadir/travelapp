import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { cars } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getOrCreateUser } from '@/lib/db/get-or-create-user';

// GET /api/cars
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser?.emailAddresses[0]?.emailAddress ?? '');

  const userCars = await db.select().from(cars).where(eq(cars.user_id, user.id));
  return NextResponse.json(userCars);
}

// POST /api/cars
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser?.emailAddresses[0]?.emailAddress ?? '');

  const { name, fuel_type, claimed_mileage, city_mileage, highway_mileage } = await req.json();

  if (!name || !fuel_type || !claimed_mileage) {
    return NextResponse.json({ error: 'name, fuel_type, and claimed_mileage are required' }, { status: 400 });
  }

  const inserted = await db
    .insert(cars)
    .values({ 
      user_id: user.id, 
      name, 
      fuel_type, 
      claimed_mileage, 
      city_mileage: city_mileage ?? null,
      highway_mileage: highway_mileage ?? null 
    })
    .returning();

  return NextResponse.json(inserted[0], { status: 201 });
}
