import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Profile } from '@/app/profile/_components/profile'
import { getDb } from '@/drizzle/client'
import { userProfile } from '@/drizzle/schema/d1/user-profile-schema'
import { auth } from '@/lib/auth'

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const db = await getDb()
  const [profile] = await db
    .select() //
    .from(userProfile)
    .where(eq(userProfile.userId, session.user.id))
    .limit(1)

  return <Profile profile={profile} />
}
