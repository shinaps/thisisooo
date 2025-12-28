import { Skeleton } from '@/components/ui/skeleton'

export default function InterviewLoading() {
  return (
    <div className="w-full h-screen flex flex-col">
      {/* チャットメッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
          {/* AIメッセージのスケルトン */}
          <div className="self-start w-full space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* ユーザーメッセージのスケルトン */}
          <div className="self-end w-full flex flex-col items-end space-y-2">
            <Skeleton className="h-10 w-1/2" />
          </div>

          {/* AIメッセージのスケルトン */}
          <div className="self-start w-full space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>

      {/* 入力エリアのスケルトン */}
      <div className="w-full fixed bottom-0 p-4 bg-background">
        <div className="max-w-3xl w-full mx-auto">
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
