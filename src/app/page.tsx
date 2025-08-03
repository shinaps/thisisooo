'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { authClient } from '@/lib/auth-client'

export default function Home() {
  const router = useRouter()
  const { data, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && !data) {
      router.push('/sign-in')
    }
  }, [isPending, data, router])

  if (isPending || !data) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Welcome, {data.user.email}!</h1>
      <p className="mt-4">You are logged in.</p>
    </div>
  )
}
