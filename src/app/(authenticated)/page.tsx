import { countInterviews } from '@/app/(authenticated)/actions'

export default async function Home() {
  const count = await countInterviews()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="mt-4">hello</p>
      <p className="mt-4">{count}</p>
    </div>
  )
}
