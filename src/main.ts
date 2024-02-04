import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const appBackend = await NestFactory.create<NestExpressApplication>(
    AppModule,
    {
      cors: {
        origin: '*',
      },
    },
  );
  appBackend.useGlobalPipes(new ValidationPipe());

  await appBackend.listen(process.env.SERVER_PORT, () =>
    console.log(`Server started on ${process.env.SERVER_PORT}`),
  );
}
bootstrap();
