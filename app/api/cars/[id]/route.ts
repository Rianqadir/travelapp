import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { cars } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getOrCreateUser } from '@/lib/db/get-or-create-user';

// PATCH /api/cars/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser?.emailAddresses[0]?.emailAddress ?? '');

  const { id } = await params;
  const body = await req.json();
  const { name, fuel_type, claimed_mileage, city_mileage, highway_mileage } = body;

  const updated = await db
    .update(cars)
    .set({ 
      name, 
      fuel_type, 
      claimed_mileage, 
      city_mileage: city_mileage ?? undefined,
      highway_mileage: highway_mileage ?? undefined 
    })
    .where(and(eq(cars.id, parseInt(id)), eq(cars.user_id, user.id)))
    .returning();

  if (!updated.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated[0]);
}

// DELETE /api/cars/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser?.emailAddresses[0]?.emailAddress ?? '');

  const { id } = await params;

  const deleted = await db
    .delete(cars)
    .where(and(eq(cars.id, parseInt(id)), eq(cars.user_id, user.id)))
    .returning();

  if (!deleted.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
