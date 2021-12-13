import Hero from '@/components/hero';
import { ticks2time, unix_time_to_datestring } from '@/lib/helpers';
import { InferGetServerSidePropsType } from 'next';

import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Match } from 'pages/matches';

const MatchDetails = ({ match }: { match: Match }) => {
	const router = useRouter();

	const { match_id } = router.query;

	return (
		<div className="w-8/12 min-h-screen align-middle mx-auto flex flex-col justify-evenly">
			<section className="card shadow-2xl">
				<div className="card-body">
					<h2 className="card-title">{match?.map_name ?? 'Unknown map'}</h2>
					<div className="flex gap-20">
						<div className="flex flex-col text-sm">
							<span>{match?.map_name}</span>
							<span>Duration: {ticks2time(match?.ticks)}</span>
							<span>Played at: {unix_time_to_datestring(match?.unix_utc_time)}</span>
							<span>Version: {match?.mod_version}</span>
						</div>
						<div className="flex flex-row items-center gap-8">
							{
								<PlayerDetails
									hero={match.p1_hero}
									rating={match.p1_rating}
									outcome_rating={match.p1_outcome_rating}
									rd={match.p1_rd}
									outcome_rd={match.p1_outcome_rd}
									name={match.p1_name}
								/>
							}
							<span>vs.</span>
							{
								<PlayerDetails
									hero={match.p2_hero}
									rating={match.p2_rating}
									outcome_rating={match.p2_outcome_rating}
									rd={match.p2_rd}
									outcome_rd={match.p2_outcome_rd}
									name={match.p2_name}
								/>
							}
						</div>
					</div>
				</div>
			</section>
			<section className="card shadow-2xl">
				<div className="card-body">
					<h2 className="card-title">Chat</h2>
					<div className="flex flex-col gap-1">
						{JSON.parse(match?.chat)?.map((message: Message, index: number) => {
							return (
								<div className="flex flex-row gap-3 text-sm" key={index}>
									<span className="font-mono">{ticks2time(message.tick)}</span>
									<span className="text-info">{message.sender}</span>
									<span className="text-warning">{message.body}</span>
								</div>
							);
						})}
					</div>
				</div>
			</section>
			<section className="card shadow-2xl">
				<div className="card-body">
					<h2 className="card-title">Actions</h2>
				</div>
			</section>
		</div>
	);
};

type PlayerDetailsProps = {
	hero: number;
	name: string;
	rating: number;
	outcome_rating: number;
	rd: number;
	outcome_rd: number;
};
function PlayerDetails({ hero, name, rating, outcome_rating, rd, outcome_rd }: PlayerDetailsProps) {
	const won: boolean = rating < outcome_rating;
	return (
		<div className="flex gap-3">
			<div className="flex flex-col gap-3">
				<div className="flex items-center gap-3">
					<span>{name}</span>
					<Hero size={52} hero={hero} />
				</div>
				<span className="text-2xs">
					<span>
						{rating} &#177; {rd}
					</span>{' '}
					&nbsp;&gt;&gt;&nbsp;{' '}
					<span className={won ? 'text-green-500' : 'text-red-500'}>
						{outcome_rating} &#177; {outcome_rd}
					</span>
				</span>
			</div>
		</div>
	);
}

export async function getServerSideProps({ params: { match_id = null } }) {
	const res: any = await fetch(`${process.env.API_URL}/matches/${match_id}`);
	const match: Match = await res.json();

	return {
		props: {
			match,
		},
	};
}

export default MatchDetails;

interface Message {
	tick: number;
	sender: string;
	receiver: string;
	body: string;
}
