import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class FrontendController {
  @Get('/main')
  @Render('index')
  game() {}
}
