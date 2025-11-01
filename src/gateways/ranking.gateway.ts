import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RankingService } from '../services/ranking.service';
import { Difficulty, RankingEntry } from '../interfaces/ranking.interface';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5002',
      'http://localhost:5000',
      'http://localhost:3000',
      'http://port-next-gdgoc-mhfzu50b8c0a8c89.sel3.cloudtype.app',
    ],
    credentials: true,
  },
  namespace: '/rankings',
})
export class RankingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clientSubscriptions = new Map<string, Set<Difficulty>>();

  constructor(private readonly rankingService: RankingService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clientSubscriptions.delete(client.id);
  }

  @SubscribeMessage('subscribeToRanking')
  handleSubscribe(client: Socket, payload: { difficulty: Difficulty }) {
    if (!payload || !payload.difficulty) {
      client.emit('error', { message: '유효하지 않은 구독 요청입니다.' });
      return;
    }

    if (!['easy', 'medium', 'hard'].includes(payload.difficulty)) {
      client.emit('error', {
        message: "difficulty는 'easy', 'medium', 'hard' 중 하나여야 합니다.",
      });
      return;
    }

    // 클라이언트 구독 정보 저장
    if (!this.clientSubscriptions.has(client.id)) {
      this.clientSubscriptions.set(client.id, new Set());
    }
    this.clientSubscriptions.get(client.id)?.add(payload.difficulty);

    // 초기 랭킹 데이터 전송
    const rankings = this.rankingService.getRankings(payload.difficulty);
    client.emit('rankingUpdate', {
      difficulty: payload.difficulty,
      rankings,
    });
  }

  /**
   * 특정 난이도의 랭킹이 업데이트되었을 때 호출됩니다.
   * RankingController에서 점수 추가 후 이 메서드를 호출합니다.
   */
  broadcastRankingUpdate(difficulty: Difficulty, rankings: RankingEntry[]) {
    // 해당 난이도를 구독 중인 모든 클라이언트에게 브로드캐스트
    this.clientSubscriptions.forEach((subscriptions, clientId) => {
      if (subscriptions.has(difficulty)) {
        const client = this.server.sockets.sockets.get(clientId);
        if (client) {
          client.emit('rankingUpdate', {
            difficulty,
            rankings,
          });
        }
      }
    });
  }
}

