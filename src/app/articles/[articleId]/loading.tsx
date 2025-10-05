import { Skeleton } from '@/components/ui/skeleton'

export default function ArticleLoading() {
	return (
		<div className="flex flex-col px-4 py-8 gap-y-8 max-w-3xl mx-auto">
			{/* Article Header */}
			<div className="flex flex-col gap-y-4">
				<Skeleton className="h-8 w-3/4" />
				<div className="flex gap-x-4">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-32" />
				</div>
			</div>

			{/* Article Content */}
			<div className="flex flex-col gap-y-4">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-4/5" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
			</div>
		</div>
	)
}
