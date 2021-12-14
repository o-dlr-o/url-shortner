/*
 * Copyright (c) HEROW 2021.
 */

import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  LoadEvent,
} from 'typeorm';

import { InjectConnection } from '@nestjs/typeorm';
import { ShortenedUrlEntity } from '../entities/shortened-url.entity';

@EventSubscriber()
export class UrlSubscriber
  implements EntitySubscriberInterface<ShortenedUrlEntity>
{
  constructor(
    @InjectConnection('default')
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return ShortenedUrlEntity;
  }

  afterLoad(entity: ShortenedUrlEntity, event: LoadEvent<ShortenedUrlEntity>) {
    if (event.entity.hash) {
      entity.hash = process.env.SERVICE_BASE_URL + event.entity.hash;
    }
  }
}
