import { Cell, Food, Game, Move, Player, Snake } from 'src/types/game.types';
import { getFreeCoord } from './game.utils';

export const makeMove = (player: Player, move: Move) => {
  let velm = 1;
  switch (move as Move) {
    case Move.LEFT:
      if (player.snake.velx != 0) {
        break;
      }
      if (!player.moved) {
        player.nextMove = Move.LEFT;
        break;
      }
      player.snake.velx = -velm;
      player.snake.vely = 0;
      player.moved = false;
      break
    case Move.RIGHT:
      if (player.snake.velx != 0) {
        break;
      }
      if (!player.moved) {
        player.nextMove = Move.RIGHT;
        break;
      }
      player.snake.velx = velm;
      player.snake.vely = 0;
      player.moved = false;

      break
    case Move.UP:
      if (player.snake.vely != 0) {
        break;
      }
      if (!player.moved) {
        player.nextMove = Move.UP;
        break;
      }
      player.snake.vely = -velm;
      player.snake.velx = 0;
      player.moved = false;

      break
    case Move.DOWN:
      if (player.snake.vely != 0) {
        break;
      }
      if (!player.moved) {
        player.nextMove = Move.DOWN;
        break;
      }
      player.snake.vely = velm;
      player.snake.velx = 0;
      player.moved = false;

      break
    default:
      throw new Error("Unknown move");
  }
}

export const createApple = (game: Game) => {
  const {x, y} = getFreeCoord(game);
  if (!game.foods) {
    game.foods = [];
  }
  game.foods.push({
    x, y, 
    adds: generateRandomFoodsAdd()
  });
}

export const generateRandomFoodsAdd = () => {
  const m = Math.random();
  if (m < 0.05)  {
    return -2;
  }
  if (m < 0.1) {
    return 3;
  }
  if (m < 0.15) {
    return 5;
  }

  if (m < 0.3) {
    return 2;
  }
  return 1;
}

export const removeApple = (food: Food, game: Game) => {
  game.foods = game.foods.filter(f => f.x !== food.x || f.y !== food.y);
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
    if (head.x < 0 || head.x >= game.fieldSettings.fieldW ||
        head.y < 0 || head.y >= game.fieldSettings.fieldH ) {
          loosers.push(player);
          continue; 
    }
    let foodToRemove: Food[] = [];
    for (let food of game.foods) {
      if (checkCollision(food, head)) {
        for (let i = 0; i < food.adds; i++) {
          snake.body.unshift({...snake.body[0]});
        }
        eatApple(player, game, food);
        foodToRemove.push({...food});
      }
    }
    for (const f of foodToRemove) {
      removeApple(f, game);
      createApple(game);
    }
    
    
    if (checkSelfCollisions(snake)) {
      loosers.push(player);
      continue;
    }

    if (checkCollisionsWithObstacles(snake.head, game.obstacles)) {
      loosers.push(player);
      continue;
    }

    if (checkCollisionsWithSnakes(
      game.players
            .filter(p => p.userId !== player.userId && p.alive === true)
            .map(p => p.snake), 
      head)) {
        loosers.push(player);
        continue;
    }

    // console.log(snake.body)
    // let oldSnake = JSON.parse(JSON.stringify(snake.body));
    // snake.body[snake.body.length - 1] = {...head};
    // for (let i = snake.body.length - 2; i >= 0; i--) {
    //   snake.body[i].x = oldSnake[i + 1].x; 
    //   snake.body[i].y = oldSnake[i + 1].y;
    // }
    // console.log(snake.body, "\n===\n");


    snake.body.shift();
    snake.body.push({x: snake.body.at(-1).x + snake.velx, y: snake.body.at(-1).y + snake.vely});
    snake.head = {...snake.body.at(-1)};
    if (!player.moved) {
      player.moved = true;
      if (player.nextMove) {
        makeMove(player, player.nextMove);
      }
      player.nextMove = null;
    }
  }
  for (let player of loosers) {
    player.alive = false
  }
  return loosers;
}

const checkSelfCollisions = (player: Snake) => {
  for (let c of player.body.slice(0, -2)) {
    if (checkCollision(player.head, c)) {
      return true;
    }
  }
  return false;
}

const checkCollisionsWithSnakes = (players: Snake[], head: Cell) => {
  for (let p of players) {
    for (let c of p.body) {
      if (checkCollision(head, c)) {
        return true;
      }
    }
  }
  return false;
}

const checkCollisionsWithObstacles = (head: Cell, obstacles: Cell[]) => {
  for (let ob of obstacles) {
    if (checkCollision(head, ob)) {
      return true;
    }
  }
  return false;
}


const eatApple = (player: Player, game: Game, food: Food) => {
  let dif = player.score % game.gameSettings.increasingVelPerScores;
  player.score += food.adds;

  if (player.speedPhase === game.gameSettings.maxSpeedPhase) {
    return;
  }
  if ((dif + food.adds >= game.gameSettings.increasingVelPerScores) || player.score % game.gameSettings.increasingVelPerScores === 0) {
    player.speedPhase--;
  }
}

export const checkCollision = (a: Cell, b: Cell) => {
  return (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y) <= 0.5;
}

export const cellsEquals = (a: Cell, b:Cell) => {
  return a.x === b.x && a.y === b.y;
}