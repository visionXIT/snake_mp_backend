import { Module } from "@nestjs/common";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";
import { GameSocketController } from "./game.socket";
import { AuthModule } from "src/auth/auth.module";
import { AuthService } from "src/auth/auth.service";

@Module({
  imports: [AuthModule],
  providers: [GameService, GameSocketController, AuthService],
  controllers: [GameController],
  exports: []
})
export class GameModule {}