import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './comments.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  findByComic(comicId: number) {
    return this.prisma.comment.findMany({
      where: { comicId },
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(comicId: number, userId: number, dto: CreateCommentDto) {
    const comic = await this.prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) throw new NotFoundException('Comic not found');

    return this.prisma.comment.create({
      data: { comicId, userId, content: dto.content },
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });
  }

  async remove(id: number, userId: number, userRole: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Cannot delete this comment');
    }

    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Comment deleted' };
  }
}