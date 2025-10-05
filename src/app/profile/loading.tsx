import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
	return (
		<div className="flex flex-col px-4 py-8 gap-y-8 max-w-md mx-auto">
			{/* Avatar */}
			<div className="flex justify-center">
				<Skeleton className="h-24 w-24 rounded-full" />
			</div>

			{/* Form Fields */}
			<div className="flex flex-col gap-y-4">
				<div className="flex flex-col gap-y-2">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-10 w-full" />
				</div>
				<div className="flex flex-col gap-y-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-10 w-full" />
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex flex-col gap-y-2">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
			</div>
		</div>
	)
}
