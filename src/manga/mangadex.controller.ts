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
    try {
      const decoded = decodeURIComponent(url);
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(decoded, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        res.status(response.status).json({ error: `Upstream error: ${response.status}` });
        return;
      }

      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(Buffer.from(buffer));
    } catch (err: any) {
      if (err.name === 'AbortError') {
        res.status(504).json({ error: 'Image fetch timed out' });
      } else {
        res.status(500).json({ error: 'Image proxy failed', detail: String(err) });
      }
    }
  }

  @Get('pages/:chapterId')
  async getPages(@Param('chapterId') id: string) {
    return this.mangaDexService.getPages(id);
  }
}