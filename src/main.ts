import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { FrontendModule } from './frontend/frontend.module';

async function bootstrap() {
  const appBackend = await NestFactory.create<NestExpressApplication>(
    AppModule,
    {
      cors: {
        origin: '*',
      },
    },
  );

  // const appFrontend = await NestFactory.create<NestExpressApplication>(
  //   FrontendModule,
  //   {
  //     cors: {
  //       origin: '*',
  //     },
  //   },
  // );

  // appFrontend.setBaseViewsDir(join(__dirname, '..', 'views'));
  // appFrontend.useStaticAssets(join(__dirname, '..', 'public'));
  // appFrontend.setViewEngine('hbs');
  appBackend.useGlobalPipes(new ValidationPipe());

  // await appFrontend.listen(process.env.FRONTEND_PORT, () =>
  //   console.log(`Frontend started on ${process.env.FRONTEND_PORT}`),
  // );
  await appBackend.listen(process.env.SERVER_PORT, () =>
    console.log(`Server started on ${process.env.SERVER_PORT}`),
  );
}
bootstrap();
