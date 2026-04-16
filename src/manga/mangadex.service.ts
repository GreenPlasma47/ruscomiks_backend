import { Injectable } from '@nestjs/common';

@Injectable()
export class MangaDexService {
  private readonly BASE = 'https://api.mangadex.org';

  async searchManga(query: any) {
    const params = new URLSearchParams(query).toString();
    const res = await fetch(`${this.BASE}/manga?${params}`);
    return await res.json();
  }

  async getFeed(id: string, query: any) {
    const params = new URLSearchParams(query).toString();
    const res = await fetch(`${this.BASE}/manga/${id}/feed?${params}`);
    return await res.json();
  }

  async getServer(chapterId: string) {
    const res = await fetch(`${this.BASE}/at-home/server/${chapterId}`);
    return await res.json();
  }
}