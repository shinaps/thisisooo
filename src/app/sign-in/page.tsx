'use client'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export default function SignInPage() {
  const signIn = async () => {
    const data = await authClient.signIn.social({
      provider: 'google',
    })
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <Button size="lg" onClick={signIn}>
        Googleアカウントでログインする
      </Button>
    </div>
  )
}
