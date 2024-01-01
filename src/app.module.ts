import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { ServerModule } from './server/server.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule, GameModule, ServerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
