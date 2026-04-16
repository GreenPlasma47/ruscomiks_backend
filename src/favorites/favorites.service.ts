import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: number, sort: string = 'date') {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        comic: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            status: true,
            viewCount: true,
            genres: { include: { genre: true } },
            _count: { select: { favorites: true } },
          },
        },
      },
      orderBy:
        sort === 'alpha'
          ? { comic: { title: 'asc' } }
          : { createdAt: 'desc' },
    });
  }

  async add(userId: number, comicId: number) {
    const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) throw new NotFoundException('Comic not found');

    try {
      return await this.prisma.favorite.create({ data: { userId, comicId } });
    } catch {
      throw new ConflictException('Already in favorites');
    }
  }

  async remove(userId: number, comicId: number) {
    const fav = await this.prisma.favorite.findUnique({
      where: { userId_comicId: { userId, comicId } },
    });
    if (!fav) throw new NotFoundException('Favorite not found');

    await this.prisma.favorite.delete({
      where: { userId_comicId: { userId, comicId } },
    });
    return { message: 'Removed from favorites' };
  }
}