import { DefaultField, DowTable } from '@/components/table';
import Hero from '@/components/hero';
import { ticks2time } from '@/lib/helpers';
import Ratings from '@/components/ratings';
import { FaTrophy } from 'react-icons/fa';
import { Match } from './api/matches';

const Matches = ({ matches, totalElements }: any) => {
	const headers: string[] = ['Date', 'Player 1', 'Player 2', 'Map'];

	return (
		<DowTable headers={headers} totalElements={totalElements}>
			{matches
				? matches.map((match: Match) => (
						<tr key={match.id}>
							<MatchRow match={match} />
						</tr>
				  ))
				: 'No data available'}
		</DowTable>
	);
};

export async function getServerSideProps({ query: { page = 1 } }) {
	const res = await fetch(
		`${process.env.API_URL}:${process.env.PORT}${process.env.BASE_PATH}/api/matches?offset=${page}`
	);
	const { matches = null, totalElements = null } = await res.json();

	return {
		props: {
			matches,
			totalElements,
		},
	};
}

export default Matches;

const MatchRow = ({ match }: { match: Match }) => {
	return (
		<>
			<DefaultField>
				<span className="text-xs text-gray-400">{new Date(match.unix_utc_time * 1000).toLocaleString()}</span>
			</DefaultField>
			<DefaultField>
				<PlayerField
					name={match.p1_name}
					hero={match.p1_hero}
					rating={match.p1_rating}
					rd={match.p1_rd}
					outcome_rating={match.p1_outcome_rating}
					outcome_rd={match.p1_outcome_rd}
					winner={match.winner === 1}
				/>
			</DefaultField>
			<DefaultField>
				<PlayerField
					name={match.p2_name}
					hero={match.p2_hero}
					rating={match.p2_rating}
					rd={match.p2_rd}
					outcome_rating={match.p2_outcome_rating}
					outcome_rd={match.p2_outcome_rd}
					winner={match.winner === 2}
				/>
			</DefaultField>
			<DefaultField className="flex flex-col">
				<span>{match.map_name}</span>
				<span className="text-xs text-gray-400">{ticks2time(match.ticks)}</span>
			</DefaultField>
		</>
	);
};

const PlayerField = ({
	hero,
	name,
	rating,
	rd,
	outcome_rating,
	outcome_rd,
	winner,
}: {
	name: string;
	hero: number;
	rating: number;
	rd: number;
	outcome_rating: number;
	outcome_rd: number;
	winner: boolean;
}) => {
	return (
		<div className="flex flex-row items-left justify-between">
			<div className="flex flex-col items-left">
				<Hero size={50} hero={hero} />
			</div>
			<div className="flex flex-col items-end">
				<span>{name}</span>
				<Ratings rating={{ glicko_rating: rating, rd: rd }} />
				<Ratings rating={{ glicko_rating: outcome_rating, rd: outcome_rd }} />
			</div>
		</div>
	);
};


