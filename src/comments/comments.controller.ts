import {
  Controller, Get, Post, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './comments.dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('comic/:comicId')
  findByComic(@Param('comicId', ParseIntPipe) comicId: number) {
    return this.commentsService.findByComic(comicId);
  }

  @Post('comic/:comicId')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('comicId', ParseIntPipe) comicId: number,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.create(comicId, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.commentsService.remove(id, user.id, user.role);
  }
}