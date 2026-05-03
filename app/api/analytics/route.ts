import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { trips } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { getOrCreateUser } from '@/lib/db/get-or-create-user';

// GET /api/analytics?period=monthly (default)
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser?.emailAddresses[0]?.emailAddress ?? '');

  const now = new Date();

  // Last 6 months of trips
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const allTrips = await db
    .select()
    .from(trips)
    .where(and(eq(trips.user_id, user.id), gte(trips.created_at, sixMonthsAgo)))
    .orderBy(desc(trips.created_at));

  // Build monthly breakdown
  const monthlyMap: Record<string, { label: string; cost: number; distance: number; count: number }> = {};

  for (const trip of allTrips) {
    const date = new Date(trip.created_at!);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });

    if (!monthlyMap[key]) {
      monthlyMap[key] = { label, cost: 0, distance: 0, count: 0 };
    }
    monthlyMap[key].cost += trip.fuel_cost_pkr;
    monthlyMap[key].distance += trip.distance_km;
    monthlyMap[key].count += 1;
  }

  const monthly = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ ...v, cost: parseFloat(v.cost.toFixed(2)), distance: parseFloat(v.distance.toFixed(1)) }));

  // Current month totals
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthTrips = allTrips.filter(t => new Date(t.created_at!) >= currentMonthStart);

  const thisMonth = {
    total_cost: parseFloat(currentMonthTrips.reduce((s, t) => s + t.fuel_cost_pkr, 0).toFixed(2)),
    total_distance: parseFloat(currentMonthTrips.reduce((s, t) => s + t.distance_km, 0).toFixed(1)),
    trip_count: currentMonthTrips.length,
    avg_cost_per_km: currentMonthTrips.length > 0
      ? parseFloat((currentMonthTrips.reduce((s, t) => s + t.cost_per_km, 0) / currentMonthTrips.length).toFixed(2))
      : 0,
    most_expensive: [...currentMonthTrips].sort((a, b) => b.fuel_cost_pkr - a.fuel_cost_pkr).slice(0, 3),
  };

  return NextResponse.json({ monthly, thisMonth });
}
