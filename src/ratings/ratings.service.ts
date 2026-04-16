import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertRatingDto } from './ratings.dto';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async getForComic(comicId: number) {
    const ratings = await this.prisma.rating.findMany({ where: { comicId } });
    const avg = ratings.length
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : 0;
    return { average: parseFloat(avg.toFixed(1)), count: ratings.length };
  }

  async upsert(comicId: number, userId: number, dto: UpsertRatingDto) {
    return this.prisma.rating.upsert({
      where: { userId_comicId: { userId, comicId } },
      update: { score: dto.score },
      create: { userId, comicId, score: dto.score },
    });
  }

  async getMyRating(comicId: number, userId: number) {
    const rating = await this.prisma.rating.findUnique({
      where: { userId_comicId: { userId, comicId } },
    });
    return { score: rating?.score ?? 0 };
  }
}