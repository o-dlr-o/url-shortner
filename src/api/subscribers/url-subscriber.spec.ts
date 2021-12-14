/*
 * Copyright (c) HEROW 2021.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'typeorm';
import { UrlSubscriber } from './url-subscriber';
import { ShortenedUrlEntity } from '../entities/shortened-url.entity';

describe('Url subscriber', () => {
  let subscriber: UrlSubscriber;
  const baseUrl = 'http://s.me/';
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlSubscriber, Connection],
    })
      .overrideProvider(Connection)
      .useValue({
        subscribers: [],
      })
      .compile();

    subscriber = module.get<UrlSubscriber>(UrlSubscriber);
    process.env.SERVICE_BASE_URL = baseUrl;
  });

  it('should be defined', () => {
    expect(subscriber).toBeDefined();
  });

  it('should listen to ShortenedUrlEntity Repository', () => {
    expect(subscriber.listenTo()).toBe(ShortenedUrlEntity);
  });

  it('after laod should complete shortenUrl with service base address', async () => {
    const shortenUrlEntity: ShortenedUrlEntity = {
      id: 1,
      url: 'url',
      hash: 'hash',
      urlCallsEntity: { id: 1, counter: 0 } as any,
    };

    const event: any = {
      connection: undefined,
      queryRunner: undefined,
      manager: undefined,
      entity: shortenUrlEntity,
      metadata: undefined,
    };
    await subscriber.afterLoad(shortenUrlEntity, event);
    expect(event.entity.hash).toBe(baseUrl + 'hash');
  });
});
