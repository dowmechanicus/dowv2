import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import { useEffect, useState } from 'react';
import axios from 'axios';

Chart.register(
  ArcElement,
  CategoryScale,
  ChartDataLabels,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

const Statistics = () => {
  const [statistics, setStatistics] = useState();
  useEffect(() => {
    async function getData() {
      const res = await axios.get('/api/statistics');
      setStatistics(res.data);
    };

    getData();
  }, []);
  return (
    <div className='w-8/12 mx-auto flex flex-col'>
    { statistics ? <>
      <HeroPopularity data={statistics?.hero_win_ratio} />
      <FactionPopularity data={statistics?.faction_popularity} />
      <MapPopularity data={statistics?.map_popularity} />
      <GameLengthDistribution data={statistics?.game_length} />
      <FactionWinRatioOverGameLength
        data={statistics?.faction_win_ratio_over_game_length}
      />
      </> : <span>No data available</span>
      }
    </div>
  );
};

const HeroPopularity = ({ data }) => {
  const labels = data.map((hero) => hero.hero_name);
  const counts = data.map((hero) => parseInt(hero.counts));
  const options = {
    plugins: {
      legend: {
        enabled: false,
        display: false,
      },
    },
    scales: {
      y: {
        title: {
          enabled: true,
          display: true,
          text: '# Games / Win ratio (%)',
        },
      },
    },
  };

  const _data = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: [
          '#7C3AED',
          '#7C3AED',
          '#7C3AED',
          '#D97706',
          '#D97706',
          '#D97706',
          '#FCD34D',
          '#FCD34D',
          '#FCD34D',
          '#4B5563',
          '#4B5563',
          '#4B5563',
          '#059669',
          '#059669',
          '#059669',
          '#2563EB',
          '#2563EB',
          '#2563EB',
          '#DC2626',
          '#DC2626',
          '#DC2626',
        ],
        borderColor: [
          '#7C3AED',
          '#7C3AED',
          '#7C3AED',
          '#D97706',
          '#D97706',
          '#D97706',
          '#FCD34D',
          '#FCD34D',
          '#FCD34D',
          '#4B5563',
          '#4B5563',
          '#4B5563',
          '#059669',
          '#059669',
          '#059669',
          '#2563EB',
          '#2563EB',
          '#2563EB',
          '#DC2626',
          '#DC2626',
          '#DC2626',
        ],
        datalabels: {
          backgroundColor: function(context) {
            return context.dataset.backgroundColor;
          },
          formatter: function(value, context) {
            return '';
          },
        },
      },
      {
        data: data.map((hero) => hero.wins),
        backgroundColor: [
          '#C4B5FD',
          '#C4B5FD',
          '#C4B5FD',
          '#FBBF24',
          '#FBBF24',
          '#FBBF24',
          '#FDE68A',
          '#FDE68A',
          '#FDE68A',
          '#D1D5DB',
          '#D1D5DB',
          '#D1D5DB',
          '#6EE7B7',
          '#6EE7B7',
          '#6EE7B7',
          '#93C5FD',
          '#93C5FD',
          '#93C5FD',
          '#FCA5A5',
          '#FCA5A5',
          '#FCA5A5',
        ],
        datalabels: {
          rotation: -90,
          color: 'white',
          anchor: 'end',
          align: 'end',
          formatter: function(value, context) {
            const winrate = Math.round(
              (value / counts[context.dataIndex]) * 100
            );
            return `${winrate} %`;
          },
        },
      },
    ],
  };

  return (
    <div className='card'>
      <div className='card-body'>
        <div className='card-title uppercase'>hero popularity / win ratio</div>
        <Bar data={_data} options={options} />
      </div>
    </div>
  );
};

const FactionPopularity = ({ data }) => {
  const labels = data.map((race) => race.race_name);
  const _data = {
    labels,
    datasets: [
      {
        data: data.map((race) => race.counts),
        backgroundColor: [
          '#7C3AED',
          '#D97706',
          '#FCD34D',
          '#4B5563',
          '#059669',
          '#2563EB',
          '#DC2626',
        ],
        borderColor: [
          '#7C3AED',
          '#D97706',
          '#FCD34D',
          '#4B5563',
          '#059669',
          '#2563EB',
          '#DC2626',
        ],
        datalabels: {
          backgroundColor: function(context) {
            return context.dataset.backgroundColor;
          },
          formatter: function(value, context) {
            return '';
          },
        },
      },
    ],
  };
  const options = {
    plugins: {
      legend: {
        enabled: false,
        display: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: '# Games',
        },
      },
    },
  };

  return (
    <div className='card'>
      <div className='card-body'>
        <div className='card-title uppercase'>faction popularity</div>
      </div>
      <Bar data={_data} options={options} />
    </div>
  );
};

const MapPopularity = ({ data }) => {
  data.sort((a, b) => parseInt(b.counts) - parseInt(a.counts));
  const max = parseInt(data[0].counts); // Not every map should be display - need at least 10% of max value
  const _data = data.filter((map) => parseInt(map.counts) > max * 0.1);
  const labels = _data.map((map) => map.screen_name);

  const options = {
    plugins: {
      legend: {
        enabled: false,
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '# Games',
        },
      },
    },
    indexAxis: 'y',
  };
  const barData = {
    labels,
    datasets: [
      {
        data: _data.map((map) => map.counts),
        backgroundColor: ['#2563EB'],
        datalabels: {
          color: 'white',
        },
      },
    ],
  };
  return (
    <div className='card'>
      <div className='card-body'>
        <div className='card-title uppercase'>map popularity</div>
        <Bar data={barData} options={options} />
      </div>
    </div>
  );
};

const GameLengthDistribution = ({ data }) => {
  const labels = data.map((gamelength) => gamelength.game_length);
  const options = {
    plugins: {
      legend: {
        enabled: false,
        display: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: '# Games',
        },
      },
    },
  };

  const _data = {
    labels,
    datasets: [
      {
        data: data.map((gamelength) => gamelength.counts),
        borderColor: ['#2563EB'],
        tension: 0.1,
      },
    ],
  };
  return (
    <div className='card'>
      <div className='card-body'>
        <div className='card-title uppercase'>Game Length distribution</div>
        <Line data={_data} options={options} />
      </div>
    </div>
  );
};

const FactionWinRatioOverGameLength = ({
  data,
}) => {
  const labels = Array.from(
    new Set(data.map((faction) => faction.game_length))
  );

  const barData = data.reduce((acc, x) => {
    (acc[x.race_name] = acc[x.race_name] || []).push(x);
    return acc;
  }, {});

  const backgroundColor = (raceKey) => {
    switch (raceKey) {
      case 'Chaos Space Marines':
        return ['#7C3AED'];
      case 'Eldar':
        return ['#D97706'];
      case 'Imperial Guard':
        return ['#FDE68A'];
      case 'Ordo Malleus':
        return ['#4B5563'];
      case 'Orks':
        return ['#059669'];
      case 'Space Marines':
        return ['#2563EB'];
      case 'Tyranids':
        return ['#DC2626'];
      default:
        return [];
    }
  };

  const options = {
    plugins: {
      legend: {
        enabled: false,
        display: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Win ratio (%)',
        },
      },
    },
  };

  const _data = {
    labels,
    datasets: Object.keys(barData).map((raceKey) => ({
      data: barData[raceKey].map((race) =>
        Math.round((race.win_ratio) * 100)
      ),
      backgroundColor: backgroundColor(raceKey),
      datalabels: {
        formatter: function (value, context) {
          return '';
        },
      },
    })),
  };
  return (
    <div className='card'>
      <div className='card-body'>
        <div className='card-title uppercase'>
          Faction win ratio over game length
        </div>
        <Bar data={_data} options={options} />
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  try {
    const res = await fetch(`${process.env.API_URL}/statistics`);
    const statistics = await res.json();

    return {
      props: {
        statistics,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        statistics: undefined,
      },
    };
  }
}

export default Statistics;

/*
interface HeroPopularity {
  hero: number;
  hero_name: string;
  race_name: string;
  counts: string;
}

interface HeroWinRatio {
  hero: number;
  hero_name: string;
  counts: string;
  wins: string;
}

interface FactionPopularity {
  race_name: string;
  counts: string;
}

interface FactionWinRatio {
  race_name: string;
  counts: string;
  wins: string;
}

interface FactionWinRatioOverGameLength extends FactionWinRatio {
  game_length: string;
  win_ratio: string;
}

interface MapPopularity {
  map_id: number;
  screen_name: string;
  player_count: number;
  counts: string;
}

interface GameLength {
  game_length: string;
  counts: string;
}

interface Statistics {
  hero_win_ratio: HeroWinRatio[];
  faction_popularity: FactionPopularity[];
  faction_win_ratio: FactionWinRatio[];
  faction_win_ratio_over_game_length: FactionWinRatioOverGameLength[];
  map_popularity: MapPopularity[];
  game_length: GameLength[];
}
*/
