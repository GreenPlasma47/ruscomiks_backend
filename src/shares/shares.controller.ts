import { Controller, Post, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SharesService } from './shares.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('shares')
export class SharesController {
  constructor(private sharesService: SharesService) {}

  @Post('comic/:comicId')
  @UseGuards(JwtAuthGuard)
  share(
    @Param('comicId', ParseIntPipe) comicId: number,
    @CurrentUser() user: any,
  ) {
    return this.sharesService.share(comicId, user.id);
  }
}