import { IsString, IsNumber, IsIn, IsNotEmpty, MaxLength, Min } from 'class-validator';

export class CreateScoreDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10, { message: 'name은 최대 10자까지 입력 가능합니다.' })
  name: string;

  @IsNumber()
  @Min(0)
  score: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['easy', 'medium', 'hard'], {
    message: "difficulty는 'easy', 'medium', 'hard' 중 하나여야 합니다.",
  })
  difficulty: 'easy' | 'medium' | 'hard';
}

