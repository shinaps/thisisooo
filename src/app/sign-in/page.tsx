'use client'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export default function SignInPage() {
  const signIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
    })
  }

  return (
    <div className="grow flex items-center justify-center">
      <Button size="lg" onClick={signIn}>
        Googleアカウントでログインする
      </Button>
    </div>
  )
}
