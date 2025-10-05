import { Skeleton } from '@/components/ui/skeleton'

export default function SignInLoading() {
	return (
		<div className="grow flex items-center justify-center">
			<Skeleton className="h-12 w-72" />
		</div>
	)
}
