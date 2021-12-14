import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiExcludeEndpoint()
  @Redirect('/documentation')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  swagger(): void {}
}
