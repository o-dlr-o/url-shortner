import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_URL_PATH } from './shared/config/app.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Url shortener API')
    .setDescription(
      'This API allow you to shorten url and follow user URL consumption',
    )
    .setVersion('1.0')
    .addTag('url')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_URL_PATH, app, document, {
    customSiteTitle: 'API shortner',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        exposeUnsetFields: false,
      },
    }),
  );

  await app.listen(process.env.PORT);
}

bootstrap();
