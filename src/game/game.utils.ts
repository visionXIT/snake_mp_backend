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

export const getRandomCoords = (game: Game, min = 3, max = 3) => {
  const x = getRandomNumber(min, game.fieldSettings.fieldW - max),
        y = getRandomNumber(min, game.fieldSettings.fieldH - max)
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
    // console.log("===", coords);
  } while (!areCoordsFree([coords], game)); 
  // console.log("Final", coords);
  return coords;
}

export const createObstacles = (game: Game) => {
  game.obstacles = [];
  for (let i = 0; i < game.gameSettings.numObstacles; i++) {
    let coords: Cell[] = [];
    let id = getRandomNumber(0, obstaclesPatterns.length);
    do {
      const cell = getFreeCoord(game);
      coords = [cell];
      for (let c of obstaclesPatterns[id]) {
        coords.push(addCell(cell, c));
      }
      id = (id + 1) % obstaclesPatterns.length;
    } while (!areCoordsFree(coords, game));
    game.obstacles.push(...coords);
  }
}

const obstaclesPatterns = [
  [{x: 0, y: -1}, {x: 0, y: -2}, {x: -1, y: -2}],
  [{x: 0, y: 1}, {x: 0, y: 2}, {x: -1, y: 2}],
  [{x: 0, y: -1}, {x: 0, y: -2}, {x: 1, y: -2}],
  [{x: 0, y: 1}, {x: 0, y: 2}, {x: 1, y: 2}],
  [{x: 0, y: -1}, {x: 0, y: -2}, {x: 0, y: 1}, {x: 0, y: 2}],
  [{x: -2, y: 0}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}],
  [],
  [{x: 0, y: -1}, {x: -1, y: -1}, {x: 0, y: 1}, {x: -1, y: 1}, {x: 1, y: 1}, {x: 1, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}],
]

const addCell = (a: Cell, b: Cell) => {
  return {x: a.x + b.x, y: a.y + b.y};
}