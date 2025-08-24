'use server'

import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { getDb } from '@/drizzle/client'
import { userProfile } from '@/drizzle/schema/d1/user-profile-schema'

export const deleteUserAction = async (userId: string) => {
  const db = getDb()
  await db
    .delete(userProfile) //
    .where(eq(userProfile.userId, userId))
}
