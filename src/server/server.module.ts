import { Module } from "@nestjs/common";
import { ServerService } from "./server.service";

@Module({
  providers: [ServerService],
  controllers: [],
  exports: []
})
export class ServerModule {}