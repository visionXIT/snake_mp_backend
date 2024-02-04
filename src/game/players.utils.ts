import { Cell, Game, Player } from 'src/types/game.types';
import { areCoordsFree, getRandomCoords, getRandomNumber } from './game.utils';
import { SPEED_PHASE } from './config';

export const getNumPlayers = (game: Game) => {
  return game.players.length;
};

export const getPlayersAlive = (game: Game) => {
  return game.players.filter((player) => player.alive);
};

export const getPlayerById = (game: Game, userId: number) => {
  return game.players.find((player) => player.userId === userId);
};

export const removePlayer = (game: Game, userId: number) => {
  game.players = game.players.filter((player) => player.userId !== userId);
};

export const createPlayer = (userId: number, name: string, startSpeed: number) => {
  const player: Player = {
    userId,
    color: [Math.random(), Math.random(), Math.random()],
    score: 0,
    isReady: false,
    snake: null,
    alive: true,
    name,
    started: false,
    speedPhase: startSpeed,
    phase: 0,
    moved: true
  };
  return player;
};

export const updatePlayer = (player: Player, startSpeed: number) => {
  player.score = 0;
  player.isReady = true;
  player.alive = true;
  player.started = false;
  player.speedPhase = startSpeed;
  player.phase = 0;
};

export const initPlayer = (player: Player, game: Game) => {
  const dir = getRandomNumber(0, 4);
  let cells: Cell[] = [];
  let velx = 0,
    vely = 0;
  let velm = 1;
  switch (dir) {
    case 0:
      do {
        const { x, y } = getRandomCoords(game);
        cells = [
          { x, y },
          { x, y: y + 1 },
          { x, y: y + 2 },
        ];
        vely = velm;
      } while (!areCoordsFree(cells, game));
      break;
    case 1:
      do {
        const { x, y } = getRandomCoords(game);
        cells = [
          { x, y },
          { x, y: y - 1 },
          { x, y: y - 2 },
        ];
        vely = -velm;
      } while (!areCoordsFree(cells, game));
      break;
    case 2:
      do {
        const { x, y } = getRandomCoords(game);
        cells = [
          { x, y },
          { x: x + 1, y },
          { x: x + 2, y },
        ];
        velx = velm;
      } while (!areCoordsFree(cells, game));
      break;
    case 3:
      do {
        const { x, y } = getRandomCoords(game);
        cells = [
          { x, y },
          { x: x - 1, y },
          { x: x - 2, y },
        ];
        velx = -velm;
      } while (!areCoordsFree(cells, game));
      break;
  }
  player.snake = {
    head: { ...cells.at(-1) },
    body: cells,
    velx,
    vely,
  };
};
