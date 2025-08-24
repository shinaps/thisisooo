'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { deleteUserAction } from '@/app/profile/_actions/delete-user-action'
import { updateProfileAction } from '@/app/profile/_actions/update-profile-action'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import type { SelectUserProfile } from '@/drizzle/schema/d1/user-profile-schema'
import { authClient } from '@/lib/auth-client'

type Props = {
  profile: SelectUserProfile
}
export const Profile = (props: Props) => {
  const router = useRouter()
  const [name, setName] = useState(props.profile.name || 'anonymous')
  const [username, setUsername] = useState(props.profile.username || 'anonymous')
  const [isLoading, setIsLoading] = useState(false)

  const handleClickUpdate = async () => {
    setIsLoading(true)
    try {
      await updateProfileAction(props.profile.userId, name, username)
      toast.success('ユーザー情報を更新しました')

      router.refresh()
    } catch (error) {
      toast.error('ユーザー情報の更新に失敗しました')
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
      await deleteUserAction(props.profile.userId)
      await authClient.deleteUser()
      router.refresh()
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
              <AvatarImage src={props.profile.image || ''} />
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
