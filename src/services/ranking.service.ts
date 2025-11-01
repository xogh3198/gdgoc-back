import { Injectable } from '@nestjs/common';
import { RankingEntry, Difficulty } from '../interfaces/ranking.interface';

@Injectable()
export class RankingService {
  private rankings: Map<Difficulty, Array<{ name: string; score: number }>> =
    new Map([
      ['easy', []],
      ['medium', []],
      ['hard', []],
    ]);

  /**
   * 점수를 랭킹에 추가하고 정렬합니다.
   * @param name 사용자 이름
   * @param score 점수
   * @param difficulty 난이도
   * @returns 갱신된 랭킹 목록 (상위 5개)
   */
  addScore(
    name: string,
    score: number,
    difficulty: Difficulty,
  ): RankingEntry[] {
    const currentRankings = this.rankings.get(difficulty) || [];

    // 새 점수 추가
    currentRankings.push({ name, score });

    // 점수 내림차순 정렬, 동점 시 이름 오름차순 정렬
    currentRankings.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.name.localeCompare(b.name);
    });

    // 상위 5개만 유지
    const topRankings = currentRankings.slice(0, 5);
    this.rankings.set(difficulty, topRankings);

    // 랭킹 정보 반환 (상위 5개)
    return topRankings.map((entry, index) => ({
      rank: index + 1,
      name: entry.name,
      score: entry.score,
    }));
  }

  /**
   * 특정 난이도의 랭킹을 조회합니다.
   * @param difficulty 난이도
   * @returns 랭킹 목록 (상위 5개)
   */
  getRankings(difficulty: Difficulty): RankingEntry[] {
    const currentRankings = this.rankings.get(difficulty) || [];

    return currentRankings.map((entry, index) => ({
      rank: index + 1,
      name: entry.name,
      score: entry.score,
    }));
  }
}

