import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Redirect,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiMovedPermanentlyResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  apiBadRequestMessage,
  apiInternalServerErrorMessage,
} from '../shared/messages/api-response.messages';
import { ShortenedUrl } from './dto/shortened-url';
import { plainToClass } from 'class-transformer';
import { UrlCreateRequest } from './dto/requests/url-create.request';
import {
  apiCreatedMessage,
  apiNotFoundMessage,
  apiRedirectedMessage,
} from './dto/responses/controller-responses-messages';
import { ApiService } from './api.service';
import { ShortenedUrlEntity } from './entities/shortened-url.entity';
import { ShortenedUrlStats } from './dto/responses/shortened-url-stats';
import { PaginationQuery } from './dto/requests/pagination.query';

@Controller('api/shorturl')
@ApiTags('url')
export class ApiController {
  private readonly logger = new Logger(ApiController.name);

  constructor(private readonly apiService: ApiService) {}

  @Post()
  @ApiOperation({
    summary: 'Add an Url shortcut',
  })
  @ApiBadRequestResponse(apiBadRequestMessage)
  @ApiInternalServerErrorResponse(apiInternalServerErrorMessage)
  @ApiCreatedResponse({
    description: apiCreatedMessage.description,
    type: ShortenedUrl,
  })
  async addShortenUrl(@Body() urlCreateRequest: UrlCreateRequest) {
    try {
      const createdUrl: ShortenedUrlEntity = await this.apiService.addUrl(
        urlCreateRequest,
      );

      return plainToClass(ShortenedUrl, createdUrl, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      this.logger.warn('Failed to create Url entry', err);
      throw new BadRequestException(err.message);
    }
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'List shortened url',
  })
  @ApiQuery({
    name: 'offset',
    description: 'Number of items to skip',
    example: 0,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Max items to retrieve',
    required: false,
    example: 10,
  })
  @ApiOkResponse({
    type: ShortenedUrlStats,
  })
  @ApiMovedPermanentlyResponse(apiRedirectedMessage)
  @ApiNotFoundResponse(apiNotFoundMessage)
  @ApiInternalServerErrorResponse(apiInternalServerErrorMessage)
  async listUrls(@Query() paginationQuery: PaginationQuery) {
    const urlWithStats = await this.apiService.listUrl(paginationQuery);
    return urlWithStats.map((u) => {
      return plainToClass(
        ShortenedUrlStats,
        { ...u, nbClicks: u.urlCallsEntity.counter },
        { excludeExtraneousValues: true },
      );
    });
  }

  @Get(':hash')
  @Redirect('https://www.foo.com', 302)
  @ApiOperation({
    summary: 'Resolve a shortened Url & redirect to original',
  })
  @ApiMovedPermanentlyResponse(apiRedirectedMessage)
  @ApiNotFoundResponse(apiNotFoundMessage)
  @ApiInternalServerErrorResponse(apiInternalServerErrorMessage)
  async resolveUrl(@Param('hash') hash: string) {
    const shortenUrl = await this.apiService.resolveUrl(hash);
    if (shortenUrl) {
      return { url: shortenUrl.url };
    } else {
      throw new NotFoundException(apiNotFoundMessage.description);
    }
  }
}
