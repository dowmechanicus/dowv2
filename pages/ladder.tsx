import { GetServerSidePropsContext } from 'next';
import Ratings from '@/components/ratings';
import { MainRace } from '@/lib/helpers';
import { DowTable, DefaultField } from '@/components/table';

interface Player {
	relic_id: number;
	cr: number;
	glicko_rating: number;
	last_steam_name: string;
	main_race: number;
	rating: number;
	rd: number;
	alias: string;
	games: number;
	wins: number;
}

const Ladder = ({ players }: { players: Player[] }) => {
	const headers: string[] = ['Rank', 'Name', 'Main Race', 'Ratings', 'Winrate'];

	return (
		<>
			<DowTable headers={headers}>
				{players
					? players.map((player: Player, index: number) => (
							<tr key={player.relic_id}>
								<DefaultField>{index + 1}</DefaultField>
								<DefaultField>
									<PlayerName player={player} />
								</DefaultField>
								<DefaultField>
									<MainRace size={40} main_race={player.main_race} />
								</DefaultField>
								<DefaultField>
									<Ratings rating={{ cr: player.cr, glicko_rating: player.glicko_rating, rd: player.rd }} />
								</DefaultField>
								<DefaultField>
									<Record player={player} />
								</DefaultField>
							</tr>
					  ))
					: 'No data available'}
			</DowTable>
		</>
	);
};

export async function getServerSideProps() {
	try {
		const res = await fetch(`${process.env.API_URL}/ladder`);
		const { players, winrates } = await res.json();

		let _players = players?.map((player: any) => {
			const _res = winrates.find((_player: any) => _player?.player_id === player?.relic_id);

			return { ...player, ..._res };
		});

		return {
			props: { players: _players ?? [] },
		};
	} catch (error) {
		return {
			props: {
				players: [],
			},
		};
	}
}

export default Ladder;

function PlayerName({ player }: { player: Player }) {
	return (
		<div className="flex flex-col">
			<span>{player.last_steam_name}</span>
			<span className="text-xs text-gray-400">{player.alias ?? 'No known alias'}</span>
		</div>
	);
}

function Record({ player }: { player: Player }) {
	return (
		<div className="flex flex-col">
			<span>
				<span className="text-green-500">{player.wins}</span> :{' '}
				<span className="text-red-500">{player.games - player.wins}</span>
			</span>
			<span>{Math.round((player.wins / player.games) * 100)} %</span>
		</div>
	);
}
