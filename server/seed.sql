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

CREATE TABLE player (
  relic_id BIGINT PRIMARY KEY UNIQUE NOT NULL,
  steam_id BIGINT UNIQUE NOT NULL,
  forum_id INT UNIQUE,
  discord_id BIGINT UNIQUE,
  player_name varchar NOT NULL,
  glicko_rating FLOAT DEFAULT 1500,
  ratings_deviation FLOAT DEFAULT 350,
  main_race INT,
  created_at timestamp without time zone default (now() at time zone 'utc'),
  last_active timestamp without time zone default (now() at time zone 'utc'),
);

CREATE TABLE map (
  id BIGINT PRIMARY KEY UNIQUE NOT NULL AUTO_INCREMENT,
  file_name varchar(32) CHARACTER SET ascii NOT NULL,
  screen_name varchar(32) NOT NULL,
  player_count tinyint(4) NOT NULL,
  width smallint(3) unsigned DEFAULT NULL,
  height smallint(3) unsigned DEFAULT NULL
);

CREATE TABLE heroes (
  id int(11) PRIMARY KEY UNIQUE NOT NULL,
  hero_slot tinyint(2) unsigned NOT NULL,
  race_slot tinyint(2) unsigned NOT NULL,
  short_name char(2) CHARACTER SET ascii NOT NULL,
  hero_name varchar(20) NOT NULL,
  race_name varchar(20) NOT NULL
);
