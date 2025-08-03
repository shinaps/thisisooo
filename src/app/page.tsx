'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function Home() {
	const { data, isPending } = authClient.useSession()
	const router = useRouter()
	if (isPending) {
		return <div>Loading...</div>
	}

	if (!data) {
		router.push('/sign-up')
		return
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<h1 className="text-2xl font-bold">Welcome, {data.user.email}!</h1>
			<p className="mt-4">You are logged in.</p>
		</div>
	)
}
