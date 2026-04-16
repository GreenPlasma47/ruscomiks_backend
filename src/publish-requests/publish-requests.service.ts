import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublishRequestDto } from './publish-requests.dto';

@Injectable()
export class PublishRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreatePublishRequestDto) {
    const existing = await this.prisma.publishRequest.findFirst({
      where: { userId, status: 'pending' },
    });
    if (existing) {
      throw new ConflictException('You already have a pending request');
    }

    return this.prisma.publishRequest.create({
      data: { userId, message: dto.message },
    });
  }

  findAll() {
    return this.prisma.publishRequest.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: number) {
    const request = await this.prisma.publishRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Request not found');

    await Promise.all([
      this.prisma.publishRequest.update({
        where: { id },
        data: { status: 'approved' },
      }),
      this.prisma.user.update({
        where: { id: request.userId },
        data: { role: 'publisher' },
      }),
    ]);

    return { message: 'Request approved — user promoted to publisher' };
  }

  async reject(id: number) {
    const request = await this.prisma.publishRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Request not found');

    await this.prisma.publishRequest.update({
      where: { id },
      data: { status: 'rejected' },
    });

    return { message: 'Request rejected' };
  }
}