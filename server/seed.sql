
CREATE TABLE player (
  relic_id BIGINT PRIMARY KEY UNIQUE NOT NULL,
  steam_id BIGINT UNIQUE NOT NULL,
  forum_id INT UNIQUE,
  discord_id BIGINT UNIQUE,
  player_name varchar NOT NULL,
  glicko_rating FLOAT DEFAULT 1500,
  ratings_deviation FLOAT DEFAULT 350,
  created_at timestamp without time zone default (now() at time zone 'utc'),
  last_active timestamp without time zone default (now() at time zone 'utc')
);

CREATE TABLE map (
  id BIGINT PRIMARY KEY UNIQUE NOT NULL,
  file_name TEXT NOT NULL,
  screen_name TEXT NOT NULL,
  player_count INT NOT NULL,
  width INT DEFAULT NULL,
  height INT DEFAULT NULL
);

CREATE TABLE heroes (
  id int PRIMARY KEY UNIQUE NOT NULL,
  hero_slot INT NOT NULL,
  race_slot INT NOT NULL,
  short_name TEXT NOT NULL,
  hero_name TEXT NOT NULL,
  race_name TEXT NOT NULL
);

CREATE TABLE match (
  match_relic_id BIGINT NOT NULL,
  player_id BIGINT NOT NULL,
  map_id INT NOT NULL,
  winner INT NOT NULL,
  ticks INT NOT NULL,
  chat text,
  observers text,
  mod_version INT NOT NULL,
  CONSTRAINT fk_player FOREIGN KEY(player_id) REFERENCES player(relic_id),
  CONSTRAINT fk_map FOREIGN KEY(map_id) REFERENCES map(id)
);
