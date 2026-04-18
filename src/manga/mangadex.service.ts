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
  
  async proxyImage(url: string) {
        const res = await fetch(url);
        return res;
    }

  async getPages(chapterId: string): Promise<{ pageNum: number; imageUrl: string }[]> {
    const res = await fetch(`${this.BASE}/at-home/server/${chapterId}`);
    const json = await res.json();

    const baseUrl: string = json.baseUrl;
    const hash: string = json.chapter.hash;
    const filenames: string[] = json.chapter.data;

    return filenames.map((filename, i) => ({
      pageNum: i + 1,
      imageUrl: `${baseUrl}/data/${hash}/${filename}`,
    }));
  }
}