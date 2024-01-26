import { Cell, Game, Move, Player, Snake } from 'src/types/game.types';
import { getFreeCoord } from './game.utils';

export const makeMove = (player: Player, move: Move) => {
  let velm = 1;

  switch (move as Move) {
    case Move.LEFT:
      if (player.snake.velx > 0) {
        break;
      }
      player.snake.velx = -velm;
      player.snake.vely = 0;
      break
    case Move.RIGHT:
      if (player.snake.velx < 0) {
        break;
      }
      player.snake.velx = velm;
      player.snake.vely = 0;
      break
    case Move.UP:
      if (player.snake.vely > 0) {
        break;
      }
      player.snake.vely = -velm;
      player.snake.velx = 0;
      break
    case Move.DOWN:
      if (player.snake.vely < 0) {
        break;
      }
      player.snake.vely = velm;
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
    player.phase++;
    if (player.phase < player.speedPhase) {
      continue;
    }
    player.phase = 0;

    const snake = player.snake;
    const head = snake.head;
    head.x += snake.velx;
    head.y += snake.vely;
    
    if (head.x < 0 || head.x > game.fieldSettings.fieldW ||
        head.y < 0 || head.y > game.fieldSettings.fieldH) {
          loosers.push(player);
          continue
    }

    if (head.x === game.food.x && head.y === game.food.y) {
      snake.body.unshift({...snake.body[0]});
      changePlayerSpeed(player, game);
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
      head)) {
        loosers.push(player);
        continue;
    }

    snake.body.shift();
    snake.body.push({x: snake.body.at(-1).x + snake.velx, y: snake.body.at(-1).y + snake.vely});
    snake.head = {...snake.body.at(-1)};
  }
  for (let player of loosers) {
    player.alive = false
  }
  return loosers;
}

const checkSelfCollisions = (player: Snake) => {
  for (let c of player.body.slice(0, -2)) {
    if (c.x === player.head.x && c.y ===player.head.y) {
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

const changePlayerSpeed = (player: Player, game: Game) => {
  if (player.speedPhase === game.maxSpeedPhase) {
    return;
  }
  player.speedPhase--;
}