import { Injectable, NotFoundException } from "@nestjs/common";
import { FieldSettingsType, Game, GameSettingsType, Move } from "src/types/game.types";
import { generateId } from "./game.utils";
import { createPlayer, getNumPlayers, getPlayerById, getPlayersAlive, initPlayer, removePlayer } from "./players.utils";
import { createApple, gameLoop, makeMove } from "./snake.utils";
import { Socket, Server } from "socket.io";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class GameService {
  private games: Game[] = [];

  constructor(
    private authService: AuthService
  ) {}

  async createGame(gameSettings: GameSettingsType, fieldSettings: FieldSettingsType) {
    const gameId = generateId();
    const game: Game = {
      gameSettings, 
      fieldSettings,
      players: [],
      winner: null,
      gameId,
      status: 'waiting',
      food: null
    }
    this.games.push(game);
    return gameId;
  }

  joinGame(gameId: number, userId: number) {
    const game = this.findGame(gameId);
    if (!game) {
      throw new Error("Cannot find a game");
    }
    if (game.gameSettings.maxPlayers === getNumPlayers(game)) {
      throw new Error("Too many players");
    }

    if (game.status !== 'waiting') {
      throw new Error("Game is in process or finished");
    }

    const user = this.authService.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const player = createPlayer(userId, user.name);
    game.players.push(player);
    return {game, player};
  }

  startGame(gameId: number, userId: number): Game {
    const game = this.findGame(gameId);
    if (!game) {
      throw new Error("Cannot find a game");
    }
    if (game.gameSettings.minPlayers > getNumPlayers(game)) {
      throw new Error("Not enough players");
    }

    if (game.status !== 'waiting') {
      throw new Error("Game is in process or finished");
    }

    if (game.gameSettings.ownerId !== userId) {
      throw new Error("Only owner can start the game");
    }

    game.status = 'in_process';
    createApple(game);
    for (let player of game.players) {
      player = initPlayer(player, game);
    }
    game.timeGameStarted = new Date().getTime();
    return game;
  }

  leaveGame(gameId: number, userId: number) {
    const game = this.findGame(gameId);
    if (!game) {
      throw new Error("Cannot find a game");
    }
    removePlayer(game, userId);
    return game;
  }

  makeMove(gameId: number, userId: number, move: Move) {
    const game = this.findGame(gameId);
    if (!game) {
      throw new Error("Cannot find a game");
    }
    if (game.status !== 'in_process') {
      throw new Error("Game is not in process");
    }
    const player = getPlayerById(game, userId);
    makeMove(player, move);
    player.started = true;
  }

  startGameInterval(game: Game, socket: Server) {
    const id = setInterval(() => {
      let loosers = gameLoop(game);
      for (let player of loosers) {
        socket.in(game.gameId.toString()).emit('playerLost', {userId: player.userId});
      }
      socket.in(game.gameId.toString()).emit('gameState', {game});

      if (getPlayersAlive(game).length < 2) {
        if (getPlayersAlive(game).length == 0) {
          socket.in(game.gameId.toString()).emit('gameOver', {userId: null});
        } else {
          socket.in(game.gameId.toString()).emit('gameOver', {userId: getPlayersAlive(game)[0].userId});
          game.winner = getPlayersAlive(game)[0].userId;
        }
        clearInterval(id);
      }
    }, 1000);
  }

  findGame(gameId: number) {
    return this.games.find(game => game.gameId === gameId);
  }

  getAllGames() {
    return this.games;
  }
}