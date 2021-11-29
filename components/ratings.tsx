export default function Ratings({
	rating: { cr, glicko_rating, rd },
}: {
	rating: {
		cr?: number;
		glicko_rating: number;
		rd: number;
	};
}) {
	return (
		<div className="flex flex-col">
			{cr ?? <span>{cr}</span>}
			<span className="text-xs text-gray-400">
				{glicko_rating} &#177; {rd}
			</span>
		</div>
	);
}
