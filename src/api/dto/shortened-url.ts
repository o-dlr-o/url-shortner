import { IsString, IsUrl } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ShortenedUrl {
  id: string;

  @ApiProperty({
    description: 'Url to shorten',
    example: 'https://www.my-url-to-shorten.com',
  })
  @IsUrl({}, { message: 'invalid URL' })
  @Expose({ name: 'url' })
  originalUrl: string;

  @IsString()
  @Expose({ name: 'hash' })
  @ApiProperty({
    description: 'Short Url',
    example: '4hxNeK',
  })
  shortUrl: string;
}
