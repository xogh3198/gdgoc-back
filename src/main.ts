import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정
  app.enableCors({
    origin: [
      'http://localhost:5002',
      'http://localhost:5000',
      'http://localhost:3000',
      'http://port-next-gdgoc-mhfzu50b8c0a8c89.sel3.cloudtype.app',
    ],
    credentials: true,
  });

  // 전역 예외 필터 설정
  app.useGlobalFilters(new HttpExceptionFilter());

  // ValidationPipe 전역 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 5002);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
