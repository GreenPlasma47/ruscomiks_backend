import { IsOptional, IsString } from 'class-validator';

export class CreatePublishRequestDto {
  @IsOptional()
  @IsString()
  message?: string;
}