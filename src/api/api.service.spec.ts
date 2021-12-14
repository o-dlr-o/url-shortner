import { Test, TestingModule } from '@nestjs/testing';
import { ApiService } from './api.service';
import { CACHE_MANAGER } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShortenedUrlEntity } from './entities/shortened-url.entity';
import { UrlCallsEntity } from './entities/url-calls.entity';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ApiService', () => {
  let service: ApiService;
  let shortenUrlEntityRepository, urlCallsEntityRepository, cache, eventEmitter;
  const shortenedUrlEntity = {};

  const urlCallsEntity = { counter: 0 };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiService,
        {
          provide: getRepositoryToken(ShortenedUrlEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UrlCallsEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            upsert: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ApiService>(ApiService);
    cache = module.get<Cache>(CACHE_MANAGER);
    shortenUrlEntityRepository = module.get<Repository<ShortenedUrlEntity>>(
      getRepositoryToken(ShortenedUrlEntity),
    );
    urlCallsEntityRepository = module.get<Repository<UrlCallsEntity>>(
      getRepositoryToken(UrlCallsEntity),
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addUrl', () => {
    it('should return newly created url', async () => {
      shortenUrlEntityRepository.create.mockReturnValue(shortenedUrlEntity);
      shortenUrlEntityRepository.save.mockReturnValue(shortenedUrlEntity);
      await service.addUrl({ originalUrl: 'http://www.url.com' });
      expect(shortenUrlEntityRepository.save).toBeCalledTimes(1);
    });
    it('should create counter entry', async () => {
      shortenUrlEntityRepository.create.mockReturnValue(shortenedUrlEntity);
      shortenUrlEntityRepository.save.mockReturnValue(shortenedUrlEntity);
      urlCallsEntityRepository.create.mockReturnValue(urlCallsEntity);
      urlCallsEntityRepository.save.mockReturnValue(urlCallsEntity);

      await service.addUrl({ originalUrl: 'http://www.url.com' });
      expect(urlCallsEntityRepository.create).toBeCalledTimes(1);
    });
  });

  describe('resolveUrl', () => {
    it('should return resolved url', async () => {
      cache.get.mockReturnValue(shortenedUrlEntity);
      shortenUrlEntityRepository.findOne.mockReturnValue(shortenedUrlEntity);
      urlCallsEntityRepository.findOne.mockReturnValue(urlCallsEntity);
      await service.resolveUrl('url');
      expect(cache.get).toBeCalledTimes(1);
    });

    it('should return null if url has not be shortened', async () => {
      cache.get.mockReturnValue(null);
      shortenUrlEntityRepository.findOne.mockReturnValue(null);
      urlCallsEntityRepository.findOne.mockReturnValue(null);
      await service.resolveUrl('url');
      expect(cache.get).toBeCalledTimes(1);
    });

    it('should take data from cache if exist', async () => {
      cache.get.mockReturnValue(shortenedUrlEntity);
      shortenUrlEntityRepository.findOne.mockReturnValue(shortenedUrlEntity);
      urlCallsEntityRepository.findOne.mockReturnValue(urlCallsEntity);
      await service.resolveUrl('url');
      expect(shortenUrlEntityRepository.findOne).toBeCalledTimes(0);
    });

    it('or from database', async () => {
      cache.get.mockReturnValue(null);
      shortenUrlEntityRepository.findOne.mockReturnValue(shortenedUrlEntity);
      urlCallsEntityRepository.findOne.mockReturnValue(urlCallsEntity);
      await service.resolveUrl('url');

      expect(shortenUrlEntityRepository.findOne).toBeCalledTimes(1);
    });

    it('should update cache', async () => {
      cache.get.mockReturnValue(null);
      shortenUrlEntityRepository.findOne.mockReturnValue(shortenedUrlEntity);
      urlCallsEntityRepository.findOne.mockReturnValue(urlCallsEntity);
      await service.resolveUrl('url');

      expect(cache.set).toBeCalledTimes(1);
    });

    it('should emit an event', async () => {
      cache.get.mockReturnValue(null);
      shortenUrlEntityRepository.findOne.mockReturnValue(shortenedUrlEntity);
      urlCallsEntityRepository.findOne.mockReturnValue(urlCallsEntity);
      await service.resolveUrl('url');

      expect(eventEmitter.emit).toBeCalledTimes(1);
    });
  });

  describe('listUrl', () => {
    it('should search shortened url in repository', async () => {
      await service.listUrl({ limit: 1, offset: 0 });
      expect(shortenUrlEntityRepository.find).toBeCalledTimes(1);
    });
  });

  describe('increaseUrlViewCounter', () => {
    it('should increase counter', async () => {
      urlCallsEntityRepository.findOne.mockReturnValue(urlCallsEntity);
      await service.increaseUrlViewCounter(shortenedUrlEntity as any);
      expect(urlCallsEntityRepository.findOne).toBeCalledTimes(1);
      expect(urlCallsEntityRepository.upsert).toBeCalledTimes(1);
    });
  });
});
