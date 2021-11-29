import { useRouter } from 'next/router';

export default function Pagination({ totalElements }: { totalElements: number }) {
	const router = useRouter();
	const { pathname } = router;
	const { page = 1 } = router.query;
	const offset = +page === 1 ? 0 : (+page - 1) * 25;

	return (
		<div className="divide-y divide-gray-500">
			<div className="px-6 py-3 text-gray-500 font-medium text-xs text-left tracking-wider">
				{/* Only visible on e.g. mobile devices */}
				<div className="flex-1 flex justify-between sm:hidden">
					<a
						href="#"
						className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
					>
						Previous
					</a>
					<a
						href="#"
						className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
					>
						Next
					</a>
				</div>
				<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
					<div>
						<p className="text-sm text-gray-700">
							Showing <span className="font-medium">{offset + 1}</span> to{' '}
							<span className="font-medium">{offset + 25}</span> of{' '}
							<span className="font-medium">{totalElements}</span> results
						</p>
					</div>
					<div>
						<nav className="relative z-0 flex rounded-md shadow-sm justify-between" aria-label="Pagination">
							<button
								onClick={() => router.push(`${pathname}?page=${+page - 1}`)}
								disabled={page <= 1}
								className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
							>
								Previous
							</button>
							<button
								onClick={() => router.push(`${pathname}?page=${+page + 1}`)}
								className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ml-4"
							>
								Next
							</button>
						</nav>
					</div>
				</div>
			</div>
		</div>
	);
}
