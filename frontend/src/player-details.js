import { MainRace } from './lib/helpers';
import { FaComments, FaDiscord, FaSteam } from 'react-icons/fa';
import { useEffect, useReducer } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CategoryScale,
  Chart,
  LineElement,
  Filler,
  Legend,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(
  CategoryScale,
  LineElement,
  Filler,
  Legend,
  Tooltip,
);

const playerDetailsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        player: action.payload.player,
        wins_per_map: action.payload.wins_per_map,
        wins_per_hero: action.payload.wins_per_hero,
        rank: action.payload.rank,
        steam_stats: action.payload.steam_stats,
        glicko_history: action.payload.glicko_history,
      }
    default:
      throw Error('no action')
  }
}

const PlayerDetails = () => {
  const { player_id } = useParams();
  const [state, dispatch] = useReducer(playerDetailsReducer, {
    player: null,
    wins_per_map: null,
    wins_per_hero: null,
    rank: null,
    steam_stats: null,
    glicko_history: null,
  });

  useEffect(() => {
    async function getData() {
      const res = await axios.get(`/api/players/${player_id}`);

      dispatch({
        type: 'SET_DATA',
        payload: {
          ...res.data.data,
        }
      });
    }

    getData();
  }, [player_id]);
  return (
    <div className="w-8/12 align-middle mx-auto flex flex-col gap-y-16">
      {state.player ?
        <>
          <PlayerDetailsHeader player={state.player} steam_stats={state.steam_stats} />
          <PlayerDetailsSummary player={state.player} rank={state.rank} />
          <PlayerMapsAndHeroStats wins_per_hero={state.wins_per_hero} wins_per_map={state.wins_per_map} />
          <GlickoHistory glicko_history={state.glicko_history} />
        </> : <span>No data available</span>
      }
    </div>
  );
};

const PlayerDetailsHeader = ({
  player,
  steam_stats,
}
) => {
  const { player_id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="card card-side bordered shadow-xl">
      <figure>
        <img src={steam_stats.avatarfull} alt={'avatar'} />
      </figure>
      <div className="card-body">
        <h2 className="card-title">
          {player.last_steam_name} (alias: {player.alias})<br />
          <span className="text-xs">{steam_stats?.personaname}</span>
        </h2>
        <div className="flex ">
          <div className="flex flex-1 justify-items-start gap-x-8">
            <FaComments size={32} style={{ opacity: player.forum_id ? 1 : 0.1 }} />
            <FaDiscord size={32} style={{ opacity: player.discord_id ? 1 : 0.1 }} />
            <FaSteam size={32} style={{ opacity: player.steam_id ? 1 : 0.1 }} />
          </div>
          <div className="flex flex-1 justify-end">
            <button className="btn btn-info" onClick={() => navigate(`/players/${player_id}/log`)}>Match log</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerDetailsSummary = ({ player, rank }) => {
  return (
    <div className="shadow-xl card bordered">
      <div className="card-body">
        <h2 className="card-title">Summary</h2>
        <div className="stats">
          <div className="stat">
            <div className="stat-title">Rank</div>
            <div className="stat-value text-info">{rank}</div>
            <div className="stat-desc"></div>
          </div>
          <div className="stat">
            <div className="stat-title">Ratings</div>
            <div className="stat-value text-info">{player.cr}</div>
            <div className="stat-desc">
              {player.glicko_rating} &#177; {player.ratings_deviation}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Games played</div>
            <div className="stat-value text-info">{player.games}</div>
            <div className="stat-desc text-success"></div>
          </div>
          <div className="stat">
            <div className="stat-title">Winrate</div>
            <div className="stat-value text-info">{Math.round((player.wins / player.games) * 100)} %</div>
            <div className="stat-desc">
              W: {player.wins} L: {player.games - player.wins}
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
    </div>
  );
};

const PlayerMapsAndHeroStats = ({
  wins_per_map,
  wins_per_hero,
}
) => {
  const heroes = wins_per_hero.reduce((acc, key) => {
    acc[key.race_name] = {
      ...acc[key.race_name],
      [key.hero_name]: { ...key },
    };
    return acc;
  }, {});

  return (
    <>
      <div className="card bordered shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Hero statistics</h2>
          <div className="flex flex-col gap-y-16">
            <div className="flex flex-wrap">
              {Object.keys(heroes).map((race) => (
                <div key={race}>
                  <label>{race}</label>
                  <HeroWins race={heroes[race]} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="card bordered shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Map statistics</h2>
          <div className="flex flex-wrap items-start gap-x-6 ">
            {wins_per_map.map((map) => (
              <div key={map.screen_name} className="artboard phone text-2xs">
                <div>
                  <label htmlFor={map.screen_name}>{map.screen_name}</label>
                  <progress
                    id={map.screen_name}
                    className="progress progress-error"
                    value={map.wins}
                    max={map.total_games}
                  ></progress>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const HeroWins = ({ race }) => {
  return (
    <div className="p-6 space artboard flex flex-col phone text-2xs">
      {Object.keys(race).map((hero) => (
        <div key={hero}>
          <label>{hero}</label>
          <progress
            className="progress progress-success"
            value={race[hero].wins}
            max={race[hero].total_games}
          ></progress>
        </div>
      ))}
    </div>
  );
};

const GlickoHistory = ({ glicko_history }) => {
  const { player_id } = useParams();

  const glicko_with_confidence_intervals = glicko_history
    .map(match => getGlickHistoryData(match, player_id))

  const _data = {
    labels: Array.from({ length: glicko_with_confidence_intervals.length }, (x, i) => i + 1),
    datasets: [
      {
        type: 'line',
        data: glicko_with_confidence_intervals.map(glicko => glicko.glicko_rating),
        tension: 0,
        borderColor: ['#2563EB'],
        backgroundColor: '#2563EB',
        fill: false,
        label: 'Glicko Rating',
        pointRadius: 0,
        datalabels: {
          formatter: function(value, context) {
            return '';
          },
        },
      },
      {
        backgroundColor: "rgb(75, 192, 255, 0.25)",
        label: 'Glicko + 2 σ',
        pointRadius: 0,
        fill: 0,
        tension: 0,
        data: glicko_with_confidence_intervals.map(glicko => (glicko.glicko_rating + (2 * glicko.deviation))),
        datalabels: {
          formatter: function(value, context) {
            return '';
          },
        },
      },
      {
        backgroundColor: "rgb(75, 192, 255, 0.25)",
        label: 'Glicko - 2 σ',
        pointRadius: 0,
        fill: 0,
        tension: 0,
        data: glicko_with_confidence_intervals.map(glicko => (glicko.glicko_rating - (2 * glicko.deviation))),
        datalabels: {
          formatter: function(value, context) {
            return '';
          },
        },
      },
    ]
  }

  const options = {

    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true
      },
      tooltip: {
        display: true,
        enabled: true,
        position: 'nearest'
      }
    }
  }


  return <>
    <div className="card bordered shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Glicko History</h2>
        <Line data={_data} options={options} />
      </div>
    </div>
  </>
}

export async function getServerSideProps({ params: { player_id = null } }) {
  try {
    const res = await fetch(`${process.env.API_URL}/players/${player_id}`);
    const {
      data: { player, wins_per_map, wins_per_hero, rank, steam_stats },
    } = await res.json();

    return {
      props: {
        player: { ...player, rank },
        wins_per_hero,
        wins_per_map,
        steam_stats,
      },
    };
  } catch (error) {
    return {
      props: {},
    };
  }
}

function getGlickHistoryData(match, player_id) {

  const glicko_rating = match.p1_relic_id === player_id ? match.p1_rating : match.p2_rating;
  const deviation = match.p1_relic_id === player_id ? match.p1_rd : match.p2_rd;
  const ci67 = glicko_rating - deviation;
  const ci95 = glicko_rating - (2 * deviation);

  return ({
    glicko_rating,
    deviation,
    ci67,
    ci95
  })
}

export default PlayerDetails;

/*
export interface PlayerDetails {
  alias: string;
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
  rank?: number;
  ratings_deviation: number;
  relic_id: number;
  steam_id: number;
  tournament_wins: number;
}

export interface ExtendedPlayerDetails extends PlayerDetails {
  cr: number;
  games: number;
  wins: number;
}

interface WinsPerMap {
  screen_name: string;
  total_games: number;
  wins: number;
}

interface WinsPerHero {
  hero_name: string;
  hero: number;
  race_name: string;
  total_games: number;
  wins: number;
}

interface GlickoHistory {
  p1_relic_id: number;
  p2_relic_id: number;
  p1_rating: number;
  p1_rd: number;
  p2_rating: number;
  p2_rd: number;
  winner: number;
  unix_utc_time: number;
  match_relic_id: number;
}
*/
