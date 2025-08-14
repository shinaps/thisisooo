'use server'

import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { z } from 'zod'
import { getDb } from '@/drizzle/client'
import { userProfile } from '@/drizzle/schema/d1/user-profile-schema'

const nameSchema = z
  .string()
  .min(1)
  .max(20)
  .regex(/^[^<>{}"'`;]+$/)
const usernameSchema = z
  .string()
  .min(4)
  .max(20)
  .regex(/^[a-zA-Z0-9_]+$/)

export const updateProfileAction = async (
  userId: string, //
  name: string,
  username: string,
) => {
  nameSchema.parse(name)
  usernameSchema.parse(username)

  const db = await getDb()
  await db
    .update(userProfile) //
    .set({ name, username })
    .where(eq(userProfile.userId, userId))
}
