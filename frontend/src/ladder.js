import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DefaultField, DowTable } from './components/table';
import Ratings from './components/ratings';
import { MainRace } from './lib/helpers';
import axios from 'axios';

const Ladder = () => {
  const headers = ['Rank', 'Name', 'Main Race', 'Ratings', 'Winrate'];
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function getData() {
      const res = await axios.get('http://localhost:4000/ladder');
      const { players, winrates } = res.data;

      let _players = players ? players?.map((player) => {
        const _res = winrates.find(
          (_player) => _player?.player_id === player?.relic_id
        );

        return { ...player, ..._res };
      }) : [];

      setPlayers(_players);
    }

    getData();
  }, []);

  return (
    <>
      <DowTable headers={headers}>
        {players
          ? players.map((player, index) => (
            <tr key={player.relic_id}>
              <DefaultField>{index + 1}</DefaultField>
              <DefaultField>
                <PlayerName player={player} />
              </DefaultField>
              <DefaultField>
                <MainRace size={40} main_race={player.main_race} />
              </DefaultField>
              <DefaultField>
                <Ratings
                  rating={{
                    cr: player.cr,
                    glicko_rating: player.glicko_rating,
                    rd: player.rd,
                  }}
                />
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

export default Ladder;

function PlayerName({ player }) {
  return (
    <Link to={`/players/${player.relic_id}`}>
      <div className='flex flex-col cursor-pointer'>
        <span>{player.last_steam_name}</span>
        <span className='text-xs text-gray-400'>
          {player.alias ?? 'No known alias'}
        </span>
      </div>
    </Link>
  );
}

function Record({ player }) {
  return (
    <div className='flex flex-col'>
      <span>
        <span className='text-green-500'>{player.wins}</span> :{' '}
        <span className='text-red-500'>{player.games - player.wins}</span>
      </span>
      <span>{Math.round((player.wins / player.games) * 100)} %</span>
    </div>
  );
}
