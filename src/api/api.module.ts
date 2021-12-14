import { CacheModule, Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortenedUrlEntity } from './entities/shortened-url.entity';
import { UrlCallsEntity } from './entities/url-calls.entity';
import { UrlSubscriber } from './subscribers/url-subscriber';
import { UrlListener } from './listeners/url.listener';

@Module({
  controllers: [ApiController],
  imports: [
    TypeOrmModule.forFeature([ShortenedUrlEntity, UrlCallsEntity]),
    CacheModule.register(),
  ],
  providers: [ApiService, UrlSubscriber, UrlListener],
})
export class ApiModule {}
