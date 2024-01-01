import { Cell, Game, Move, Player, Snake } from 'src/types/game.types';
import { getFreeCoord } from './game.utils';

export const makeMove = (player: Player, move: Move) => {
  switch (move as Move) {
    case Move.LEFT:
      if (player.snake.velx > 0) {
        break;
      }
      player.snake.velx = -1;
      player.snake.vely = 0;
      break
    case Move.RIGHT:
      if (player.snake.velx < 0) {
        break;
      }
      player.snake.velx = 1;
      player.snake.vely = 0;
      break
    case Move.UP:
      if (player.snake.vely > 0) {
        break;
      }
      player.snake.vely = -1;
      player.snake.velx = 0;
      break
    case Move.DOWN:
      if (player.snake.vely < 0) {
        break;
      }
      player.snake.vely = 1;
      player.snake.velx = 0;
      break
    default:
      throw new Error("Unknown move");
  }
}

export const createApple = (game: Game) => {
  const {x, y} = getFreeCoord(game);
  game.food = {
    x, y, 
    adds:1
  }
}

export const gameLoop = (game: Game) => {
  let loosers: Player[] = [];
  for (let player of game.players) {
    if (!player.alive) {
      continue;
    }

    if (!player.started) {
      if (new Date().getTime() - game.timeGameStarted >= game.gameSettings.delayTime) {
        player.started = true;
      } else {
        continue;
      }
    }

    const snake = player.snake;
    snake.head.x += snake.velx;
    snake.head.y += snake.vely;
    
    if (snake.head.x < 0 || snake.head.x > game.fieldSettings.fieldW ||
        snake.head.y < 0 || snake.head.y > game.fieldSettings.fieldH) {
          loosers.push(player);
          continue
    }

    if (snake.head.x === game.food.x && snake.head.y === game.food.y) {
      snake.body.push({...snake.body.at(-1)});
      createApple(game);
    }
    
    if (checkSelfCollisions(snake)) {
      loosers.push(player);
      continue;
    }

    
    if (checkCollisionsWithSnakes(
      game.players
            .filter(p => p.userId !== player.userId)
            .map(p => p.snake), 
      snake.head)) {
        loosers.push(player);
        continue;
    }

    snake.body.shift();
    snake.body.push({...snake.head});
  }
  for (let player of loosers) {
    player.alive = false
  }
  return loosers;
}

const checkSelfCollisions = (player: Snake) => {
  for (let c of player.body.slice(0, -2)) {
    if (c.x === player.head.x && c.y === player.head.y) {
      return true;
    }
  }
  return false;
}

const checkCollisionsWithSnakes = (players: Snake[], head: Cell) => {
  for (let p of players) {
    for (let c of p.body) {
      if (c.x === head.x && c.y === head.y) {
        return true;
      }
    }
  }
  return false;
}