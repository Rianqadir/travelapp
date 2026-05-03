import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fuel_prices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/db/get-or-create-user';

// GET /api/fuel-prices — public
export async function GET() {
  let prices = await db.select().from(fuel_prices);

  // If no prices exist yet, seed defaults from OGRA (approximate)
  if (prices.length === 0) {
    const defaults = [
      { fuel_type: 'petrol', price_per_liter: 399.86 },
      { fuel_type: 'diesel', price_per_liter: 399.58 },
      { fuel_type: 'high_octane', price_per_liter: 420.00 },
    ];
    prices = await db.insert(fuel_prices).values(defaults).returning();
  }

  return NextResponse.json(prices);
}

// POST /api/fuel-prices — admin only (manual price update)
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser?.emailAddresses[0]?.emailAddress ?? '');

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { fuel_type, price_per_liter } = await req.json();

  if (!fuel_type || !price_per_liter || price_per_liter <= 0) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const updated = await db
    .update(fuel_prices)
    .set({ price_per_liter, updated_at: new Date(), updated_by: user.id })
    .where(eq(fuel_prices.fuel_type, fuel_type))
    .returning();

  return NextResponse.json(updated[0]);
}
