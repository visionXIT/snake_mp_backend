import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import {
  FieldSettingsType,
  Game,
  GameSettingsType,
  Move,
} from 'src/types/game.types';
import { generateId } from './game.utils';
import {
  createPlayer,
  getNumPlayers,
  getPlayerById,
  getPlayersAlive,
  initPlayer,
  removePlayer,
  updatePlayer,
} from './players.utils';
import { createApple, gameLoop, makeMove } from './snake.utils';

@Injectable()
export class GameService {
  private games: Game[] = [];

  constructor(private authService: AuthService) {}

  async createGame(
    gameSettings: GameSettingsType,
    fieldSettings: FieldSettingsType,
  ) {
    const gameId = generateId();
    const game: Game = {
      gameSettings,
      fieldSettings,
      players: [],
      winner: null,
      gameId,
      status: 'waiting',
      foods: null,
    };
    this.games.push(game);
    return gameId;
  }

  joinGame(gameId: number, userId: number) {
    const game = this.findGame(gameId);
    if (!game) {
      throw new Error('Cannot find a game');
    }

    const existingPlayer = getPlayerById(game, userId);

    if (existingPlayer) {
      return { game, existingPlayer };
    }

    if (game.gameSettings.maxPlayers === getNumPlayers(game)) {
      throw new Error('Too many players');
    }

    if (game.status !== 'waiting') {
      throw new Error('Game is in process or finished');
    }

    const user = this.authService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const player = createPlayer(userId, user.name, game.gameSettings.startSpeedPhaze);
    game.players.push(player);
    return { game, player };
  }

  startGame(gameId: number, userId: number): Game {
    const game = this.findGame(gameId);
    if (!game) {
      throw new Error('Cannot find a game');
    }
    if (game.gameSettings.minPlayers > getNumPlayers(game)) {
      throw new Error('Not enough players');
    }

    if (game.status !== 'waiting') {
      throw new Error('Game is in process or finished');
    }

    if (game.gameSettings.ownerId !== userId) {
      throw new Error('Only owner can start the game');
    }
    
    game.status = 'in_process';
    game.foods = [];
    for (let i = 0; i < game.gameSettings.numApples; i++) {
      createApple(game);
    }

    for (let player of game.players) {
      initPlayer(player, game);
      updatePlayer(player, game.gameSettings.startSpeedPhaze);
    }
    game.timeGameStarted = new Date().getTime();
    return game;
  }

  leaveGame(gameId: number, userId: number) {
    const game = this.findGame(gameId);
    if (!game) {
      throw new Error('Cannot find a game');
    }
    removePlayer(game, userId);
    if (game.players.length === 0) {
      this.removeGame(gameId);
    }
    return game;
  }

  makeMove(gameId: number, userId: number, move: Move) {
    const game = this.findGame(gameId);
    if (!game) {
      throw new Error('Cannot find a game');
    }
    if (game.status !== 'in_process') {
      throw new Error('Game is not in process');
    }
    const player = getPlayerById(game, userId);
    makeMove(player, move);
    player.started = true;
  }

  startGameInterval(game: Game, socket: Server) {
    const id = setInterval(() => {
      let loosers = gameLoop(game);
      for (let player of loosers) {
        socket
          .in(game.gameId.toString())
          .emit('playerLost', { player: player, userId: player.userId });
      }
      socket.in(game.gameId.toString()).emit('gameState', { game });

      if (game.gameSettings.endPlay && getPlayersAlive(game).length === 0) {
        socket.in(game.gameId.toString()).emit('gameOver', { player: game.players.length === 0 ? null : loosers[0], game });
        game.status = 'waiting';
        game.winner = game.players.length === 0 ? null : loosers[0].userId;
        this.setBestScore(game);
        clearInterval(id);
      }
      else {
        if (!(getPlayersAlive(game).length === 1 && game.gameSettings.endPlay) && getPlayersAlive(game).length < Math.min(game.players.length, 2)) {
          if (getPlayersAlive(game).length == 0) {      
            socket.in(game.gameId.toString()).emit('gameOver', { player: game.players.length === 0 ? null : loosers[0], game });
            game.winner = game.players.length === 0 ? null : loosers[0].userId;
            this.setBestScore(game);
          } else {
            socket
              .in(game.gameId.toString())
              .emit('gameOver', { player: getPlayersAlive(game)[0], game });
            game.winner = getPlayersAlive(game)[0].userId;
            this.setBestScore(game);
          }
          game.status = 'waiting';
          clearInterval(id);
        }
      }
    }, 10);
  }

  setBestScore(game: Game) {
    for (const p of game.players) {
      const user = this.authService.findById(p.userId);
      user.bestScore = Math.max(user.bestScore, p.score);
    }
  }

  findGame(gameId: number) {
    return this.games.find((game) => game.gameId === gameId);
  }

  getAllGames() {
    return this.games;
  }

  removeGame(gameId: number) {
    this.games = this.games.filter((g) => g.gameId !== gameId);
  }

  deleteGame(gameId: number, userId: number) {
    const game = this.findGame(gameId);
    if (game.status === 'in_process') {
      throw new BadRequestException('Cannot stop game which is in progress');
    }
    if (game.players.filter(p => p.userId !== userId).length !== 0) {
      throw new BadRequestException('Cannot stop game with players in it');
    }
    if (game.gameSettings.ownerId !== userId) {
      throw new BadRequestException('Not your game');
    }
    this.removeGame(gameId);
  }
}
