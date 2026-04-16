import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SharesService {
  constructor(private prisma: PrismaService) {}

  async share(comicId: number, userId: number) {
    const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) throw new NotFoundException('Comic not found');

    await Promise.all([
      this.prisma.share.create({ data: { userId, comicId } }),
      this.prisma.comic.update({
        where: { id: comicId },
        data: { shareCount: { increment: 1 } },
      }),
    ]);

    return { message: 'Shared' };
  }
}