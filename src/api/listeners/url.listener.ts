import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UrlEvent } from '../dto/events/url.event';
import { ApiService } from '../api.service';
import { URL_ACCESS_EVENT } from '../../shared/events';

@Injectable()
export class UrlListener {
  constructor(private readonly apiService: ApiService) {}

  @OnEvent(URL_ACCESS_EVENT)
  handleOrderCreatedEvent(event: UrlEvent) {
    this.apiService.increaseUrlViewCounter(event.shortenUrl);
  }
}
