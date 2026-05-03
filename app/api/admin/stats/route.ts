import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, trips } from '@/lib/db/schema';
import { count, sum } from 'drizzle-orm';
import { getOrCreateUser } from '@/lib/db/get-or-create-user';

// GET /api/admin/stats — admin only
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser?.emailAddresses[0]?.emailAddress ?? '');

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [userCount] = await db.select({ count: count() }).from(users);
  const [tripStats] = await db
    .select({ count: count(), total_distance: sum(trips.distance_km) })
    .from(trips);

  return NextResponse.json({
    total_users: userCount.count,
    total_trips: tripStats.count,
    total_distance_km: parseFloat((tripStats.total_distance ?? '0').toString()),
  });
}
