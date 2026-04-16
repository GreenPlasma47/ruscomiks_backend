import { Controller, Get, Query, Param } from '@nestjs/common';
import { MangaDexService } from './mangadex.service';

@Controller('mangadex')
export class MangaDexController {
  constructor(private readonly mangaDexService: MangaDexService) {}

  @Get('search')
  async search(@Query() query: any) {
    return this.mangaDexService.searchManga(query);
  }

  @Get('feed/:id')
  async getFeed(@Param('id') id: string, @Query() query: any) {
    return this.mangaDexService.getFeed(id, query);
  }

  @Get('server/:chapterId')
  async getServer(@Param('chapterId') id: string) {
    return this.mangaDexService.getServer(id);
  }
}