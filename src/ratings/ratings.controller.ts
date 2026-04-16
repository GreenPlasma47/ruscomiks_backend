import {
  Controller, Get, Post,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { UpsertRatingDto } from './ratings.dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('ratings')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Get('comic/:comicId')
  getForComic(@Param('comicId', ParseIntPipe) comicId: number) {
    return this.ratingsService.getForComic(comicId);
  }

  @Get('comic/:comicId/mine')
  @UseGuards(JwtAuthGuard)
  getMyRating(
    @Param('comicId', ParseIntPipe) comicId: number,
    @CurrentUser() user: any,
  ) {
    return this.ratingsService.getMyRating(comicId, user.id);
  }

  @Post('comic/:comicId')
  @UseGuards(JwtAuthGuard)
  upsert(
    @Param('comicId', ParseIntPipe) comicId: number,
    @Body() dto: UpsertRatingDto,
    @CurrentUser() user: any,
  ) {
    return this.ratingsService.upsert(comicId, user.id, dto);
  }
}