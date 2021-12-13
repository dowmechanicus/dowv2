import Image from 'next/image';

export function MainRace({ main_race, size = 32 }: { main_race: number; size?: number }) {
	let url: string;

	switch (main_race) {
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
	return <Image width={size} height={size} src={url} alt="main race" />;
}

export function ticks2time(ticks: number): string {
	const total_seconds = Math.floor(ticks / 10);
	const minutes = Math.floor(total_seconds / 60);
	const remaining_seconds = total_seconds - minutes * 60;

	return `${minutes < 10 ? '0' + minutes : minutes}:${
		remaining_seconds < 10 ? '0' + remaining_seconds : remaining_seconds
	}`;
}

export function unix_time_to_datestring(unix_utc_time: number): string {
	return new Date(unix_utc_time * 1000).toLocaleString();
}
