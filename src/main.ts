import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
     origin: [
      'http://localhost:5000',
      'http://port-next-gdgoc-mhfzu50b8c0a8c89.sel3.cloudtype.app',
  ],
  credentials: true, 
});
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
