import { Controller, Get, Query, Param, Res } from '@nestjs/common';
import { MangaDexService } from './mangadex.service';
import type {Response} from 'express';

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
  @Get('image')
    async proxyImage(@Query('url') url: string, @Res() res: Response) {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        res.set('Content-Type', contentType);
        res.send(Buffer.from(buffer));
    }
}