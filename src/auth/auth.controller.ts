import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller('/auth')
export class AuthController {
  constructor(
    private service: AuthService
  ) {}

  @Post('/create_user')
  createUser(@Body() msg: {name: string}) {
    const {name} = msg;
    return this.service.createUser(name);
  }

  @Post('/logout')
  logout(@Body() msg: {userId: number}) {
    const { userId } = msg;
    return this.service.logout(+userId);
  }

  @Get('/get_user/:userId')
  getUser(@Param('userId') userId: number) {
    return this.service.findById(+userId);
  }

  @Get('/get_scores')
  getScores() {
    return this.service.getScores();
  }
}