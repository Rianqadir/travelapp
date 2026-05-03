import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { trips } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getOrCreateUser } from '@/lib/db/get-or-create-user';

// DELETE /api/trips/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, clerkUser?.emailAddresses[0]?.emailAddress ?? '');

  const { id } = await params;

  const deleted = await db
    .delete(trips)
    .where(and(eq(trips.id, parseInt(id)), eq(trips.user_id, user.id)))
    .returning();

  if (!deleted.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
