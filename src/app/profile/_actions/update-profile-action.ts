'use server'

import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { getDb } from '@/drizzle/client'
import { userProfile } from '@/drizzle/schema/d1/user-profile-schema'

export const updateProfileAction = async (
  userId: string, //
  name: string,
  username: string,
) => {
  const db = await getDb()
  await db
    .update(userProfile) //
    .set({ name, username })
    .where(eq(userProfile.userId, userId))
}
