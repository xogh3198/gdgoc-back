import { Module, forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RankingController } from './controllers/ranking.controller';
import { RankingService } from './services/ranking.service';
import { RankingGateway } from './gateways/ranking.gateway';

@Module({
  imports: [],
  controllers: [AppController, RankingController],
  providers: [
    AppService,
    RankingService,
    {
      provide: RankingGateway,
      useClass: RankingGateway,
    },
  ],
})
export class AppModule {}
