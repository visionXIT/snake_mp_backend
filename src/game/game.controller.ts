import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateGameDto } from "./dto/create-game.dto";
import { GameService } from "./game.service";

@Controller('/game')
export class GameController {
  constructor(
    private service: GameService
  ) {}

  @Post('/create_game')
  async createGame(@Body() createGameDto: CreateGameDto) {
    const {gameSettings, fieldSettings} = createGameDto;
    const gameId = this.service.createGame(gameSettings, fieldSettings);
    return gameId;
  }

  @Get("/get_all_games")
  async getGames() {
    return this.service.getAllGames();
  }

  @Get("/get_game/:gameId")
  async getGame(@Param('gameId') gameId: number) {
    return this.service.findGame(gameId);
  }
}