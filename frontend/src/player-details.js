import { MainRace } from './lib/helpers';
import { FaComments, FaDiscord, FaSteam } from 'react-icons/fa';
import { useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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
        <div className="flex justify-items-start gap-x-8">
          <FaComments size={32} style={{ opacity: player.forum_id ? 1 : 0.1 }} />
          <FaDiscord size={32} style={{ opacity: player.discord_id ? 1 : 0.1 }} />
          <FaSteam size={32} style={{ opacity: player.steam_id ? 1 : 0.1 }} />
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
                    className="progress progress-info"
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
*/
