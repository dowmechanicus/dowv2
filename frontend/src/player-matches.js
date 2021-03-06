import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { DefaultField, DowTable } from './components/table';
import Hero from './components/hero';
import { ticks2time } from './lib/helpers';
import Ratings from './components/ratings';

const PlayerMatches = () => {
  const { player_id } = useParams();
  const headers = ['Date', 'Player 1', 'Player 2', 'Map'];
  const [matches, setMatches] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      const response = await axios.get(`/api/matches?offset=${page}&playerId=${player_id}`);
      const { data: matches, totalElements } = response.data;

      setMatches(matches);
      setTotalElements(totalElements);
    };
    getData();
  }, [page, player_id]);

  return (
    <DowTable headers={headers} totalElements={totalElements} setCurrentPage={setPage}>
      {matches ? (
        matches.map((match) => (
          <tr
            key={match.id}
            className='hover:bg-gray-300 transition-colors hover:cursor-pointer'
            onClick={() => navigate(`/matches/${match.id}`)}
          >
            <MatchRow match={match} />
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={4} className='text-center'>
            No data available
          </td>
        </tr>
      )}
    </DowTable>
  );
};


export default PlayerMatches;

const MatchRow = ({ match }) => {
  return (
    <>
      <DefaultField>
        <span className='text-xs text-gray-400'>
          {new Date(match.unix_utc_time * 1000).toLocaleString()}
        </span>
      </DefaultField>
      <DefaultField>
        <PlayerField
          name={match.p1_name}
          hero={match.p1_hero}
          rating={match.p1_rating}
          rd={match.p1_rd}
          outcome_rating={match.p1_outcome_rating}
          outcome_rd={match.p1_outcome_rd}
          winner={match.winner === 1}
        />
      </DefaultField>
      <DefaultField>
        <PlayerField
          name={match.p2_name}
          hero={match.p2_hero}
          rating={match.p2_rating}
          rd={match.p2_rd}
          outcome_rating={match.p2_outcome_rating}
          outcome_rd={match.p2_outcome_rd}
          winner={match.winner === 2}
        />
      </DefaultField>
      <DefaultField>
        <div className='flex flex-col'>
          <span>{match.map_name}</span>
          <span className='text-xs text-gray-400'>
            {ticks2time(match.ticks)}
          </span>
        </div>
      </DefaultField>
    </>
  );
};

const PlayerField = ({
  hero,
  name,
  rating,
  rd,
  outcome_rating,
  outcome_rd,
  winner,
}
) => {
  return (
    <div className='flex flex-row items-left gap-8'>
      <div className='flex flex-col items-left'>
        <Hero size={50} hero={hero} />
      </div>
      <div className='flex flex-col items-left'>
        <span>{name}</span>
        <Ratings rating={{ glicko_rating: rating, rd: rd }} />
        <Ratings rating={{ glicko_rating: outcome_rating, rd: outcome_rd }} />
      </div>
    </div>
  );
};

/*
export interface Match {
  id: number;
  match_relic_id: number;
  automatch: boolean;
  md5: string;
  p1_relic_id: number;
  p2_relic_id: number;
  p1_name: string;
  p2_name: string;
  p1_hero: number;
  p2_hero: number;
  p1_rank: number;
  p2_rank: number;
  p1_rating: number;
  p2_rating: number;
  p1_rd: number;
  p2_rd: number;
  p1_outcome_rating: number;
  p2_outcome_rating: number;
  p1_outcome_rd: number;
  p2_outcome_rd: number;
  map: number;
  ticks: number;
  winner: 1 | 2;
  ranked: number;
  unix_utc_time: number;
  mod_version: number;
  chat: string;
  observers: string;
  youtube: string;
  league: 0 | 1;
  map_name: string;
  file_name: string;
}*/
