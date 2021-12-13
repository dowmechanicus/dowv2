import { MainRace } from '@/lib/helpers';

const PlayerDetails = ({ player }: { player: ExtendedPlayerDetails }) => {
	return (
		<div className="w-8/12 min-h-screen align-middle mx-auto flex flex-col justify-evenly">
			<div className="w-full shadow stats">
				<div className="stat">
					<div className="stat-figure text-secondary">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							className="inline-block w-8 h-8 stroke-current"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
					</div>
					<div className="stat-title">Ratings</div>
					<div className="stat-value text-info">{player.cr}</div>
					<div className="stat-desc">
						{player.glicko_rating} &#177; {player.ratings_deviation}
					</div>
				</div>
				<div className="stat">
					<div className="stat-figure text-secondary">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							className="inline-block w-8 h-8 stroke-current"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
							></path>
						</svg>
					</div>
					<div className="stat-title">Games played</div>
					<div className="stat-value text-info">{player.games}</div>
					<div className="stat-desc text-success"></div>
				</div>
				<div className="stat">
					<div className="stat-figure text-secondary">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							className="inline-block w-8 h-8 stroke-current"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
							></path>
						</svg>
					</div>
					<div className="stat-title">Victories</div>
					<div className="stat-value text-info">{player.wins}</div>
					<div className="stat-desc">
						Losses {player.games - player.wins} (
						{Math.round(((player.games - player.wins) / player.games) * 100)} %)
					</div>
				</div>
				<div className="stat">
					<div className="stat-title">Main race</div>
					<div className="stat-value">
						<MainRace main_race={player.main_race} size={96} />
					</div>
					<div className="stat-desc"></div>
				</div>
			</div>
		</div>
	);
};

export async function getServerSideProps({ params: { player_id = null } }) {
	try {
		const res = await fetch(`${process.env.API_URL}/players/${player_id}`);
		const player: ExtendedPlayerDetails = await res.json();

		console.log(player);

		return {
			props: {
				player,
			},
		};
	} catch (error) {
		return {
			props: {
				player: {},
			},
		};
	}
}

export default PlayerDetails;

export interface PlayerDetails {
	country: string;
	created_at: string;
	discord_id: number;
	forum_id: number;
	glicko_rating: number;
	last_cr_change: number;
	last_position_change: number;
	last_rating_change: number;
	last_rd_change: number;
	last_steam_name: string;
	main_race: number;
	ratings_deviation: number;
	relic_id: number;
	steam_id: number;
	tournament_wins: number;
}

export interface ExtendedPlayerDetails extends PlayerDetails {
	wins: number;
	games: number;
	cr: number;
}
