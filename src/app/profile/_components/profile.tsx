'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import type { User } from '@/lib/auth'
import { authClient } from '@/lib/auth-client'

type Props = {
  user: User
}
export const Profile = (props: Props) => {
  const router = useRouter()
  const [name, setName] = useState(props.user.name || 'anonymous')
  const [username, setUsername] = useState(props.user.username || 'anonymous')
  const [isLoading, setIsLoading] = useState(false)

  const handleClickUpdate = async () => {
    setIsLoading(true)
    try {
      await authClient.updateUser({
        name: name,
        // @ts-ignore
        username: username,
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClickSignOut = async () => {
    setIsLoading(true)
    try {
      await authClient.signOut()
      router.refresh()
    } catch (error) {
      console.error('Failed to sign out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClickDeleteAccount = async () => {
    setIsLoading(true)
    try {
      await authClient.deleteUser()
      router.refresh()
      // Optionally redirect or show a success message
    } catch (error) {
      console.error('Failed to delete account:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex flex-col px-4 gap-y-16 py-16">
        <div className="text-center text-2xl font-bold">Profile Page</div>

        <div className="flex flex-col gap-y-6">
          <div className="flex items-center gap-x-6">
            <Avatar className="size-12">
              <AvatarImage src={props.user.image || ''} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>←これはまだ編集できないのでユーザーにも表示されません</span>
          </div>

          <div className="flex flex-col gap-y-3">
            <Label htmlFor="name" className="font-semibold">
              表示名
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="flex flex-col gap-y-3">
            <Label htmlFor="username" className="font-semibold">
              ユーザーネーム
            </Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleClickUpdate}>更新する</Button>

        <div className="flex flex-col gap-y-4">
          <Button
            onClick={() => {
              ConfirmDialog.call({
                title: 'ログアウト',
                description: 'ログアウトしますか？',
                onConfirm: {
                  text: 'ログアウトする',
                  variant: 'default',
                  onClick: async () => {
                    await handleClickSignOut()
                  },
                },
              })
            }}
            variant="secondary"
          >
            ログアウトする
          </Button>

          <Button
            onClick={() => {
              ConfirmDialog.call({
                title: 'アカウントの削除',
                description: 'アカウントを削除しますか？アカウントを削除すると全てのデータが削除されます。',
                onConfirm: {
                  text: '削除する',
                  variant: 'destructive',
                  onClick: async () => {
                    await handleClickDeleteAccount()
                  },
                },
              })
            }}
            variant="destructive"
          >
            アカウントを削除する
          </Button>
        </div>
      </div>
    </>
  )
}
