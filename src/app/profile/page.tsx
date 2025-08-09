import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Profile } from '@/app/profile/_components/profile'
import { auth } from '@/lib/auth'

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return <Profile user={session.user} />
}
