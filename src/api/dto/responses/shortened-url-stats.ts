import { ShortenedUrl } from '../shortened-url';
import { ApiProperty } from '@nestjs/swagger';

export class ShortenedUrlStats extends ShortenedUrl {
  @ApiProperty({
    description: 'Click counter',
  })
  nbClicks = 0;
}
