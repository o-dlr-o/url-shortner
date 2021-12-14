import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ShortenedUrlEntity } from './entities/shortened-url.entity';
import { ShortenedUrlStats } from './dto/responses/shortened-url-stats';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ShortenedUrl } from './dto/shortened-url';

describe('ApiController', () => {
  let controller: ApiController;
  let apiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [
        {
          provide: ApiService,
          useValue: {
            addUrl: jest.fn(),
            resolveUrl: jest.fn(),
            listUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ApiController>(ApiController);
    apiService = module.get<ApiService>(ApiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return shortened url list', async () => {
    const shortenUrlEntity: ShortenedUrlEntity = {
      id: 1,
      url: 'url',
      hash: 'hash',
      urlCallsEntity: { id: 1, counter: 0 } as any,
    };
    apiService.listUrl.mockResolvedValue([shortenUrlEntity]);
    const urlList = await controller.listUrls({ limit: 2, offset: 0 });
    expect(apiService.listUrl).toBeCalledTimes(1);
    expect(urlList[0]).toBeInstanceOf(ShortenedUrlStats);
  });

  describe('resolveUrl', () => {
    it('should return shortened url', async () => {
      const shortenUrlEntity: ShortenedUrlEntity = {
        id: 1,
        url: 'url',
        hash: 'hash',
        urlCallsEntity: { id: 1, counter: 0 } as any,
      };
      apiService.resolveUrl.mockResolvedValue(shortenUrlEntity);
      const resolvedUrl = await controller.resolveUrl('hash');
      expect(apiService.resolveUrl).toBeCalledTimes(1);
      expect(resolvedUrl).toStrictEqual({ url: shortenUrlEntity.url });
    });

    it('or throw a 404 exception', async () => {
      apiService.resolveUrl.mockResolvedValue(null);
      await expect(controller.resolveUrl('hash')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(apiService.resolveUrl).toBeCalledTimes(1);
    });
  });

  describe('addShortenUrl', () => {
    it('should return shortened url', async () => {
      const shortenUrlEntity: ShortenedUrlEntity = {
        id: 1,
        url: 'url',
        hash: 'hash',
        urlCallsEntity: { id: 1, counter: 0 } as any,
      };
      apiService.addUrl.mockResolvedValue(shortenUrlEntity);
      const addedUrl = await controller.addShortenUrl({
        originalUrl: 'http://www.test.me',
      });
      expect(apiService.addUrl).toBeCalledTimes(1);
      expect(addedUrl).toBeInstanceOf(ShortenedUrl);
    });

    it('or thow an exception', async () => {
      apiService.addUrl.mockRejectedValue(new Error());
      await expect(
        controller.addShortenUrl({
          originalUrl: 'foo',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(apiService.addUrl).toBeCalledTimes(1);
    });
  });
});
