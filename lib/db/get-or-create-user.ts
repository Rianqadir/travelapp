import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Get existing user by clerk_id, or create one on first sign-in.
 * This replaces the webhook approach for local dev.
 */
export async function getOrCreateUser(clerkId: string, email: string) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerk_id, clerkId))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const inserted = await db
    .insert(users)
    .values({ clerk_id: clerkId, email, role: 'user' })
    .returning();

  return inserted[0];
}
