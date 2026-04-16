import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  score!: number;
}