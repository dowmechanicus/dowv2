import { useRoutes } from "react-router-dom";
import Home from "./home";
import Ladder from './ladder';
import Codex from './codex';
import Matches from './matches';
import MatchDetails from './match-details';
import JoinUs from './join';
import Statistics from './statistics';
import PlayerDetails from './player-details';
import PlayerMatches from './player-matches';
import SpaceMarines from "./codex/space_marines";
import TacticalMarines from "./codex/space_marines/tactical_marines";

const routes = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: "/codex",
    element: <Codex />,
    children: [
      {
        path: 'space_marines',
        element: <SpaceMarines />,
        children: [
          { path: 'tactical_marines', element: <TacticalMarines /> },
        ]
      }
    ]
  },
  { path: "/ladder", element: <Ladder /> },
  { path: "/matches", element: <Matches /> },
  { path: "/matches/:match_id", element: <MatchDetails /> },
  { path: "/join", element: <JoinUs /> },
  { path: "/statistics", element: <Statistics /> },
  { path: "/players/:player_id", element: <PlayerDetails /> },
  { path: "/players/:player_id/log", element: <PlayerMatches /> },
];

export default function Router() {
  let element = useRoutes(routes);

  return element;
}
