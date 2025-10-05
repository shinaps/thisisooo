import { Card, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
	return (
		<div className="flex flex-col px-4 py-8 gap-y-12">
			{/* Budget Progress */}
			<div className="flex flex-col gap-y-2">
				<Skeleton className="h-4 w-48" />
				<Skeleton className="h-2 w-full" />
			</div>

			{/* Articles List */}
			<div className="flex flex-col gap-y-4">
				<Skeleton className="h-7 w-32" />
				<div className="w-full items-center flex flex-col gap-y-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<Card key={i} className="w-full">
							<CardHeader className="gap-y-4">
								<Skeleton className="h-6 w-32" />
								<Skeleton className="h-6 w-3/4" />
							</CardHeader>
							<CardFooter>
								<div className="flex justify-between w-full gap-x-4">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-24" />
								</div>
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		</div>
	)
}
