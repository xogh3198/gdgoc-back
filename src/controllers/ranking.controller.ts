import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RankingService } from '../services/ranking.service';
import { CreateScoreDto } from '../dto/create-score.dto';
import { Difficulty } from '../interfaces/ranking.interface';
import { RankingGateway } from '../gateways/ranking.gateway';

@Controller('api')
export class RankingController {
  constructor(
    private readonly rankingService: RankingService,
    private readonly rankingGateway: RankingGateway,
  ) {}

  /**
   * 게임 종료 시 점수를 등록합니다.
   * POST /api/scores
   */
  @Post('scores')
  @HttpCode(HttpStatus.CREATED)
  async createScore(@Body() createScoreDto: CreateScoreDto) {
    const rankings = this.rankingService.addScore(
      createScoreDto.name,
      createScoreDto.score,
      createScoreDto.difficulty,
    );

    // WebSocket을 통해 구독자들에게 랭킹 업데이트 브로드캐스트
    this.rankingGateway.broadcastRankingUpdate(
      createScoreDto.difficulty,
      rankings,
    );

    return {
      success: true,
      message: '점수가 성공적으로 등록되었습니다.',
    };
  }

  /**
   * 난이도별 랭킹을 조회합니다.
   * GET /api/rankings?difficulty=...
   */
  @Get('rankings')
  getRankings(@Query('difficulty') difficulty: string) {
    if (!difficulty) {
      throw new BadRequestException({
        success: false,
        message: 'difficulty 쿼리 파라미터가 필요합니다.',
      });
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      throw new BadRequestException({
        success: false,
        message: "difficulty 쿼리 파라미터가 유효하지 않습니다.",
      });
    }

    const rankings = this.rankingService.getRankings(
      difficulty as Difficulty,
    );

    return {
      success: true,
      difficulty,
      rankings,
    };
  }
}

