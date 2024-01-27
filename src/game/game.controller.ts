import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
} from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { GameService } from './game.service';

@Controller('/game')
export class GameController {
  constructor(private service: GameService) {}

  @Post('/create_game')
  async createGame(@Body() createGameDto: CreateGameDto) {
    const { gameSettings, fieldSettings } = createGameDto;
    const gameId = this.service.createGame(gameSettings, fieldSettings);
    return gameId;
  }

  @Get('/check_gameId/:gameId')
  async joinGame(@Param("gameId", new ParseIntPipe()) gameId: number) {
    console.log(gameId);
    const game = this.service.findGame(gameId);
    return game ? true : false;
  }

  @Get('/get_all_games')
  async getGames() {
    return this.service.getAllGames();
  }

  @Get('/get_game/:gameId')
  async getGame(@Param('gameId', new ParseIntPipe()) gameId: number) {
    return this.service.findGame(gameId);
  }

  @Post('/delete_game')
  async deleteGame(@Body() msg: {gameId: number, userId: number}) {
    const {gameId, userId} = msg;
    this.service.deleteGame(gameId, userId);
  }
}
