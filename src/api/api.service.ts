import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { UrlCreateRequest } from './dto/requests/url-create.request';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { ShortenedUrlEntity } from './entities/shortened-url.entity';
import { Repository } from 'typeorm';
import {
  URL_CACHE_TTL_SEC,
  URL_HASH_LENGTH,
} from '../shared/config/app.config';
import { hash } from 'typeorm/util/StringUtils';
import { UrlCallsEntity } from './entities/url-calls.entity';
import { PaginationQuery } from './dto/requests/pagination.query';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UrlEvent } from './dto/events/url.event';
import { URL_ACCESS_EVENT } from '../shared/events';

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(ShortenedUrlEntity)
    private readonly shortenedUrlEntityRepository: Repository<ShortenedUrlEntity>,
    @InjectRepository(UrlCallsEntity)
    private readonly urlCallsEntityRepository: Repository<UrlCallsEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Compute url hash & save it
   *
   * @param request
   */
  async addUrl(request: UrlCreateRequest): Promise<ShortenedUrlEntity> {
    const shortenedUrlEntity = this.shortenedUrlEntityRepository.create({
      url: request.originalUrl,
      hash: this.makeHashFromUrl(request.originalUrl),
    });

    const shortenedUrl = await this.shortenedUrlEntityRepository.save(
      shortenedUrlEntity,
    );

    const urlCallsEntity = await this.urlCallsEntityRepository.create({
      shortenUrl: shortenedUrl,
      counter: 0,
    });
    await this.urlCallsEntityRepository.save(urlCallsEntity);

    return shortenedUrl;
  }

  /**
   * Based on hash, returns according shortenUrl entity or null fi none exists
   *
   * Entity found will be save into cache ti improve performances
   *
   * @param hash
   */
  async resolveUrl(hash: string): Promise<ShortenedUrlEntity> {
    let shortenUrl = await this.cacheManager.get<ShortenedUrlEntity>(hash);
    if (!shortenUrl) {
      this.logger.log(`No url this hash ${hash} found in cache, adding it`);
      shortenUrl = await this.shortenedUrlEntityRepository.findOne({
        where: { hash: hash },
      });
    }
    if (shortenUrl) {
      const urlEvent = new UrlEvent();
      urlEvent.shortenUrl = shortenUrl;

      this.eventEmitter.emit(URL_ACCESS_EVENT, urlEvent);
    }
    return shortenUrl
      ? await this.cacheManager.set<ShortenedUrlEntity>(hash, shortenUrl, {
          ttl: URL_CACHE_TTL_SEC,
        })
      : null;
  }

  async listUrl(
    paginationQuery: PaginationQuery,
  ): Promise<ShortenedUrlEntity[]> {
    return await this.shortenedUrlEntityRepository.find({
      skip: paginationQuery.offset,
      take: paginationQuery.limit,
    });
  }

  /**
   * Increase counter for specified url
   *
   * @param shortenUrl
   */
  async increaseUrlViewCounter(shortenUrl: ShortenedUrlEntity) {
    const urlCallsEntity = await this.urlCallsEntityRepository.findOne({
      shortenUrl: shortenUrl,
    });
    urlCallsEntity.counter += 1;
    return await this.urlCallsEntityRepository.upsert(urlCallsEntity, ['id']);
  }

  /**
   * Given an url, returns a hash
   *
   * @param url
   */
  makeHashFromUrl(url: string): string {
    return hash(url, { length: URL_HASH_LENGTH });
  }
}
