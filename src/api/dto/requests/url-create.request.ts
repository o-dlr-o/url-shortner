import { OmitType } from '@nestjs/swagger';
import { ShortenedUrl } from '../shortened-url';

export class UrlCreateRequest extends OmitType(ShortenedUrl, [
  'id',
  'shortUrl',
]) {}
