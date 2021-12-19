import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Statistics = ({ statistics }: { statistics: Statistics }) => {
	return (
		<div>
			<FactionPopularity data={statistics.faction_popularity} />
		</div>
	);
};

const FactionPopularity = ({ data }: { data: FactionPopularity[] }) => {
	const pieData = {
		labels: [...data.map((faction) => faction.race_name)],
		datasets: [
			{
				data: [...data.map((faction) => faction.counts)],
				backgroundColor: ['#2563EB', '#7C3AED', '#D97706', '#059669', '#FDE68A', '#DC2626', '#4B5563'],
			},
		],
	};

	return (
		<div>
			<Pie data={pieData} />
		</div>
	);
};

export async function getServerSideProps() {
	try {
		const res = await fetch(`${process.env.API_URL}/statistics`);
		const statistics: Statistics = await res.json();

		return {
			props: {
				statistics,
			},
		};
	} catch (error) {
		console.error(error);
	}
}

export default Statistics;

interface HeroPopularity {
	hero: number;
	hero_name: string;
	counts: number;
}

interface HeroWinRatio {
	hero: number;
	hero_name: string;
	counts: number;
	wins: string;
}

interface FactionPopularity {
	race_name: string;
	counts: number;
}

interface FactionWinRatio {
	race_name: string;
	counts: number;
	wins: string;
}

interface MapPopularity {
	map_id: number;
	screen_name: string;
	player_count: number;
	counts: number;
}

interface GameLength {
	game_length: string;
	counts: number;
}

interface Statistics {
	hero_popularity: HeroPopularity[];
	hero_win_ratio: HeroWinRatio[];
	faction_popularity: FactionPopularity[];
	faction_win_ratio: FactionWinRatio[];
	map_popularity: MapPopularity[];
	game_length: GameLength[];
}
