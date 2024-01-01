import { Cell, Game } from "src/types/game.types";

export const generateId = (len = 3) => {
  let id = '';
  for (let i = 0; i < len; i++) {
    id += Math.floor((Math.random() * 9)).toString();
  }
  return +id;
}

export const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
}

export const getUsedCoords = (game: Game) => {
  let cells: Cell[] = []
  for (let player of game.players) {
    if (!player.snake?.body) {
      continue;
    }
    for (let c of player.snake.body) {
      cells.push({x: c.x, y: c.y});
    }
  }
  return cells;
}

export const getRandomCoords = (game: Game) => {
  const x = getRandomNumber(3, game.fieldSettings.fieldW - 3),
        y = getRandomNumber(3, game.fieldSettings.fieldW - 3)
  return {x, y};
}

export const areCoordsFree = (arr: Cell[], game: Game) => {
  const cells = getUsedCoords(game);
  for (let c of arr) {
    const f = cells.find(cell => cell.x === c.x && cell.y === c.y);
    if (f) {
      return false;
    }
  }
  return true;
}

export const getFreeCoord = (game: Game) => {
  let coords: Cell;
  do {
    coords = getRandomCoords(game);
  } while (!areCoordsFree([coords], game)); 
  return coords;
}