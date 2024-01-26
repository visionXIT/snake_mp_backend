import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { GameService } from "./game.service";
import { Socket, Server } from "socket.io";
import { Move } from "src/types/game.types";

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class GameSocketController {
  constructor(
    private service: GameService
  ) {}

  @WebSocketServer()
  private server: Server;

  handleDisconnect(
    @ConnectedSocket() client: Socket
  ) {
    for (let room of client.rooms) {
      this.service.leaveGame(+room, client.data.userId);
    }
    client.disconnect(true);
    console.log("Client disconnected");
  }

  handleConnection(
    @ConnectedSocket() client: Socket,
  ) {
    console.log("Client connected to game");
  }
  
  @SubscribeMessage('join_game')
  async handleJoinGame(
    @MessageBody() message: {gameId: number, userId: number},
    @ConnectedSocket() client: Socket
  ) {
    const {gameId, userId} = message;
    try {
      const {game, player} = this.service.joinGame(gameId, userId);
      client.join(gameId.toString());
      client.data.userId = userId;
      this.server.in(gameId.toString()).emit('playerJoined', game);

    } catch (error: unknown) {
      const msg = (error as {message: string}).message;
      client.emit('error', {message: msg});
    }
  }

  @SubscribeMessage('exit_game')
  async handleExitGame(
    @MessageBody() message: {gameId: number, userId: number},
    @ConnectedSocket() client: Socket
  ) {
    const {gameId, userId} = message;
    try {
      const game = this.service.leaveGame(gameId, userId);
      client.leave(gameId.toString());
    } catch (error: unknown) {
      const msg = (error as {message: string}).message;
      client.emit('error', {message: msg});
    }
  }

  @SubscribeMessage('start_game')
  async handleStartGame(
    @MessageBody() message: {gameId: number, userId: number},
    @ConnectedSocket() client: Socket
  ) {
    const {gameId, userId} = message;
    try {
      const game = this.service.startGame(gameId, userId);
      this.server.in(game.gameId.toString()).emit('gameStarted', {game});
      this.service.startGameInterval(game, this.server);
    } catch (error: unknown) {
      const msg = (error as {message: string}).message;
      client.emit('error', {message: msg});
    }
  }

  @SubscribeMessage('make_move')
  async handleMakeMove(
    @MessageBody() message: {gameId: number, userId: number, move: Move},
    @ConnectedSocket() client: Socket
  ) {
    const {gameId, userId, move} = message;
    try {
      this.service.makeMove(gameId, userId, move);
    } catch (error: unknown) {
      const msg = (error as {message: string}).message;
      client.emit('error', {message: msg});
    }
  }
}