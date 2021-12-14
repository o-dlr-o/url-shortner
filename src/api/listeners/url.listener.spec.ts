/*
 * Copyright (c) HEROW 2021.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UrlListener } from './url.listener';
import { ApiService } from '../api.service';

describe('Url listener', () => {
  let listener: UrlListener;
  let apiService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlListener, ApiService],
    })

      .overrideProvider(ApiService)
      .useValue({
        increaseUrlViewCounter: jest.fn(),
      })
      .compile();

    listener = module.get<UrlListener>(UrlListener);
    apiService = module.get<ApiService>(ApiService);
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  it('handleOrderCreatedEvent should call service to increase counter', async () => {
    await listener.handleOrderCreatedEvent({ shortenUrl: {} as any });
    expect(apiService.increaseUrlViewCounter).toBeCalledTimes(1);
  });
});
