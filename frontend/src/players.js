import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Pagination from './components/pagination';
import Ratings from './components/ratings';
import { MainRace } from './lib/helpers';
import { FaDiscord } from 'react-icons/fa';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      const response = await axios.get(`/api/players?offset=${page}`);
      const { players, totalElements } = response.data;

      setPlayers(players);
      setTotalElements(totalElements);
    };
    getData();
  }, [page]);
  return (
    <div className='py-2 align-middle inline-block w-7/12 sm:px-6 lg:px-8'>
      <div className='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
        <table className='min-w-full divide-y divide-gray-500'>
          <thead className='bg-gray-100'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Name
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Rating
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Main race
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Community
              </th>
            </tr>
          </thead>
          <tbody className='bg-gray-100 divide-y divide-gray-500'>
            {players
              ? players.map((player) => (
                  <tr key={player.relic_id}>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {player.last_steam_name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <Ratings
                        rating={{
                          glicko_rating: player.glicko_rating,
                          rd: player.ratings_deviation,
                        }}
                      />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <MainRace size={40} main_race={player.main_race} />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap flex justify-between'>
                      {
                      <img
                          src='/forum_logo.svg'
                          width={32}
                          height={32}
                          className={
                            player.forum_id ? 'opacity-100' : 'opacity-10'
                          }
                          alt='forum logo'
                        />
                      }
                      {
                        <FaDiscord
                          size={32}
                          style={{ opacity: player.discord_id ? 1 : 0.1 }}
                        />
                      }
                    </td>
                  </tr>
                ))
              : 'No data available'}
          </tbody>
        </table>
        {totalElements ? <Pagination totalElements={totalElements} /> : null}
      </div>
    </div>
  );
};

export default Players;

export async function getServerSideProps({ query: { page = 1 } }) {
  const players_response = await fetch(
    `${process.env.API_URL}/players?offset=${page}`
  );
  const { players, totalElements } = await players_response.json();

  return {
    props: {
      players: players ?? null,
      page,
      totalElements: totalElements ?? 0,
    },
  };
}
