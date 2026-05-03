import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getOrCreateUser } from '@/lib/db/get-or-create-user';

// GET /api/user — get current user profile
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser?.emailAddresses[0]?.emailAddress ?? '');

  return NextResponse.json(user);
}

// PATCH /api/user — update monthly budget
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser?.emailAddresses[0]?.emailAddress ?? '');

  const { monthly_budget } = await req.json();

  const updated = await db
    .update(users)
    .set({ monthly_budget })
    .where(eq(users.id, user.id))
    .returning();

  return NextResponse.json(updated[0]);
}
