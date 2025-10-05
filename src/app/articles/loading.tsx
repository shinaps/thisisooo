import { Card, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ArticlesLoading() {
	return (
		<div className="flex flex-col px-4 py-8 gap-y-4">
			<Skeleton className="h-7 w-32" />
			<div className="w-full items-center flex flex-col gap-y-4">
				{[1, 2, 3, 4, 5].map((i) => (
					<Card key={i} className="w-full">
						<CardHeader className="gap-y-4">
							<div className="flex flex-wrap gap-2">
								<Skeleton className="h-6 w-32" />
								<Skeleton className="h-6 w-20" />
							</div>
							<Skeleton className="h-6 w-3/4" />
						</CardHeader>
						<CardFooter>
							<Skeleton className="h-4 w-24" />
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	)
}
