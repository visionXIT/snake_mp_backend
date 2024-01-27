import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller('/auth')
export class AuthController {
  constructor(
    private service: AuthService
  ) {}

  @Post('/create_user')
  createUser(@Body() msg) {
    const {name} = msg;
    return this.service.createUser(name);
  }

  @Post('/logout')
  logout(@Body() msg) {
    const { userId } = msg;
    return this.service.logout(userId);
  }
}