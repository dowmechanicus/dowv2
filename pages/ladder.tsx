import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';

interface Player {
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

const Ladder = ({ players }: any) => {
	return (
		<table className="ui table">
			<thead>
				<tr>
					<th>Rank</th>
					<th>Name</th>
					<th>Main race</th>
					<th>Ratings</th>
					<th>Records</th>
				</tr>
			</thead>
			<tbody>
				{players.map((player: Player, index: number) => (
					<tr key={index}>
						<td>{index + 1}</td>
						<td>
							<PlayerName player={player} />
						</td>
						<td>
							<MainRace player={player} />
						</td>
						<td>
							<Ratings player={player} />
						</td>
						<td>
							<Record player={player} />
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
	try {
		const res = await fetch('http://localhost:3000/api/ladder');
		const { players, winrates } = await res.json();

		let _players = players.map((player: any) => {
			const _res = winrates.find((_player: any) => _player?.player_id === player?.relic_id);

			return { ...player, ..._res };
		});

		return {
			props: { players: _players },
		};
	} catch (error) {
		console.error(error);
		return {
			props: {},
		};
	}
}

export default Ladder;

function PlayerName({ player }: { player: Player }) {
	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<span>{player.last_steam_name}</span>
			<span>{player.alias ?? 'No known alias'}</span>
		</div>
	);
}

function MainRace({ player }: { player: Player }) {
	let url: string;

	switch (player.main_race) {
		case 1:
			url = 'https://dawnofwar.info/assets/img/dow2/race_sm_x.png';
			break;
		case 2:
			url = 'https://dawnofwar.info/assets/img/dow2/race_ork_x.png';
			break;
		case 3:
			url = 'https://dawnofwar.info/assets/img/dow2/race_eldar_x.png';
			break;
		case 4:
			url = 'https://dawnofwar.info/assets/img/dow2/race_tyranid_x.png';
			break;
		case 5:
			url = 'https://dawnofwar.info/assets/img/dow2/race_chaos_x.png';
			break;
		case 6:
			url = 'https://dawnofwar.info/assets/img/dow2/race_ig_x.png';
			break;
		case 7:
			url = 'https://dawnofwar.info/assets/img/dow2/race_gk_x.png';
			break;
		default:
			url = 'https://dawnofwar.info/assets/img/dow2/race_sm_x.png';
			break;
	}
	return <Image width="32px" height="32px" src={url} alt="IG" />;
}
function Ratings({ player }: { player: Player }) {
	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<span>{player.cr}</span>
			<span>
				{player.glicko_rating} &#177; {player.rd}
			</span>
		</div>
	);
}
function Record({ player }: { player: Player }) {
	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<span>
				<span style={{ color: 'green' }}>{player.wins}</span> -{' '}
				<span style={{ color: 'red' }}>{player.games - player.wins}</span>
			</span>
			<span>{Math.round((player.wins / player.games) * 100)} %</span>
		</div>
	);
}
