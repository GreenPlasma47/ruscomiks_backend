import { Controller, Get, Query, Param, HttpCode } from '@nestjs/common';

@Controller('mangadex') // This becomes /api/mangadex
export class MangaDexController {
  private readonly BASE_URL = 'https://api.mangadex.org';

  @Get('search')
  async search(@Query() query: any) {
    const params = new URLSearchParams(query).toString();
    const response = await fetch(`${this.BASE_URL}/manga?${params}`);
    return await response.json();
  }

  @Get('feed/:id')
  async getFeed(@Param('id') id: string, @Query() query: any) {
    const params = new URLSearchParams(query).toString();
    const response = await fetch(`${this.BASE_URL}/manga/${id}/feed?${params}`);
    return await response.json();
  }

  @Get('server/:chapterId')
  async getServer(@Param('chapterId') id: string) {
    const response = await fetch(`${this.BASE_URL}/at-home/server/${id}`);
    return await response.json();
  }
}